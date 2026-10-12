#!/usr/bin/env bash
# Helfer-Sitzung für paralleles Voiceover (VoxCPM2 auf CPU ist ~20x langsamer als Echtzeit):
# richtet das Modell ein, erzeugt nur die angegebenen Abschnitte und legt sie im Repo ab.
#   bash wolf-erklaervideo/helper_tts.sh "11,16,21" <branch>
# Ergebnis: wolf-erklaervideo/v2/voice_cache/chunks_voxcpm/<NN_id>.wav/.json, committet und gepusht.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
CHUNKS="$1"; BRANCH="$2"
VENV="${VENV:-/home/user/vs-venv}"
cd "$ROOT"

echo "== Umgebung"
python3 -m venv --system-site-packages "$VENV"
"$VENV/bin/pip" install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
"$VENV/bin/pip" install -q "transformers>=5.10.0" accelerate pydub soundfile huggingface_hub "voxcpm>=2.0.3" sherpa-onnx numpy
command -v ffmpeg >/dev/null || { echo "ffmpeg fehlt"; exit 1; }

echo "== Modelle"
mkdir -p models audio
"$VENV/bin/python" -c "from huggingface_hub import snapshot_download as d; d('openbmb/VoxCPM2', local_dir='models/VoxCPM2')"
if [ ! -d models/sherpa-onnx-whisper-small ]; then
  (cd models && curl -sSL --retry 3 -o w.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 \
    && tar xjf w.tar.bz2 && rm w.tar.bz2)
fi

echo "== Abschnitte $CHUNKS"
ENGINE=voxcpm MAX_TAKES=2 ONLY_CHUNKS="$CHUNKS" "$VENV/bin/python" src/tts_local.py "$ROOT" "$ROOT/v2/script_v2.json" 2>&1 \
  | grep -E "take[0-9] score|^     |Traceback|Error"

echo "== Ergebnisse ablegen"
mkdir -p v2/voice_cache/chunks_voxcpm
cp audio/chunks_voxcpm/*.wav audio/chunks_voxcpm/*.json v2/voice_cache/chunks_voxcpm/
cd "$ROOT/.."
git add wolf-erklaervideo/v2/voice_cache
git commit -q -F - <<EOF
Voiceover-Abschnitte $CHUNKS (Helfer, VoxCPM2)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LySJPQhg4KjwyGFbf1vCcV
EOF
for i in 1 2 3 4 5 6; do
  git pull -q --rebase origin "$BRANCH" && git push -q origin "HEAD:$BRANCH" && { echo "gepusht"; exit 0; }
  sleep $((2 ** i))
done
echo "Push fehlgeschlagen"; exit 1
