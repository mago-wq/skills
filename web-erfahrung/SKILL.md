---
name: web-erfahrung
description: Fallen aus tatsächlich gebauten Web-Projekten, jeweils mit dem Symptom, an dem man sie erkennt — Orientierung im fremden Repo, Typografie mit Textmarker und Umlauten, Markenfarben als Fläche, Layout- und Motion-Fallstricke, Prüfen vor der Abgabe, 3D-Modelle und Bau-Assets. Dazu ein ausgeführtes Referenzprojekt in references/. Immer laden, bevor an einer Website gebaut, umgebaut oder etwas repariert wird — auch bei scheinbar kleinen Änderungen wie "mach den Knopf grüner" oder "die Überschrift auch auf der anderen Seite", und besonders bei einem neuen Projekt, einem fremden Repo oder einer gemeldeten Regression.
---

# Web-Erfahrung

Jeder Punkt hier hat einmal Zeit gekostet — in echten Projekten, nicht in der Theorie. Deshalb
steht bei den meisten das **Symptom** dabei: der Anblick, an dem du die Ursache erkennst, ohne
sie erst suchen zu müssen.

Der Design-Council beantwortet *wie soll es aussehen*. Diese Datei beantwortet *woran ist es
schon einmal gescheitert*. Beides gilt gleichzeitig.

## 0. Bevor die erste Zeile geändert wird

**Erst herausfinden, welchen Code der Mensch tatsächlich vor sich sieht.** Das Repo, in dem die
Sitzung startet, ist nicht zwingend das Projekt. Der Standard-Branch ist nicht zwingend der
Branch, aus dem die Vorschau kommt.

Symptom: Auf dem Screenshot sind Elemente zu sehen, die es im ausgecheckten Stand nicht gibt —
ein grüner Knopf, wo im Code `btn-secondary` steht. Dann stimmt Repo oder Branch nicht.

Vorgehen: nach dem sichtbaren Text aus dem Screenshot greppen. Findet sich nichts, die
verfügbaren Repos auflisten und den Branch-Verlauf ansehen. Ein Branch, auf den zuletzt
inhaltliche Commits gingen, während der Standard-Branch stillsteht, ist der Arbeitsstand — dort
schaut der Mensch hin, dort gehört die Änderung hin.

Der Preis, wenn man das überspringt: eine sauber gebaute Änderung an einer Datei, die niemand
ausliefert.

## 1. Wenn eine Regression gemeldet wird

**Erst den eigenen Diff ansehen, dann rendern, dann antworten.** Nicht sofort reparieren.

Ein gemeldeter Fehler ist eine Beobachtung, keine Ursachenanalyse — und der Mensch ordnet ihn
naheliegenderweise der letzten Änderung zu. Prüfe, welche Dateien dein Commit wirklich angefasst
hat, wann die betroffene Datei zuletzt geändert wurde, und rendere den gepushten Stand.

Deckt sich der Render mit dem, was vorher richtig war, dann liegt es an Cache, Deployment,
Branch oder Gerät — und du fragst gezielt danach, statt an gesundem Code zu drehen. Ein Bild vom
aktuellen Stand mitzuschicken spart dabei eine ganze Runde.

Deckt es sich nicht: gefunden, reparieren.

## 2. Typografie

**Textmarker-Balken hinter Text und enger Durchschuss vertragen sich nicht.** Ein Balken, der
hinter einem Wort liegt (`::before`, `z-index: -1`), reicht über die Ober- und Unterkante der
Versalien hinaus. Bei Zeilenhöhe um 1.0 stößt er in die Nachbarzeile.

Symptom im Deutschen zuerst sichtbar: die Punkte über dem Ü verschwinden halb unter dem Balken
der Zeile darüber. Abhilfe ist mehr Durchschuss für genau diese Überschrift (~1.25), nicht
weniger Balken. Prüfen heißt hier: rendern, den Ausschnitt vergrößern, hinsehen — 1.16 sah in
der Rechnung genug aus und war es nicht.

