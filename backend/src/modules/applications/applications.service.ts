import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateApplicationDto) {
    return this.prisma.application.create({ data });
  }

  findAll() {
    return this.prisma.application.findMany({
      include: {
        responsible: true,
        vulnerabilities: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        responsible: true,
        vulnerabilities: true,
      },
    });
  }

  update(id: string, data: UpdateApplicationDto) {
    return this.prisma.application.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.application.delete({ where: { id } });
  }

  async getTopCritical(limit = 10) {
    const apps = await this.prisma.application.findMany({
      include: {
        vulnerabilities: true,
        responsible: true,
      },
    });
    const ranked = apps
      .map((app) => ({
        ...app,
        criticalCount: app.vulnerabilities.filter((v) => v.severity === 'critical' || v.severity === 'high').length,
      }))
      .sort((a, b) => b.criticalCount - a.criticalCount)
      .slice(0, limit);
    return ranked;
  }
}
