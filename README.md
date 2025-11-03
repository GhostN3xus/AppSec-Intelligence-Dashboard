# AppSec Intelligence Dashboard

Plataforma integrada para equipes de segurança da informação consolidarem dados de SAST, DAST, infraestrutura e documentação. O projeto é composto por backend NestJS + Prisma, frontend Next.js com TailwindCSS e banco PostgreSQL, com orquestração via Docker Compose.

## Arquitetura

- **Backend (porta 4000)**: NestJS com módulos de autenticação JWT, gestão de usuários, aplicações, vulnerabilidades, SLAs, templates de relatório, documentação e integrações.
- **Frontend (porta 3000)**: Next.js 14 (App Router) com tema dark cibernético, dashboards interativos e editor WYSIWYG.
- **Banco**: PostgreSQL + Prisma ORM.
- **IA**: Conector modular para OpenAI/Azure OpenAI (fallback local incluído).

```
services:
  backend   -> backend NestJS
  frontend  -> Next.js SPA
  postgres  -> PostgreSQL 15
```

## Configuração rápida


### Setup automatizado

```bash
./setup.sh
```

O assistente solicitará a chave de API de IA (ex.: OpenAI) e cuidará de copiar o `.env`, instalar dependências e gerar o Prisma Client.

### Setup manual


```bash
make install           # instala dependências backend + frontend
cp backend/.env.example backend/.env
make prisma-generate   # gera Prisma Client
make seed              # popula dados básicos
make dev-backend       # inicia API em http://localhost:4000
make dev-frontend      # inicia frontend em http://localhost:3000
```


### Containers

Ou via Docker Compose:


```bash
docker-compose up --build
```

A aplicação padrão autentica usuários usando JWT. O seed cria o usuário `admin@appsec.local` (senha `admin123`) e carrega documentação e templates base.

## Principais recursos

### Importação & Correlação
- Upload Semgrep (CSV/JSON) pelo endpoint `/api/integrations/semgrep` ou via CLI: `make import-semgrep file=relatorio.csv`.
- Endpoint genérico `/api/integrations/tool` para Nessus, Nmap, Burp ou ZAP (JSON).
- Correlaciona achados por aplicação e responsável, registrando auditoria de importações.

### Gestão de aplicações e responsáveis
- CRUD completo via `/api/applications` e `/api/responsibles`.
- Exportação Excel dos responsáveis com colunas **Aplicação, Responsável, Severidade, SLA** (`/api/responsibles/export/excel`).
- Dashboard com métricas de severidade, SLAs, top aplicações críticas e taxa de falsos positivos (IA).

### SLAs dinâmicos
- Defaults: Crítica 7d, Alta 15d, Média 30d, Baixa 60d.
- Endpoint `/api/sla/config` para ajuste dos prazos e `/api/sla/dashboard` para status (vencido, em risco, no prazo).

### Documentação & Templates
- Biblioteca versionável de documentação Pentest (OWASP, NIST, API Security, checklists) editável no app.
- Templates de relatório (Pentest técnico/executivo, SAST Semgrep, DAST Burp/ZAP, API Security, Plano de remediação, False positive review, SLA status) com exportação PDF, DOCX, HTML ou JSON via `/api/reports`.

### IA integrada
- Endpoint `/api/ai/triage` para classificar achados e sugerir falsos positivos.
- `/api/ai/summary` e `/api/ai/remediation` para resumos executivos e recomendações.
- Frontend inclui botões de triagem automática e resumo IA.
- Caso não exista chave de API, o serviço aplica heurística local.

### Auditoria
- Logs de ações relevantes (`/api/audit`).
- Configurações de SLA e integrações persistidas em `IntegrationConfig`.

## Estrutura de pastas

```
backend/
  src/
    modules/ ...
    prisma/
    cli/import-semgrep.ts
frontend/
  app/
  components/
  lib/api-client.ts
prisma/schema.prisma
Makefile
```

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | String de conexão PostgreSQL |
| `JWT_SECRET` / `JWT_EXPIRATION` | Config JWT |
| `OPENAI_API_KEY` | (Opcional) chave OpenAI |
| `AZURE_OPENAI_ENDPOINT` / `AZURE_OPENAI_KEY` | (Opcional) Azure OpenAI |

## Scripts úteis

- `make import-semgrep file=path.csv` – importa relatório Semgrep via CLI.
- `npm --prefix backend run prisma:migrate` – cria/atualiza migrações.
- `npm --prefix backend run seed` – cria dados iniciais (usuário admin, docs, templates, SLA).

## Autenticação

Consuma `/api/auth/register` ou `/api/auth/login` para obter JWT. A API entrega o token via cookie HTTP-only (`appsec_token`), permitindo chamadas autenticadas sem expor o segredo no navegador. O frontend usa `withCredentials` para enviar cookies automaticamente.

## Observações

- O editor WYSIWYG utiliza React Quill com persistência em markdown simples.
- Exports de relatório usam `pdfkit`, `docx` e HTML/JSON direto.
- O dashboard aproveita Chart.js e Tailwind para visualizações e tema cyberpunk.
- Ajuste `NEXT_PUBLIC_API_URL` no frontend para apontar para a API desejada.

## Roadmap sugerido

- Implementar autenticação no frontend (login flow).
- Adicionar migrações Prisma com versionamento (`prisma migrate deploy`).
- Expandir correlação multi-fonte com regras mais avançadas.
- Configurar pipelines CI/CD e testes automatizados.
