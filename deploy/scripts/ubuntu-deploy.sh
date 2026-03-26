#!/usr/bin/env bash
# Setup passo a passo para Ubuntu:
# 1) instala dependencias (Node mais recente, Docker/Compose, Nginx)
# 2) pergunta URLs/portas/senha do banco (vazio => random)
# 3) gera deploy/.env
# 4) configura Nginx reverse proxy sem conflito com frontend em 3000
# 5) sobe stack em ordem e deixa migration do api-auth por ultimo

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
ENV_FILE="$REPO_ROOT/deploy/.env"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Erro: execute como root (sudo)." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: não encontrei $COMPOSE_FILE" >&2
  exit 1
fi

API_BASE_URL=""
CRM_URL=""
CORS_ALLOWED_ORIGINS=""
HOST_FRONTEND_PORT="3000"
HOST_API_AUTH_PORT="3001"
HOST_API_CORE_PORT="3002"
POSTGRES_PASSWORD=""
FORCE_ENV=0
RESET_DB_VOLUME=0
SKIP_SEED=0

usage() {
  cat <<EOF
Uso: $0 [opções]

Opções:
  --api-base-url <url>      URL base da API (ex.: https://api.exemplo.com)
  --crm-url <url>           URL do frontend (ex.: https://crm.exemplo.com)
  --frontend-port <porta>   Porta host do frontend (default: 3000)
  --postgres-password <pwd> Senha do banco (vazio => random)
  --cors-origins <lista>    Origens CORS separadas por virgula
  --force                   Sobrescreve deploy/.env sem perguntar
  --reset-db-volume         Remove volume do Postgres (apaga dados)
  --skip-seed               Nao roda bun run db:seed
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-base-url) API_BASE_URL="${2:-}"; shift 2 ;;
    --crm-url) CRM_URL="${2:-}"; shift 2 ;;
    --frontend-port) HOST_FRONTEND_PORT="${2:-}"; shift 2 ;;
    --postgres-password) POSTGRES_PASSWORD="${2:-}"; shift 2 ;;
    --cors-origins) CORS_ALLOWED_ORIGINS="${2:-}"; shift 2 ;;
    --force) FORCE_ENV=1; shift 1 ;;
    --reset-db-volume) RESET_DB_VOLUME=1; shift 1 ;;
    --skip-seed) SKIP_SEED=1; shift 1 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Opcao desconhecida: $1" >&2
      usage
      exit 1
      ;;
  esac
done

random_alnum() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48
  else
    head -c 64 /dev/urandom | base64 2>/dev/null | tr -dc 'A-Za-z0-9' | head -c 48
  fi
}

url_host() {
  local u="$1"
  echo "$u" | sed -E 's#^https?://([^/]+).*$#\1#'
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

prompt_if_empty() {
  local var_name="$1"
  local question="$2"
  if [[ -z "${!var_name}" ]]; then
    read -r -p "$question" "$var_name"
  fi
}

install_base_packages() {
  echo "==> [1/7] Instalando pacotes base..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release git unzip tar build-essential
}

install_node_latest() {
  echo "==> [2/7] Instalando Node.js (latest)..."
  if curl -fsSL https://deb.nodesource.com/setup_current.x >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
  else
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  fi
  apt-get install -y nodejs
  echo "Node: $(node -v 2>/dev/null || echo 'nao detectado')"
}

install_docker() {
  echo "==> [3/7] Instalando Docker/Compose..."
  if need_cmd docker && docker compose version >/dev/null 2>&1; then
    echo "Docker/Compose ja instalados."
    return 0
  fi

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  local codename
  codename="$(. /etc/os-release && echo "${VERSION_CODENAME}")"
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${codename} stable" >/etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
}

install_nginx() {
  echo "==> [4/7] Instalando Nginx..."
  apt-get install -y nginx
  systemctl enable --now nginx
}

collect_inputs() {
  echo "==> [5/7] Configuracao interativa..."
  prompt_if_empty "API_BASE_URL" "URL base da API (ex.: https://api.asgardai.com.br): "
  prompt_if_empty "CRM_URL" "URL do Frontend (ex.: https://blackbox.asgardai.com.br): "

  if [[ -z "$HOST_FRONTEND_PORT" ]]; then
    HOST_FRONTEND_PORT="3000"
  fi

  if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
    read -r -p "CORS_ALLOWED_ORIGINS (default: $CRM_URL): " CORS_ALLOWED_ORIGINS
  fi
  if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
    CORS_ALLOWED_ORIGINS="$CRM_URL"
  fi

  if [[ -z "$POSTGRES_PASSWORD" ]]; then
    read -r -p "Senha do Postgres (Enter para gerar random): " POSTGRES_PASSWORD
  fi
}

write_env_file() {
  local api_base_trimmed="${API_BASE_URL%/}"
  local public_api_auth_url="${api_base_trimmed}/api-auth"
  local public_api_core_url="${api_base_trimmed}/api-core"

  local postgres_user="asgard"
  local postgres_db="asgard_master"
  local jwt_secret
  jwt_secret="$(random_alnum)$(random_alnum)"

  if [[ -z "$POSTGRES_PASSWORD" ]]; then
    POSTGRES_PASSWORD="$(random_alnum)"
    echo "POSTGRES_PASSWORD gerada automaticamente."
  fi

  if [[ -f "$ENV_FILE" && "$FORCE_ENV" -ne 1 ]]; then
    read -r -p "deploy/.env ja existe. Sobrescrever? [y/N] " ans
    if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
      echo "Mantendo deploy/.env atual."
      return 0
    fi
  fi

  cat >"$ENV_FILE" <<EOF
POSTGRES_USER=${postgres_user}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${postgres_db}
DATABASE_URL=postgresql://${postgres_user}:${POSTGRES_PASSWORD}@postgres:5432/${postgres_db}

JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d

PUBLIC_FRONTEND_URL=${CRM_URL}
FRONTEND_URL=${CRM_URL}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}

PUBLIC_API_AUTH_URL=${public_api_auth_url}
PUBLIC_API_CORE_URL=${public_api_core_url}

HOST_FRONTEND_PORT=${HOST_FRONTEND_PORT}
HOST_API_AUTH_PORT=${HOST_API_AUTH_PORT}
HOST_API_CORE_PORT=${HOST_API_CORE_PORT}

API_AUTH_PORT=${HOST_API_AUTH_PORT}
API_CORE_PORT=${HOST_API_CORE_PORT}

JSON_LIMIT=1mb
EOF

  echo "OK: $ENV_FILE atualizado."
}

