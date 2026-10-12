"""Voiceover mit lokalem TTS: VoxCPM2 (Standard), OmniVoice aus VoiceStudio oder Qwen3-TTS.

ENGINE=voxcpm (Standard): VoxCPM2 (OpenBMB, eine der Engines in VoiceStudio, github.com/debpalash/VoiceStudio),
  native 48 kHz, sauberer "Studio"-Klang, Lizenz Apache-2.0. Läuft in einer eigenen venv (transformers >= 5.10).
  Der Erzähler spricht im Fortsetzungsmodus aus der gewählten Hörprobe weiter (v2/voice_ref/narrator_voxcpm.wav + .txt):
  so bleibt es exakt diese Stimme, und "Wolf" wird mit offenem o gesprochen (der Referenz-Modus machte daraus "Wulf").
  Das Modell wiederholt dabei anfangs kurz das Ende der Vorlage – das wird per Whisper erkannt und abgeschnitten.
  Nebenstimmen per Voice-Design (Beschreibung in Klammern vor dem Text). Danach Studio-Mastering-Kette.
  Auf CPU ca. 20x langsamer als Echtzeit: ONLY_CHUNKS="5-10" erzeugt nur diese Abschnitte (siehe helper_tts.sh).
ENGINE=omni: k2-fsa/OmniVoice, die Standard-Engine von VoiceStudio. Muttersprachliches Deutsch, Erzähler geklont aus
  v2/voice_ref/narrator_omnivoice.wav + .txt. Klingt dumpfer; Lizenz der Gewichte CC-BY-NC (nicht kommerziell).
ENGINE=qwen: Qwen3-TTS 1.7B CustomVoice, Sprecher "Ryan" (englischer Akzent).

Das Modell spricht zusammenhängende Abschnitte (mehrere Skriptzeilen am Stück). Danach:
  1. Sprechabschnitte finden, jeden mit Whisper anhören.
  2. Nicht-Sprache (z. B. "*seufzt*") und Abschnitte ohne Skriptbezug herausschneiden, lange Pausen kürzen.
  3. Wortausrichtung (align.py) -> Start/Ende/Satzanfänge jeder Zeile.
  4. Verständlichkeit je Zeile prüfen; schwache Abschnitte neu erzeugen (bis MAX_TAKES), bester Take gewinnt.
Ausgabe: audio/chunks_<engine>/<id>.wav/.json (Neustart-sicher), audio/voiceover_v2.wav, src/timeline_v2.js

Aufruf: ENGINE=voxcpm <venv>/bin/python tts_local.py <projektordner> <script_v2.json>
"""
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import wave

import numpy as np
import torch

ROOT, SCRIPT = sys.argv[1], sys.argv[2]
sys.path.insert(0, os.path.join(ROOT, "src"))
import align  # noqa: E402  (Whisper + Wortausrichtung)

SR = 48000
MAX_TAKES = int(os.environ.get("MAX_TAKES", "3"))
ENGINE = os.environ.get("ENGINE", "voxcpm")
SPEED = float(os.environ.get("SPEED", "1.08" if ENGINE == "qwen" else "1.0"))
MAX_WORDS = int(os.environ.get("MAX_WORDS", "40"))
MAX_GAP = float(os.environ.get("MAX_GAP", "0.38"))
GOOD = float(os.environ.get("GOOD", "0.72"))
WOLF_SPELL = os.environ.get("WOLF_SPELL", "Wolf")  # Schreibweise nur für die Sprachausgabe (z. B. "Wolff" für ein offeneres o)
# Nur bestimmte Abschnitte erzeugen (z. B. "8,13,18" oder "8-12"), etwa für parallele Helfer-Sitzungen; ohne Zusammensetzen
ONLY = set()
for _p in filter(None, os.environ.get("ONLY_CHUNKS", "").split(",")):
    _a, _, _b = _p.partition("-")
    ONLY |= set(range(int(_a), int(_b or _a) + 1))
