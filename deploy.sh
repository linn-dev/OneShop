#!/usr/bin/env bash
set -euo pipefail

# Deploy script for OneShop on a VPS (run as the deploy user, e.g. oneshop).
# Expects the repo at /var/www/oneshop with .env already configured.
# Usage: bash deploy.sh

cd "$(dirname "$0")"

echo "==> Pulling latest code"
git pull

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database schema (SQLite)"
npx prisma db push --skip-generate

echo "==> Building Next.js app"
npm run build

echo "==> Reloading PM2 process"
pm2 reload oneshop || pm2 start ecosystem.config.cjs

echo "==> Deploy complete"
