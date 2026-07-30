---
name: design-council
description: Konfliktauflösung zwischen den vendorten Design-Skills (taste-skill-Familie, Emil-Kowalski-Familie, impeccable). Immer laden, bevor gestaltet wird — Redesign, neue Sektion, Motion, Typografie, Farbe, Spacing, Layout, für jedes Projekt und jede Branche. Legt fest, was ohne Diskussion gilt, was sich nur scheinbar widerspricht, und wie echte Widersprüche entschieden werden (Kontext → Agenten-Debatte → Rückfrage). Qualitätsanspruch ist verkaufsfähige Premium-Arbeit, nie der Bestand.
---

# Design Council

23 vendorte Design-Skills aus drei unabhängigen Quellen. Sie überschneiden sich stark, stimmen
öfter überein als man denkt — und widersprechen sich an wenigen, klar benennbaren Stellen.

**Grundhaltung: Vereinigungsmenge, nicht Auswahl.** Alles anwenden, worin sie sich einig sind
oder ergänzen. Nur die belegten Gegensätze durchlaufen die Eskalationsleiter. Es ist *kein*
"welcher Skill gewinnt"-Ranking — ein Skill kann in einer Frage recht haben und in der nächsten
überstimmt werden.

**Der Council ist projektunabhängig.** Er gilt für Landingpages, Produkt-UI, Portfolios,
Shops — quer über Branchen und Kunden. Projektspezifisches steht ausschließlich in
`PROJEKTPROFIL.md`, nie in dieser Datei.

## Qualitätsanspruch

Der Maßstab ist **verkaufsfähige Premium-Arbeit**: eine Seite, die ein Kunde als eigenständige
Leistung bezahlt, nicht als Vorlage erkennt und ohne Nacharbeit online stellen kann.

Daraus folgen drei Dinge, die häufig falsch gemacht werden:

1. **Der Bestand ist nie der Maßstab.** Vorhandener Code ist *Beweismittel* für den Ist-Zustand,
   nicht die Messlatte. "Läuft schon so" beantwortet keine Design-Frage. Die Latte liegt bei
   impeccables `craft-floor`, `taste-skill`s Pre-Flight-Check und Emils Craft-Bar — die gelten
   auch dann, wenn das Bestehende sie zufällig schon erfüllt.
2. **Fertig heißt fertig.** Kein Platzhalter-Text, kein halb gebautes Motion, keine toten Links,
   keine „hier könnte ein Bild stehen"-Lücke. Wer Arbeit verkauft, liefert Übergabequalität —
   impeccable `harden` und `polish` gehören zum Abschluss, nicht zur Kür.
3. **Unauffällig ist ein Fehler.** Eine Seite, die austauschbar aussieht, ist keine
   Premium-Arbeit, egal wie sauber der Code ist. Die Anti-Slop-Disziplin aus Stufe 1 ist beim
   Verkaufen wichtiger, nicht unwichtiger.

Zurückhaltung bleibt trotzdem erlaubt, wo der Brief sie verlangt: leise ist nicht billig. Der
Unterschied ist, ob die Zurückhaltung **gewählt** oder **ausgesessen** wurde.

## Eskalationsleiter

Von billig nach teuer. **Immer auf der niedrigsten Stufe halten, die die Frage beantwortet.**

| # | Stufe | Wann | Kosten |
|---|---|---|---|
| 0 | **Projektgesetz** | steht im aktiven `PROJEKTPROFIL.md` | keine |
| 1 | **Konsens** | ≥2 Quellen sagen unabhängig dasselbe | keine |
| 2 | **Ergänzung** | Skills reden über verschiedene Dinge | keine |
| 3 | **Präzedenzfall** | steht schon in `ENTSCHEIDUNGEN.md` | keine |
| 4 | **Kontext-Ableitung** | Brief/Prompt/Branche entscheidet | gering |
| 5 | **Agenten-Debatte** | echt strittig *und* folgenreich | hoch |
| 6 | **Rückfrage** | Geschmack, Geld, Inhalt, Recht | Nutzerzeit |

Stufe 5 und 6 erzeugen einen Eintrag in `ENTSCHEIDUNGEN.md`. Damit fällt dieselbe Frage beim
nächsten Mal auf Stufe 3 — das ist das Gedächtnis des Councils.

