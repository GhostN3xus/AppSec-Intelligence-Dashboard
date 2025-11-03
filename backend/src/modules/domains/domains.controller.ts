import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { DomainsService } from './domains.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('domains')
@UseGuards(JwtAuthGuard)
export class DomainsController {
  constructor(private readonly domainsService: DomainsService) {}

  @Get()
  findAll() {
    return this.domainsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.domainsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateDomainDto) {
    return this.domainsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDomainDto) {
    return this.domainsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domainsService.remove(id);
  }

  @Get('/export/csv/all')
  async exportCsv(@Res() res: Response) {
    const csv = await this.domainsService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="domains.csv"');
    res.send(csv);
  }
}
