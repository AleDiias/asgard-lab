#!/usr/bin/env bash
# Sobe o stack de produção (Postgres + api-auth + api-core + frontend).
# Uso (na raiz do repositório ou a partir de qualquer pasta):
#   ./deploy/scripts/prod-up.sh
#   ./deploy/scripts/prod-up.sh /caminho/para/outro.env
#
# Requisitos: Docker Engine + Docker Compose v2, Git (para clonar/atualizar o repo na VPS).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
ENV_FILE="${1:-$REPO_ROOT/deploy/.env}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: não encontrei $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Erro: ficheiro de ambiente não encontrado: $ENV_FILE" >&2
  echo "Copie o exemplo: cp deploy/env.prod.example deploy/.env  (e edite os valores)" >&2
  exit 1
fi

cd "$REPO_ROOT"

echo "==> Build das imagens…"
docker compose -f deploy/docker-compose.prod.yml --env-file "$ENV_FILE" build

echo "==> A subir contentores…"
docker compose -f deploy/docker-compose.prod.yml --env-file "$ENV_FILE" up -d

echo "==> Estado:"
docker compose -f deploy/docker-compose.prod.yml --env-file "$ENV_FILE" ps

echo ""
echo "Contentores: asgardlab-postgres, asgardlab-api-auth, asgardlab-api-core, asgardlab-frontend"
echo "Seed opcional (api-auth): docker exec asgardlab-api-auth bun run db:seed"
echo "Migrações tenant (api-core), por tenant: ver README em backend/api-core."