---

## Stufe 0 — Projektgesetz

**Ein Platzhalter, keine feste Liste.** Projektgesetz ist das, was das *aktuelle* Projekt für
unverhandelbar erklärt — technisch, rechtlich, vertraglich. Es schlägt jeden Skill, auch wenn
alle 23 dagegen sind. Und es gilt **nur für dieses eine Projekt**.

Gefüllt wird es aus `PROJEKTPROFIL.md`. Typische Quellen: CLAUDE.md des Repos, Datenschutz-/
Rechtsvorgaben, vorgegebener Stack, Kundenvertrag, Barrierefreiheits-Pflichten (BFSG/WCAG),
bestehendes Markenhandbuch.

**Wo Profil und Log liegen — in dieser Reihenfolge suchen:**

1. `.claude/design-projekt/` im Projekt — gilt, wenn die Skills als **Submodul** eingebunden
   sind. Projektspezifisches darf nicht im geteilten Repo liegen, sonst wandern Kundendaten und
   Einzelfallentscheidungen in alle anderen Projekte.
2. Geschwisterdateien neben dieser `SKILL.md` — gilt bei direkter Ablage im Projekt.

Findet sich beides, gewinnt (1). Findet sich nichts, siehe unten.

Drei Regeln zum Umgang damit:

- **Ein Skill, der hier anstößt, wird übersetzt, nicht ignoriert.** Seine *Absicht* umsetzen, mit
  den erlaubten Mitteln. Beispiel: verbietet ein Profil Webfonts, kommt Schriftcharakter über
  Hierarchie, Gewicht, Tracking und Größe statt über eine Schriftdatei.
- **Projektgesetz ist keine Design-Wahrheit.** Es beschreibt, was hier gilt, nicht was gut ist.
  Dieselbe Frage kann im nächsten Projekt gegenteilig ausgehen — das ist kein Widerspruch.
- **Kosten benennen.** Wenn eine Auflage die erreichbare Qualität deckelt (kein Webfont, kein
  Build-Step, gesperrte Bildbudgets), einmal sagen, was sie kostet, und dann sauber innerhalb der
  Grenze arbeiten. Nicht heimlich unterlaufen, nicht stumm hinnehmen.

Fehlt ein Profil, gilt: nichts ist gesetzt außer Recht und Barrierefreiheit. Dann Stufe 4 nutzen
und bei folgenreichen Weichenstellungen (Stack, Fonts, Bildbudget) nach Stufe 6 fragen.

## Stufe 1 — Konsens (gilt immer, ohne Diskussion)

Unabhängige Quellen, gleiche Aussage. Projektunabhängig gültig:

| Regel | Belegt durch |
|---|---|
| Keine AI-Default-Optik: Purple-Gradients, Mesh-Hero, Gradient-Text, Dark-Glow, Radial-Halo, Glassmorphism-überall | `taste-skill` §0.D · impeccable `ai-color-palette`/`gradient-text`/`dark-glow`/`radial-halo` |
| WCAG AA: Fließtext ≥4.5:1, groß ≥3:1 — Buttons und Formulare explizit prüfen | `taste-skill` §4.5 (mandatory) · impeccable `craft-floor`:9 + `low-contrast`/`gray-on-color` |
| `prefers-reduced-motion` immer bedienen | `taste-skill` ("non-negotiable") · `emil-design-eng` · `apple-design` |
| `window.addEventListener('scroll')` verboten → IntersectionObserver / scroll-driven CSS | `taste-skill` §5.D (harter Bann) · `soft-skill` ("kills mobile performance") |
| `min-height: 100dvh` statt `h-screen`/`100vh` | `taste-skill` · `soft-skill` · `redesign-skill` (alle drei einzeln) |
| Nur `transform`/`opacity` animieren, nie `transition: all` | `emil-design-eng`:44 · `soft-skill` · `prototype`:15 |
| `ease-out` bei Eintritten, nie `ease-in` für UI | `emil-design-eng`:121 · `prototype`:15 (impeccable `bounce-easing` stützt nur die Richtung, verbietet `ease-in` nicht) |
| Grain/Noise nur auf `position: fixed; pointer-events: none` | `taste-skill` §6.E · `soft-skill`:75 |
| Keine gefakten Produkt-Screenshots aus `<div>`s, keine erfundene Spec-Ästhetik | **Einzelquelle:** `taste-skill` §4.8 — unwidersprochen, deshalb bindend, aber kein Konsensbeleg |

