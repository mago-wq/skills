# Referenzprojekt: Textildruck Grimma

Eine Shop- und Konfigurator-Seite für eine Textil- und Tassendruckerei — Startseite, Shop mit 63
Artikeln, 3D-Konfigurator, Über uns, Kontakt. Statisches HTML, ein Komponentengerüst, kein
Framework-Buildschritt. Sie steht hier nicht, weil sie besonders aufwendig wäre, sondern weil
Änderungen an ihr **billig** sind: Der Grund dafür lässt sich in fünf Punkten benennen und auf
andere Projekte übertragen.

## 1. Eine gemeinsame Grundlage mit eigenem Namensraum

Die Optik liegt in **einer** Datei (`assets/werkstatt.css`), die jede Seite einbindet — auch die,
die ihren Stil ursprünglich selbst mitbrachte. Farben, Schriftgrade, Knöpfe, Karten, Motion:
eine Quelle.

Alle Klassen tragen ein Präfix (`w-` für Werkstatt), damit sie sich weder mit dem mitgelieferten
Design-System noch mit den seitenspezifischen Klassen des Konfigurators (`k-`) beißen. Das klingt
nach Formalie und ist der Grund, warum man eine Klasse ergänzen kann, ohne die anderen beiden
Ebenen zu lesen.

Der Hebel, den das gibt: Die Whats-App-Farbe zu ändern hieß, **eine** Regel anzufassen und eine
Variable einzuführen — nicht sechs Schaltflächen auf fünf Seiten zu suchen. Der Preis, den es
verlangt: Wer diese Datei anfasst, muss die Seiten mitprüfen, die er nicht gemeint hat.

## 2. Kommentare, die das Warum und das Verworfene festhalten

Der Stil der Kommentare ist der eigentliche Wert des Projekts. Sie erklären nicht, *was* eine
Regel tut — das steht daneben —, sondern warum sie so aussieht und was stattdessen versucht
wurde. Drei echte Beispiele:

> Der Hauptknopf bleibt einfarbig. Der Farbverlauf wäre hier verlockend, scheitert aber am
> Kontrast: Druckfarbe auf dem rostroten Anfang kommt nur auf 2,9:1, weiße Schrift auf dem
> minzfarbenen Ende auf 2,2:1 — beides zu wenig für Text.

> Gedreht wird der Farbverlauf, nicht das Element. Mit `transform: rotate()` wäre der Platzbedarf
> des Quadrats zwischendurch um bis zum Wurzel-zwei-fachen gewachsen — auf schmalen Bildschirmen
> schob das die ganze Seite seitlich auf.

> Ohne Textmarker: die Zeile läuft über drei Zeilen, dort drängt sich der Balken zwischen die eng
> gesetzten Zeilen und deckt die Nachbarn an.

Der dritte ist der interessanteste. Als die Aufgabe kam, den Marker auch im Shop zu setzen, stand
die Begründung des Weglassens schon da — inklusive des Problems, das dabei zu lösen war. Kein
Nachbauen des Fehlers, kein Ratespiel. **Ein Kommentar, der eine bewusste Auslassung begründet,
ist mehr wert als drei, die Selbstverständliches beschreiben.**

Ebenso festgehalten werden gemessene Zahlen (Kontrastwerte), damit die nächste Farbrunde nicht
neu rechnet.

## 3. Gestaltungswerte als Variablen, nicht als Einzelfälle

Vorher trug jede Überschrift ihr eigenes `clamp()` im `style`-Attribut. Jetzt gibt es eine Leiter
in `:root` — `--w-h1` bis `--w-h5`, dazu Fließtext- und Kicker-Grade — und vier Druckfarben plus
eine abgeleitete Signalfarbe.

Zwei Dinge machen das mehr als Kosmetik:

