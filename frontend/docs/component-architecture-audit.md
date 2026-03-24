# Auditoria: Primitivos, Presentacionais e Orquestradores

Verificação conforme `.cursor/rules/frontend/component-architecture.mdc` e `tooling-and-structure.mdc`.

---

## 1. Primitivos de UI (`/src/components/ui/`)

**Regras:** 100% visuais; apenas props primitivas; NUNCA estado global, API ou regras de negócio.

| Verificação | Resultado |
|-------------|-----------|
| Chamadas API (useQuery, useMutation, fetch, axios) | ✅ Nenhuma em `components/ui/` |
| Estado global (Zustand, useStore) | ✅ Nenhum |
| Apenas props e estado local de UI | ✅ Sim. Uso de `useContext`/`useState` em form, sidebar, carousel, etc. é interno (compound components) ou estado local de UI (ex.: `isOpen`), permitido. |
| Localização | ✅ Todos em `/src/components/ui/` |

**Conclusão:** Os componentes em `ui/` estão alinhados às regras de primitivos.

**Recomendações:**
- **Nomenclatura:** Vários ainda usam `index.tsx` (ex.: calendar, command, form, sidebar). O padrão do projeto é PascalCase (ex.: `Button.tsx`, `Card.tsx`). Considerar migrar gradualmente para `ComponentName.tsx` + `index.ts` que re-exporta.

---

## 2. Componentes Presentacionais (`/src/components/features/` e `/src/components/screens/`)

**Regras:** Composições de primitivos; dados via props; eventos via callbacks; NUNCA API nem estado global; estado local de UI permitido.

| Verificação | Resultado |
|-------------|-----------|
| Existência de `features/` ou `screens/` | ✅ Existe `components/screens/` (ex.: navbar-lateral). `components/features/` opcional. |
| Páginas com UI pesada | ⚠️ A página `Login` concentra toda a UI (formulário, layout, motion) em um único ficheiro. |

**Conclusão:** A camada presentacional ainda não está separada. O fluxo de login está todo dentro da página.

**Recomendação:** Criar um componente presentacional para o login, por exemplo:
- `src/components/features/auth/LoginForm.tsx` (ou `LoginView.tsx`): recebe `email`, `password`, `onEmailChange`, `onPasswordChange`, `onSubmit`, `loading`, `error` e renderiza o formulário usando primitivos de `ui/` (Button, Input, etc.). A página `Login` (orquestrador) chamaria o hook de API, geriria estado e passaria props para este componente.

---

## 3. Orquestradores (`/src/pages/` e `.../containers/`)

**Regras:** Focados em lógica; pouco HTML/Tailwind; hooks de API, Zustand, validação; passam dados para presentacionais.

| Ficheiro | Situação |
|----------|----------|
| `pages/Index.tsx` | ✅ Apenas renderiza `<Login />`. Pode ser considerado orquestrador mínimo. |
| `pages/auth/Login.tsx` | ❌ **Violação:** Contém toda a UI (layout, formulário, motion, estilos). Deveria ser um orquestrador fino que: (1) usa hook de login (ex.: `useLoginApi`), (2) mantém estado de formulário/erro, (3) renderiza um único componente presentacional (ex.: `<LoginForm {...props} />`) com dados e callbacks. Além disso, usa **PrimeReact** (InputText, Password, Button) em vez dos primitivos do design system (`@/components/ui/input`, `@/components/ui/button`). |

**Conclusão:** A página de login não segue o padrão orquestrador e ignora os primitivos de `ui/`.

**Recomendações:**
1. Extrair a UI do login para `components/features/auth/LoginForm.tsx` (presentacional).
2. Reduzir `Login.tsx` a orquestração: estado, chamada ao hook de API, validação e renderização de `<LoginForm ... />`.
3. No presentacional, usar `Button` e `Input` (e outros) de `@/components/ui/` em vez de PrimeReact para manter consistência com o design system.

---

## 4. Outros

| Item | Situação |
|------|----------|
| **NavLink** | ✅ **Corrigido.** Movido para `/src/components/ui/nav-link/` (NavLink.tsx + index.ts). Import: `import { NavLink } from "@/components/ui/nav-link";` |

---

## Resumo

| Camada | Estado | Ação sugerida |
|--------|--------|----------------|
| **Primitivos (ui/)** | ✅ Conformes | Opcional: migrar mais pastas para PascalCase (Nome.tsx + index.ts). |
| **Presentacionais (features/ screens/)** | ⚠️ Inexistente | Criar `features/auth/LoginForm.tsx` e extrair UI do Login. |
| **Orquestradores (pages/)** | ❌ Login mistura UI e lógica | Refatorar Login para orquestrador fino + usar primitivos de ui/. |
| **NavLink** | ✅ Corrigido | Já em `ui/nav-link/`. |
