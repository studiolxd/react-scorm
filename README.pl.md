🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo zawierające bibliotekę headless `@studiolxd/react-scorm` do obsługi środowiska uruchomieniowego SCORM oraz interaktywną aplikację demonstracyjną prezentującą wszystkie funkcje biblioteki.

## Pakiety

| Pakiet | Opis |
|--------|------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Biblioteka headless React + TypeScript — środowisko uruchomieniowe SCORM 1.2 / 2004 |
| [`example`](./example/) | Interaktywna aplikacja demonstracyjna — prezentuje wszystkie funkcje biblioteki |

## Pierwsze kroki

```bash
npm install          # zainstaluj wszystkie workspaces z poziomu korzenia
npm run dev:lib      # buduj bibliotekę w trybie watch
npm run dev:example  # uruchom serwer deweloperski przykładu (http://localhost:5173)
```

Dodatkowe skrypty dostępne z poziomu korzenia:

- `npm run build` — buduje bibliotekę
- `npm run test` — uruchamia zestaw testów biblioteki

## Struktura projektu

```
react-scorm/
├── package.json          # korzeń npm workspaces (prywatny)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — publikowany na npm
│       └── README.md     # pełna dokumentacja biblioteki
└── example/              # interaktywna demonstracja (niepublikowana)
    └── README.md         # dokumentacja demonstracji
```

## Publikacja

Tylko `packages/react-scorm` jest publikowany na npm. Workspace `example` oraz korzeń są prywatne. Aby opublikować:

```bash
cd packages/react-scorm
npm publish
```

## Licencja

MIT
