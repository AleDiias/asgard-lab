# Saída do build (pasta `dist/`)

Após `bun run build`, o Vite gera a pasta `dist/` com os ficheiros estáticos para deploy.

## Estrutura

```
dist/
├── index.html              # Página principal (carrega os scripts)
├── fonts/                  # Fontes (woff2, woff, etc.) – ex.: Inter
│   └── inter-*-[hash].woff2
└── assets/                 # JS, CSS e imagens
    ├── index-[hash].js     # Bundle principal (React, rotas, libs)
    ├── index-[hash].css    # Estilos globais (Tailwind, temas)
    ├── LoginPage-[hash].js # Chunk do login (carregado sob demanda)
    ├── AppHomePage-[hash].js
    ├── auth.store-[hash].js # Store Zustand (auth)
    ├── asgard-bg-[hash].jpg
    └── asgard-logo-[hash].png
```

## O que é cada ficheiro

| Ficheiro | Descrição |
|----------|-----------|
| **index-[hash].js** | Código principal da app (React, React Router, i18n, etc.). O `[hash]` muda a cada build para invalidar cache. |
| **LoginPage-[hash].js** | Código da página de login (e dependências). Só é descarregado quando o utilizador acede a `/`. |
| **AppHomePage-[hash].js** | Código da página pós-login (`/app`). |
| **auth.store-[hash].js** | Store de autenticação (Zustand). Partilhado por várias rotas. |
| **index-[hash].css** | CSS compilado (Tailwind + variáveis do tema). |
| **fonts/** | Ficheiros de fonte (ex.: Inter). Usados pelo `@fontsource-variable/inter`. |

Os hashes existem para **cache busting**: quando fazes um novo deploy, os nomes mudam e o browser descarrega a nova versão em vez de usar a em cache.
