#!/usr/bin/env bash
# Wrapper de compatibilidade: o fluxo único agora é `prod-setup-all.sh`.
# Este wrapper envia apenas as flags reconhecidas (as restantes são ignoradas).

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ARGS=(--env-only)
while [[ $# -gt 0 ]]; do
  case "$1" in
    --public-frontend-url)
      ARGS+=(--public-frontend-url "$2")
      shift 2
      ;;
    --public-api-auth-url)
      ARGS+=(--public-api-auth-url "$2")
      shift 2
      ;;
    --public-api-core-url)
      ARGS+=(--public-api-core-url "$2")
      shift 2
      ;;
    --public-api-base-url)
      ARGS+=(--api-base-url "$2")
      shift 2
      ;;
    --cors-allowed-origins)
      ARGS+=(--cors-allowed-origins "$2")
      shift 2
      ;;
    --force)
      ARGS+=(--force-env-overwrite)
      shift 1
      ;;
    *)
      # Ignora flags antigas (ex.: --postgres-password, --jwt-secret) para manter o script único.
      shift 1
      ;;
  esac
done

exec "$SCRIPT_DIR/prod-setup-all.sh" "${ARGS[@]}"

# Gera deploy/.env automaticamente (JWT_SECRET randomico + credenciais do Postgres + URLs públicas)
#
# Uso (um domínio para toda a API):
#   ./deploy/scripts/prod-gen-env.sh \
#     --public-frontend-url https://crm.seudominio.com \
#     --public-api-base-url https://api.seudominio.com.br \
#     --cors-allowed-origins https://crm.seudominio.com
#
# Paths por defeito:
#   PUBLIC_API_AUTH_URL = ${PUBLIC_API_BASE_URL}/api-auth
#   PUBLIC_API_CORE_URL = ${PUBLIC_API_BASE_URL}/api-core
#
# O script cria deploy/.env por padrão e não sobrescreve sem --force.
#
# Opcional:
#   --postgres-password <senha>   (por defeito gera random)
#   --jwt-secret <secret>         (por defeito gera random)
#   --seed-email/--seed-password/--seed-name (por defeito fica com defaults do api-auth)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT_FILE="$REPO_ROOT/deploy/.env"

FORCE=0

PUBLIC_FRONTEND_URL="https://crm.asgardai.com.br"
PUBLIC_API_AUTH_URL=""
PUBLIC_API_CORE_URL=""
PUBLIC_API_BASE_URL=""
CORS_ALLOWED_ORIGINS="https://crm.asgardai.com.br"

# Paths usados quando se passa `--public-api-base-url`
API_AUTH_PATH="/api-auth"
API_CORE_PATH="/api-core"

POSTGRES_USER="asgard"
POSTGRES_DB="asgard_master"
POSTGRES_PASSWORD=""

JWT_EXPIRES_IN="7d"
JWT_SECRET=""

SEED_EMAIL=""
SEED_PASSWORD=""
SEED_NAME=""

usage() {
  cat <<'EOF'
Uso:
  prod-gen-env.sh --public-frontend-url <url> --public-api-auth-url <url> --public-api-core-url <url> --cors-allowed-origins <origins>

Exemplo:
  ./deploy/scripts/prod-gen-env.sh \
    --public-frontend-url https://crm.asgardlab.pt \
    --public-api-auth-url https://auth.asgardlab.pt \
    --public-api-core-url https://core.asgardlab.pt \
    --cors-allowed-origins https://crm.asgardlab.pt

Alternativa (1 domínio / base URL):
  ./deploy/scripts/prod-gen-env.sh \
    --public-frontend-url https://crm.asgardlab.pt \
    --public-api-base-url https://api.asgardlab.pt \
    --cors-allowed-origins https://crm.asgardlab.pt

Paths (opcional):
  --api-auth-path /api-auth
  --api-core-path /api-core

Opcional:
  --postgres-password <senha>
  --jwt-secret <jwt_secret>
  --seed-email <email>
  --seed-password <password>
  --seed-name <nome>
  --force
EOF
}

random_alnum() {
  # Apenas [A-Za-z0-9] para evitar problemas de encoding em URLs de conexão.
  # 48 chars ~ bastante para JWT e segredos.
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48
  else
    # fallback
    head -c 64 /dev/urandom | base64 2>/dev/null | tr -dc 'A-Za-z0-9' | head -c 48
  fi
}

