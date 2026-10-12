---
name: wolf-erklaervideo
description: Deutsches Erklärvideo mit einem Wolf im Stil von „Gorilla Bum“ (Tier erzählt in der dritten Person ein Gesundheitsthema), halal-tauglich (keine Musik, stark vereinfachte Augen). v2 (Standard) baut das Video aus halbrealistischen KI-Standbildern mit Ken-Burns-Bewegung, animierten Einblendungen und Infografiken; das Voiceover spricht lokal Qwen3-TTS (Sprecher Ryan). v1 ist die rein animierte SVG-Variante mit augenlosem Cartoon-Wolf und Piper-Stimme. Verwenden, wenn ein neues Wolf-Video gebaut, ein Thema/Skript getauscht oder das vorhandene Testosteron-Video geändert werden soll.
---

# Wolf-Erklärvideo

Vorlage: „How To Increase Testosterone Naturally & Permanently“ (Kanal *Gorilla Bum*). Ein Tier erzählt
in der dritten Person („Wolf wacht auf …“) ein Gesundheitsthema in kurzen, trockenen Sätzen. Hier ist das
Tier ein muskulöser grauer Wolf im orangen Tanktop mit dunkelblauen Shorts.

## Harte Regeln (halal)

- **Augen stark vereinfacht.** v2: Die Augen sind rein weiße Flächen ohne Pupille, Iris oder dunklen Punkt,
  oder geschlossen. Das gilt auch im Spiegelbild. Nur wenn der Wolf „seine Instinkte weckt“ (Teaser), darf in jedem Auge
  ein einzelner roter Punkt sitzen. v1: gar keine Augen. Icons und Requisiten haben nie Gesichter und keine Punkte,
  die wie Pupillen wirken. Funkeln und Emotes sitzen nie auf einem Gesicht.
- **Keine Musik**, keine Glocken oder Ding-Töne. Nur dezente, synthetische Effekte (`src/sfx_mix.py`).
- Keine Alkohol- oder Anzüglichkeits-Gags. Fleisch wird als halal gekennzeichnet. Shorts reichen bis zum Knie.
  Im Bild ist nur der Wolf zu sehen, keine anderen Figuren.
- Gesundheitsaussagen vorsichtig formulieren, Vereinfachungen benennen. Am Ende steht der Hinweis „keine ärztliche Beratung“.

## v2 – Standbilder + Qwen3-Stimme (Standard)

| Datei | Zweck |
|---|---|
| `v2/script_v2.json` | Sprechertext: Zeilen mit `id`, `text`, `voice` (`narrator`, `muscle`, `brain`, `ad`), `pause` |
| `v2/image_prompts.json` | Die tatsächlich verwendeten Bild-Prompts je Shot (Figur-Block + Szene + Schlussblock) |
| `v2/img/final/S*.jpg` | Die geprüften Standbilder (1920×1080). S31 ist der Teaser mit roten Instinkt-Augen |
| `src/tts_qwen.py` | Voiceover: spricht **Abschnitte** aus mehreren Zeilen am Stück. Einzelzeilen erzeugen Seufzer und Kichern. Whisper hört jeden Sprechabschnitt, Nicht-Sprache („\*seufzt\*“) wird herausgeschnitten, Pausen werden gekürzt, und die Wortausrichtung (`align.py`) liefert Start, Ende und Satzanfänge (`parts`) jeder Zeile. Schwache Abschnitte werden neu erzeugt, der beste Take gewinnt. Ergebnis: `audio/chunks_v2/`, `audio/voiceover_v2.wav`, `src/timeline_v2.js` |
| `src/align.py` | Whisper (sherpa-onnx) + Needleman-Wunsch-Wortausrichtung, Normalisierung von Zahlen („10-15%“ → „zehn bis fünfzehn prozent“) |
| `src/scenes_v2.js` | Alle Szenen. `shot()` blendet über die vorige Szene, `photo()` zeigt ein Standbild mit Ken-Burns (`KB`-Tabelle), `kbXY()` rechnet Bildpunkte auf den Bildschirm um (für Zeiger auf Dinge im Bild). Dazu `chapterBanner()`, `tag()`, `checklist()`, `gfxBg()` (weichgezeichnetes Standbild als Grafik-Hintergrund) und `photoCard()` |
| `src/blur_bg.py` | Erzeugt `v2/img/final/blur/` für die Grafik-Hintergründe |
| `src/qa_frames.js` + `src/contact.py` | Prüfbilder je Szene und Kontaktbögen (Augen- und Layout-Check) |

