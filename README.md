# design-skills

Portable Design-/UI-Skills für Claude Code. Der Inhalt dieses Repos wird direkt
nach `.claude/skills/` eines Projekts eingehängt — die Skill-Ordner liegen
deshalb auf oberster Ebene.

## Inhalt

| Familie | Herkunft | Lizenz |
|---|---|---|
| `taste-skill`, `soft-skill`, `minimalist-skill`, `brutalist-skill`, `gpt-tasteskill`, `stitch-skill`, `redesign-skill`, `output-skill`, `brandkit`, `image-to-code-skill`, `imagegen-frontend-*`, `ui-ux-pro-max` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | MIT |
| `emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library`, `prototype` | [emilkowalski/skills](https://github.com/emilkowalski/skills) | MIT |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 |
| `design-council` | eigene Arbeit | — |
| `scrapling-official` | [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | BSD-3-Clause |
| `wolf-erklaervideo` | eigene Arbeit | — |

Lizenztexte liegen in den `_*-meta/`-Ordnern.

`scrapling-official` ist der offizielle Web-Scraping-Skill von Scrapling und
damit der einzige Nicht-Design-Skill hier — er hängt am selben Submodul-Mount,
weil er ebenfalls nach `.claude/skills/` gehört. Er setzt eine installierte
Bibliothek voraus, Details in `_scrapling-meta/NOTICE.md`.

`wolf-erklaervideo` baut animierte Erklärvideos mit einem augenlosen Cartoon-Wolf
(halal-tauglich, ohne Musik). Stimmenmodelle, Schriften und Renderausgaben liegen
nicht im Repo – `wolf-erklaervideo/setup.sh` lädt sie nach.

## Einbinden in ein Projekt

```bash
git submodule add <URL dieses Repos> .claude/skills
git submodule update --init --recursive

# Projektspezifisches (gehört NICHT ins Submodul):
mkdir -p .claude/design-projekt
cp .claude/skills/_projekt-vorlage/design-projekt/* .claude/design-projekt/

# Subagenten und Detector-Hook:
cp -R .claude/skills/_projekt-vorlage/agents .claude/agents
cp .claude/skills/_projekt-vorlage/settings.hook.json .claude/settings.json
```

Danach `.claude/design-projekt/PROJEKTPROFIL.md` ausfüllen — das ist Stufe 0
des Councils und die einzige Datei, die pro Projekt zwingend angefasst wird.

## Wichtig beim Klonen eines Projekts

Submodule werden nicht automatisch mitgeholt:

```bash
git clone --recurse-submodules <projekt>
# oder nachträglich:
git submodule update --init --recursive
```

**Bei Vercel/Netlify beachten:** Ist dieses Repo privat, muss der Deploy Zugriff
darauf haben, sonst schlägt der Clone fehl und damit der Deploy. Entweder das
Repo öffentlich stellen oder im Hosting einen Deploy-Key hinterlegen —
**vor** dem Umstellen eines produktiven Projekts prüfen.

## Aktualisieren

```bash
cd .claude/skills && git pull origin main && cd -
git add .claude/skills && git commit -m "skills aktualisiert"
```

Universelle Entscheidungen aus einzelnen Projekten gehören zurück in
`design-council/` — projektgebundene bleiben, wo sie sind.