## Stufe 2 — Ergänzung (verschiedene Zuständigkeiten, alle anwenden)

Kein Konflikt, sondern Arbeitsteilung. Bei einer Aufgabe ruhig alle passenden gleichzeitig ziehen:

| Domäne | Zuständig |
|---|---|
| Brief lesen, Stilrichtung, Regler setzen | `taste-skill` §0–1 |
| Motion-Mechanik (Easing, Dauer, Origin, Interruptibility) | `emil-design-eng`, `apple-design`, `review-animations` |
| Motion-Chancen finden / bestehende Motion auditieren | `find-animation-opportunities`, `improve-animations` |
| a11y, Performance, Responsive, UX-Copy, Edge-Cases, i18n | impeccable `audit`, `critique`, `harden`, `clarify`, `adapt`, `optimize` |
| Bestehendes verbessern statt neu bauen | `redesign-skill`, impeccable `polish`/`distill` |
| Neue Marke / visuelle Welt aufsetzen | `brandkit`, impeccable `new-work` |
| Vollständige, nicht abgeschnittene Code-Ausgabe | `output-skill` |
| Begriff für einen Motion-Effekt finden | `animation-vocabulary` |
| Varianten zum Durchklicken | `prototype`, impeccable `live` |

Die **Stil-Skills** (`soft-skill`, `minimalist-skill`, `brutalist-skill`, `gpt-tasteskill`,
`stitch-skill`) sind der eine Ausnahmefall: davon **genau einer** pro Aufgabe, gewählt über den
Design-Read. "Soft" und "Brutalist" gleichzeitig ist kein Kompromiss, sondern Matsch.

## Stufe 3 — Präzedenzfälle

`ENTSCHEIDUNGEN.md` lesen, bevor eine strittige Frage neu aufgerollt wird. Auf
**Geltungsbereich** achten: universelle Einträge gelten überall, projektgebundene nur im
zugehörigen Profil.

## Stufe 4 — Kontext-Ableitung

Es gibt **keine Standard-Regler**. Sie werden pro Auftrag aus dem Brief abgeleitet — Branche,
Publikum, Wettbewerb, Preisniveau, Markenmaterial. Vorgehen nach `taste-skill` §0–1:

1. **Design-Read in einem Satz** ausgeben: *"Lese das als: \<Seitentyp> für \<Publikum>, mit
   \<Sprache>, Richtung \<System/Ästhetik>."*
2. **Drei Regler setzen** und begründen: `DESIGN_VARIANCE`, `MOTION_INTENSITY`, `VISUAL_DENSITY`.
3. **impeccable-Modus wählen:** Persuade / Operate / Read / Experience.
4. **Genau einen Stil-Skill** wählen.

Anhaltspunkte statt Vorgaben: Vertrauens-/Regulierungsbranchen (Recht, Medizin, Finanzen,
öffentlicher Dienst) laufen niedriger auf `DESIGN_VARIANCE`; Agentur, Mode, Kultur, Gastro,
Kreativ-Portfolio deutlich höher; Dashboards und Tools höher auf `VISUAL_DENSITY`, aber
niedriger auf `MOTION_INTENSITY`.

**Niedrige Regler sind kein Freibrief für Langeweile.** Auch ein konservativer Brief bekommt
eine eigenständige Handschrift — sie steckt dann in Typografie, Raum und Detail statt in Effekt.

## Stufe 5 — Agenten-Debatte

**Nur wenn alle vier Bedingungen gelten:**
1. Stufen 0–4 lösen es nicht,
2. es liegt ein *belegter* Konflikt aus der Karte unten vor (oder ein neuer, mit Fundstelle),
3. die Entscheidung wirkt auf Sektions- oder Systemebene (nicht ein einzelner Pixelwert),
4. sie ist nicht ohnehin Nutzersache nach Stufe 6.

