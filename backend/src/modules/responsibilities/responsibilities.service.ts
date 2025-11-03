import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';
import ExcelJS from 'exceljs';

@Injectable()
export class ResponsibilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateResponsibleDto) {
    return this.prisma.responsible.create({ data });
  }

  findAll() {
    return this.prisma.responsible.findMany({
      include: {
        applications: true,
        vulnerabilities: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.responsible.findUnique({
      where: { id },
      include: {
        applications: true,
        vulnerabilities: true,
      },
    });
  }

  update(id: string, data: UpdateResponsibleDto) {
    return this.prisma.responsible.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.responsible.delete({ where: { id } });
  }

  async exportToWorkbook() {
    const responsibles = await this.prisma.responsible.findMany({
      include: {
        applications: true,
        vulnerabilities: true,
      },
    });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Responsaveis');
    worksheet.columns = [
      { header: 'Aplicação', key: 'application', width: 30 },
      { header: 'Responsável', key: 'responsavel', width: 25 },
      { header: 'Severidade', key: 'severidade', width: 15 },
      { header: 'SLA', key: 'sla', width: 12 },
    ];

    responsibles.forEach((responsible) => {
      if (!responsible.vulnerabilities.length) {
        worksheet.addRow({
          application: '-',
          responsavel: responsible.name,
          severidade: '-',
          sla: '-',
        });
        return;
      }
      responsible.vulnerabilities.forEach((vuln) => {
        worksheet.addRow({
          application: vuln.applicationId ?? 'N/A',
          responsavel: responsible.name,
          severidade: vuln.severity,
          sla: vuln.dueDate?.toISOString().substring(0, 10),
        });
      });
    });

    return workbook;
  }
}
