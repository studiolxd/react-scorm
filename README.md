🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo containing the `@studiolxd/react-scorm` headless SCORM runtime library and an interactive demo app that showcases every feature.

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Headless React + TypeScript SCORM 1.2 / 2004 runtime library | [README](./packages/react-scorm/README.md) |
| [`example`](./example/) | Interactive demo app — showcases every library feature | [README](./example/README.md) |

## Getting Started

```bash
npm install          # install all workspaces from the root
npm run dev:lib      # build the library in watch mode
npm run dev:example  # start the example dev server (http://localhost:5173)
```

Additional scripts available from the root:

- `npm run build` — builds the library
- `npm run test` — runs the library test suite

## Project Structure

```
react-scorm/
├── package.json          # npm workspaces root (private)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — published to npm
│       └── README.md     # full library documentation
└── example/              # interactive demo (not published)
    └── README.md         # demo documentation
```

## Publishing

Only `packages/react-scorm` is published to npm. The `example` workspace and the root are private. To publish:

```bash
cd packages/react-scorm
npm publish
```

## License

MIT
