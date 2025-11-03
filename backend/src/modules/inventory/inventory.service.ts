import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [applications, responsibles, domains, vulnerabilities] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.responsible.count(),
      this.prisma.domain.count(),
      this.prisma.vulnerability.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
    ]);

    const severityMap: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    vulnerabilities.forEach((item) => {
      severityMap[item.severity] = item._count.severity;
    });

    const openSla = await this.prisma.vulnerability.count({ where: { status: 'open' } });
    const closed = await this.prisma.vulnerability.count({ where: { status: 'closed' } });

    return {
      applications,
      responsibles,
      domains,
      vulnerabilities: severityMap,
      totals: {
        open: openSla,
        closed,
      },
    };
  }
}
