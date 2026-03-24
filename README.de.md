🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo, das die headless-Bibliothek `@studiolxd/react-scorm` für die SCORM-Laufzeitumgebung und eine interaktive Demo-App enthält, die alle Funktionen der Bibliothek zeigt.

## Pakete

| Paket | Beschreibung |
|-------|--------------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Headless React + TypeScript Laufzeitbibliothek für SCORM 1.2 / 2004 |
| [`example`](./example/) | Interaktive Demo-App — zeigt alle Funktionen der Bibliothek |

## Erste Schritte

```bash
npm install          # alle Workspaces vom Root aus installieren
npm run dev:lib      # Bibliothek im Watch-Modus bauen
npm run dev:example  # Entwicklungsserver der Demo starten (http://localhost:5173)
```

Weitere Skripte, die vom Root aus verfügbar sind:

- `npm run build` — baut die Bibliothek
- `npm run test` — führt die Test-Suite der Bibliothek aus

## Projektstruktur

```
react-scorm/
├── package.json          # npm-workspaces-Root (privat)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — auf npm veröffentlicht
│       └── README.md     # vollständige Bibliotheksdokumentation
└── example/              # interaktive Demo (nicht veröffentlicht)
    └── README.md         # Demo-Dokumentation
```

## Veröffentlichung

Nur `packages/react-scorm` wird auf npm veröffentlicht. Der `example`-Workspace und der Root sind privat. Zur Veröffentlichung:

```bash
cd packages/react-scorm
npm publish
```

## Lizenz

MIT