IMPROVE_BELOW = float(os.environ.get("IMPROVE_BELOW", "0"))  # >0: vorhandene Abschnitte mit schwächerer Zeile nachbessern
EXTRA = int(os.environ.get("EXTRA", "2"))
TEMPO2 = float(os.environ.get("TEMPO2", "1.0"))  # nachträgliche Straffung vorhandener Abschnitte (nur mit REALIGN=1, einmalig)
PAUSE_F = float(os.environ.get("PAUSE_F", "1.0"))  # Faktor für die Pausen zwischen Abschnitten
LEVEL = float(os.environ.get("LEVEL", "-27.5"))  # Ziel-Lautheit je Abschnitt (LUFS) beim Zusammensetzen
MODEL = os.environ.get("MODEL") or os.path.join(ROOT, "models", {"omni": "OmniVoice", "voxcpm": "VoxCPM2"}.get(
    ENGINE, os.path.join("qwen3tts", "Qwen3-TTS-12Hz-1.7B-CustomVoice")))
OUT = os.path.join(ROOT, "audio", "chunks_" + ENGINE)
# Fertige Abschnitte im Repo: werden übernommen, solange ihr Text zum Skript passt (spart Stunden auf CPU)
CACHE = os.path.join(ROOT, "v2", "voice_cache", "chunks_" + ENGINE)
NARRATOR_REF = os.environ.get("NARRATOR_REF", os.path.join(ROOT, "v2", "voice_ref", "narrator_%s.wav" % ("voxcpm" if ENGINE == "voxcpm" else "omnivoice")))
# VoxCPM2-Voice-Design: freie Beschreibung, wird in Klammern vor den Text gesetzt
DESC = {
    "narrator": "Professionelle Studioaufnahme, nah am Mikrofon, klar und präsent. Deutscher Sprecher mittleren Alters, tiefe, kräftige Stimme, energischer und begeisterter YouTube-Erzähler, pointiert, dynamisch, mit trockenem Humor",
    "muscle": "Studioaufnahme. Tiefe, laute, gehetzte Männerstimme eines panischen Bodybuilders, der aufgeregt in ein Funkgerät ruft, sehr energisch, klar verständlich",
    "brain": "Studioaufnahme. Ruhige, trockene, kontrollierte Männerstimme eines Einsatzleiters am Funkgerät, knapp und sachlich, klar verständlich",
    "ad": "Studioaufnahme. Übertrieben begeisterter, schneller Werbesprecher aus dem Teleshopping, laut, marktschreierisch, überdreht, klar verständlich",
}
# Studio-Mastering (angelehnt an VoiceStudios "Podcast"-Preset): Entrauschen, Mulm raus, Präsenz, Luft, De-Esser, Kompressor
STUDIO = ("highpass=f=90,afftdn=nr=12:nf=-42,equalizer=f=250:t=q:w=1.0:g=-3,equalizer=f=3200:t=q:w=1.2:g=3,"
          "highshelf=f=8000:g=2.5,deesser=i=0.35,acompressor=threshold=-20dB:ratio=3.5:attack=3:release=70:makeup=2")
# OmniVoice-Voice-Design: nur festes Vokabular (Geschlecht, Alter, Tonhöhe, Akzent)
DESIGN = {"narrator": "male, middle-aged, low pitch", "muscle": "male, young adult, low pitch",
          "brain": "male, middle-aged, moderate pitch", "ad": "male, young adult, high pitch"}

INSTRUCT = {
    "narrator": "Energischer, dynamischer männlicher YouTube-Erzähler mit tiefer, kräftiger Stimme. Pointiert, selbstbewusst, mit Spannung und trockenem Humor. Zügiges Tempo, kurze Pausen.",
    "muscle": "Laute, tiefe, gehetzte Stimme eines panischen Bodybuilders, der aufgeregt in ein Funkgerät ruft. Sehr energisch, klar verständlich.",
    "brain": "Ruhige, trockene, kontrollierte Stimme eines Einsatzleiters am Funkgerät. Knapp und sachlich, klar verständlich.",
    "ad": "Übertrieben begeisterter, schneller Werbesprecher aus dem Teleshopping. Laut, marktschreierisch, überdreht, klar verständlich.",
}
FX = {
    "narrator": "highpass=f=60,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120",
    "muscle": "highpass=f=60,rubberband=pitch=0.93,acompressor=threshold=-20dB:ratio=4:attack=5:release=80",
    "brain": "highpass=f=320,lowpass=f=3600,acompressor=threshold=-22dB:ratio=6:attack=3:release=60,volume=1.5",
    "ad": "highpass=f=90,acompressor=threshold=-20dB:ratio=4:attack=5:release=80",
}
# Abschnittsgrenzen: Kapitelanfänge und inhaltliche Brüche
BREAK_BEFORE = {"i6", "i14", "s1", "s4", "s7", "s10", "s13", "t1", "t9", "t12", "t14", "t16", "t19",
                "e1", "e4", "e7", "c1", "c4", "c7", "r1", "r7", "r10", "r12", "n1", "n3", "n5"}


