#!/usr/bin/env bash
# Para correr na VPS após git pull (atualiza código e recria o stack).
# Uso na pasta do repositório:
#   ./deploy/scripts/vps-pull-and-up.sh
#
# Variável opcional: BRANCH=main (default: branch atual)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BRANCH="${BRANCH:-}"

cd "$REPO_ROOT"

if [[ -n "${BRANCH}" ]]; then
  echo "==> git fetch && checkout ${BRANCH}…"
  git fetch origin
  git checkout "${BRANCH}"
  git pull origin "${BRANCH}"
else
  echo "==> git pull…"
  git pull --ff-only
fi

exec "$SCRIPT_DIR/prod-up.sh"
