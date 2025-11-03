import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Injectable()
export class DomainsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateDomainDto) {
    return this.prisma.domain.create({ data });
  }

  findAll() {
    return this.prisma.domain.findMany({
      include: {
        application: true,
        responsible: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.domain.findUnique({
      where: { id },
      include: {
        application: true,
        responsible: true,
      },
    });
  }

  update(id: string, data: UpdateDomainDto) {
    return this.prisma.domain.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.domain.delete({ where: { id } });
  }

  async exportCsv() {
    const domains = await this.findAll();
    const header = 'Nome,Tipo,Valor,Status,Ambiente,Aplicação,Responsável';
    const rows = domains.map((domain) =>
      [
        domain.name,
        domain.type,
        domain.value,
        domain.status,
        domain.environment ?? '',
        domain.application?.name ?? '',
        domain.responsible?.name ?? '',
      ]
        .map((value) => `"${(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );
    return [header, ...rows].join('\n');
  }
}
