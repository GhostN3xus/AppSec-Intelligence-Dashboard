import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/utils/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { ResponsibilitiesModule } from './modules/responsibilities/responsibilities.module';
import { VulnerabilitiesModule } from './modules/vulnerabilities/vulnerabilities.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SlaModule } from './modules/sla/sla.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { AuditModule } from './modules/audit/audit.module';
import { AiModule } from './modules/ai/ai.module';
import { DomainsModule } from './modules/domains/domains.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ImportsModule } from './modules/imports/imports.module';
import { DependencyFindingsModule } from './modules/dependency-findings/dependency-findings.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ResponsibilitiesModule,
    VulnerabilitiesModule,
    ReportsModule,
    SlaModule,
    IntegrationsModule,
    ImportsModule,
    DependencyFindingsModule,
    KnowledgeBaseModule,
    AuditModule,
    AiModule,
    DomainsModule,
    InventoryModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    RolesGuard,
  ],
})
export class AppModule {}
