import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ResponsibilitiesModule,
    VulnerabilitiesModule,
    ReportsModule,
    SlaModule,
    IntegrationsModule,
    KnowledgeBaseModule,
    AuditModule,
    AiModule,
  ],
})
export class AppModule {}
