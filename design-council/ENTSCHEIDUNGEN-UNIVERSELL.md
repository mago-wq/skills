# Universelle Entscheidungen

Präzedenzfälle, die in einem Projekt entschieden wurden und **überall gelten**. Sie
reisen mit dem Skill-Repo mit und werden in Stufe 3 der Eskalationsleiter gelesen,
bevor eine strittige Frage neu aufgerollt wird.

Projektgebundene Entscheidungen gehören **nicht** hierher, sondern bleiben in
`.claude/design-projekt/ENTSCHEIDUNGEN.md` des jeweiligen Projekts. Testfrage vor dem
Eintrag: *Würde ich das in einem Projekt mit ganz anderer Branche, Sprache und
Zielgruppe genauso entscheiden?* Nur dann steht es hier richtig.

| Datum | Streitpunkt | Entscheidung | Begründung | Stufe |
|---|---|---|---|---|
| 11.08.2026 | Gedankenstriche (Halbgeviert, Geviert) im sichtbaren Text | Im Fließtext nicht verwenden. Statt dessen Komma, Doppelpunkt oder Punkt. Der Bindestrich in zusammengesetzten Wörtern bleibt unberührt. | Der Einschub mit Gedankenstrich ist zur Handschrift maschinell erzeugter Texte geworden. Auf einer Kundenseite weckt er genau den Verdacht, den die Seite nicht wecken darf. Bei fremdem Text (Kundenkopie) heißt das: Strich ersetzen, kein Wort ändern, jede Ersetzung auflisten. | 4 |
| 11.08.2026 | Wie stellt man sicher, dass eine Schreib- oder Farbregel eingehalten wird? | Jede Regel, die man sich vornimmt, bekommt eine maschinelle Prüfung über das **gebaute** Ergebnis. Ohne Prüfung gilt sie als nicht getroffen. | Zwei Projekte in Folge haben dieselbe Regel gebrochen, obwohl sie schriftlich festgehalten war. Eine Regel ohne Prüfung ist ein Vorsatz. Gemessen wird am gerenderten Text, nicht an der Quelle, damit auch erwischt wird, was ein Skript zur Laufzeit einsetzt. | 4 |
| 11.08.2026 | Eine Markenfarbe, zwei Verwendungen (Fläche und Schrift) | Aus jeder Markenfarbe zwei Werte ableiten und getrennt benennen: einen für Flächen (mit dunkler Schrift darauf) und einen abgedunkelten für Schrift auf hellem Grund. Der Wert aus dem Logo ist fast immer der Flächenwert. | Signalfarben aus Logos (Gelb, Orange, Hellgrün) liegen als Schrift auf Weiß regelmäßig unter 2:1. Wer das erst im Kontrastlauf merkt, baut die halbe Seite um. Vorher ableiten kostet fünf Minuten. | 1 |
| 11.08.2026 | Fremde Karten, Videos und Social-Bausteine einbetten | Verlinken statt einbetten, solange die Einbettung nicht die eigentliche Funktion ist. | Eine Einbettung überträgt die IP-Adresse des Besuchers beim Laden an einen Dritten und zieht damit Einwilligungswerkzeug, Banner und einen Absatz in der Datenschutzerklärung nach sich, der gepflegt werden muss. Ein Link kostet nichts davon und erledigt dieselbe Aufgabe. | 4 |

## Offen

| Streitpunkt | Warum offen |
|---|---|
| Gedankenstrich in Zahlen- und Datumsspannen („10–15 m") | Dort ist er typografisch korrekt und kein Stilmittel. Bisher kein Fall aufgetreten, in dem das auf einer Kundenseite nötig war. Wird einer auftreten, hier entscheiden. |
