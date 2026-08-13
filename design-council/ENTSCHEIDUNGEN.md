# Design-Entscheidungen — universelles Gedächtnis

Gedächtnis des Councils. Jeder auf Stufe 4–6 entschiedene Konflikt landet hier und gilt
danach wie Konsens — bis er ausdrücklich gekippt wird. Zweck: dieselbe Frage nicht zweimal
ausdiskutieren.

**In dieser Datei stehen ausschließlich Einträge mit Geltung `universell`.** Sie reist mit
dem Skill mit. Projektgebundene Entscheidungen gehören in die `ENTSCHEIDUNGEN.md` des
jeweiligen Projekts (`design-projekt/` oder `.claude/skills/design-council/`) und werden
**nicht** hierher übernommen.

**Format:** Datum · Streitpunkt · Entscheidung · Begründung in einem Satz · Stufe.

Betrifft eine Entscheidung zusätzlich Recht, Datenschutz, Preise oder inhaltliche Claims,
gehört sie **auch** in den Projekt-Log — dieses Log ist Design-Werkzeug, nicht Projekt-Log.

## Wer trägt hier ein

Nicht der gute Wille, sondern `scripts/wissen-hook.mjs`: Der Stop-Hook prüft beim Beenden
einer Sitzung, ob gearbeitet wurde, ohne eine Wissensdatei anzufassen, und blockt dann
genau einmal mit der Aufforderung, nachzutragen. Einrichtung siehe `settings.hook.json`
und den Abschnitt „Gedächtnis" in `SKILL.md`.

---

| Datum | Streitpunkt | Entscheidung | Begründung | Stufe |
|---|---|---|---|---|
| 2026-07-30 | **K3** Animationsdauer | Interaktives Feedback nach Emils Tabelle, dekorativer Scroll-Reveal darf länger | Scheinkonflikt: verschiedene Element-Klassen, kein echter Widerspruch | 2 |
| 2026-07-30 | **K5** Spring-Physik | Spring bei Gesten/Interruption, CSS-Transition bei simplem Hover/Fade | Emil ist fachlich präziser als „Spring auf allem" | 4 |
| 2026-07-30 | **K7** Layout-Randomisierung | In der Exploration erlaubt, im Auslieferungsstand aus | Produktivcode braucht reproduzierbare, reviewbare Diffs | 4 |
| 2026-07-30 | **K9** Iterationstiefe | Code vollständig ausgeben, Prüfrunden begrenzen | Scheinkonflikt: verschiedene Achsen, beide Regeln gelten gleichzeitig | 2 |
| 2026-07-30 | **Qualitätsmaßstab** | Bestand ist Beweismittel, nie Messlatte | Verkaufsfähige Arbeit misst sich an `craft-floor`/Pre-Flight, nicht an „läuft schon" | 6 |
| 2026-07-30 | **K11** Gedankenstriche | Em-Dash (—) im Fließtext meiden, deutschen Gedankenstrich (–) normal setzen | Schein-Konsens aufgelöst: impeccable führt die Regel als `advisory`, `taste-skill` bannt hart — gemeint ist beide Male der englische AI-Tell, nicht die Duden-Regel | 4 |
| 2026-07-30 | **Auflagen-Typologie** | Profile trennen „Recht & Wahrheit" von „Betriebsentscheidungen" | Nur Betriebsentscheidungen können Qualität deckeln; Rechtspflichten als Deckel zu führen verwechselt Anstand mit einer Einschränkung | 6 |
| 2026-08-13 | **Funktion ohne Backend** | Nie Zustellung behaupten, die nicht stattfindet. Entweder ehrlich beschriften oder den Weg zu Ende bauen: aus den Eingaben eine fertige Nachricht bauen und Mailprogramm oder Messenger damit öffnen | Ein Formular, das „Ihre Anfrage ist bei uns eingegangen" meldet und nichts sendet, ist kein Platzhalter, sondern eine Falschaussage gegenüber Kunden des Auftraggebers | 4 |
| 2026-08-13 | **Kontrast messen** | Farben nie selbst aus `getComputedStyle` parsen, sondern über eine 1×1-Canvas zusammenrechnen lassen | `color-mix(… transparent)` liefert `color(srgb 0.91 0.91 0.93 / 0.82)` — Werte von 0 bis 1 plus Alpha; als 0–255 gelesen hält der Parser jede Farbe für fast schwarz und meldet die halbe Seite als Fehler | 4 |
| 2026-08-13 | **Prüfergebnisse plausibilisieren** | Ein Befund, der überall gleich schlecht ausfällt, prüft sich selbst falsch — vor dem Abarbeiten eine Stelle von Hand gegenrechnen | Kostet eine Minute und verhindert, dass eine funktionierende Seite nach einem Werkzeugfehler umgebaut wird | 4 |
| 2026-08-13 | **Rechtsstand statt Vorlage** | Rechtstexte aus einer bestehenden Fassung nie ungeprüft kopieren: Fundstellen und Verweise gegen den heutigen Stand prüfen | Konkret: § 5 TMG ist seit Mai 2024 § 5 DDG, und die EU-Streitschlichtungsplattform wurde zum 20.07.2025 eingestellt — ein Verweis darauf ist heute falsch, nicht nur veraltet | 4 |
| 2026-08-13 | **Grundausstattung jeder Seite** | `lang`, `<title>`, `description` und Favicon gehören in die Prüfschleife, nicht in die Kür | Fehlende Kopfangaben sieht man beim Ansehen der Seite nicht; in einem Projekt liefen vier von fünf Seiten ohne Titel, bis ein Skript sie mit auslas | 4 |
| 2026-08-13 | **Pflichtseiten und Sonderseiten** | Impressum und Datenschutz müssen von **jeder** Seite erreichbar sein, auch von Seiten mit eigener Navigation | Eine Unterseite ohne Fußzeile verfehlt den Zweck von § 5 DDG, selbst wenn alle anderen Seiten korrekt verlinken | 4 |
