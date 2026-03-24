🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo que contiene la librería headless `@studiolxd/react-scorm` para el runtime de SCORM y una aplicación de demostración interactiva que muestra todas las funcionalidades.

## Paquetes

| Paquete | Descripción |
|---------|-------------|------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Librería headless React + TypeScript para el runtime de SCORM 1.2 / 2004 | [README](./packages/react-scorm/README.md) |
| [`example`](./example/) | Aplicación de demostración interactiva — muestra todas las funcionalidades de la librería | [README](./example/README.md) |

## Primeros pasos

```bash
npm install          # instala todos los workspaces desde la raíz
npm run dev:lib      # compila la librería en modo watch
npm run dev:example  # inicia el servidor de desarrollo del ejemplo (http://localhost:5173)
```

Scripts adicionales disponibles desde la raíz:

- `npm run build` — compila la librería
- `npm run test` — ejecuta la suite de tests de la librería

## Estructura del proyecto

```
react-scorm/
├── package.json          # raíz de npm workspaces (privado)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — publicado en npm
│       └── README.md     # documentación completa de la librería
└── example/              # demostración interactiva (no publicada)
    └── README.md         # documentación de la demostración
```

## Publicación

Solo `packages/react-scorm` se publica en npm. El workspace `example` y la raíz son privados. Para publicar:

```bash
cd packages/react-scorm
npm publish
```

## Licencia

MIT
