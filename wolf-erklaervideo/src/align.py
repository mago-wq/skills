"""Richtet ein langes TTS-Stück (viele Skriptzeilen am Stück gesprochen) an den Skriptzeilen aus.

1. Sprechabschnitte zwischen Pausen finden.
2. Whisper transkribiert jeden Abschnitt.
3. Globale Wort-Ausrichtung (Needleman-Wunsch mit unscharfem Wortvergleich) zwischen
   erkannten Wörtern und Skriptwörtern -> jedes Skriptwort bekommt einen Abschnitt.
4. Zeilen-/Satzgrenzen = Pausen zwischen den Abschnitten; liegt eine Grenze mitten in
   einem Abschnitt, wird nach Wortanteil geteilt.

Aufruf: python3 align.py <projektordner> <audio> <zeilen.json> <out.json>
  zeilen.json: [{"id":..., "text":...}, ...] in Sprechreihenfolge
"""
import difflib
import json
import os
import re
import subprocess
import sys

import numpy as np

SR = 48000


def load(path):
    out = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "pipe:1"],
                         capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype=np.float32).copy()


def segments(x, win=0.01, thr_db=-38, min_gap=0.08, min_seg=0.12):
    n = int(win * SR)
    frames = len(x) // n
    rms = np.sqrt(np.mean(x[: frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms / (rms.max() + 1e-9))
    loud = db >= thr_db
    segs, i = [], 0
    while i < frames:
        if loud[i]:
            j = i
            while j < frames and loud[j]:
                j += 1
            segs.append([i * win, j * win])
            i = j
        else:
            i += 1
    merged = []
    for s in segs:  # kurze Lücken schließen
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    out = []
    for s in merged:  # Mini-Abschnitte (Klicks, Atmer) an Nachbarn hängen
        if s[1] - s[0] < min_seg and out:
            out[-1][1] = s[1]
        else:
            out.append(s)
    return out, frames * win


_REC = None


def hear(root, x):
    global _REC
    import sherpa_onnx
    if _REC is None:
        m = os.path.join(root, "models", "sherpa-onnx-whisper-small")
        _REC = sherpa_onnx.OfflineRecognizer.from_whisper(
            encoder=m + "/small-encoder.int8.onnx", decoder=m + "/small-decoder.int8.onnx",
            tokens=m + "/small-tokens.txt", language="de", task="transcribe", num_threads=4)
    y = x[::3]
    pad = np.zeros(8000, dtype=np.float32)
    st = _REC.create_stream()
    st.accept_waveform(16000, np.concatenate([pad, y, pad]))
    _REC.decode_stream(st)
    return st.result.text.strip()


NUM = {"10": "zehn", "1": "eins", "2": "zwei", "3": "drei", "4": "vier", "5": "fünf", "6": "sechs", "7": "sieben", "8": "acht", "9": "neun",
       "12": "zwölf", "15": "fünfzehn", "20": "zwanzig", "300": "dreihundert", "500": "fünfhundert", "%": "prozent"}


def words(t):
    t = re.sub(r"(\d+)\s*[-–]\s*(\d+)", r"\1 bis \2", t)  # Whisper schreibt "10-15%" für "zehn bis fünfzehn Prozent"
    t = t.lower().replace("-", " ").replace("%", " % ")
    out = []
    for w in t.split():
        w = w.strip(".,!?:;„“\"…'()–")
        out.append(NUM.get(w, re.sub(r"[^a-zäöüß]", "", w)))
    return [w for w in out if w]


def wsim(a, b):
    return 1.0 if a == b else difflib.SequenceMatcher(None, a, b).ratio()


def align(asr, ref):
    """Needleman-Wunsch: gibt für jedes Ref-Wort den Index des zugeordneten ASR-Worts (oder None)."""
    n, m = len(asr), len(ref)
    GAP = -0.6
    D = np.zeros((n + 1, m + 1))
    B = np.zeros((n + 1, m + 1), dtype=np.int8)
    D[1:, 0] = GAP * np.arange(1, n + 1); B[1:, 0] = 1
    D[0, 1:] = GAP * np.arange(1, m + 1); B[0, 1:] = 2
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            s = wsim(asr[i - 1], ref[j - 1])
            opts = (D[i - 1, j - 1] + (s * 2 - 1), D[i - 1, j] + GAP, D[i, j - 1] + GAP)
            k = int(np.argmax(opts))
            D[i, j] = opts[k]
            B[i, j] = k
    i, j, mp = n, m, [None] * m
    while i > 0 or j > 0:
        k = B[i, j] if i > 0 and j > 0 else (1 if j == 0 else 2)
        if k == 0:
            mp[j - 1] = i - 1; i -= 1; j -= 1
        elif k == 1:
            i -= 1
        else:
            j -= 1
    return mp


def main():
    root, audio, lines_path, out_path = sys.argv[1:5]
    lines = json.load(open(lines_path, encoding="utf-8"))
    x = load(audio)
    segs, total = segments(x)
    asr, asr_seg = [], []
    for k, (a, b) in enumerate(segs):
        ws = words(hear(root, x[int(a * SR): int(b * SR)]))
        asr += ws
        asr_seg += [k] * len(ws)
    # Skriptwörter mit (Zeile, Satz)
    ref, ref_line, ref_sent = [], [], []
    for li, l in enumerate(lines):
        sents = [s for s in re.split(r"(?<=[.!?…“])\s+", l["text"]) if s.strip()]
        for si, s in enumerate(sents):
            ws = words(s)
            ref += ws; ref_line += [li] * len(ws); ref_sent += [si] * len(ws)
    mp = align(asr, ref)
    # Abschnitt je Skriptwort (Lücken interpolieren)
    seg_of = [asr_seg[i] if i is not None else None for i in mp]
    last = 0
    for j in range(len(seg_of)):
        if seg_of[j] is None:
            nxt = next((seg_of[k] for k in range(j + 1, len(seg_of)) if seg_of[k] is not None), last)
            seg_of[j] = last if nxt == last else last
        last = seg_of[j]
    # Zeitpunkt eines Wortes: innerhalb seines Abschnitts nach Wortposition interpolieren
    seg_words = {}
    for j, s in enumerate(seg_of):
        seg_words.setdefault(s, []).append(j)

    def word_time(j, edge):
        s = seg_of[j]
        a, b = segs[s]
        ws = seg_words[s]
        pos = ws.index(j)
        frac = (pos + (1 if edge == "end" else 0)) / len(ws)
        return a + (b - a) * frac

    res = []
    for li, l in enumerate(lines):
        idx = [j for j in range(len(ref)) if ref_line[j] == li]
        if not idx:
            continue
        a, b = word_time(idx[0], "start"), word_time(idx[-1], "end")
        parts, seen = [], set()
        for j in idx:
            if ref_sent[j] not in seen:
                seen.add(ref_sent[j]); parts.append(round(word_time(j, "start") - a, 3))
        seg = x[int(a * SR): int(b * SR)]
        heard = hear(root, seg)
        sim = difflib.SequenceMatcher(None, words(l["text"]), words(heard)).ratio()
        res.append({"id": l["id"], "start": round(a, 3), "end": round(b, 3), "parts": parts, "heard": heard, "sim": round(sim, 2)})
        print(f"{l['id']:5s} {a:7.2f}-{b:7.2f}  sim={sim:.2f}  {heard[:70]}", flush=True)
    json.dump({"duration": round(total, 3), "segments": segs, "lines": res}, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