**Ablauf:**
- **Runde 1 (parallel, ein Nachrichtenblock):** 2–3 Agenten, je *eine* Position. Jeder Agent lädt
  ausschließlich seinen eigenen Skill, argumentiert die stärkste Fassung dieser Position, belegt
  mit `datei:zeile`, und schließt mit zwei Pflichtangaben: **stärkstes Gegenargument** und
  **was mich umstimmen würde**.
- **Runde 2 (nur bei echtem Dissens):** Positionen gegenseitig zustellen (`SendMessage`, gleiche
  Agenten, Kontext bleibt) mit der Frage, was sie nach Kenntnis der Gegenposition revidieren.
  Häufigster Ausgang: die Positionen betrafen verschiedene Geltungsbereiche und lösen sich auf.
- **Synthese:** Ich entscheide gegen Projektgesetz + Brief. **Keine Mehrheitsabstimmung** — drei
  Skills derselben Familie sind keine drei Meinungen. Ergebnis + Ein-Satz-Begründung in
  `ENTSCHEIDUNGEN.md`, mit Geltungsbereich.

**Grenzen:** max. 3 Agenten, max. eine Debatte pro Aufgabe, Runde 2 nur bei bestehendem Dissens.
Eine Debatte über eine Frage, die der Nutzer in zehn Sekunden beantwortet, ist Verschwendung —
dann Stufe 6.

## Stufe 6 — Rückfrage (`AskUserQuestion`)

Wenn die Entscheidung **dem Nutzer gehört**, nicht den Skills:

- **Geld** — API-Keys, Bildbudget, Lizenzkosten für Schriften oder Stockmaterial.
- **Inhalt** — neue Aussagen, Zahlen, Claims, Bilder mit Aussagegehalt.
- **Recht/Datenschutz** — Third-Party-Request, Cookie, `localStorage`, Tracking.
- **Grundsätzlicher Stilwechsel** — Palette, Schriftcharakter, Gesamtanmutung.
- **Geschmack ohne fachliches Richtig/Falsch** — zwei gleich gute Wege.

Eine Frage, konkrete Optionen, Empfehlung zuerst. Kein Fragenkatalog.

---

## Konfliktkarte

Die tatsächlich belegten Widersprüche. **Geltungsbereich beachten:** „profilabhängig" heißt,
die Auflösung kippt mit dem Projekt und wird dort neu entschieden — nicht ein für alle Mal.

