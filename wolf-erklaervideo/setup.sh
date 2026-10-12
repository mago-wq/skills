#!/usr/bin/env bash
# Einmalige Einrichtung: Python-/Node-Pakete, Stimmen- und Whisper-Modelle, Schriften.
# Braucht Netz zu pypi.org, registry.npmjs.org, github.com, fonts.googleapis.com
# und für v2 zusätzlich download.pytorch.org und huggingface.co (V2=0 überspringt das, OMNI=1 lädt OmniVoice, QWEN=1 Qwen3-TTS dazu).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
REL="https://github.com/k2-fsa/sherpa-onnx/releases/download"

pip install --quiet piper-tts sherpa-onnx numpy pillow
(cd "$ROOT/src" && npm install --silent)
if [ "${V2:-1}" = "1" ]; then
  # v2-Stimme: VoxCPM2 (OpenBMB, eine der Engines in VoiceStudio) – eigene venv, weil es transformers >= 5.10 braucht.
  # Modellgewichte ~4,7 GB, Lizenz Apache-2.0 (kommerziell nutzbar). Auf CPU ca. 20x langsamer als Echtzeit,
  # mit GPU ein Bruchteil davon; helper_tts.sh verteilt Abschnitte auf weitere Maschinen.
  pip install --quiet torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  python3 -m venv --system-site-packages "$ROOT/.venv-vs"
  "$ROOT/.venv-vs/bin/pip" install --quiet "transformers>=5.10.0" accelerate pydub soundfile huggingface_hub "voxcpm>=2.0.3"
  "$ROOT/.venv-vs/bin/python" -c "from huggingface_hub import snapshot_download as d; d('openbmb/VoxCPM2', local_dir='$ROOT/models/VoxCPM2')"
  if [ "${OMNI:-0}" = "1" ]; then   # alternative Stimme (ENGINE=omni): OmniVoice aus VoiceStudio, CC-BY-NC
    [ -d "$ROOT/vendor/VoiceStudio" ] || git clone --depth 1 https://github.com/debpalash/VoiceStudio "$ROOT/vendor/VoiceStudio"
    "$ROOT/.venv-vs/bin/pip" install --quiet --no-deps -e "$ROOT/vendor/VoiceStudio"
    "$ROOT/.venv-vs/bin/python" -c "from huggingface_hub import snapshot_download as d; d('k2-fsa/OmniVoice', local_dir='$ROOT/models/OmniVoice')"
  fi
  if [ "${QWEN:-0}" = "1" ]; then   # alternative Stimme (ENGINE=qwen): Qwen3-TTS, Sprecher Ryan
    pip install --quiet qwen-tts huggingface_hub
    python3 -c "from huggingface_hub import snapshot_download as d; d('Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice', local_dir='$ROOT/models/qwen3tts/Qwen3-TTS-12Hz-1.7B-CustomVoice')"
  fi
fi

mkdir -p "$ROOT/models" "$ROOT/fonts" "$ROOT/audio" "$ROOT/render/chunks"
cd "$ROOT/models"
fetch() { [ -d "$1" ] || { curl -sSL --retry 3 -o "$1.tar.bz2" "$2/$1.tar.bz2" && tar xjf "$1.tar.bz2" && rm "$1.tar.bz2"; }; }
fetch vits-piper-de_DE-thorsten-high "$REL/tts-models"                 # Erzähler
fetch vits-piper-de_DE-thorsten_emotional-medium "$REL/tts-models"     # Muskel, Gehirn, Werbung
fetch sherpa-onnx-whisper-small "$REL/asr-models"                      # Aussprache-Check

cd "$ROOT/fonts"
python3 - <<'EOF'
import re, urllib.request
ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36"
fams = ["Bebas+Neue", "Anton", "Archivo+Black", "Barlow+Condensed:wght@600;700;800;900", "Nunito:wght@700;800;900"]
out = []
for fam in fams:
    req = urllib.request.Request(f"https://fonts.googleapis.com/css2?family={fam}&display=swap", headers={"User-Agent": ua})
    css = urllib.request.urlopen(req).read().decode()
    for subset, block in re.findall(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", css):
        if subset not in ("latin", "latin-ext"):
            continue
        url = re.search(r"url\((https://[^)]+)\)", block).group(1)
        name = re.search(r"font-family:\s*'([^']+)'", block).group(1).replace(" ", "")
        weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
        fn = f"{name}-{weight}-{subset}.woff2"
        urllib.request.urlretrieve(url, fn)
        out.append(block.replace(url, fn))
open("local-fonts.css", "w").write("\n".join(out))
print(len(out), "Schriftschnitte geladen")
EOF
echo "Fertig. Chromium wird unter /opt/pw-browsers/chromium erwartet (siehe src/render.js)."
