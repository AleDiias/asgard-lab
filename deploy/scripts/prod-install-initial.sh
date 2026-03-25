#!/usr/bin/env bash
# Wrapper de compatibilidade: o fluxo único agora é `prod-setup-all.sh`.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

NO_SEED=0
ENV_ARG=""
for arg in "$@"; do
  case "$arg" in
    --no-seed)
      NO_SEED=1
      ;;
    -h|--help)
      ;;
    *)
      ENV_ARG="$arg"
      ;;
  esac
done

if [[ -n "$ENV_ARG" && -f "$ENV_ARG" ]]; then
  cp "$ENV_ARG" "$REPO_ROOT/deploy/.env"
fi

if [[ "$NO_SEED" -eq 1 ]]; then
  exec "$SCRIPT_DIR/prod-setup-all.sh" --skip-seed
else
  exec "$SCRIPT_DIR/prod-setup-all.sh"
fi

# Instalação inicial na VPS (Docker): prepara deploy/.env, sobe o stack e corre seed do api-auth.
#
# Uso (na raiz do repositório clonado):
#   ./deploy/scripts/prod-install-initial.sh
#   ./deploy/scripts/prod-install-initial.sh /caminho/custom.env
#
# Flags:
#   --no-seed     Não executa `bun run db:seed` no api-auth após o up.
#
# 1.ª execução típica: se deploy/.env não existir, copia deploy/.env.example,
#     imprime instruções e termina com código 1 — edite as variáveis e volte a correr este script.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
COMPOSE_FILE="$REPO_ROOT/deploy/docker-compose.prod.yml"
EXAMPLE_ENV="$REPO_ROOT/deploy/.env.example"
ENV_FILE="${REPO_ROOT}/deploy/.env"
RUN_SEED=1
extra=()

for arg in "$@"; do
  case "$arg" in
    --no-seed)
      RUN_SEED=0
      ;;
    --help|-h)
      echo "Uso: $0 [--no-seed] [deploy/.env ou caminho absoluto]"
      exit 0
      ;;
    -*)
      echo "Opção desconhecida: $arg" >&2
      echo "Uso: $0 [--no-seed] [caminho/para/.env]" >&2
      exit 1
      ;;
    *)
      extra+=("$arg")
      ;;
  esac
done

if [[ ${#extra[@]} -gt 1 ]]; then
  echo "Erro: indique no máximo um ficheiro .env." >&2
  exit 1
fi

if [[ ${#extra[@]} -eq 1 ]]; then
  p="${extra[0]}"
  if [[ "$p" == /* ]]; then
    ENV_FILE="$p"
  else
    ENV_FILE="$(cd "$REPO_ROOT/$(dirname "$p")" && pwd)/$(basename "$p")"
  fi
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Erro: não encontrei $COMPOSE_FILE" >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: Docker não está instalado ou não está no PATH." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Erro: precisa do Docker Compose v2 (comando: docker compose)." >&2
  exit 1
fi

cd "$REPO_ROOT"

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ ! -f "$EXAMPLE_ENV" ]]; then
    echo "Erro: não existe $EXAMPLE_ENV para copiar." >&2
    exit 1
  fi
  cp "$EXAMPLE_ENV" "$ENV_FILE"
  echo ""
  echo ">>> Criei $ENV_FILE a partir do exemplo."
  echo ">>> Edite esse ficheiro (obrigatório: senhas, JWT_SECRET, DATABASE_URL com host"
  echo "    postgres, URLs públicas CORS / APIs / frontend) e volte a executar:"
  echo ">>>   ./deploy/scripts/prod-install-initial.sh"
  echo ""
  exit 1
fi

# Evita subir produção com valores de exemplo óbvios do repositório.
if grep -E 'troque_por_(senha_forte|string_longa_aleatoria)' "$ENV_FILE" >/dev/null 2>&1; then
  echo "Erro: $ENV_FILE ainda contém valores de exemplo (troque_por_*)." >&2
  echo "Defina POSTGRES_PASSWORD, JWT_SECRET e DATABASE_URL com credenciais reais e URLs corretas." >&2
  exit 1
fi

if [[ "$RUN_SEED" -eq 1 ]] && grep -E '^ASGARD_SEED_PASSWORD[[:space:]]*=[[:space:]]*$' "$ENV_FILE" >/dev/null 2>&1; then
  echo "Aviso: ASGARD_SEED_PASSWORD está vazio em $ENV_FILE — no contentor isso vira palavra-passe vazia (não o default da app)." >&2
  echo "Defina ASGARD_SEED_PASSWORD ou use --no-seed." >&2
fi

echo "==> Build e arranque dos contentores (asgardlab-*)…"
"$SCRIPT_DIR/prod-up.sh" "$ENV_FILE"

echo "==> A aguardar o api-auth aceitar comandos…"
for _ in $(seq 1 60); do
  if docker exec asgardlab-api-auth true >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! docker exec asgardlab-api-auth true >/dev/null 2>&1; then
  echo "Erro: o contentor asgardlab-api-auth não ficou disponível a tempo." >&2
  exit 1
fi

if [[ "$RUN_SEED" -eq 1 ]]; then
  echo "==> Seed da base (api-auth) — idempotente (onConflictDoNothing no email)…"
  docker compose -f "$REPO_ROOT/deploy/docker-compose.prod.yml" --env-file "$REPO_ROOT/deploy/.env" exec -T api-auth bun run db:seed
  echo "==> Seed concluído."
else
  echo "==> Seed ignorado (--no-seed)."
fi

echo ""
echo "Instalação inicial concluída."
echo "  Portas expostas no host — ver HOST_FRONTEND_PORT, HOST_API_AUTH_PORT, HOST_API_CORE_PORT em:"
echo "    $ENV_FILE"
echo "  Migrações por base tenant (api-core): backend/api-core/README.md"