- **Die Akzentleiter des Design-Systems wird überschrieben, nicht ergänzt.** Das mitgelieferte
  Lavendel färbte Links, den aktiven Navigationspunkt und den Lichtschein im Hintergrund. Statt
  diese Stellen einzeln nachzuziehen, wurden `--color-accent-100` bis `-900` neu belegt. Danach
  bleibt nichts übrig, das später als vergessener Rest auffällt.
- **Die Farbanzahl wurde bewusst reduziert.** Sechs Druckfarben wurden auf vier gekürzt, als
  auffiel, dass zwei davon als große einfarbige Flächen dominierten. Weniger Farben, klarere
  Rollen — jede hat eine Aufgabe statt eines Platzes im Kreis.

## 4. Motion mit Grund und mit Rückfallebene

Vier Bewegungen, jede mit einem Zweck:

| Bewegung | Zweck | Auslöser |
|---|---|---|
| Zeileneinzug der Überschrift | Aufmerksamkeit auf die Aussage | Hereinscrollen |
| Textmarker wischt durch | hebt ein Wort hervor | Hereinscrollen, verzögert |
| drehender Lichtschein | dauerhaft sichtbares Leben hinter der 3D-Bühne | Dauerschleife |
| Knopf fährt in seinen Schatten | greifbares Drücken | `:active` |

Jede hat eine Rückfallebene. `prefers-reduced-motion` setzt alle Startzustände explizit auf den
Endzustand, statt nur Transitions abzuschalten — sonst bliebe der Inhalt unsichtbar. Der Shop hat
kein Einblend-Skript, deshalb gibt es für den Marker zusätzlich eine Keyframe-Variante, die ohne
Auslöser läuft. Und wo Bewegung von einer neueren CSS-Fähigkeit abhängt (`@property`), steht der
Verlauf im alten Browser eben still.

## 5. Der 3D-Konfigurator: austauschbare Modelle

Der lehrreichste Teil. Sechs Produkte, jedes ein quantisiertes Modell in `assets/model-*.js`:
Positionen als Int16 gegen die halbe Ausdehnung normiert, Indizes als Zickzack-Varint-Deltas
(etwa ein Viertel der Größe von Uint32), **keine** Normalen — die rechnet der Betrachter selbst.
Ein Tote-Bag-Modell mit 80.000 Punkten passt so in 1,4 MB.

Entscheidend ist aber nicht die Kompression, sondern:

**Druckbereiche stehen als Anteile der Modellmaße**, nicht in absoluten Koordinaten:

```js
tasche: [
  { id:'mitte', name:'Mitte', dir:[0,0,1], x:[0.28,0.72], y:[0.22,0.44], w:22, depth:0.03 },
  …
]
```

Deshalb kostete der Austausch der Stofftasche — ein anderes Modell, andere Punktzahl, andere
Henkelform — genau **eine Datei**. Kamera, Zonen, Preis, Ansichtsknöpfe blieben unangetastet,
weil die Zielhöhe (0,66 m inklusive Henkel) beibehalten wurde.

Dazu kommen zwei Vorsichtsmaßnahmen, die man erst schätzt, wenn man sie braucht:

- Fehlt eine Modelldatei, fällt der Konfigurator auf eine prozedural gebaute Geometrie zurück,
  statt eine leere Bühne zu zeigen.
- Auf hauchdünnen Teilen (Trageschlaufen) heben sich die Flächennormalen auf; solche Nullnormalen
  würden schwarz beleuchtet. Sie werden aus der Lage zum Schwerpunkt ersetzt.

## Was sich nicht übertragen lässt

Der Vollständigkeit halber: Die Seite lebt vom Werkstatt-Look — Plakatschrift in Versalien, harte
Kanten, harte Schlagschatten, Siebdruck-Farbauszug. Das passt zu einer Druckerei und wäre für
eine Kanzlei oder ein Medizinprodukt falsch. **Übertragbar ist die Bauweise, nicht der Look.**
Was in ein neues Projekt gehört, sind die fünf Punkte oben; welche Haltung die Seite trägt,
beantwortet der Design-Council mit dem Projektprofil.
