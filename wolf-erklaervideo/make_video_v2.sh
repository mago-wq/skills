#!/usr/bin/env bash
# v2-Pipeline: lokales Voiceover (OmniVoice/VoiceStudio) -> Standbilder + Einblendungen -> Ton (-14 LUFS) -> fertiges MP4.
#   ./make_video_v2.sh [skript.json] [ausgabe.mp4]
# Erwartet die Standbilder in v2/img/final/<SHOT>.jpg (1920x1080).
# Umgebungsvariablen: WORKERS (parallele Renderer, Standard 4), SKIP_TTS=1 (vorhandenes Voiceover weiterverwenden),
#                     ENGINE=omni|qwen, MAX_TAKES (TTS-Takes je Abschnitt), SPEED (Tempo-Faktor)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="${1:-$ROOT/v2/script_v2.json}"
OUT="${2:-$ROOT/render/wolf-video-v2.mp4}"
FPS=30
WORKERS="${WORKERS:-4}"
CH="$ROOT/render/chunks_v2"
export TL_FILE=timeline_v2.js
mkdir -p "$ROOT/audio" "$CH"

if [ "${SKIP_TTS:-0}" != "1" ]; then
  # ENGINE=omni (Standard): OmniVoice aus VoiceStudio in eigener venv; ENGINE=qwen: Qwen3-TTS mit System-Python
  ENGINE="${ENGINE:-omni}"
  if [ "$ENGINE" = "omni" ]; then PY="${TTS_PY:-$ROOT/.venv-vs/bin/python}"; else PY="${TTS_PY:-python3}"; fi
  echo "== 1/6 Voiceover ($ENGINE lokal, abschnittsweise, per Whisper geprüft)"
  ENGINE="$ENGINE" "$PY" "$ROOT/src/tts_local.py" "$ROOT" "$SCRIPT" 2>&1 | grep -v -i "sox" | tee "$ROOT/audio/tts_${ENGINE}_log.txt"
fi

echo "== 2/6 Weichgezeichnete Hintergründe für die Infografiken"
python3 "$ROOT/src/blur_bg.py" "$ROOT/v2/img/final"

echo "== 3/6 Soundeffekt-Cues exportieren"
node "$ROOT/src/render.js" scenes_v2.js /dev/null $FPS 0 0 --sfx "$ROOT/render/sfx_v2.json"
TOTAL=$(python3 -c "import json,math; print(math.ceil(json.load(open('$ROOT/render/sfx_v2.json'))['duration']*$FPS))")

echo "== 4/6 $TOTAL Frames mit $WORKERS Renderern"
rm -f "$CH"/part*.mp4
pids=()
for i in $(seq 0 $((WORKERS - 1))); do
  A=$((TOTAL * i / WORKERS)); B=$((TOTAL * (i + 1) / WORKERS))
  node "$ROOT/src/render.js" scenes_v2.js "$CH/part$i.mp4" $FPS $A $B > "$CH/log$i.txt" 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done

echo "== 5/6 Ton: Voiceover + Effekte (keine Musik), auf -14 LUFS"
python3 "$ROOT/src/sfx_mix.py" "$ROOT/render/sfx_v2.json" "$ROOT/audio/voiceover_v2.wav" "$ROOT/audio/mix_v2.wav"
CHAIN="acompressor=threshold=-26dB:ratio=2.5:attack=6:release=150:makeup=1"
loud() { ffmpeg -hide_banner -i "$1" -af loudnorm=print_format=summary -f null - 2>&1 | awk '/Input Integrated/{print $3}'; }
ffmpeg -hide_banner -loglevel error -y -i "$ROOT/audio/mix_v2.wav" -af "$CHAIN,pan=stereo|c0=c0|c1=c0" "$ROOT/audio/_probe.wav"
GAIN=$(python3 -c "print(round(-14 - float('$(loud "$ROOT/audio/_probe.wav")') + 0.4, 2))")
ffmpeg -hide_banner -loglevel error -y -i "$ROOT/audio/mix_v2.wav" \
  -af "$CHAIN,volume=${GAIN}dB,alimiter=limit=0.84:attack=3:release=80:level=false,pan=stereo|c0=c0|c1=c0" \
  -ar 48000 "$ROOT/audio/mix_v2_norm.wav"
rm -f "$ROOT/audio/_probe.wav"
echo "   Lautheit: $(loud "$ROOT/audio/mix_v2_norm.wav") LUFS"

echo "== 6/6 Zusammensetzen -> $OUT"
: > "$CH/list.txt"
for i in $(seq 0 $((WORKERS - 1))); do echo "file 'part$i.mp4'" >> "$CH/list.txt"; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$CH/list.txt" -i "$ROOT/audio/mix_v2_norm.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
