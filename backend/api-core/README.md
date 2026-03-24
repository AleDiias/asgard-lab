# api-core

Microsserviço operacional **multi-tenant** (Database-per-Tenant): valida JWT emitido pela `api-auth`, resolve o banco do cliente e expõe APIs de domínio (ex.: leads).

- **Porta:** `3002` (configurável via `PORT`)
- **Auth:** mesmo `JWT_SECRET` que a `api-auth`
- **Master DB:** leitura apenas na tabela `tenants` (resolver `tenantId` / `X-Tenant-Domain` → nome físico `tenant_<db_name>`)

## Variáveis de ambiente

Copie `.env.example` para `.env` e alinhe `JWT_SECRET` e `DATABASE_URL` com a `api-auth`.

Em desenvolvimento, se não existir `api-core/.env`, o arranque tenta carregar `../api-auth/.env` para reutilizar o mesmo `JWT_SECRET` (e demais variáveis).

## Scripts

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Servidor com watch |
| `bun run start` | Servidor em produção |
| `bun run typecheck` | TypeScript |
| `bun run db:generate:tenant` | Gera SQL a partir de `src/infra/database/tenant/schema.ts` |
| `bun run db:migrate:tenant` | Aplica migrations pendentes no DB apontado por `DATABASE_URL` (lê `api-core/.env` automaticamente) |

## Migrations (tenant)

1. Gerar SQL após alterar o schema:
   ```bash
   cd backend/api-core
   bun run db:generate:tenant
   ```
2. Aplicar **em cada banco de tenant** (ex.: `tenant_demo`), ajustando o nome da base na URL:
   ```bash
   DATABASE_URL="postgres://asgard:asgard@127.0.0.1:5432/tenant_demo" bun run db:migrate:tenant
   ```
   Repita para cada `tenant_*` existente.

> As migrations de `users` continuam a ser responsabilidade da `api-auth`; a `api-core` não as duplica — esta pasta de migrations só adiciona objetos novos (ex.: `leads`).

## Permissões RBAC

- `leads.read` — `GET /api/v1/leads`, `GET /api/v1/leads/:id`
- `leads.write` — `POST /api/v1/leads`, `PUT /api/v1/leads/:id`

Utilizadores com `*` no JWT (ex.: admin) ou Super Admin (`isSuperAdmin`) ignoram a checagem granular.

## Super Admin (Asgard)

Enviar cabeçalho **`X-Tenant-Domain`** (domínio do tenant no Master, ex.: `demo`) para indicar em qual Tenant DB operar.

## Rotas

| Método | Rota | Auth |
|--------|------|------|
| POST | `/api/v1/leads` | Bearer + tenant + `leads.write` |
| GET | `/api/v1/leads?page=&pageSize=` | Bearer + tenant + `leads.read` |
| GET | `/api/v1/leads/:id` | Bearer + tenant + `leads.read` |
| PUT | `/api/v1/leads/:id` | Bearer + tenant + `leads.write` |
| POST | `/api/v1/leads/bulk` | Bearer + tenant + `leads.write` — corpo `{ "leads": [{ "name", "phone", "email?", "status?" }] }` (máx. 10 000). Duplicados por `phone` são ignorados (`ON CONFLICT DO NOTHING`). Resposta: `imported`, `duplicatesSkipped`, `invalidSkipped`, `attempted`. |
