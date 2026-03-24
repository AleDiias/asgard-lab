#!/bin/sh
set -e
cd /app
echo "[asgardlab-api-auth] Aplicando migrações…"
bun run db:migrate
echo "[asgardlab-api-auth] A iniciar servidor…"
exec bun run src/server.ts
