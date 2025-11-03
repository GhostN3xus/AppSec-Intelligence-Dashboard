#!/usr/bin/env ts-node
import 'reflect-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { VulnerabilitiesService } from '../modules/vulnerabilities/vulnerabilities.service';
import { AuditService } from '../modules/audit/audit.service';
import { IntegrationsService } from '../modules/integrations/integrations.service';

async function bootstrap() {
  const args = process.argv.slice(2);
  const fileArg = args.find((arg) => arg.startsWith('--file='));
  if (!fileArg) {
    console.error('Usage: npm run import-semgrep -- --file=path/to/file');
    process.exit(1);
  }
  const filePath = fileArg.split('=')[1];
  const absolutePath = filePath.startsWith('/') ? filePath : join(process.cwd(), filePath);
  const buffer = readFileSync(absolutePath);
  const prisma = new PrismaService();
  await prisma.$connect();
  const vulnerabilitiesService = new VulnerabilitiesService(prisma);
  const auditService = new AuditService(prisma);
  const integrationsService = new IntegrationsService(vulnerabilitiesService, auditService, prisma);
  const result = await integrationsService.importSemgrep(buffer);
  console.log(`Imported ${result.created} findings from ${result.tool}`);
  await prisma.$disconnect();
}

bootstrap().catch((error) => {
  console.error('Failed to import Semgrep data', error);
  process.exit(1);
});
