const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Gerar apenas os types sem os binários
const prismaDir = path.join(__dirname, 'node_modules', '@prisma', 'client');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

console.log('Tentando gerar cliente Prisma com fallback...');

const env = {
  ...process.env,
  PRISMA_GENERATE_SKIP_AUTOINSTALL: '1',
  PRISMA_CLI_BINARY_TARGETS: 'native'
};

const child = spawn('npx', ['prisma', 'generate', '--skip-engine-validation'], {
  cwd: __dirname,
  env,
  stdio: 'inherit'
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log('Cliente Prisma gerado com sucesso!');
  } else {
    console.log('Falha ao gerar cliente, tentando criar estrutura mínima...');
    // Criar estrutura mínima se falhar
    const indexPath = path.join(prismaDir, 'index.js');
    if (!fs.existsSync(indexPath)) {
      const minimalClient = `
const { PrismaClient } = require('./default');
module.exports = { PrismaClient };
      `;
      try {
        fs.writeFileSync(indexPath, minimalClient);
        console.log('Cliente Prisma mínimo criado.');
      } catch (err) {
        console.error('Erro ao criar cliente mínimo:', err);
      }
    }
  }
  process.exit(code || 0);
});
