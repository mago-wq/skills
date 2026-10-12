---
name: wolf-erklaervideo
description: Animiertes Erklärvideo mit dem augenlosen Cartoon-Wolf (halal-tauglich: keine Augen, keine Musik) im Stil von „Gorilla Bum“ – deutsches Voiceover lokal per Piper (Thorsten), flache SVG-Szenen, Rendering per Chromium, Ton auf -14 LUFS. Verwenden, wenn ein neues Wolf-Video gebaut, ein Thema/Skript getauscht oder das vorhandene Testosteron-Video geändert werden soll.
---

# Wolf-Erklärvideo

Vorlage: „How To Increase Testosterone Naturally & Permanently“ (Kanal *Gorilla Bum*) – ein Tier erzählt
in der dritten Person („Wolf wacht auf …“) ein Gesundheitsthema in kurzen, trockenen Sätzen. Hier ist das
Tier ein Wolf im orangen Tanktop, durchgehend **ohne Augen**.

## Harte Regeln (halal)

- **Keine Augen** – nirgends: nicht am Wolf, nicht im Spiegelbild, nicht an Icons. Keine Emoji mit Gesicht,
  keine Fische mit Auge (Lachs als Filet, Thunfisch als Dose), kein Punkt im „Pac-Man“-Enzym, keine
  Glanzpunkte, die wie Pupillen wirken (Avocado-Kern, Fettzelle), Funkeln nie auf Kopfhöhe.
  Ausdruck kommt über Ohren (`ear`), Maul (`smile`, `open`), Kopfneigung, Haltung, Schwanz und Symbole.
- **Keine Musik**, keine Glocken/Ding-Töne. Nur dezente, synthetische Effekte (`src/sfx_mix.py`).
- Keine Alkohol- oder Anzüglichkeits-Gags; Fleisch wird als halal gekennzeichnet.
- Gesundheitsaussagen vorsichtig formulieren, Vereinfachungen benennen, am Ende Hinweis „keine ärztliche Beratung“.

## Aufbau

| Datei | Zweck |
|---|---|
| `src/script_de.json` | Sprechertext: Zeilen mit `id`, `text` (Anzeige), optional `tts` (Aussprache), `voice`, `pause`; Stimmen; IPA-Korrekturen unter `phonemes` |
| `src/tts.py` | Voiceover: je Satz mehrere Takes, Whisper hört zurück, verständlichster gewinnt → `audio/voiceover.wav` + `src/timeline.js` (mit Satz-Startzeiten `parts`) |
| `src/wolf.js` | Wolf-Rig (Profil, 2-Knochen-IK für Arme/Beine), Posen (`POSES`, `exPose()` für Übungen), Emotes |
| `src/props.js` | Hintergründe, Requisiten, Icons, Kapitelkarten, Titel-Helfer |
| `src/scenes.js` | Alle Szenen; Zeiten hängen an Cues: `S(id)`/`EN(id)` Zeilenstart/-ende, `PT(id,k)` k-ter Satz, `WT(id,"Wort")` geschätzte Wortzeit; `sfx(t, art)` setzt Effekte |
| `src/engine.js` | Easing, Keyframes (`kf`), `pop()`, Wischer, `renderFrame(t)` |
| `src/render.js` | Frame-Bereich per Chromium-Screenshot direkt in ffmpeg |
| `src/preview.js` | Einzelbilder: `node preview.js scenes.js ../render/p 12.5 40` |

## Ablauf

```bash
./setup.sh                      # einmalig: Pakete, Stimmen (~200 MB), Whisper, Schriften
./make_video.sh                 # Skript -> render/wolf-video.mp4 (ca. 4 min Renderzeit bei 4 Kernen)
SKIP_TTS=1 ./make_video.sh      # nur neu rendern, Voiceover behalten
```

Neues Thema: `src/script_de.json` neu schreiben (IDs frei wählbar), Szenen in `src/scenes.js` auf die neuen
IDs umstellen, mit `preview.js` Stichproben-Frames prüfen (Augen-Check!), dann rendern.

## Aussprache

Piper/espeak betont manche Fremdwörter falsch. Korrekturen stehen als IPA in `phonemes`
(z. B. `Koffein`, `Cholesterin`, `Körperfett`). Vorher prüfen: `python3 src/asr_check.py . src/script_de.json`
listet Zeilen, die Whisper anders zurückhört. Zahlen im TTS-Text ausschreiben („sieben bis neun“),
Satzanfänge mit „Testosteron“ meiden (klingt abgehackt) – lieber „Man kauft Testosteron nicht.“
