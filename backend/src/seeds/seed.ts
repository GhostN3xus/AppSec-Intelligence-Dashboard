import 'reflect-metadata';
import { PrismaService } from '../prisma/prisma.service';
import { SLA_DEADLINES } from '../common/utils/sla';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaService();
  await prisma.$connect();

  const adminEmail = 'admin@appsec.local';
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'AppSec Admin',
      role: 'admin',
    },
  });

  await prisma.integrationConfig.upsert({
    where: { provider: 'sla-defaults' },
    update: { settings: SLA_DEADLINES },
    create: { provider: 'sla-defaults', settings: SLA_DEADLINES },
  });

  const documents = [
    {
      slug: 'metodologia-owasp',
      title: 'Metodologia OWASP',
      category: 'Documentação Pentest',
      content: '# Metodologia OWASP\n- Reconhecimento\n- Modelagem de ameaças\n- Testes de vulnerabilidade',
    },
    {
      slug: 'checklist-sast',
      title: 'Checklist SAST',
      category: 'Checklists',
      content: '- Configurar pipeline\n- Revisar regras Semgrep\n- Validar falsos positivos',
    },
    {
      slug: 'boas-praticas-relatorio',
      title: 'Boas práticas de relatório',
      category: 'Guias',
      content: 'Utilize linguagem executiva, inclua métricas CVSS e recomendações objetivas.',
    },
  ];

  for (const doc of documents) {
    await prisma.knowledgeDocument.upsert({
      where: { slug: doc.slug },
      update: doc,
      create: doc,
    });
  }

  const templates = [
    {
      name: 'Pentest Técnico',
      category: 'Pentest',
      content: '## Pentest Técnico\n{{resumo}}\n### Vulnerabilidades\n{{vulnerabilidades}}',
    },
    {
      name: 'Relatório SAST (Semgrep)',
      category: 'SAST',
      content: '## Relatório SAST\nTotal Findings: {{total}}\nResumo: {{resumo}}',
    },
    {
      name: 'Plano de Remediação',
      category: 'Remediation',
      content: '## Plano de Remediação\n{{acoes}}',
    },
  ];

  for (const template of templates) {
    await prisma.reportTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
  }

  console.log('Seed completed. Admin user:', admin.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
