import { Module } from '@nestjs/common';
import { DependencyFindingsService } from './dependency-findings.service';
import { DependencyFindingsController } from './dependency-findings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DependencyFindingsService],
  controllers: [DependencyFindingsController],
  exports: [DependencyFindingsService],
})
export class DependencyFindingsModule {}
