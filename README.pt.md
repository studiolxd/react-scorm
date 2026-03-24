🌐 [English](README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português](README.pt.md) · [Deutsch](README.de.md) · [Polski](README.pl.md)

# @studiolxd/react-scorm

Monorepo contendo a biblioteca headless `@studiolxd/react-scorm` para o runtime SCORM e um aplicativo de demonstração interativo que apresenta todos os recursos da biblioteca.

## Pacotes

| Pacote | Descrição |
|--------|-----------|
| [`@studiolxd/react-scorm`](./packages/react-scorm/) | Biblioteca headless React + TypeScript para o runtime SCORM 1.2 / 2004 | [README](./packages/react-scorm/README.md) |
| [`example`](./example/) | Aplicativo de demonstração interativo — apresenta todos os recursos da biblioteca | [README](./example/README.md) |

## Primeiros passos

```bash
npm install          # instala todos os workspaces a partir da raiz
npm run dev:lib      # compila a biblioteca em modo watch
npm run dev:example  # inicia o servidor de desenvolvimento do exemplo (http://localhost:5173)
```

Scripts adicionais disponíveis na raiz:

- `npm run build` — compila a biblioteca
- `npm run test` — executa a suíte de testes da biblioteca

## Estrutura do projeto

```
react-scorm/
├── package.json          # raiz dos npm workspaces (privado)
├── packages/
│   └── react-scorm/      # @studiolxd/react-scorm — publicado no npm
│       └── README.md     # documentação completa da biblioteca
└── example/              # demonstração interativa (não publicada)
    └── README.md         # documentação da demonstração
```

## Publicação

Apenas `packages/react-scorm` é publicado no npm. O workspace `example` e a raiz são privados. Para publicar:

```bash
cd packages/react-scorm
npm publish
```

## Licença

MIT
