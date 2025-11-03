import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type DependencyFindingInput = {
  package: string;
  version?: string;
  ecosystem?: string;
  severity?: string;
  advisoryId?: string;
  dependencyFile?: string;
  tool?: string;
  applicationId?: string | null;
  rawData?: any;
};

@Injectable()
export class DependencyFindingsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(entries: DependencyFindingInput[]) {
    if (!entries.length) {
      return { created: 0 };
    }

    const data = entries.map((entry) => ({
      package: entry.package,
      version: entry.version,
      ecosystem: entry.ecosystem,
      severity: entry.severity,
      advisoryId: entry.advisoryId,
      dependencyFile: entry.dependencyFile,
      tool: entry.tool,
      applicationId: entry.applicationId ?? null,
      rawData: entry.rawData,
    }));

    const { count } = await this.prisma.dependencyFinding.createMany({ data });
    return { created: count };
  }

  findAll(filters: { ecosystem?: string; severity?: string; applicationId?: string } = {}) {
    const { ecosystem, severity, applicationId } = filters;
    return this.prisma.dependencyFinding.findMany({
      where: {
        ecosystem: ecosystem || undefined,
        severity: severity || undefined,
        applicationId: applicationId || undefined,
      },
      include: {
        application: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTopDependencies(limit = 5) {
    const grouped = await this.prisma.dependencyFinding.groupBy({
      by: ['package', 'version'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: limit,
    });

    return Promise.all(
      grouped.map(async (group) => {
        const sample = await this.prisma.dependencyFinding.findFirst({
          where: { package: group.package, version: group.version },
          select: { ecosystem: true, severity: true },
        });
        return {
          package: group.package,
          version: group.version,
          count: group._count._all,
          ecosystem: sample?.ecosystem,
          severity: sample?.severity,
        };
      }),
    );
  }

  async getEcosystemMetrics() {
    const grouped = await this.prisma.dependencyFinding.groupBy({
      by: ['ecosystem'],
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
    });

    return grouped.map((item) => ({
      ecosystem: item.ecosystem ?? 'desconhecido',
      total: item._count._all,
    }));
  }
}
