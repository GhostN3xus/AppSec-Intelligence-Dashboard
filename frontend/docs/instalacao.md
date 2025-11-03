# Instalação e Setup

Bem-vindo ao AppSec Intelligence Dashboard! Siga estes passos para rodar a plataforma localmente.

## Pré-requisitos

- Docker e Docker Compose instalados
- Porta 3000 livre para o frontend
- Porta 4000 livre para o backend
- Porta 5432 livre para o PostgreSQL

## Passos

1. Clone o repositório e instale as dependências necessárias.
2. Configure variáveis de ambiente opcionais no arquivo `.env.local` do frontend ou `.env` do backend caso precise customizar integrações.
3. Execute o comando:

```bash
docker-compose up --build
```

4. Acesse `http://localhost:3000` e faça login com o usuário administrador criado automaticamente (`admin@appsec.local` / `admin123`).

## Estrutura de serviços

- **frontend**: Interface Next.js com autenticação via cookies e páginas protegidas.
- **backend**: API NestJS + Prisma com guardas de rota, importadores SAST/SCA e geração de relatórios.
- **postgres**: Banco de dados relacional com todas as entidades do domínio AppSec.
- **sast-parser**: Monitor de arquivos CSV Semgrep/SCA que envia achados automaticamente para o backend.

## Migrações e seed

As migrações Prisma são executadas automaticamente pelo container do backend na inicialização. Em seguida o seed cria:

- Usuário administrador padrão
- Templates OWASP/MSTG para relatórios executivos e técnicos

Após subir os serviços você já pode realizar logins, cadastrar aplicações e importar relatórios de segurança.
