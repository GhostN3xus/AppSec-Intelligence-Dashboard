import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [VulnerabilitiesModule, AuditModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
