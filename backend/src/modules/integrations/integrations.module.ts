import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { EmailService } from './email.service';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [VulnerabilitiesModule, AuditModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, EmailService],
  exports: [IntegrationsService, EmailService],
})
export class IntegrationsModule {}
