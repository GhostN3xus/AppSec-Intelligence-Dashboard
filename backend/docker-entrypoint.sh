#!/bin/sh
set -e

until npx prisma migrate deploy; do
  echo "Database is unavailable - retrying in 3s"
  sleep 3
done

npx prisma generate

echo "Running database seed"
node dist/seeds/seed.js

exec node dist/main.js
