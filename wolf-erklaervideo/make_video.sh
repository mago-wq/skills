#!/usr/bin/env bash
# Komplette Pipeline: Skript -> Voiceover -> Frames -> Ton (-14 LUFS) -> fertiges MP4.
#   ./make_video.sh [skript.json] [ausgabe.mp4]
# Umgebungsvariablen: WORKERS (parallele Renderer, Standard 4), TAKES (TTS-Takes je Satz, Standard 6),
#                     SKIP_TTS=1 (vorhandenes Voiceover + Timeline weiterverwenden)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="${1:-$ROOT/src/script_de.json}"
OUT="${2:-$ROOT/render/wolf-video.mp4}"
FPS=30
WORKERS="${WORKERS:-4}"
CH="$ROOT/render/chunks"
mkdir -p "$ROOT/audio" "$CH"

if [ "${SKIP_TTS:-0}" != "1" ]; then
  echo "== 1/5 Voiceover (bester von ${TAKES:-6} Takes je Satz, per Whisper geprüft)"
  TAKES="${TAKES:-6}" python3 "$ROOT/src/tts.py" "$ROOT" "$SCRIPT" | tee "$ROOT/audio/tts_log.txt"
fi

echo "== 2/5 Soundeffekt-Cues exportieren"
node "$ROOT/src/render.js" scenes.js /dev/null $FPS 0 0 --sfx "$ROOT/render/sfx.json"
TOTAL=$(python3 -c "import json,math; print(math.ceil(json.load(open('$ROOT/render/sfx.json'))['duration']*$FPS))")

echo "== 3/5 $TOTAL Frames mit $WORKERS Renderern"
rm -f "$CH"/part*.mp4
pids=()
for i in $(seq 0 $((WORKERS - 1))); do
  A=$((TOTAL * i / WORKERS)); B=$((TOTAL * (i + 1) / WORKERS))
  node "$ROOT/src/render.js" scenes.js "$CH/part$i.mp4" $FPS $A $B > "$CH/log$i.txt" 2>&1 &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p"; done

echo "== 4/5 Ton: Voiceover + Effekte (keine Musik), auf -14 LUFS"
python3 "$ROOT/src/sfx_mix.py" "$ROOT/render/sfx.json" "$ROOT/audio/voiceover.wav" "$ROOT/audio/mix.wav"
CHAIN="acompressor=threshold=-26dB:ratio=2.5:attack=6:release=150:makeup=1"
loud() { ffmpeg -hide_banner -i "$1" -af loudnorm=print_format=summary -f null - 2>&1 | awk '/Input Integrated/{print $3}'; }
ffmpeg -hide_banner -loglevel error -y -i "$ROOT/audio/mix.wav" -af "$CHAIN,pan=stereo|c0=c0|c1=c0" "$ROOT/audio/_probe.wav"
GAIN=$(python3 -c "print(round(-14 - float('$(loud "$ROOT/audio/_probe.wav")') + 0.4, 2))")
ffmpeg -hide_banner -loglevel error -y -i "$ROOT/audio/mix.wav" \
  -af "$CHAIN,volume=${GAIN}dB,alimiter=limit=0.84:attack=3:release=80:level=false,pan=stereo|c0=c0|c1=c0" \
  -ar 48000 "$ROOT/audio/mix_norm.wav"
rm -f "$ROOT/audio/_probe.wav"
echo "   Lautheit: $(loud "$ROOT/audio/mix_norm.wav") LUFS"

echo "== 5/5 Zusammensetzen -> $OUT"
: > "$CH/list.txt"
for i in $(seq 0 $((WORKERS - 1))); do echo "file 'part$i.mp4'" >> "$CH/list.txt"; done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$CH/list.txt" -i "$ROOT/audio/mix_norm.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT"
