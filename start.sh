#!/usr/bin/env bash
set -e
if ! command -v node &>/dev/null; then echo "[ERROR] Node.js not found"; exit 1; fi
if ! command -v pnpm &>/dev/null; then npm install -g pnpm; fi
if [ ! -d "node_modules" ]; then pnpm install; fi
pnpm dev