**Zeilenweise Einblendungen mit Maske schneiden Umlaute ab.** Läuft jede Zeile hinter ihrer
eigenen `overflow: hidden`-Maske hoch, liegen Umlautpunkte oben und Kommas unten außerhalb des
Zeilenkastens. Aus WÄHLEN wird WAHLEN. Innenabstand schafft die Luft, negativer Außenabstand
nimmt sie optisch zurück.

**Plakatschriften brauchen eine eigene Größenleiter.** Anton und Verwandte haben eine hohe
Versalhöhe und wirken bei gleicher Pixelzahl deutlich größer als Inter. Wer eine Seite auf eine
Plakatschrift umstellt und die Grade behält, hat unbeabsichtigt alles vergrößert. Ebenso die
Sperrung: negatives `letter-spacing` aus einem Inter-Entwurf ist bei Versalien falsch.

## 3. Farbe

**Die Logofarbe einer Marke ist nicht ihre Flächenfarbe.** Markenhandbücher führen meist zwei
Werte: einen leuchtenden für kleine Zeichen auf hellem Grund und einen dunkleren für Flächen und
Schaltflächen. Whats App ist das Lehrbuchbeispiel — `#25d366` ist korrekt fürs Logo und
überstrahlt als handflächengroßer Knopf auf dunklem Grund alles andere auf der Seite;
`#1daa61` ist derselbe Farbton, gebaut für genau diesen Zweck.

Symptom: Der Mensch sagt „nicht so knallig, aber die echte Markenfarbe". Das ist kein
Widerspruch — er meint den zweiten Wert.

**Kontrast nachrechnen und die Zahl in den Kommentar schreiben.** Nicht, weil Kommentare schön
sind, sondern weil die nächste Farbrunde sonst dieselbe Rechnung neu macht. 4,5:1 für Fließtext,
3:1 erst ab 24 px oder 18,66 px fett — ein 15-px-Knopf in halbfett ist *kein* großer Text.
Gedrückte und überfahrene Zustände mitrechnen, die fallen sonst durch.

**Ein Farbverlauf unter Text scheitert fast immer am Kontrast.** Er müsste an seinem hellsten
*und* dunkelsten Punkt tragen. Verläufe gehören auf Zierde — Preise, Marker, Lichtschein —, nicht
unter Beschriftungen.

## 4. Layout und Motion

**`transform: rotate()` auf einer großen weichgezeichneten Fläche schiebt die Seite seitlich
auf.** Ein Quadrat braucht während der Drehung bis zum Wurzel-zwei-fachen seiner Kantenlänge.
Auf schmalen Bildschirmen entsteht daraus waagerechtes Scrollen. Statt das Element zu drehen,
den Winkel des Farbverlaufs animieren — als `@property` mit `syntax: "<angle>"`, damit er
überhaupt weich läuft. Kennt ein Browser das nicht, steht der Verlauf still: Farbe bleibt,
Bewegung entfällt, nichts bricht.

**`overflow-x: clip` statt `hidden`.** `hidden` legt einen Scrollbereich an, und darin hört
`position: sticky` auf zu kleben. `clip` schneidet nur ab.

**Feste Spaltenzahlen im Raster zerquetschen Inhalte.** Zwei feste Spalten quetschen unter etwa
960 px die schmalere auf wenige Pixel — die Überschrift bricht Buchstabe für Buchstabe um. Unter
dem Umbruchpunkt auf eine Spalte gehen und dabei entscheiden, was zuerst kommt.

**Einblendungen beim Laden auslösen heißt: niemand sieht sie.** Auf einer schweren Seite ist die
Animation vorbei, bevor das Bild steht; man sieht nur den Endzustand. Beim Hereinscrollen
auslösen (`IntersectionObserver`, Klasse setzen).

**`prefers-reduced-motion` muss auf dem Endzustand landen.** Wer nur die Transition abschaltet,
lässt Blöcke bei `opacity: 0` und `translateY` stehen — der Inhalt bleibt unsichtbar. Farbe
bleibt, Bewegung nicht: jede Startposition explizit zurücksetzen.

