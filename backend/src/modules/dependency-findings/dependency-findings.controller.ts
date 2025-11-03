import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DependencyFindingsService } from './dependency-findings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('sca/dependencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DependencyFindingsController {
  constructor(private readonly dependencyFindingsService: DependencyFindingsService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.analyst, UserRole.auditor)
  findAll(
    @Query('ecosystem') ecosystem?: string,
    @Query('severity') severity?: string,
    @Query('applicationId') applicationId?: string,
  ) {
    return this.dependencyFindingsService.findAll({ ecosystem, severity, applicationId });
  }

  @Get('top')
  @Roles(UserRole.admin, UserRole.analyst, UserRole.auditor)
  top(@Query('limit') limit?: string) {
    return this.dependencyFindingsService.getTopDependencies(limit ? Number(limit) : 5);
  }

  @Get('metrics/ecosystem')
  @Roles(UserRole.admin, UserRole.analyst, UserRole.auditor)
  metrics() {
    return this.dependencyFindingsService.getEcosystemMetrics();
  }
}