class Engine:
    """Einheitliche Schnittstelle: generate(text, voice) -> (Samples float32, Abtastrate)."""

    def __init__(self):
        torch.set_num_threads(4)
        self.refs = {}  # Stimme -> (wav-Pfad, Transkript) für gleichbleibende Klangfarbe
        if ENGINE == "voxcpm":
            from voxcpm import VoxCPM
            self.m = VoxCPM.from_pretrained(MODEL, load_denoiser=False, optimize=False, device="cpu")
            txt = os.path.splitext(NARRATOR_REF)[0] + ".txt"
            if os.path.exists(NARRATOR_REF) and os.path.exists(txt):
                self.refs["narrator"] = (NARRATOR_REF, open(txt, encoding="utf-8").read().strip())
        elif ENGINE == "omni":
            from omnivoice.models.omnivoice import OmniVoice
            self.m = OmniVoice.from_pretrained(MODEL, device_map="cpu", dtype=torch.float32)
            txt = os.path.splitext(NARRATOR_REF)[0] + ".txt"
            if os.path.exists(NARRATOR_REF) and os.path.exists(txt):
                self.refs["narrator"] = (NARRATOR_REF, open(txt, encoding="utf-8").read().strip())
        else:
            from qwen_tts import Qwen3TTSModel
            self.m = Qwen3TTSModel.from_pretrained(MODEL, device_map="cpu", dtype=torch.float32)

    def generate(self, text, voice):
        if ENGINE == "voxcpm":
            t = re.sub(r"\bWolf", WOLF_SPELL, text)
            if voice in self.refs:  # Fortsetzungsmodus: spricht aus der Vorlage heraus weiter
                wav, pt = self.refs[voice]
                a = self.m.generate(text=t, prompt_wav_path=wav, prompt_text=pt, cfg_value=2.0, inference_timesteps=10)
                return drop_prompt_echo(np.asarray(a, dtype=np.float32).reshape(-1), pt, text), 48000
            a = self.m.generate(text="(" + DESC[voice] + ")" + t, cfg_value=2.0, inference_timesteps=10)
            return np.asarray(a, dtype=np.float32).reshape(-1), 48000
        if ENGINE == "omni":
            if voice in self.refs:
                wav, rt = self.refs[voice]
                a = self.m.generate(text=text, language="German", ref_audio=wav, ref_text=rt)
            else:
                a = self.m.generate(text=text, language="German", instruct=DESIGN[voice])
            x = a[0]
            x = x.cpu().numpy() if hasattr(x, "cpu") else np.asarray(x)
            return np.asarray(x, dtype=np.float32).reshape(-1), 24000
        wavs, sr = self.m.generate_custom_voice(text=text, language="German", speaker="Ryan", instruct=INSTRUCT[voice])
        return np.asarray(wavs[0] if isinstance(wavs, (list, tuple)) else wavs, dtype=np.float32).reshape(-1), sr


def drop_prompt_echo(x, prompt_text, text, sr=48000):
    """Schneidet am Anfang wiederholte Wörter vom Ende der Vorlage ab (Fortsetzungsmodus von VoxCPM2)."""
    segs, _ = align.segments(x)
    tail, tgt = align.words(prompt_text), align.words(text)
    cut = 0
    for a, b in segs[:2]:
        w = align.words(align.hear(ROOT, x[int(a * sr): int(b * sr)]))
        if not w:
            continue
        s_tail = difflib.SequenceMatcher(None, w, tail[-len(w):]).ratio()
        s_tgt = difflib.SequenceMatcher(None, w, tgt[: len(w)]).ratio()
        if s_tail >= 0.6 and s_tail > s_tgt:
            cut = b
        else:
            break
    return x[max(0, int((cut + 0.02) * sr)):] if cut else x


