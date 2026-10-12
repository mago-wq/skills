"""Erzeugt das Voiceover aus script_*.json und eine Timeline für den Renderer.

Aufruf:  python3 tts.py <projektordner> <script.json>
Ausgabe: audio/lines/<id>.wav, audio/voiceover.wav (48 kHz mono), src/timeline.js
"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np
from piper import PiperVoice, SynthesisConfig

ROOT = sys.argv[1]
SCRIPT = sys.argv[2]
SR_OUT = 48000

MODELS = {
    "high": ("vits-piper-de_DE-thorsten-high", "de_DE-thorsten-high.onnx"),
    "emotional": ("vits-piper-de_DE-thorsten_emotional-medium", "de_DE-thorsten_emotional-medium.onnx"),
}


def load(name):
    d, onnx = MODELS[name]
    m = os.path.join(ROOT, "models", d, onnx)
    return PiperVoice.load(m, config_path=m + ".json")


PHONEMES = {}


def apply_phonemes(text):
    """Ersetzt Wörter mit falscher Betonung durch [[IPA]]-Blöcke (längste zuerst)."""
    for word in sorted(PHONEMES, key=len, reverse=True):
        text = re.sub(r"(?<![\wÄÖÜäöüß\[-])" + re.escape(word) + r"(?![\wÄÖÜäöüß\]])", "[[" + PHONEMES[word] + "]]", text)
    return text


def synth(voice, text, sid, speed, gap=0.16):
    cfg = SynthesisConfig(speaker_id=sid if voice.config.num_speakers > 1 else None, length_scale=1.0 / speed,
                          normalize_audio=False)
    parts, offsets = [], []
    sr = voice.config.sample_rate
    pos = 0
    for chunk in voice.synthesize(apply_phonemes(text), syn_config=cfg):
        a = trim(chunk.audio_float_array, sr)
        if parts:
            parts.append(np.zeros(int(gap * sr), dtype=np.float32))
            pos += int(gap * sr)
        offsets.append(pos / sr)
        parts.append(a)
        pos += len(a)
    synth.offsets = offsets
    return np.concatenate(parts), sr


def trim(s, sr, thr=0.004, margin=0.05):
    env = np.abs(s)
    idx = np.where(env > thr * max(env.max(), 1e-6))[0]
    if len(idx) == 0:
        return s
    a = max(0, idx[0] - int(margin * sr))
    b = min(len(s), idx[-1] + int(margin * 1.8 * sr))
    return s[a:b]


TAKES = int(os.environ.get("TAKES", "6"))
_REC = None
NUMS = {"1.": "erstens", "2.": "zweitens", "3.": "drittens", "4.": "viertens", "7": "sieben", "9": "neun", "15": "fünfzehn",
        "2": "zwei", "5": "fünf", "12": "zwölf", "8": "acht", "20": "zwanzig", "300": "dreihundert", "500": "fünfhundert",
        "%": " prozent", "isst": "ist", "cortisol": "kortisol", "tunfisch": "thunfisch"}


def _norm(txt):
    txt = txt.lower().replace("-", " ").replace("%", " % ")
    out = []
    for w in txt.split():
        w2 = w.strip(".,!?:;„“\"…")
        if w in NUMS:
            out.append(NUMS[w])
        elif w2 in NUMS:
            out.append(NUMS[w2])
        else:
            out.append(re.sub(r"[^a-zäöüß]", "", w2))
    return [w for w in " ".join(out).split() if w]


def judge(samples, sr, ref):
    """Whisper hört den Take; Rückgabe: Ähnlichkeit zum Skripttext (0..1)."""
    global _REC
    import difflib
    import sherpa_onnx
    if _REC is None:
        m = os.path.join(ROOT, "models", "sherpa-onnx-whisper-small")
        _REC = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=m + "/small-encoder.int8.onnx", decoder=m + "/small-decoder.int8.onnx",
            tokens=m + "/small-tokens.txt", language="de", task="transcribe", num_threads=4)
    x = ffmpeg_filter(samples, sr, "")[::3]
    pad = np.zeros(11200, dtype=np.float32)
    st = _REC.create_stream()
    st.accept_waveform(16000, np.concatenate([pad, x, pad]))
    _REC.decode_stream(st)
    hyp = st.result.text.strip()
    return difflib.SequenceMatcher(None, _norm(ref), _norm(hyp)).ratio(), hyp


def ffmpeg_filter(samples, sr_in, chain):
    """Schickt float32-Samples durch eine ffmpeg-Filterkette und liefert 48 kHz zurück."""
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error",
        "-f", "f32le", "-ar", str(sr_in), "-ac", "1", "-i", "pipe:0",
        "-af", chain + (",aresample=%d" % SR_OUT if chain else "aresample=%d" % SR_OUT),
        "-f", "f32le", "-ar", str(SR_OUT), "-ac", "1", "pipe:1",
    ]
    out = subprocess.run(cmd, input=samples.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype=np.float32).copy()


def voice_chain(v):
    parts = ["highpass=f=70"]
    if v.get("pitch"):
        ratio = 2 ** (v["pitch"] / 12.0)
        parts.append("rubberband=pitch=%.5f:pitchq=quality" % ratio)
    if v.get("radio"):
        parts += ["highpass=f=320", "lowpass=f=3400", "acompressor=threshold=-20dB:ratio=6:attack=3:release=60",
                  "volume=1.6"]
    else:
        parts.append("acompressor=threshold=-18dB:ratio=3:attack=8:release=120")
    return ",".join(parts)


def write_wav(path, s, sr):
    with wave.open(path, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes((np.clip(s, -1, 1) * 32767).astype(np.int16).tobytes())


def main():
    spec = json.load(open(SCRIPT, encoding="utf-8"))
    voices = spec["voices"]
    PHONEMES.update(spec.get("phonemes", {}))
    engines = {}
    os.makedirs(os.path.join(ROOT, "audio", "lines"), exist_ok=True)

    t = 0.0
    timeline = {}
    chunks = []  # (start_time, samples)
    for line in spec["lines"]:
        v = voices[line.get("voice", "narrator")]
        if v["model"] not in engines:
            engines[v["model"]] = load(v["model"])
        tts = engines[v["model"]]
        text = line.get("tts", line["text"])
        takes = []
        n = TAKES if len(text) > 12 else max(2, TAKES // 2)
        for _ in range(n):
            raw, sr = synth(tts, text, v.get("sid", 0), v.get("speed", 1.0))
            score, heard = judge(raw, sr, line["text"])
            takes.append((score, heard, raw, sr, list(synth.offsets)))
            if score >= 0.999:
                break
        score, heard, raw, sr, offs = max(takes, key=lambda x: x[0])
        print("     best of %d: %.2f  '%s'" % (len(takes), score, heard), flush=True)
        s = ffmpeg_filter(raw, sr, voice_chain(v))
        t += line.get("lead", 0.0)
        dur = len(s) / SR_OUT
        timeline[line["id"]] = {
            "start": round(t, 3),
            "end": round(t + dur, 3),
            "text": line["text"],
            "voice": line.get("voice", "narrator"),
            "parts": [round(t + o, 3) for o in offs],
        }
        write_wav(os.path.join(ROOT, "audio", "lines", line["id"] + ".wav"), s, SR_OUT)
        chunks.append((t, s))
        print("%-4s %6.2f-%6.2f  %s" % (line["id"], t, t + dur, text[:70]), flush=True)
        t += dur + line.get("pause", 0.3)
        t += line.get("tail", 0.0)

    total = t
    mix = np.zeros(int(total * SR_OUT) + SR_OUT, dtype=np.float32)
    for start, s in chunks:
        i = int(start * SR_OUT)
        mix[i:i + len(s)] += s
    peak = np.abs(mix).max()
    mix *= 0.89 / max(peak, 1e-6)
    write_wav(os.path.join(ROOT, "audio", "voiceover.wav"), mix[: int(total * SR_OUT)], SR_OUT)

    tl = {"duration": round(total, 3), "title": spec.get("title", ""), "lines": timeline}
    with open(os.path.join(ROOT, "src", "timeline.js"), "w", encoding="utf-8") as f:
        f.write("window.TL = " + json.dumps(tl, ensure_ascii=False, indent=1) + ";\n")
    print("TOTAL %.2f s" % total)


if __name__ == "__main__":
    main()
