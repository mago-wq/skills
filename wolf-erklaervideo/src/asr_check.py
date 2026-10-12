"""Transkribiert jede Voiceover-Zeile mit Whisper und vergleicht mit dem Skript (Aussprache-Check)."""
import json, subprocess, sys, os, difflib, re
import numpy as np, sherpa_onnx
ROOT = sys.argv[1]; SCRIPT = sys.argv[2]
m = os.path.join(ROOT, "models", "sherpa-onnx-whisper-small")
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{m}/small-encoder.int8.onnx", decoder=f"{m}/small-decoder.int8.onnx",
    tokens=f"{m}/small-tokens.txt", language="de", task="transcribe", num_threads=4)
def load16(path):
    out = subprocess.run(["ffmpeg","-loglevel","error","-i",path,"-ar","16000","-ac","1","-f","f32le","pipe:1"], capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype=np.float32)
norm = lambda s: re.sub(r"[^a-zäöüß0-9 ]", "", s.lower().replace("-", " ")).split()
spec = json.load(open(SCRIPT, encoding="utf-8"))
for line in spec["lines"]:
    s = load16(os.path.join(ROOT, "audio", "lines", line["id"] + ".wav"))
    pad = np.zeros(11200, dtype=np.float32); s = np.concatenate([pad, s, pad])
    st = rec.create_stream(); st.accept_waveform(16000, s); rec.decode_stream(st)
    hyp = st.result.text.strip()
    ref = line["text"]
    r = difflib.SequenceMatcher(None, norm(ref), norm(hyp)).ratio()
    flag = "  " if r > 0.9 else "!!"
    print(f"{flag} {line['id']:4s} {r:.2f} | {hyp}", flush=True)
