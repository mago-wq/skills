#!/usr/bin/env node
/**
 * Stop-Hook: erzwingt, dass gelerntes Wissen weggeschrieben wird.
 *
 * Warum es den Hook gibt: Der Council beschreibt in SKILL.md, dass Entscheidungen
 * der Stufen 4–6 in ENTSCHEIDUNGEN.md gehoeren. Nur *beschrieben* heisst nicht
 * *passiert* — im Projekt textildruck-grimma stand der letzte Eintrag vom
 * 2026-07-30, obwohl danach mehrere Arbeitssitzungen liefen und dabei sehr wohl
 * Entscheidungen fielen. Niemand hat sie eingetragen, weil nichts danach fragte.
 *
 * Der Hook prueft beim Beenden einer Sitzung: Wurde gearbeitet, ohne dass eine der
 * Wissensdateien angefasst wurde? Dann blockt er das Beenden genau einmal und sagt,
 * was einzutragen ist.
 *
 * Bewusst zurueckhaltend:
 *   - blockt hoechstens einmal pro Sitzung (stop_hook_active + Marker je Sitzung),
 *   - blockt gar nicht, wenn nichts geaendert wurde,
 *   - blockt gar nicht, wenn die Wissensdateien schon angefasst wurden,
 *   - faellt bei jedem Fehler still auf "durchlassen" zurueck. Ein Hook, der eine
 *     Sitzung blockiert, weil er selbst kaputt ist, waere schlimmer als kein Hook.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';

const DURCHLASSEN = 0;

/** Dateien, die als "Wissen wurde festgehalten" zaehlen. */
const WISSENSDATEIEN = /(ENTSCHEIDUNGEN\.md|PROJEKTPROFIL\.md|CLAUDE\.md|LEARNINGS\.md)$/i;

/** Aenderungen, die keine Arbeit im Sinne des Councils sind. */
const IGNORIEREN = /(^|\/)(node_modules|dist|build|\.next|coverage|package-lock\.json|\.claude\/state)/;

/** Nur an diesen Endungen haengt eine Design- oder Code-Entscheidung. */
const RELEVANT = /\.(html?|css|scss|jsx?|tsx?|astro|vue|svelte|md|json)$/i;

function lies(stroem) {
  try {
    return JSON.parse(readFileSync(stroem, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

function main() {
  const eingabe = lies(0);

  // Der Hook hat in dieser Sitzung schon einmal geblockt. Nicht noch einmal —
  // sonst entsteht eine Schleife, aus der die Sitzung nicht mehr herauskommt.
  if (eingabe.stop_hook_active) return DURCHLASSEN;

  const projekt = process.env.CLAUDE_PROJECT_DIR || eingabe.cwd || process.cwd();
  if (!existsSync(join(projekt, '.git'))) return DURCHLASSEN;

  // Zweiter Riegel gegen Schleifen: ein Marker je Sitzung. stop_hook_active allein
  // reicht nicht, wenn der Hook ueber mehrere Stop-Ereignisse hinweg laeuft.
  const sitzung = String(eingabe.session_id || 'ohne-id').replace(/[^\w-]/g, '');
  const markerOrdner = join(process.env.XDG_STATE_HOME || join(homedir(), '.local', 'state'), 'design-council');
  const marker = join(markerOrdner, `wissen-${sitzung}`);
  if (existsSync(marker)) return DURCHLASSEN;

  let geaendert = [];
  try {
    // Sowohl unversionierte als auch bereits committete Arbeit dieser Sitzung:
    // wer committet und dann beendet, hat genauso gearbeitet.
    const offen = git(['status', '--porcelain'], projekt)
      .split('\n')
      .map((z) => z.slice(3).trim())
      .filter(Boolean);
    let seitBasis = [];
    try {
      const basis = git(['rev-parse', '--verify', '-q', '@{upstream}'], projekt).trim();
      seitBasis = git(['diff', '--name-only', basis + '..HEAD'], projekt).split('\n').filter(Boolean);
    } catch {
      /* Kein Upstream (neuer Branch): dann zaehlt nur der offene Stand. */
    }
    geaendert = [...new Set([...offen, ...seitBasis])].filter((d) => !IGNORIEREN.test(d));
  } catch {
    return DURCHLASSEN;
  }

  const gearbeitet = geaendert.filter((d) => RELEVANT.test(d) && !WISSENSDATEIEN.test(d));
  const festgehalten = geaendert.filter((d) => WISSENSDATEIEN.test(d));

  // Nichts gemacht, oder Wissen schon festgehalten: nichts zu tun.
  if (gearbeitet.length === 0) return DURCHLASSEN;
  if (festgehalten.length > 0) return DURCHLASSEN;

  // Wohin der Eintrag gehoert: erste vorhandene Ablage gewinnt.
  const kandidaten = [
    'design-projekt/ENTSCHEIDUNGEN.md',
    '.claude/skills/design-council/ENTSCHEIDUNGEN.md',
    'ENTSCHEIDUNGEN.md',
  ];
  const ziel = kandidaten.find((p) => existsSync(join(projekt, p)));

  try {
    mkdirSync(markerOrdner, { recursive: true });
    writeFileSync(marker, new Date().toISOString());
  } catch {
    /* Marker nicht schreibbar: dann greift immerhin stop_hook_active. */
  }

  const beispiele = gearbeitet.slice(0, 8).map((d) => '  - ' + d).join('\n');
  const wohin = ziel
    ? `\`${ziel}\``
    : 'eine neue `ENTSCHEIDUNGEN.md` (Vorlage: `design-council/ENTSCHEIDUNGEN.md`)';

  const grund = [
    'Design-Council, Gedächtnis: In dieser Sitzung wurde gearbeitet, aber keine',
    'Wissensdatei angefasst.',
    '',
    'Geändert wurden unter anderem:',
    beispiele,
    gearbeitet.length > 8 ? `  … und ${gearbeitet.length - 8} weitere` : null,
    '',
    `Bevor du beendest: Trage in ${wohin} jede Entscheidung ein, die du auf`,
    'Stufe 4–6 getroffen hast — also alles, was du aus dem Kontext abgeleitet, per',
    'Agenten-Debatte geklärt oder beim Nutzer erfragt hast. Format: Datum ·',
    'Streitpunkt · Entscheidung · Begründung in einem Satz · Stufe · Geltung',
    '(universell oder projektgebunden).',
    '',
    'Projektspezifische Fehler und bewährte Muster gehören zusätzlich in die',
    '`CLAUDE.md` des Projekts, mit Symptom, Ursache und Behebung.',
    '',
    'War tatsächlich keine Entscheidung dabei, schreib das in einem Satz und',
    'beende — dieser Hook fragt in dieser Sitzung nicht noch einmal.',
  ]
    // Nur die weggelassene Zusatzzeile entfernen — die Leerzeilen sind Absätze.
    .filter((z) => z !== null)
    .join('\n');

  process.stdout.write(JSON.stringify({ decision: 'block', reason: grund }));
  return DURCHLASSEN;
}

try {
  process.exit(main());
} catch {
  // Ein kaputter Hook darf niemals eine Sitzung aufhalten.
  process.exit(DURCHLASSEN);
}
