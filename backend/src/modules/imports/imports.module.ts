import { Module } from '@nestjs/common';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { DependencyFindingsModule } from '../dependency-findings/dependency-findings.module';

@Module({
  imports: [
    PrismaModule,
    VulnerabilitiesModule,
    AuditModule,
    IntegrationsModule,
    DependencyFindingsModule,
  ],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