def make_chunks(lines):
    chunks, cur, n = [], [], 0
    def flush():
        nonlocal cur, n
        if cur:
            chunks.append(cur)
        cur, n = [], 0
    for l in lines:
        v = l.get("voice", "narrator")
        nw = len(l["text"].split())
        if v != "narrator":
            flush(); chunks.append([l]); continue
        if cur and (l["id"] in BREAK_BEFORE or n + nw > MAX_WORDS):
            flush()
        cur.append(l); n += nw
    flush()
    return chunks


def ffmpeg(samples, sr_in, chain):
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-f", "f32le", "-ar", str(sr_in), "-ac", "1", "-i", "pipe:0",
           "-af", (chain + "," if chain else "") + "aresample=%d" % SR, "-f", "f32le", "-ar", str(SR), "-ac", "1", "pipe:1"]
    out = subprocess.run(cmd, input=samples.astype(np.float32).tobytes(), capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype=np.float32).copy()


def write_wav(path, a):
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())


def split_sents(text):
    return [s for s in re.split(r"(?<=[.!?…“])\s+", text) if s.strip()]


def process(raw, sr, chunk):
    """Rohaudio -> bereinigtes 48-kHz-Audio + Zeilen-Zeiten (relativ) + Bewertung."""
    voice = chunk[0].get("voice", "narrator")
    chain = FX[voice]
    if ENGINE == "voxcpm":  # Studio-Kette statt der alten Kompressor-Kette; Funk-Effekt fürs Gehirn bleibt
        chain = STUDIO + (",highpass=f=320,lowpass=f=3600,volume=1.3" if voice == "brain" else "")
    if SPEED != 1.0:
        chain = "rubberband=tempo=%.3f:pitchq=quality," % SPEED + chain
    return clean(ffmpeg(raw, sr, chain), chunk)


def clean(x, chunk):
    """48-kHz-Audio -> Nicht-Sprache entfernt, Pausen gekürzt, Zeilen ausgerichtet (idempotent)."""
    segs, _ = align.segments(x)
    # Referenzwörter mit Zeile/Satz
    ref, ref_line, ref_sent = [], [], []
    for li, l in enumerate(chunk):
        for si, s in enumerate(split_sents(l["text"])):
            ws = align.words(s)
            ref += ws; ref_line += [li] * len(ws); ref_sent += [si] * len(ws)
    heard = [align.hear(ROOT, x[int(a * SR): int(b * SR)]) for a, b in segs]
    seg_words = [align.words(h) if "*" not in h and "(" not in h else [] for h in heard]
    asr, asr_seg = [], []
    for k, ws in enumerate(seg_words):
        asr += ws; asr_seg += [k] * len(ws)
    mp = align.align(asr, ref) if asr and ref else [None] * len(ref)
    used = set(asr_seg[i] for i in mp if i is not None)
    # behalten: Abschnitte mit Skriptbezug; Pausen auf MAX_GAP kürzen
    keep = [k for k in range(len(segs)) if k in used]
    removed = [heard[k] for k in range(len(segs)) if k not in used]
    if not keep:
        return None
    pieces, newpos, t = [], {}, 0.0
    lead = int(0.03 * SR)
    for i, k in enumerate(keep):
        a, b = segs[k]
        if i:
            gap = min(MAX_GAP, max(0.06, a - segs[keep[i - 1]][1]))
            pieces.append(np.zeros(int(gap * SR), dtype=np.float32)); t += gap
        ia, ib = max(0, int(a * SR) - (lead if i == 0 else 0)), int(b * SR) + (int(0.06 * SR) if i == len(keep) - 1 else 0)
        y = x[ia: min(len(x), ib)]
        newpos[k] = (t + (int(a * SR) - ia) / SR, t + (int(a * SR) - ia) / SR + (b - a))
        pieces.append(y); t += len(y) / SR
    out = np.concatenate(pieces)
    # Zeit je Referenzwort (Wortposition innerhalb des Abschnitts)
    seg_of = [asr_seg[i] if i is not None else None for i in mp]
    last = keep[0]
    for j in range(len(seg_of)):
        if seg_of[j] is None or seg_of[j] not in newpos:
            seg_of[j] = last
        last = seg_of[j]
    by_seg = {}
    for j, s in enumerate(seg_of):
        by_seg.setdefault(s, []).append(j)
    def wt(j, edge):
        a, b = newpos[seg_of[j]]
        ws = by_seg[seg_of[j]]
        return a + (b - a) * (ws.index(j) + (1 if edge == "end" else 0)) / len(ws)
    res, sims = [], []
    for li, l in enumerate(chunk):
        idx = [j for j in range(len(ref)) if ref_line[j] == li]
        a, b = wt(idx[0], "start"), wt(idx[-1], "end")
        parts, seen = [], set()
        for j in idx:
            if ref_sent[j] not in seen:
                seen.add(ref_sent[j]); parts.append(round(max(0.0, wt(j, "start") - a), 3))
        # Verständlichkeit aus der Wortausrichtung (Teilpunkte für ähnlich klingende Wörter)
        m = [mp[j] for j in idx if mp[j] is not None]
        hyp = asr[min(m): max(m) + 1] if m else []
        h = " ".join(hyp)
        sim = sum(align.wsim(ref[j], asr[mp[j]]) for j in idx if mp[j] is not None) / max(len(idx), len(hyp), 1)
        # Zeichenebene als zweite Meinung (Whisper schreibt z. B. "schlankbleiben" statt "schlank bleiben")
        sim = max(sim, difflib.SequenceMatcher(None, "".join(ref[j] for j in idx), "".join(hyp)).ratio())
        sims.append(sim)
        res.append({"id": l["id"], "start": round(a, 3), "end": round(b, 3), "parts": parts, "heard": h, "sim": round(sim, 2)})
    score = float(np.mean(sims)) - 0.5 * sum(max(0, 0.55 - s) for s in sims)
    return out, {"lines": res, "score": round(score, 3), "removed": removed, "dur": round(len(out) / SR, 3)}


