#!/usr/bin/env bash
set -euo pipefail

# Deploy script for OneShop on a VPS (run as the deploy user, e.g. oneshop).
# Expects the repo at /var/www/oneshop with .env already configured.
#
# Usage:
#   bash deploy.sh
#   DEPLOY_BRANCH=cursor/user-profile-messages bash deploy.sh
#
# Default branch is master. New work that is only on a feature branch will
# not appear until you merge it to master or set DEPLOY_BRANCH.

cd "$(dirname "$0")"

BRANCH="${DEPLOY_BRANCH:-master}"

echo "==> Fetching origin"
git fetch origin --prune

if ! git rev-parse --verify "origin/${BRANCH}" >/dev/null 2>&1; then
  echo "Remote branch origin/${BRANCH} not found."
  echo "Available remotes:"
  git branch -r
  echo "Set DEPLOY_BRANCH to one of those names."
  exit 1
fi

echo "==> Checking out origin/${BRANCH}"
git checkout -B "${BRANCH}" "origin/${BRANCH}"
echo "==> Now at $(git log -1 --oneline)"

echo "==> Installing dependencies"
npm ci

echo "==> Generating Prisma client"
npx prisma generate

echo "==> Applying database schema (SQLite)"
npx prisma db push --skip-generate

echo "==> Building Next.js app"
npm run build

echo "==> Reloading PM2 process"
pm2 reload oneshop --update-env || pm2 start ecosystem.config.cjs
pm2 save

echo "==> Deploy complete ($(git log -1 --oneline))"
