# Storybook – Frontend Asgard CRM

O Storybook está configurado para documentar os componentes UI do projeto.

## Requisito

- **Node.js 18 ou superior** (o Storybook 8 não suporta Node 16).

Se estiver a usar Node 16, atualize com `nvm use 18` (ou instale Node 18+) antes de rodar o Storybook.

## Comandos

- **Desenvolvimento:** `bun run storybook` — inicia o Storybook em http://localhost:6006
- **Build estático:** `bun run build-storybook` — gera a build para deploy

## Erro: «Failed to fetch dynamically imported module»

1. **Node 18+** — obrigatório para o Storybook 8.
2. **Cache do Vite:** pare o Storybook, apague `node_modules/.cache/storybook` (se existir) e suba de novo.
3. **Config:** `.storybook/main.cjs` está em **CommonJS** de propósito: com `"type": "module"` no `package.json`, um `main.ts` era compilado pelo Storybook como CJS mas avaliado num contexto ESM (ex.: Bun), o que gerava `require is not defined`. O `main.cjs` é carregado com `require()` nativo. Inclui `viteFinal` com `server.fs.allow` + `optimizeDeps.include` e merge seguro de `resolve.alias`.

## Onde estão as stories

As stories ficam no diretório `src/stories/` com nomenclatura **PascalCase.stories.tsx** (ex.: `Button.stories.tsx`). O `meta.component` define o componente; as variantes usam apenas `args`, sem chamar o componente diretamente.

- `src/stories/Button.stories.tsx`
- `src/stories/Card.stories.tsx`
- `src/stories/Input.stories.tsx`
- `src/stories/Badge.stories.tsx`
- `src/stories/Alert.stories.tsx`
- `src/stories/Switch.stories.tsx`

Regras de documentação: `.cursor/rules/frontend/storybook-pattern.mdc`.