| # | Streitpunkt | Positionen | Auflösung | Geltung |
|---|---|---|---|---|
| **K1** | Schriftwahl | `soft-skill`:15 bannt Inter/Roboto/Arial/Helvetica, verlangt Geist/Clash Display · `redesign-skill`:22 will Geist/Outfit/Satoshi statt Systemschrift · impeccable `overused-font` | **Ohne Font-Auflage: Skills gewinnen** — Charakterschrift gehört zum Premium-Anspruch, Systemschrift-Default ist ein Tell. **Mit Auflage:** Stufe 0, Charakter über Hierarchie/Gewicht/Tracking. | profilabhängig |
| **K2** | Framework & Bibliotheken | `soft-skill` schreibt Tailwind + Framer Motion · `taste-skill`:99 empfiehlt shadcn/Motion · `pick-ui-library` empfiehlt npm-Pakete | **Stack des Projekts entscheidet.** Bei freier Wahl den Empfehlungen folgen. Bei Vanilla-Vorgabe als Mechanik-Vorlage lesen und von Hand umsetzen — eher Feature streichen als Dependency schmuggeln. | profilabhängig |
| **K3** | Animationsdauer | `emil-design-eng`:135 "UI unter 300ms" (Button 100–160, Dropdown 150–250, Modal 200–500) · `soft-skill`:69 "Scroll-Reveal 800ms+" | **Scheinkonflikt.** Verschiedene Klassen: *interaktives Feedback* folgt Emils Tabelle, *dekorativer Scroll-Reveal* darf länger, gedeckelt durch `MOTION_INTENSITY`. | universell |
| **K4** | Typo-Skalierung | `brutalist-skill`:92 "massive, aggressiv skalierende Typo" · `gpt-tasteskill` "wide editorial" · gegen `taste-skill`:237 "4-zeilige Headline = Font-Size-Fehler" + impeccable `oversized-h1` | **Über den Brief, nicht pauschal.** `taste-skill`:237 ist eine *Passungs*regel (Headline-Länge zu Schriftgrad), kein Deckel: kurze Headline verträgt große Skala. Lange Komposita (Deutsch) zwingen früher zum Zurückschalten. | universell |
| **K5** | Springs überall? | `redesign-skill`:150 "Spring-Physik auf **allen** interaktiven Elementen" · `emil-design-eng`:151 + `pick-ui-library`:41 "Spring nur bei Velocity/Interruption, simpler Hover braucht CSS-Transition" | **Emil gewinnt fachlich** — Spring bei Gesten/Interruption, CSS-Transition bei simplem Hover/Fade. Ohne Motion-Bibliothek im Stack zusätzlich durch Stufe 0 gestützt. | universell (Verschärfung profilabhängig) |
| **K6** | Bildpflicht | `taste-skill`:274 "auch minimalistische Seiten brauchen 2–3 echte Bilder, reine Textseite ist unfertige Arbeit" · `imagegen-*`/`image-to-code-skill` | **Skills haben recht — für Verkaufsarbeit ist eine reine Textseite unfertig.** Aber Herkunft und Budget sind Nutzersache: Stufe 6, bevor generiert oder lizenziert wird. Nie stillschweigend Kosten auslösen. | universell (Budget: Stufe 6) |
| **K7** | Zufällige Layout-Varianz | `gpt-tasteskill` verlangt Python-getriebene echte Randomisierung | **In der Exploration ja, im Auslieferungsstand nein.** Produktivcode braucht reproduzierbare, reviewbare Diffs. | universell |
| **K8** | Lauter oder leiser | impeccable `bolder`/`overdrive` gegen `quieter`/`distill` | **Kein Konflikt, sondern Parameter.** Über die Regler aus Stufe 4 setzen. | universell |
| **K9** | Wie gründlich iterieren | `output-skill` "erschöpfend, nie kürzen, keine Platzhalter" · impeccable SKILL.md:18 "begrenzte Prüfdurchgänge, aufhören zu polieren" | **Scheinkonflikt.** Verschiedene Achsen: *Code vollständig* ausgeben, in *begrenzten Prüfrunden* verifizieren. Beide gelten. | universell |
| **K10** | Eyebrow/Kicker über Überschrift | impeccable `craft-floor`:26 "ein Bann, den kein Brief zurückgewinnt" · übrige Skills schweigen | **Für neue Arbeit befolgen.** Im Bestand: Befund, kein Auftrag — siehe Hook-Regel. | universell |
| **K11** | Gedankenstriche | `taste-skill` §9.G: Em-Dash **komplett verboten** · impeccable `em-dash-overuse` ist ausdrücklich `advisory: true`, greift erst ab ~8 Em-Dashes pro 500 Zeichen und wird vom Hook standardmäßig **gar nicht** ausgewertet (`advisoryRules: 'exclude'`) | **Kein Konsens, sondern Stärkeunterschied.** Gemeint ist beide Male der englische AI-Tell: Em-Dash (—) als Satzrhythmus. Regel: Em-Dash in Fließtext meiden. **In deutschen Texten gilt das nicht für den Gedankenstrich (–)** — der ist Duden-konform, korrekt gesetzt mit Leerzeichen, und wird vom Detektor auch nicht erfasst. | universell (Sprachabhängig) |

**Neuer Konflikt gefunden?** Nur eintragen, wenn er mit `datei:zeile` aus zwei Skills belegbar
ist. Vermuteter Widerspruch ohne Fundstelle ist keiner.

## Hook-Befunde

Der impeccable-Hook meldet nach jedem UI-Edit Detector-Treffer. Das sind **Befunde, keine
Arbeitsaufträge**:

- Treffer im gerade geänderten Code → beheben.
- Treffer in bestehendem Code, den die Aufgabe nicht betrifft → nennen, nicht ungefragt umbauen.
  Ungefragter Umbau widerspricht `redesign-skill`s Audit-First-Prinzip und impeccables
  "Refinement preserves".
- Treffer, der gegen Stufe 0 gewinnen will → ignorieren, einmal begründen.
