#!/usr/bin/env bash
# Script auto-setup para VPS Ubuntu:
# - Instala dependencias (Node atual, Docker/Compose, Nginx, etc.)
# - Pergunta URLs (API base e CRM/Frontend)
# - Gera deploy/.env com JWT_SECRET e POSTGRES_PASSWORD aleatorios
# - Configura proxy (Caddy por defeito, ou Nginx) e sobe com docker compose
#
# Uso:
#   ./deploy/scripts/ubuntu-deploy.sh
#   ./deploy/scripts/ubuntu-deploy.sh --api-base-url https://api.exemplo.com --crm-url https://crm.exemplo.com
#   ./deploy/scripts/ubuntu-deploy.sh --proxy nginx
#
# Requisitos:
# - Deve ser executado com root (ou via sudo) para instalar pacotes e configurar serviços.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
SETUP_SCRIPT="$REPO_ROOT/deploy/scripts/prod-setup-all.sh"
ENV_FILE="$REPO_ROOT/deploy/.env"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: não encontrei $COMPOSE_FILE" >&2
  exit 1
fi
if [[ ! -f "$SETUP_SCRIPT" ]]; then
  echo "Erro: não encontrei $SETUP_SCRIPT" >&2
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Erro: execute este script como root (ex.: sudo $0 ...)." >&2
  exit 1
fi

API_BASE_URL=""
CRM_URL=""
PROXY_TYPE="caddy" # caddy (HTTPS) ou nginx (HTTP)
FORCE_ENV=0
SKIP_SEED=0
SKIP_DOCKER_INSTALL=1

usage() {
  cat <<EOF
Uso: $0 [opções]

Opções:
  --api-base-url <url>     URL base da API (ex.: https://api.exemplo.com)
  --crm-url <url>          URL do frontend/CRM (ex.: https://crm.exemplo.com)
  --proxy caddy|nginx|none Proxy para apontar / e /api-*.
                           Por defeito: caddy.
  --force                  Força sobrescrever deploy/.env
  --skip-seed              Não executa bun run db:seed no api-auth
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-base-url) API_BASE_URL="${2:-}"; shift 2 ;;
    --crm-url) CRM_URL="${2:-}"; shift 2 ;;
    --proxy) PROXY_TYPE="${2:-}"; shift 2 ;;
    --force) FORCE_ENV=1; shift 1 ;;
    --skip-seed) SKIP_SEED=1; shift 1 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Opção desconhecida: $1" >&2
      usage
      exit 1
      ;;
  esac
done

ensure_ubuntu() {
  if [[ ! -f /etc/os-release ]]; then
    echo "Erro: /etc/os-release não existe (sistema não suportado)." >&2
    exit 1
  fi
  # shellcheck disable=SC1091
  . /etc/os-release
  if [[ "${ID:-}" != "ubuntu" && "${ID_LIKE:-}" != *"ubuntu"* ]]; then
    echo "Aviso: este script foi pensado para Ubuntu. ID atual: ${ID:-desconhecido}." >&2
  fi
}

install_apt_prereqs() {
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release git unzip tar build-essential
}

install_node_latest() {
  # NodeSource "current" -> mais recente estável disponível.
  echo "==> A instalar Node.js (versão mais recente disponível)…"
  if curl -fsSL https://deb.nodesource.com/setup_current.x >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
    apt-get install -y nodejs
  else
    echo "Aviso: falha a obter setup_current.x. A tentar fallback para 22.x…" >&2
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi

  echo "==> Node instalado: $(node -v 2>/dev/null || true)"
}

install_nginx() {
  echo "==> A instalar Nginx…"
  apt-get install -y nginx
  systemctl enable --now nginx || true
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    echo "==> Docker/Compose já instalados."
    return 0
  fi

  echo "==> A instalar Docker e Docker Compose…"

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
}

prompt_if_empty() {
  local var_name="$1"
  local var_value="${!var_name}"
  local question="$2"
  if [[ -z "$var_value" ]]; then
    read -r -p "$question" "$var_name"
  fi
}

validate_urlish() {
  local u="$1"
  # Aceita http(s)://host[/...]
  if [[ ! "$u" =~ ^https?://[^/]+(/.*)?$ ]]; then
    echo "Aviso: a URL '${u}' não parece válida (esperado http(s)://host/...)." >&2
  fi
}

wait_postgres_healthy() {
  local tries=90
  echo "==> A validar Postgres (healthcheck)..."
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

start_apis_after_db() {
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Erro: não encontrei $ENV_FILE para subir as APIs." >&2
    return 1
  fi

  echo "==> Subindo APIs e frontend após Postgres saudável..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d api-auth api-core frontend
}

ensure_inputs() {
  prompt_if_empty "API_BASE_URL" "URL base da API (ex.: https://api.exemplo.com): "
  prompt_if_empty "CRM_URL" "URL do frontend/CRM (ex.: https://crm.exemplo.com): "

  validate_urlish "$API_BASE_URL"
  validate_urlish "$CRM_URL"
}

main() {
  ensure_ubuntu
  install_apt_prereqs

  # Dependencias pedidas pelo utilizador.
  install_node_latest
  install_nginx
  install_docker

  ensure_inputs

  echo "==> Subindo stack (docker compose)…"
  local args=(
    --api-base-url "$API_BASE_URL"
    --crm-url "$CRM_URL"
    --proxy "$PROXY_TYPE"
    --skip-docker-install
  )

  if [[ "$FORCE_ENV" -eq 1 ]]; then
    args+=(--force-env-overwrite)
  fi
  if [[ "$SKIP_SEED" -eq 1 ]]; then
    args+=(--skip-seed)
  fi

  # prod-setup-all.sh gera deploy/.env com JWT e POSTGRES_PASSWORD aleatorios automaticamente.
  "$SETUP_SCRIPT" "${args[@]}"

  # Reforço explícito da ordem: só deixa APIs/frontend subirem após DB saudável.
  wait_postgres_healthy
  start_apis_after_db
}

main "$@"

