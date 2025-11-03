import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponsibilitiesService } from './responsibilities.service';
import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('responsibles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin, UserRole.analyst)
export class ResponsibilitiesController {
  constructor(private readonly responsibilitiesService: ResponsibilitiesService) {}

  @Get()
  findAll() {
    return this.responsibilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responsibilitiesService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateResponsibleDto) {
    return this.responsibilitiesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateResponsibleDto) {
    return this.responsibilitiesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responsibilitiesService.remove(id);
  }

  @Get('/export/excel')
  async exportExcel(@Res() res: Response) {
    const workbook = await this.responsibilitiesService.exportToWorkbook();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="responsaveis.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  }
}
