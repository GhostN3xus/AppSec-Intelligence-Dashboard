import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SlaService } from './sla.service';
import { UpdateSlaConfigDto } from './dto/update-sla-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sla')
@UseGuards(JwtAuthGuard)
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get('config')
  getConfig() {
    return this.slaService.getConfig();
  }

  @Patch('config')
  updateConfig(@Body() body: UpdateSlaConfigDto) {
    return this.slaService.updateConfig(body);
  }

  @Get('dashboard')
  dashboard() {
    return this.slaService.dashboard();
  }
}
