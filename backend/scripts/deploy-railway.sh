#!/usr/bin/env bash
set -euo pipefail

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI not found. Skipping deployment."
  exit 0
fi

if [ -z "${RAILWAY_PROJECT:-}" ]; then
  echo "RAILWAY_PROJECT not set. Skipping deployment."
  exit 0
fi

echo "Deploying to Railway project: ${RAILWAY_PROJECT}"
railway up --project ${RAILWAY_PROJECT} || exit 1
