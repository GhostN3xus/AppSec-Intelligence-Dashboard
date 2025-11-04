# Changelog - Correções e Melhorias

## Data: 2025-11-04

### 🐛 Correções de Bugs Críticos

#### 1. Dependência `date-fns` Faltante
- **Problema**: Missing dependency causando crash no reset de senha
- **Arquivo**: `backend/package.json`
- **Solução**: Adicionada dependência `date-fns@^3.0.0`
- **Impacto**: Sistema de reset de senha agora funcional

#### 2. Providers Duplicados no AppModule
- **Problema**: Array `providers` definido duas vezes no `app.module.ts`
- **Arquivo**: `backend/src/app.module.ts` (linhas 60-66)
- **Solução**: Removida duplicação
- **Impacto**: Melhor performance e prevenção de erros de inicialização

#### 3. Erros no docker-compose.yml
- **Problemas**:
  - Imagem PostgreSQL duplicada (16 e 15)
  - Serviço `sast-parser` com estrutura YAML malformada
  - Dependências soltas (`- backend`)
- **Arquivo**: `docker-compose.yml`
- **Solução**:
  - Mantida apenas PostgreSQL 15
  - Corrigida estrutura do serviço sast-parser
  - Removidas dependências duplicadas
- **Impacto**: Docker compose agora válido e funcional

#### 4. Conflito de Ordem de Rotas
- **Problema**: Rota `:id` capturando `/export/excel` antes da rota específica
- **Arquivo**: `backend/src/modules/responsibilities/responsibilities.controller.ts`
- **Solução**: Movida rota `/export/excel` antes da rota parametrizada `:id`
- **Impacto**: Export de Excel agora funcional

#### 5. Cookie Parser Import
- **Problema**: Import namespace-style causando erro em runtime
- **Arquivo**: `backend/src/main.ts`
- **Solução**: Alterado para default import
- **Impacto**: Aplicação inicia corretamente

#### 6. Throttle Decorator API
- **Problema**: API do @Throttle mudou na versão 5+ do nestjs/throttler
- **Arquivo**: `backend/src/modules/auth/auth.controller.ts`
- **Solução**: Atualizado para nova API com objeto `{ default: { limit, ttl } }`
- **Impacto**: Rate limiting funcional

---

### 🔒 Melhorias de Segurança

#### 1. Configurações Sensíveis
- **Problema**: JWT_SECRET hardcoded como "supersecret"
- **Arquivos**: `backend/.env.example`, `docker-compose.yml`
- **Solução**:
  - Adicionados avisos para alterar em produção
  - Uso de variáveis de ambiente com valores padrão seguros
  - Documentação de variáveis necessárias
- **Impacto**: Melhor segurança em produção

#### 2. Guards de Segurança Consistentes
- **Problema**: Health endpoint `/modules` sem RolesGuard
- **Arquivo**: `backend/src/modules/health/health.controller.ts`
- **Solução**: Adicionados `RolesGuard` e `@Roles` decorator
- **Impacto**: Controle de acesso consistente em toda aplicação

---

### ✨ Novas Funcionalidades

#### 1. Middleware de Autenticação no Frontend
- **Descrição**: Proteção automática de rotas no Next.js
- **Arquivo**: `frontend/middleware.ts` (novo)
- **Funcionalidades**:
  - Redirecionamento automático para login se não autenticado
  - Preservação de URL de destino para redirect pós-login
  - Rotas públicas configuráveis
- **Impacto**: Melhor UX e segurança

#### 2. Sistema de Notificações por Email
- **Descrição**: Serviço completo de envio de emails
- **Arquivos**:
  - `backend/src/modules/integrations/email.service.ts` (novo)
  - `backend/src/modules/integrations/integrations.service.ts` (atualizado)
  - `backend/src/modules/integrations/integrations.controller.ts` (atualizado)
- **Funcionalidades**:
  - Envio de alertas por email
  - Email de reset de senha
  - Configuração via SMTP
  - Integração com sistema de alertas existente
- **Dependências**: `nodemailer@^6.9.9`, `@types/nodemailer@^6.4.14`
- **Configuração**: Variáveis SMTP no `.env`
- **Impacto**: Canal adicional de notificação além do Telegram

#### 3. Parser DAST Completo
- **Descrição**: Suporte para importação de ferramentas DAST
- **Arquivo**: `backend/src/modules/integrations/integrations.service.ts`
- **Formatos Suportados**:
  - OWASP ZAP (múltiplos formatos JSON)
  - Burp Suite
  - Formato genérico
  - CSV
- **Endpoint**: `POST /api/integrations/dast`
- **Impacto**: Dashboard agora suporta tanto SAST quanto DAST

#### 4. Operações em Massa para Vulnerabilidades
- **Descrição**: Manipulação eficiente de múltiplas vulnerabilidades
- **Arquivos**:
  - `backend/src/modules/vulnerabilities/vulnerabilities.service.ts`
  - `backend/src/modules/vulnerabilities/vulnerabilities.controller.ts`
- **Operações Disponíveis**:
  - `POST /api/vulnerabilities/bulk/update` - Atualizar múltiplas
  - `POST /api/vulnerabilities/bulk/delete` - Deletar múltiplas
  - `POST /api/vulnerabilities/bulk/assign` - Atribuir responsável
  - `POST /api/vulnerabilities/bulk/status` - Alterar status
- **Impacto**: Gestão mais eficiente de vulnerabilidades

---

### 📝 Configurações Adicionadas

#### Variáveis de Ambiente (backend/.env.example)
```env
# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@appsec.local

# Telegram Configuration (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

---

### 📊 Resumo das Alterações

**Arquivos Modificados**: 12
**Arquivos Criados**: 3
**Bugs Críticos Corrigidos**: 6
**Melhorias de Segurança**: 2
**Novas Funcionalidades**: 4

### 🎯 Próximos Passos Recomendados

1. **Testes**: Adicionar testes unitários e de integração
2. **Documentação**: Expandir documentação da API
3. **DAST Frontend**: Criar interface de upload para DAST
4. **Bulk Operations UI**: Interface para operações em massa no frontend
5. **Email Templates**: Templates HTML mais ricos para emails

---

### 🔧 Como Usar as Novas Funcionalidades

#### Configurar Email
```bash
# No .env do backend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
EMAIL_FROM=noreply@appsec.local
```

#### Importar DAST
```bash
curl -X POST http://localhost:4000/api/integrations/dast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@zap-report.json" \
  -F "tool=OWASP ZAP"
```

#### Operação em Massa
```bash
curl -X POST http://localhost:4000/api/vulnerabilities/bulk/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["id1", "id2"], "status": "fixed"}'
```

---

### ⚠️ Notas de Migração

1. **Instalar Dependências**: Execute `npm install` no backend
2. **Atualizar .env**: Adicione novas variáveis de ambiente
3. **Regenerar Prisma**: Execute `npx prisma generate`
4. **Rebuild**: Execute `npm run build` em backend e frontend
