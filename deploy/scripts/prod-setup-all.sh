#!/usr/bin/env bash
# Full setup para VPS (Ubuntu + Docker):
# - instala Docker/Compose (se necessário)
# - gera deploy/.env (JWT_SECRET + PASSWORD Postgres + URLs)
# - sobe proxy (Caddy por defeito; opcionalmente Nginx)
# - sobe o stack via docker compose e corre seed do api-auth
#
# Run:
#   ./deploy/scripts/prod-setup-all.sh
#
# Flags úteis:
#   --api-base-url <url>           (ex.: https://api.asgardai.com.br)
#   --crm-url <url>                (ex.: https://crm.asgardai.com.br)
#   --public-api-auth-url <url>   (alternativa; se não quiser derivar)
#   --public-api-core-url <url>   (alternativa)
#   --cors-allowed-origins <url>  (default: crm-url)
#   --proxy caddy|nginx|none      (default: caddy)
#   --caddy-email <email>         (para Let's Encrypt, recomendado)
#   --skip-docker-install
#   --skip-proxy
#   --env-only
#   --deploy-only
#   --skip-seed
#   --force-env-overwrite

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
ENV_FILE="$REPO_ROOT/deploy/.env"
ENV_EXAMPLE="$REPO_ROOT/deploy/.env.example"

MODE_ENV_ONLY=0
MODE_DEPLOY_ONLY=0
SKIP_DOCKER_INSTALL=0
SKIP_PROXY=0
SKIP_SEED=0
FORCE_ENV=0

PROXY_TYPE="caddy"
CADDY_EMAIL=""

API_BASE_URL=""
CRM_URL=""

# Se vierem diretamente (opcional / compatibilidade), aceitamos.
PUBLIC_API_AUTH_URL=""
PUBLIC_API_CORE_URL=""

PUBLIC_FRONTEND_URL=""
FRONTEND_URL=""
CORS_ALLOWED_ORIGINS=""

HOST_FRONTEND_PORT="80"
HOST_API_AUTH_PORT="3001"
HOST_API_CORE_PORT="3002"

random_alnum() {
  # Apenas [A-Za-z0-9] para evitar encoding de URL.
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | head -c 48
  else
    head -c 64 /dev/urandom | base64 2>/dev/null | tr -dc 'A-Za-z0-9' | head -c 48
  fi
}

url_trim_slash() {
  # Remove barra no fim, mantendo /api-auth intacto.
  local u="$1"
  printf "%s" "${u%/}"
}

url_host() {
  # Extrai host de uma URL simples: https://host[:port]/...
  # Nota: assume que a URL não contém espaços.
  local u="$1"
  echo "$u" | sed -E 's#^https?://([^/]+).*$#\1#'
}

url_path() {
  # Extrai pathname (com leading /) de uma URL simples.
  local u="$1"
  local p
  p="$(echo "$u" | sed -E 's#^https?://[^/]+(/.*)?$#\1#')"
  if [[ -z "$p" ]]; then
    echo "/"
  else
    echo "$p"
  fi
}

need_bin() {
  command -v "$1" >/dev/null 2>&1
}

prompt_if_empty() {
  local var_name="$1"
  local var_value="${!var_name}"
  local question="$2"
  if [[ -z "$var_value" ]]; then
    read -r -p "$question" "$var_name"
  fi
}

install_docker_if_missing() {
  if need_bin docker && docker compose version >/dev/null 2>&1; then
    echo "Docker/Compose já instalados."
    return 0
  fi

  echo "==> A instalar Docker e Docker Compose…"
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "Erro: este script suporta Ubuntu/Debian com apt-get." >&2
    exit 1
  fi

  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release

  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

  local codename
  codename="$(. /etc/os-release && echo "${VERSION_CODENAME}")"

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${codename} stable" \
    >/etc/apt/sources.list.d/docker.list

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

  systemctl enable --now docker
  echo "==> Docker instalado."
}

