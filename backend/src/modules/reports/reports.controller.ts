import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportCustomDto } from './dto/export-custom.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('templates')
  listTemplates() {
    return this.reportsService.listTemplates();
  }

  @Post('templates')
  createTemplate(@Body() body: CreateTemplateDto) {
    return this.reportsService.createTemplate(body);
  }

  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() body: UpdateTemplateDto) {
    return this.reportsService.updateTemplate(id, body);
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.reportsService.deleteTemplate(id);
  }

  @Post('generate')
  async generate(@Body() body: GenerateReportDto, @Res() res: Response) {
    const result = await this.reportsService.generateReport(body);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.data);
  }

  @Post('export')
  async exportCustom(@Body() body: ExportCustomDto, @Res() res: Response) {
    const result = await this.reportsService.exportCustom(body);
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    res.send(result.data);
  }
}