need_value() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Erro: falta $name" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --public-frontend-url)
      PUBLIC_FRONTEND_URL="${2:-}"; shift 2 ;;
    --public-api-base-url)
      PUBLIC_API_BASE_URL="${2:-}"; shift 2 ;;
    --public-api-auth-url)
      PUBLIC_API_AUTH_URL="${2:-}"; shift 2 ;;
    --public-api-core-url)
      PUBLIC_API_CORE_URL="${2:-}"; shift 2 ;;
    --api-auth-path)
      API_AUTH_PATH="${2:-}"; shift 2 ;;
    --api-core-path)
      API_CORE_PATH="${2:-}"; shift 2 ;;
    --cors-allowed-origins)
      CORS_ALLOWED_ORIGINS="${2:-}"; shift 2 ;;

    --postgres-user)
      POSTGRES_USER="${2:-}"; shift 2 ;;
    --postgres-db)
      POSTGRES_DB="${2:-}"; shift 2 ;;
    --postgres-password)
      POSTGRES_PASSWORD="${2:-}"; shift 2 ;;

    --jwt-expires-in)
      JWT_EXPIRES_IN="${2:-}"; shift 2 ;;
    --jwt-secret)
      JWT_SECRET="${2:-}"; shift 2 ;;

    --seed-email)
      SEED_EMAIL="${2:-}"; shift 2 ;;
    --seed-password)
      SEED_PASSWORD="${2:-}"; shift 2 ;;
    --seed-name)
      SEED_NAME="${2:-}"; shift 2 ;;

    --force)
      FORCE=1; shift 1 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Opção desconhecida: $1" >&2
      usage
      exit 1 ;;
  esac
done

need_value "--public-frontend-url" "$PUBLIC_FRONTEND_URL"

if [[ -n "$PUBLIC_API_BASE_URL" ]]; then
  PUBLIC_API_BASE_URL="${PUBLIC_API_BASE_URL%/}"
  PUBLIC_API_AUTH_URL="${PUBLIC_API_BASE_URL}${API_AUTH_PATH}"
  PUBLIC_API_CORE_URL="${PUBLIC_API_BASE_URL}${API_CORE_PATH}"
else
  need_value "--public-api-auth-url" "$PUBLIC_API_AUTH_URL"
  need_value "--public-api-core-url" "$PUBLIC_API_CORE_URL"
fi

if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
  CORS_ALLOWED_ORIGINS="$PUBLIC_FRONTEND_URL"
fi
need_value "--cors-allowed-origins" "$CORS_ALLOWED_ORIGINS"

if [[ -f "$OUT_FILE" && "$FORCE" -ne 1 ]]; then
  echo "Erro: $OUT_FILE já existe." >&2
  echo "Use --force para sobrescrever." >&2
  exit 1
fi

if [[ -z "$POSTGRES_PASSWORD" ]]; then
  POSTGRES_PASSWORD="$(random_alnum)"
fi
if [[ -z "$JWT_SECRET" ]]; then
  JWT_SECRET="$(random_alnum)$(random_alnum)"
fi

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

FRONTEND_URL="$PUBLIC_FRONTEND_URL"

cat >"$OUT_FILE" <<EOF
# Asgard CRM — deploy (.env) gerado automaticamente

POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=${DATABASE_URL}

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

PUBLIC_FRONTEND_URL=${PUBLIC_FRONTEND_URL}
FRONTEND_URL=${FRONTEND_URL}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}

PUBLIC_API_AUTH_URL=${PUBLIC_API_AUTH_URL}
PUBLIC_API_CORE_URL=${PUBLIC_API_CORE_URL}

HOST_FRONTEND_PORT=80
HOST_API_AUTH_PORT=3001
HOST_API_CORE_PORT=3002

API_AUTH_PORT=3001
API_CORE_PORT=3002

JSON_LIMIT=1mb

EOF

if [[ -n "$SEED_EMAIL" ]]; then
  echo "ASGARD_SEED_EMAIL=${SEED_EMAIL}" >>"$OUT_FILE"
fi
if [[ -n "$SEED_PASSWORD" ]]; then
  echo "ASGARD_SEED_PASSWORD=${SEED_PASSWORD}" >>"$OUT_FILE"
fi
if [[ -n "$SEED_NAME" ]]; then
  echo "ASGARD_SEED_NAME=${SEED_NAME}" >>"$OUT_FILE"
fi

echo ""
echo "OK: criado $OUT_FILE"
echo "Próximo passo sugerido:"
echo "  ./deploy/scripts/prod-install-initial.sh"

