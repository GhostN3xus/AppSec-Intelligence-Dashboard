#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

cat <<'BANNER'
=============================================
 AppSec Intelligence Dashboard - Setup Wizard
=============================================
BANNER

read -r -p "Informe a chave de API para IA (ex: OpenAI). Caso não tenha, pressione Enter: " API_KEY

if [ ! -f "backend/.env" ]; then
  echo "Criando backend/.env a partir de backend/.env.example..."
  cp backend/.env.example backend/.env
fi

if [ -n "${API_KEY}" ]; then
  echo "Aplicando chave de API no backend/.env..."
  APPSEC_DASHBOARD_API_KEY="${API_KEY}" python3 - <<'PY'
import os
from pathlib import Path

env_path = Path("backend/.env")
api_key = os.environ["APPSEC_DASHBOARD_API_KEY"]
lines = env_path.read_text().splitlines()

for idx, line in enumerate(lines):
    if line.startswith("OPENAI_API_KEY="):
        lines[idx] = f"OPENAI_API_KEY={api_key}"
        break
else:
    lines.append(f"OPENAI_API_KEY={api_key}")

env_path.write_text("\n".join(lines) + "\n")
PY
  unset APPSEC_DASHBOARD_API_KEY
else
  echo "Nenhuma chave de API fornecida. O backend utilizará heurísticas locais."
fi

echo "Instalando dependências do backend..."
npm --prefix backend install

echo "Instalando dependências do frontend..."
npm --prefix frontend install

echo "Gerando Prisma Client..."
npm --prefix backend run prisma:generate

echo
cat <<'DONE'
Setup concluído!
- backend/.env configurado
- Dependências instaladas (backend/frontend)
- Prisma Client gerado

Execute `make seed` para popular dados iniciais e `docker-compose up --build` ou `make dev-backend`/`make dev-frontend` para iniciar.
DONE
