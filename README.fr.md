🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo contenant la bibliothèque headless `@studiolxd/react-scorm` pour le runtime SCORM et une application de démonstration interactive présentant toutes les fonctionnalités.

## Paquets

| Paquet | Description |
|--------|-------------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Bibliothèque headless React + TypeScript pour le runtime SCORM 1.2 / 2004 | [README](./packages/react-scorm/README.md) |
| [`example`](./example/) | Application de démonstration interactive — présente toutes les fonctionnalités de la bibliothèque | [README](./example/README.md) |

## Démarrage

```bash
npm install          # installe tous les workspaces depuis la racine
npm run dev:lib      # compile la bibliothèque en mode watch
npm run dev:example  # démarre le serveur de développement de l'exemple (http://localhost:5173)
```

Scripts supplémentaires disponibles depuis la racine :

- `npm run build` — compile la bibliothèque
- `npm run test` — exécute la suite de tests de la bibliothèque

## Structure du projet

```
react-scorm/
├── package.json          # racine npm workspaces (privé)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — publié sur npm
│       └── README.md     # documentation complète de la bibliothèque
└── example/              # démonstration interactive (non publiée)
    └── README.md         # documentation de la démonstration
```

## Publication

Seul `packages/react-scorm` est publié sur npm. Le workspace `example` et la racine sont privés. Pour publier :

```bash
cd packages/react-scorm
npm publish
```

## Licence

MIT