configure_nginx_proxy() {
  echo "==> [6/7] Configurando Nginx reverse proxy..."
  local api_host crm_host
  api_host="$(url_host "$API_BASE_URL")"
  crm_host="$(url_host "$CRM_URL")"

  local conf="/etc/nginx/sites-available/asgardlab.conf"
  cat >"$conf" <<EOF
server {
  listen 80;
  server_name ${crm_host};

  location / {
    proxy_pass http://127.0.0.1:${HOST_FRONTEND_PORT};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}

server {
  listen 80;
  server_name ${api_host};

  location /api-auth/ {
    proxy_pass http://127.0.0.1:${HOST_API_AUTH_PORT}/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api-core/ {
    proxy_pass http://127.0.0.1:${HOST_API_CORE_PORT}/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

  rm -f /etc/nginx/sites-enabled/default
  ln -sf "$conf" /etc/nginx/sites-enabled/asgardlab.conf
  nginx -t
  systemctl restart nginx
}

wait_postgres_healthy() {
  local tries=90
  for _ in $(seq 1 "$tries"); do
    local status
    status="$(docker inspect -f '{{.State.Health.Status}}' asgardlab-postgres 2>/dev/null || true)"
    if [[ "$status" == "healthy" ]]; then
      echo "Postgres healthy."
      return 0
    fi
    sleep 2
  done
  echo "Erro: Postgres nao ficou healthy." >&2
  return 1
}

start_stack_step_by_step() {
  echo "==> [7/7] Subindo stack passo a passo..."
  cd "$REPO_ROOT"

  if [[ "$RESET_DB_VOLUME" -eq 1 ]]; then
    echo "Removendo volume do Postgres (dados serao apagados)..."
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v
  else
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down || true
  fi

  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

  # Ordem controlada: DB primeiro.
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres
  wait_postgres_healthy

  # Necessario para gen_random_uuid() nas migrations.
  docker exec -i asgardlab-postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"'

  # Sobe core/frontend antes; migration do auth fica por ultimo.
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps api-core
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps frontend

  # Ultimo passo: api-auth sobe e roda migration no entrypoint.
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps api-auth

  # Aguarda e, opcionalmente, roda seed.
  sleep 3
  if [[ "$SKIP_SEED" -eq 0 ]]; then
    docker exec -i asgardlab-api-auth bun run db:seed || true
  fi

  echo "=== STATUS FINAL ==="
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
  echo "Logs api-auth:"
  docker logs asgardlab-api-auth --tail 60 || true
}

main() {
  install_base_packages
  install_node_latest
  install_docker
  install_nginx
  collect_inputs
  write_env_file
  configure_nginx_proxy
  start_stack_step_by_step
}

main "$@"

