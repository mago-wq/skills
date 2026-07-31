# Scrapling – Herkunft

Der Ordner `scrapling-official/` ist eine unveränderte Kopie des offiziellen
Agent-Skills aus dem Scrapling-Repo (`agent-skill/Scrapling-Skill/`).

**Original:** https://github.com/D4Vinci/Scrapling
**Lizenz:** BSD-3-Clause (Text in `LICENSE` hier und in `scrapling-official/LICENSE.txt`)
**Autor:** Karim Shoair (D4Vinci)
**Skill-Version:** 0.4.12
**Stand:** Commit `bc0cf7dede625dd51d748a5a8eda188ae435c99a` (2026-07-30)

## Aktualisieren

```bash
git clone --depth 1 https://github.com/D4Vinci/Scrapling.git /tmp/scrapling
rm -rf scrapling-official
cp -R /tmp/scrapling/agent-skill/Scrapling-Skill scrapling-official
cp /tmp/scrapling/LICENSE _scrapling-meta/LICENSE
```

Danach Version und Commit-Stand oben nachziehen.

## Voraussetzung zur Nutzung

Der Skill ist reine Dokumentation — die Bibliothek selbst muss im Projekt
installiert sein:

```bash
pip install "scrapling[all]>=0.4.12"
scrapling install --force   # Browser-Abhängigkeiten
```