install_caddy_if_missing() {
  if need_bin caddy; then
    echo "Caddy já instalado."
    return 0
  fi

  echo "==> A instalar Caddy…"
  if apt-get update -y && apt-get install -y caddy; then
    echo "==> Caddy instalado via apt."
  else
    echo "Aviso: apt não conseguiu instalar caddy. Vou tentar download do binário."
    apt-get install -y wget tar
    local tmp="/tmp/caddy-setup.$$"
    mkdir -p "$tmp"
    cd "$tmp"
    local v
    v="$(curl -fsSL https://api.github.com/repos/caddyserver/caddy/releases/latest | sed -n 's/.*"tag_name": "\(v[^\"]*\)".*/\1/p' | head -n 1)"
    if [[ -z "$v" ]]; then
      echo "Erro: falha a obter versão do Caddy." >&2
      exit 1
    fi
    wget -q "https://github.com/caddyserver/caddy/releases/download/${v}/caddy_${v#v}_linux_amd64.tar.gz"
    tar -xzf "caddy_${v#v}_linux_amd64.tar.gz"
    install -m 0755 caddy /usr/local/bin/caddy
    cd / && rm -rf "$tmp"
  fi

  if systemctl list-unit-files | grep -q '^caddy\.service'; then
    systemctl enable --now caddy || true
  fi
}

setup_proxy() {
  local crm_host api_host
  crm_host="$(url_host "$CRM_URL")"

  if [[ -z "$API_BASE_URL" ]]; then
    # Inferir host a partir das URLs finais.
    api_host="$(url_host "$PUBLIC_API_AUTH_URL")"
  else
    api_host="$(url_host "$API_BASE_URL")"
  fi

  echo "==> A configurar proxy ($PROXY_TYPE)…"

  # Defaults: host ports são os mesmos do compose por defeito.
  local front_port="$HOST_FRONTEND_PORT"
  local auth_port="$HOST_API_AUTH_PORT"
  local core_port="$HOST_API_CORE_PORT"

  local api_auth_path api_core_path
  api_auth_path="$(url_path "$PUBLIC_API_AUTH_URL")"
  api_core_path="$(url_path "$PUBLIC_API_CORE_URL")"
  # Normaliza para prefixo: remove trailing /
  api_auth_path="${api_auth_path%/}"
  api_core_path="${api_core_path%/}"

  if [[ "$PROXY_TYPE" == "caddy" ]]; then
    install_caddy_if_missing
    mkdir -p /etc/caddy

    local caddyfile="/etc/caddy/Caddyfile"
    local global_block=""
    if [[ -n "$CADDY_EMAIL" ]]; then
      global_block="{\n  email ${CADDY_EMAIL}\n}\n\n"
    fi
    cat >"$caddyfile" <<EOF
${global_block}${crm_host} {
  reverse_proxy 127.0.0.1:${front_port}
}

${api_host} {
  handle_path ${api_auth_path}/* {
    reverse_proxy 127.0.0.1:${auth_port}
  }
  handle_path ${api_core_path}/* {
    reverse_proxy 127.0.0.1:${core_port}
  }
}
EOF

    systemctl restart caddy || true
    caddy reload || true
    echo "==> Proxy Caddy configurado."
    return 0
  fi

  if [[ "$PROXY_TYPE" == "nginx" ]]; then
    if ! need_bin nginx; then
      echo "Erro: nginx não está instalado (instala à mão ou usa --proxy caddy)." >&2
      exit 1
    fi

    local nginx_site="/etc/nginx/sites-available/asgardlab.conf"
    mkdir -p "$(dirname "$nginx_site")"

    cat >"$nginx_site" <<EOF
server {
  listen 80;
  server_name ${crm_host};

  location / {
    proxy_pass http://127.0.0.1:${front_port};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}

server {
  listen 80;
  server_name ${api_host};

  # Strip do prefixo /api-auth para chegar a /login etc.
  location ${api_auth_path}/ {
    proxy_pass http://127.0.0.1:${auth_port}/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location ${api_core_path}/ {
    proxy_pass http://127.0.0.1:${core_port}/;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
EOF

    ln -sf "$nginx_site" /etc/nginx/sites-enabled/asgardlab.conf
    nginx -t
    systemctl restart nginx
    echo "==> Proxy Nginx (HTTP) configurado."
    return 0
  fi

  if [[ "$PROXY_TYPE" == "none" ]]; then
    echo "==> Proxy omitido (PROXY_TYPE=none)."
    return 0
  fi

  echo "Erro: PROXY_TYPE inválido: $PROXY_TYPE" >&2
  exit 1
}

generate_env_file() {
  if [[ -f "$ENV_FILE" && "$FORCE_ENV" -ne 1 ]]; then
    read -r -p "deploy/.env já existe. Sobrescrever? [y/N] " ans
    if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
      echo "Abandonando geração do .env."
      return 0
    fi
  fi

  if [[ ! -f "$ENV_EXAMPLE" ]]; then
    echo "Erro: $ENV_EXAMPLE não existe." >&2
    exit 1
  fi

  local api_auth_path api_core_path
  api_auth_path="/api-auth"
  api_core_path="/api-core"

  if [[ -n "$API_BASE_URL" ]]; then
    API_BASE_URL="$(url_trim_slash "$API_BASE_URL")"
    PUBLIC_API_AUTH_URL="${API_BASE_URL}${api_auth_path}"
    PUBLIC_API_CORE_URL="${API_BASE_URL}${api_core_path}"
  fi

  if [[ -z "$PUBLIC_API_AUTH_URL" || -z "$PUBLIC_API_CORE_URL" ]]; then
    echo "Erro: tens de definir API_BASE_URL ou PUBLIC_API_AUTH_URL + PUBLIC_API_CORE_URL." >&2
    exit 1
  fi

  PUBLIC_FRONTEND_URL="$CRM_URL"
  FRONTEND_URL="$CRM_URL"
  if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
    CORS_ALLOWED_ORIGINS="$CRM_URL"
  fi

  if [[ -z "$CRM_URL" ]]; then
    echo "Erro: CRM_URL não definida." >&2
    exit 1
  fi

  local postgres_password jwt_secret
  postgres_password="$(random_alnum)"
  jwt_secret="$(random_alnum)$(random_alnum)"

  # Valores base (ajustáveis depois se quiser).
  local POSTGRES_USER="asgard"
  local POSTGRES_DB="asgard_master"

  cat >"$ENV_FILE" <<EOF
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${postgres_password}
POSTGRES_DB=${POSTGRES_DB}
DATABASE_URL=postgresql://${POSTGRES_USER}:${postgres_password}@postgres:5432/${POSTGRES_DB}

JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=7d

PUBLIC_FRONTEND_URL=${PUBLIC_FRONTEND_URL}
FRONTEND_URL=${FRONTEND_URL}
CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}

PUBLIC_API_AUTH_URL=${PUBLIC_API_AUTH_URL}
PUBLIC_API_CORE_URL=${PUBLIC_API_CORE_URL}

HOST_FRONTEND_PORT=${HOST_FRONTEND_PORT}
HOST_API_AUTH_PORT=${HOST_API_AUTH_PORT}
HOST_API_CORE_PORT=${HOST_API_CORE_PORT}

API_AUTH_PORT=${HOST_API_AUTH_PORT}
API_CORE_PORT=${HOST_API_CORE_PORT}

JSON_LIMIT=1mb
EOF

  echo "OK: gerado $ENV_FILE"
}

deploy_stack() {
  if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo "Erro: não encontrei $COMPOSE_FILE" >&2
    exit 1
  fi
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Erro: não encontrei $ENV_FILE (gere primeiro com --env-only ou sem flags)." >&2
    exit 1
  fi

  echo "==> Build das imagens…"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build

  echo "==> A subir Postgres…"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres

  wait_postgres_healthy

  # As migrações (api-auth/api-core) usam `gen_random_uuid()`.
  # Esta função vive no extension `pgcrypto`, que pode não estar habilitado por defeito.
  echo "==> A habilitar extension pgcrypto (se necessário)…"
  docker exec -i asgardlab-postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"'

  echo "==> A subir api-auth, api-core e frontend…"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d api-auth api-core frontend

  echo "==> Estado:"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
}

wait_postgres_healthy() {
  local tries=90
  echo "==> A validar Postgres (healthcheck)…"
  for _ in $(seq 1 "$tries"); do
    local status
    status="$(docker inspect -f '{{.State.Health.Status}}' asgardlab-postgres 2>/dev/null || true)"
    if [[ "$status" == "healthy" ]]; then
      echo "==> Postgres está healthy."
      return 0
    fi
    sleep 2
  done

  echo "Erro: Postgres não ficou healthy a tempo." >&2
  return 1
}

wait_api_auth() {
  local tries=60
  echo "==> A aguardar api-auth…"
  for _ in $(seq 1 "$tries"); do
    if docker exec asgardlab-api-auth true >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Erro: api-auth não ficou disponível a tempo." >&2
  return 1
}

seed_api_auth() {
  if [[ "$SKIP_SEED" -eq 1 ]]; then
    echo "==> Seed ignorado (--skip-seed)."
    return 0
  fi
  echo "==> Seed inicial (api-auth)…"
  docker exec -i asgardlab-api-auth bun run db:seed
}

main() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Aviso: recomendo correr como root na VPS (para instalar Docker/Proxy)."
  fi

  # Parse args
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --api-base-url) API_BASE_URL="${2:-}"; shift 2 ;;
      --crm-url) CRM_URL="${2:-}"; shift 2 ;;
      --public-api-auth-url) PUBLIC_API_AUTH_URL="${2:-}"; shift 2 ;;
      --public-api-core-url) PUBLIC_API_CORE_URL="${2:-}"; shift 2 ;;
      --cors-allowed-origins) CORS_ALLOWED_ORIGINS="${2:-}"; shift 2 ;;
      --public-frontend-url) CRM_URL="${2:-}"; shift 2 ;;
      --proxy) PROXY_TYPE="${2:-}"; shift 2 ;;
      --caddy-email) CADDY_EMAIL="${2:-}"; shift 2 ;;
      --skip-docker-install) SKIP_DOCKER_INSTALL=1; shift 1 ;;
      --skip-proxy) SKIP_PROXY=1; shift 1 ;;
      --env-only) MODE_ENV_ONLY=1; shift 1 ;;
      --deploy-only) MODE_DEPLOY_ONLY=1; shift 1 ;;
      --skip-seed) SKIP_SEED=1; shift 1 ;;
      --force-env-overwrite) FORCE_ENV=1; shift 1 ;;
      -h|--help)
        echo "Ajuda: ./prod-setup-all.sh --api-base-url <url> --crm-url <url> [--proxy caddy|nginx|none]"
        exit 0 ;;
      *)
        echo "Opção desconhecida: $1" >&2
        exit 1 ;;
    esac
  done

  # Modos que não exigem perguntas:
  if [[ "$MODE_DEPLOY_ONLY" -eq 1 ]]; then
    if [[ ! -f "$ENV_FILE" ]]; then
      echo "Erro: $ENV_FILE não existe. Gere antes o .env (ex.: prod-setup-all.sh --env-only)." >&2
      exit 1
    fi
  else
    # Para env-only e setup completo: perguntas mínimas.
    # Se o utilizador já passou PUBLIC_API_AUTH_URL + PUBLIC_API_CORE_URL, não precisamos pedir API_BASE_URL.
    if [[ -z "$API_BASE_URL" ]]; then
      if [[ -z "$PUBLIC_API_AUTH_URL" || -z "$PUBLIC_API_CORE_URL" ]]; then
        prompt_if_empty "API_BASE_URL" "URL base da API (ex.: https://api.asgardai.com.br): "
      fi
    fi
    prompt_if_empty "CRM_URL" "URL do CRM/Frontend (ex.: https://crm.asgardai.com.br): "
    if [[ -z "$CORS_ALLOWED_ORIGINS" ]]; then
      CORS_ALLOWED_ORIGINS="$CRM_URL"
    fi
  fi

  echo "==> Configuração"
  echo "  API_BASE_URL: $API_BASE_URL"
  echo "  CRM_URL:      $CRM_URL"

  if [[ "$MODE_ENV_ONLY" -eq 1 ]]; then
    generate_env_file
    exit 0
  fi

  if [[ "$MODE_DEPLOY_ONLY" -eq 0 ]]; then
    if [[ "$SKIP_DOCKER_INSTALL" -eq 0 ]]; then
      install_docker_if_missing
    fi
    generate_env_file
  else
    # deploy-only: assume que já existe deploy/.env
    if [[ "$SKIP_DOCKER_INSTALL" -eq 0 ]]; then
      install_docker_if_missing
    fi
  fi

  if [[ "$MODE_DEPLOY_ONLY" -eq 0 ]]; then
    if [[ "$SKIP_PROXY" -eq 0 ]]; then
      # Se usar caddy e não tiver email, vai tentar via Caddy sem email. (nem sempre funciona sem prompts)
      if [[ "$PROXY_TYPE" == "caddy" && -z "$CADDY_EMAIL" ]]; then
        read -r -p "Email para Let's Encrypt (Caddy) [opcional; Enter para none]: " CADDY_EMAIL
      fi
      setup_proxy
    fi
  fi

  deploy_stack
  wait_api_auth
  seed_api_auth

  echo "==> Tudo concluído."
}

main "$@"

