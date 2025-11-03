import { Module } from '@nestjs/common';
import { SlaService } from './sla.service';
import { SlaController } from './sla.controller';
import { VulnerabilitiesModule } from '../vulnerabilities/vulnerabilities.module';

@Module({
  imports: [VulnerabilitiesModule],
  controllers: [SlaController],
  providers: [SlaService],
  exports: [SlaService],
})
export class SlaModule {}
