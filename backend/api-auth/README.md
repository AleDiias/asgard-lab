# API Auth

Microsserviço de autenticação (login, esqueci senha, redefinir senha). Stack: Bun, TypeScript, Express, Zod, JWT, Argon2.

## Estrutura

```
src/
  controllers/   # AuthController
  services/      # AuthenticateUserService, ForgotPasswordService, ResetPasswordService
  repositories/  # user.repository, tenant.repository (+ mocks)
  schemas/       # auth.schema.ts (Zod)
  middlewares/   # requireTenantDomain, validateBody, errorHandler
  infra/         # logger, db (placeholder)
  routes.ts
  server.ts
```

## Comandos (Bun)

```bash
# Instalar dependências
bun install

# Desenvolvimento (watch)
bun run dev

# Produção
bun run start

# Typecheck
bun run typecheck
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. O Bun carrega `.env` automaticamente ao rodar.

| Variável       | Descrição              | Default |
|----------------|------------------------|---------|
| `PORT`         | Porta do servidor      | 3001    |
| `JWT_SECRET`   | Segredo do JWT         | (alterar em produção) |
| `JWT_EXPIRES_IN` | Expiração do token   | 7d      |
| `FRONTEND_URL` | URL do front (links nos e-mails) | http://localhost:3005 |
| `SMTP_HOST`    | Servidor SMTP          | -       |
| `SMTP_PORT`    | Porta SMTP (587/465)   | 587     |
| `SMTP_USER`    | Usuário SMTP          | -       |
| `SMTP_PASS`    | Senha SMTP             | -       |
| `SMTP_FROM`    | Remetente dos e-mails  | -       |

## Endpoints

Todos os endpoints exigem o header **`X-Tenant-Domain`** (subdomínio do tenant, ex: `demo`).

### POST /login

Body: `{ "email": "string", "password": "string" }`

Resposta de sucesso: `{ "success": true, "data": { "token": "...", "user": { "id", "email", "role", "permissions", "features" } } }`

### POST /forgot-password

Body: `{ "email": "string", "type": "forgot" | "activation" }` — `type` opcional; default `"forgot"`.

- **forgot:** e-mail “Redefinição de senha” com link para definir nova senha.
- **activation:** e-mail “Ative sua conta” com o mesmo link; o mesmo fluxo de **reset-password** serve para ativar conta (primeira definição de senha).

Resposta: `{ "success": true, "data": { "message": "..." } }`. O link no e-mail aponta para `FRONTEND_URL/reset-password?token=...`.

### POST /reset-password

Body: `{ "token": "string", "newPassword": "string" }`

Resposta: `{ "success": true, "data": { "message": "Senha redefinida com sucesso." } }`

## Testar (curl)

```bash
# Login (mock: tenant "demo", user@demo.com / senha123)
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: demo" \
  -d '{"email":"user@demo.com","password":"senha123"}'
```