**Gegen Design-Systeme und Inline-Styles hilft nur mehr Gewicht.** `.btn.btn-primary` statt
`.btn-primary`, wenn sonst die Ladereihenfolge der Stylesheets entscheidet. `!important` dort,
wo Werte im `style`-Attribut stehen oder ein Skript sie beim Überfahren neu schreibt — mit
Kommentar, warum, sonst räumt es die nächste Runde weg und der Fehler kommt zurück.

## 5. Prüfen, bevor du abgibst

Kein CSS-Nachdenken ersetzt einen Render. Konkret:

- Headless-Browser auf die Seite, **Desktop und 360 px**. Änderungen an Überschriften und
  Knöpfen fallen fast immer erst schmal auseinander.
- `document.documentElement.scrollWidth - clientWidth` abfragen. Größer als 0 heißt: irgendetwas
  schiebt waagerecht auf, und es ist praktisch nie das, was man vermutet.
- Konsolenfehler mitlesen (`pageerror`), nicht nur das Bild ansehen.
- Die Seiten mitprüfen, die du **nicht** angefasst hast, wenn die Änderung in einer geteilten
  CSS-Datei liegt. Eine gemeinsame Grundlage ist ein Vorteil und ein Hebel zugleich.
- Bei Typografie den Ausschnitt vergrößern. Der ganze Screenshot zeigt nicht, ob ein Balken die
  Umlautpunkte der Zeile darunter anschneidet.

## 6. 3D-Modelle und Bau-Assets

**Blenders Z-oben nach three.js' Y-oben ist eine Drehung, keine Spiegelung.** Die Abbildung
`(x, y, z) → (x, z, -y)` hat Determinante +1, der Umlaufsinn der Dreiecke bleibt also. Dreht man
ihn „zur Sicherheit" trotzdem um, zeigen sämtliche Normalen nach innen.

Symptom: fleckige graue Wolken auf dem Objekt statt weicher Schattierung, und ein Aufdruck, der
gar nicht erscheint — er sitzt auf der Rückseite des Stoffs. Vor dem Debuggen der Beleuchtung
also erst den Umlaufsinn prüfen.

**Druckbereiche als Anteile der Modellmaße definieren, nie in absoluten Koordinaten.** Dann
kostet der Austausch eines Modells eine Datei und keine Neujustierung von Kamera, Zonen und
Preisen. Beim Austausch die Zielhöhe des alten Modells übernehmen — sie ist der Maßstab, an dem
alles andere hängt.

**Große Quelldateien bleiben draußen, das Bauskript kommt hinein.** Eine 24-MB-`.blend`
verdoppelt ein 21-MB-Repo. Wenn die Vorlagen der übrigen Modelle auch nicht eingecheckt sind,
ist das die Hausregel — ihr folgen und dem Menschen sagen, dass er die Datei aufheben muss.
Prüfen, dass das Skript byteweise dasselbe Ergebnis liefert, sonst ist es Dekoration.

**Hilfsskripte nie wie ein Modul der Standardbibliothek benennen.** Ein `inspect.py` im
Arbeitsverzeichnis bringt `bpy` mit einem Absturz tief in einer C-Bibliothek zu Fall
(„InitGoogleLogging() twice"), der nach allem aussieht, nur nicht nach dem Dateinamen. Gleiches
gilt für `types.py`, `json.py`, `random.py`, `email.py`.

## 7. Wie eine Seite aussieht, die gut gealtert ist

`references/referenzprojekt-textildruck.md` beschreibt ein ausgeführtes Projekt, an dem sich
zeigen lässt, was die Punkte oben im Zusammenhang bedeuten: eine gemeinsame CSS-Grundlage mit
eigenem Namensraum, Kommentare, die das Warum und die verworfenen Alternativen festhalten,
Gestaltungswerte als Variablen statt als Einzelfälle pro Seite, und ein 3D-Konfigurator, dessen
Zonen einen Modelltausch überleben.

Die Datei lesen, wenn ein neues Projekt aufgesetzt wird oder wenn du entscheidest, wie eine
Seite intern aufgebaut sein soll — nicht für jede einzelne Änderung.
