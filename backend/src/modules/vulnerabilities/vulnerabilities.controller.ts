import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { CreateVulnerabilityDto } from './dto/create-vulnerability.dto';
import { UpdateVulnerabilityDto } from './dto/update-vulnerability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('vulnerabilities')
@UseGuards(JwtAuthGuard)
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('applicationId') applicationId?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.vulnerabilitiesService.findAll({ status, applicationId, severity, type, from, to });
  }

  @Get('sla/summary')
  getSlaSummary() {
    return this.vulnerabilitiesService.getSlaSummary();
  }

  @Get('correlated')
  correlate() {
    return this.vulnerabilitiesService.correlateFindings();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vulnerabilitiesService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateVulnerabilityDto) {
    return this.vulnerabilitiesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateVulnerabilityDto) {
    return this.vulnerabilitiesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vulnerabilitiesService.remove(id);
  }
}
