# Guia de Inicialização do AppSec Intelligence Dashboard

## Opção 1: Usando Docker Compose (Recomendado)

A forma mais fácil de executar a aplicação é usando Docker Compose:

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar os serviços
docker-compose down
```

Após iniciar, acesse:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Documentação da API**: http://localhost:4000/api

### Credenciais padrão:
- Email: `admin@appsec.local`
- Senha: `admin123`

## Opção 2: Execução Manual (Desenvolvimento)

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### 1. Configurar Banco de Dados

Instale e inicie o PostgreSQL:

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-15

# macOS com Homebrew
brew install postgresql@15

# Iniciar serviço
sudo service postgresql start  # Linux
brew services start postgresql@15  # macOS
```

Crie o banco de dados:

```bash
sudo -u postgres psql
CREATE DATABASE appsec_db;
CREATE USER appsec WITH PASSWORD 'appsec';
GRANT ALL PRIVILEGES ON DATABASE appsec_db TO appsec;
\q
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário

# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy

# Executar seeds
npm run seed

# Iniciar servidor
npm run start:dev
```

O backend estará disponível em http://localhost:4000

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em http://localhost:3000

## Solução de Problemas

### Erro ao gerar Prisma

Se você encontrar erros 403 ao baixar binários do Prisma:

1. Use Docker Compose (recomendado)
2. Configure um proxy ou VPN
3. Baixe manualmente os binários:
   ```bash
   export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
   npx prisma generate
   ```

### Erro de conexão com banco de dados

Verifique se o PostgreSQL está rodando:

```bash
sudo service postgresql status  # Linux
brew services list  # macOS
```

Verifique a URL de conexão no arquivo `.env` do backend.

### Frontend não conecta ao backend

Verifique se:
1. O backend está rodando na porta 4000
2. O arquivo `.env.local` do frontend tem a URL correta
3. CORS está configurado corretamente no backend

## Makefile

Você também pode usar o Makefile para comandos comuns:

```bash
# Ver comandos disponíveis
make help

# Iniciar com Docker
make up

# Parar containers
make down

# Ver logs
make logs
```

## Próximos Passos

1. Acesse http://localhost:3000
2. Faça login com as credenciais padrão
3. Configure integrações (SAST, OpenAI, etc.)
4. Importe relatórios SAST
5. Explore as vulnerabilidades encontradas
6. Gere relatórios personalizados

## Suporte

Para mais informações, consulte:
- README.md
- CHANGELOG.md
- Documentação da API: http://localhost:4000/api
