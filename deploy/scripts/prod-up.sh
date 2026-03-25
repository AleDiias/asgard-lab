#!/usr/bin/env bash
# Sobe o stack de produção (Postgres + api-auth + api-core + frontend).
# Uso (na raiz do repositório ou a partir de qualquer pasta):
#   ./deploy/scripts/prod-up.sh
#   ./deploy/scripts/prod-up.sh /caminho/para/outro.env
#
# Requisitos: Docker Engine + Docker Compose v2, Git (para clonar/atualizar o repo na VPS).

# Wrapper de compatibilidade: o fluxo único agora é `prod-setup-all.sh`.
# Este script sobe apenas o stack (sem seed, sem proxy) assumindo que `deploy/.env` já existe.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [[ $# -ge 1 ]]; then
  ENV_ARG="$1"
  if [[ -f "$ENV_ARG" ]]; then
    cp "$ENV_ARG" "$REPO_ROOT/deploy/.env"
    echo "==> deploy/.env atualizado a partir de: $ENV_ARG"
  fi
fi

exec "$SCRIPT_DIR/prod-setup-all.sh" --deploy-only --skip-docker-install --skip-proxy --skip-seed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
DEPLOY_ENV="$REPO_ROOT/deploy/.env"
ENV_ARG="${1:-$DEPLOY_ENV}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: não encontrei $COMPOSE_FILE" >&2
  exit 1
fi

if [[ ! -f "$ENV_ARG" ]]; then
  echo "Erro: ficheiro de ambiente não encontrado: $ENV_ARG" >&2
  echo "Copie o exemplo: cp deploy/.env.example deploy/.env  (e edite os valores)" >&2
  exit 1
fi

# Caminhos canónicos: se passar outro .env, copiamos para deploy/.env porque o Compose
# usa env_file: .env junto deste ficheiro (DATABASE_URL e segredos entram no contentor a partir daqui).
# (Evita subshell aninhado tipo (cd "$(dirname "$1")"…) — falha em bash antigo / CRLF.)
_env_dir="$(dirname "$ENV_ARG")"
_env_abs="$(cd "$_env_dir" && pwd)/$(basename "$ENV_ARG")"
_deploy_dir="$(dirname "$DEPLOY_ENV")"
_deploy_abs="$(cd "$_deploy_dir" && pwd)/$(basename "$DEPLOY_ENV")"
if [[ "$_env_abs" != "$_deploy_abs" ]]; then
  cp "$ENV_ARG" "$DEPLOY_ENV"
  echo "==> Ambiente copiado para deploy/.env (necessário para env_file dos contentores)."
fi
unset _env_dir _env_abs _deploy_dir _deploy_abs

cd "$REPO_ROOT"

echo "==> Build das imagens…"
docker compose -f deploy/docker-compose.prod.yml --env-file "$DEPLOY_ENV" build

echo "==> A subir contentores…"
docker compose -f deploy/docker-compose.prod.yml --env-file "$DEPLOY_ENV" up -d

echo "==> Estado:"
docker compose -f deploy/docker-compose.prod.yml --env-file "$DEPLOY_ENV" ps

echo ""
echo "Contentores: asgardlab-postgres, asgardlab-api-auth, asgardlab-api-core, asgardlab-frontend"
echo "Seed opcional (api-auth): docker exec asgardlab-api-auth bun run db:seed"
echo "Migrações tenant (api-core), por tenant: ver README em backend/api-core."
