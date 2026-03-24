# Componentes UI

Cada componente fica em seu próprio diretório, contendo apenas aquele componente (ex: `button/`, `dialog/`).

## Estrutura

Cada pasta tem um único arquivo `index.tsx` (ou `index.ts`):

- `button/index.tsx` — apenas o Button
- `dialog/index.tsx` — apenas o Dialog
- `input/index.tsx` — apenas o Input
- etc.

## Uso

Pelo barrel (recomendado):

```ts
import { Button, Card, Dialog } from "@/components/ui";
```

Ou direto pelo diretório do componente:

```ts
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
```

O `index.ts` na raiz de `ui` re-exporta todos os componentes.
