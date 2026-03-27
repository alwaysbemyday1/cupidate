#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[Cupidate] Init started in: $ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "[Cupidate] Error: node is not installed."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[Cupidate] Error: npm is not installed."
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[Cupidate] Installing dependencies..."
  npm install
else
  echo "[Cupidate] node_modules already exists. Skipping install."
fi

echo "[Cupidate] Starting Expo dev server..."
npm run start
