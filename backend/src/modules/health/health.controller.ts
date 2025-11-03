import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  ping() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  @Get('modules')
  @UseGuards(JwtAuthGuard)
  async modules() {
    return this.healthService.moduleStatuses();
  }
}