```bash
./setup.sh                          # einmalig, inkl. Qwen3-TTS (~4,3 GB) – V2=0 lässt das weg
./make_video_v2.sh                  # Voiceover (CPU, ca. 1 h) -> Rendering -> render/wolf-video-v2.mp4
SKIP_TTS=1 ./make_video_v2.sh       # nur neu rendern, Voiceover behalten (~10 min bei 4 Kernen)
TL_FILE=timeline_v2.js node src/qa_frames.js scenes_v2.js v2/qa 0.3,0.65,0.95 && python3 src/contact.py v2/qa v2/qa/sheet 15
```

Nachbessern am Voiceover, ohne alles neu zu sprechen:

- `IMPROVE_BELOW=0.72 EXTRA=2 python3 src/tts_qwen.py . v2/script_v2.json` erzeugt für Abschnitte mit einer Zeile unter
  0,72 zwei weitere Takes. Der beste Take bleibt.
- `REALIGN=1 TEMPO2=1.14 MAX_GAP=0.3 PAUSE_F=0.85 python3 src/tts_qwen.py . v2/script_v2.json` richtet die Zeilen neu aus.
  Dabei wird alles einmalig um 14 % gestrafft, und die Pausen werden gekürzt. Die Abschnitte werden beim Zusammensetzen
  auf gleiche Lautheit gebracht.

Hinweise:

- Der Sprecher „Ryan“ hat einen leichten englischen Akzent. Whisper hört „Wolf“ deshalb oft als „Ruf“ oder „Wurf“.
  Das ist kein Grund für endlose Neu-Takes.
- Neue Bilder erzeugt man mit Figma `generate_image` (Modell `gpt-image-2.5-sunburst`, 1536×864, auf 1920×1080 skalieren).
  Den Figur-Block aus `image_prompts.json` übernimmt man wörtlich. Danach wird jedes Bild geprüft: Augen 3–10-fach
  vergrößern, es darf kein dunkler Punkt zu sehen sein. Außerdem prüfen: genau eine Figur, Anatomie, Requisiten
  (Kniebeuge: Stange auf dem oberen Rücken; Kreuzheben: Stange vor den Oberschenkeln).
- In jedem Bild bleibt eine Seite für Einblendungen frei („… kept free for text overlays“).

## v1 – reine SVG-Animation (augenloser Cartoon-Wolf)

| Datei | Zweck |
|---|---|
| `src/script_de.json` | Sprechertext mit optionalem `tts` (Aussprache) und IPA-Korrekturen unter `phonemes` |
| `src/tts.py` | Piper (Thorsten): je Satz mehrere Takes, Whisper wählt den verständlichsten → `audio/voiceover.wav`, `src/timeline.js` |
| `src/wolf.js` | Wolf-Rig (2-Knochen-IK), Posen, `exPose()` für Übungen, Emotes |
| `src/scenes.js` | Alle v1-Szenen |

```bash
./make_video.sh                 # Skript -> render/wolf-video.mp4
SKIP_TTS=1 ./make_video.sh      # nur neu rendern
```

## Gemeinsame Bausteine

- `src/engine.js`: Easing, Keyframes (`kf`), `P()` (vor dem Start exakt 0, nach dem Ende exakt 1), `pop()`, Wischer,
  `renderFrame(t)`, `still()` und `preloadImages()`.
- `src/props.js`: Icons, Requisiten, Kapitelkarten, Titel-Helfer, Verlaufs-Schatten (`gShadeL/R/T/B`) für Text über Fotos.
- Zeiten hängen immer an Voiceover-Cues: `S(id)` und `EN(id)` für Zeilenstart und -ende, `PT(id,k)` für den k-ten Satz,
  `WT(id,"Wort")` für die geschätzte Zeit eines Wortes. `sfx(t, art)` setzt Effekte.
- `src/render.js` rendert per Chromium-Screenshot direkt in ffmpeg. Die Timeline wählt man über `TL_FILE`.
  `src/preview.js` erzeugt Einzelbilder.