def main():
    lines = json.load(open(SCRIPT, encoding="utf-8"))["lines"]
    chunks = make_chunks(lines)
    os.makedirs(OUT, exist_ok=True)
    print("Abschnitte:", len(chunks), [len(c) for c in chunks], flush=True)
    model = None
    for ci, chunk in enumerate(chunks):
        if ONLY and ci not in ONLY:
            continue
        cid = "%02d_%s" % (ci, chunk[0]["id"])
        jp = os.path.join(OUT, cid + ".json")
        text = " ".join(l["text"] for l in chunk)
        cj = os.path.join(CACHE, cid + ".json")
        if not os.path.exists(jp) and os.path.exists(cj) and json.load(open(cj, encoding="utf-8")).get("text") == text:
            shutil.copy(cj, jp)
            shutil.copy(os.path.join(CACHE, cid + ".wav"), os.path.join(OUT, cid + ".wav"))
        best, takes = None, MAX_TAKES
        if os.path.exists(jp):
            old = json.load(open(jp, encoding="utf-8"))
            # Nachbesserung: schwache Abschnitte bekommen EXTRA weitere Takes, der beste bleibt
            if IMPROVE_BELOW <= 0 or min(x["sim"] for x in old["lines"]) >= IMPROVE_BELOW or old.get("improved"):
                continue
            best, takes = (align.load(os.path.join(OUT, cid + ".wav")), old, old.get("take", 1)), EXTRA
            print("  %s: Nachbesserung (min %.2f)" % (cid, min(x["sim"] for x in old["lines"])), flush=True)
        if model is None:
            model = Engine()
        voice = chunk[0].get("voice", "narrator")
        for take in range(takes):
            t0 = time.time()
            raw, sr = model.generate(text, voice)
            r = process(raw, sr, chunk)
            if r is None:
                print("  %s take%d: keine Sprache erkannt" % (cid, take + 1), flush=True)
                continue
            audio, info = r
            low = [x["id"] for x in info["lines"] if x["sim"] < GOOD]
            print("  %s take%d score %.2f dur %.1fs (%.0fs) low=%s removed=%s" % (cid, take + 1, info["score"], info["dur"], time.time() - t0, low, info["removed"]), flush=True)
            for x in info["lines"]:
                print("     %-4s %.2f %5.2f-%5.2f | %s" % (x["id"], x["sim"], x["start"], x["end"], x["heard"][:70]), flush=True)
            if best is None or info["score"] > best[1]["score"]:
                best = (audio, info, take + 1)
            if not low:
                break
        audio, info, take = best
        info["take"], info["text"] = take, text
        if IMPROVE_BELOW > 0 and os.path.exists(jp):
            info["improved"] = True
        write_wav(os.path.join(OUT, cid + ".wav"), audio)
        json.dump(info, open(jp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if not ONLY:
        assemble(lines, chunks)


def loudness(path):
    """Integrierte Lautheit (LUFS) per ffmpeg-loudnorm-Messung."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "loudnorm=print_format=summary", "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"Input Integrated:\s*(-?[\d.]+)", r.stderr)
    return float(m.group(1)) if m else LEVEL


def realign(lines, chunks):
    """Zeilen-Zeiten vorhandener Abschnitte neu berechnen (z. B. nach Änderung an align.words), ohne neu zu sprechen."""
    for ci, chunk in enumerate(chunks):
        cid = "%02d_%s" % (ci, chunk[0]["id"])
        jp = os.path.join(OUT, cid + ".json")
        old = json.load(open(jp, encoding="utf-8"))
        x = align.load(os.path.join(OUT, cid + ".wav"))
        if TEMPO2 != 1.0 and not old.get("tempo2"):
            x = ffmpeg(x, SR, "rubberband=tempo=%.3f:pitchq=quality" % TEMPO2)
            old["tempo2"] = TEMPO2
        audio, info = clean(x, chunk)
        for k in ("take", "improved", "tempo2"):
            if k in old:
                info[k] = old[k]
        write_wav(os.path.join(OUT, cid + ".wav"), audio)
        json.dump(info, open(jp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("  %s neu ausgerichtet: %s" % (cid, " ".join("%s=%.2f" % (x["id"], x["sim"]) for x in info["lines"])), flush=True)


def assemble(lines, chunks):
    t, timeline, placed = 0.6, {}, []
    byid = {l["id"]: l for l in lines}
    for ci, chunk in enumerate(chunks):
        cid = "%02d_%s" % (ci, chunk[0]["id"])
        info = json.load(open(os.path.join(OUT, cid + ".json"), encoding="utf-8"))
        a = align.load(os.path.join(OUT, cid + ".wav"))
        a = a * 10 ** (max(-6.0, min(6.0, LEVEL - loudness(os.path.join(OUT, cid + ".wav")))) / 20)  # Abschnitte gleich laut
        for x in info["lines"]:
            l = byid[x["id"]]
            timeline[x["id"]] = {"start": round(t + x["start"], 3), "end": round(t + x["end"], 3), "text": l["text"],
                                 "voice": l.get("voice", "narrator"), "parts": [round(t + x["start"] + p, 3) for p in x["parts"]], "sim": x["sim"]}
        placed.append((t, a))
        t += len(a) / SR + chunk[-1].get("pause", 0.25) * PAUSE_F
    total = t + 4.0
    mix = np.zeros(int(total * SR) + SR, dtype=np.float32)
    for st, a in placed:
        i = int(st * SR); mix[i: i + len(a)] += a
    mix *= 0.89 / max(np.abs(mix).max(), 1e-6)
    write_wav(os.path.join(ROOT, "audio", "voiceover_v2.wav"), mix[: int(total * SR)])
    tl = {"duration": round(total, 3), "title": "Testosteron v2", "lines": timeline}
    with open(os.path.join(ROOT, "src", "timeline_v2.js"), "w", encoding="utf-8") as f:
        f.write("window.TL = " + json.dumps(tl, ensure_ascii=False, indent=1) + ";\n")
    print("TOTAL %.2f s" % total, flush=True)


if __name__ == "__main__":
    if os.environ.get("REALIGN") == "1":
        ls = json.load(open(SCRIPT, encoding="utf-8"))["lines"]
        realign(ls, make_chunks(ls))
        assemble(ls, make_chunks(ls))
    else:
        main()
