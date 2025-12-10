#!/usr/bin/env bash
set -euo pipefail
APP="$1"          # ex: admin, api
REMOTE_PATH="/srv/rsapps/${APP}"
mkdir -p "$REMOTE_PATH"
echo "Deploy placeholder para $REMOTE_PATH (o rsync do GitHub Actions publicará os artefatos)"
