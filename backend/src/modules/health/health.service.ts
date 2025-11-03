import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FindingType } from '@prisma/client';

type ModuleSummary = {
  id: string;
  label: string;
  status: 'operational' | 'pending';
  totalFindings: number;
  lastActivity: string | null;
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async moduleStatuses(): Promise<{ generatedAt: string; modules: ModuleSummary[] }> {
    const [
      sastCount,
      scaCount,
      reportCount,
      lastSast,
      lastSca,
      lastReport,
    ] = await this.prisma.$transaction([
      this.prisma.finding.count({ where: { type: FindingType.sast } }),
      this.prisma.dependencyFinding.count(),
      this.prisma.reportTemplate.count(),
      this.prisma.finding.findFirst({
        where: { type: FindingType.sast },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.dependencyFinding.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.reportTemplate.findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      }),
    ]);

    const modules: ModuleSummary[] = [
      {
        id: 'sast',
        label: 'SAST',
        status: sastCount > 0 ? 'operational' : 'pending',
        totalFindings: sastCount,
        lastActivity: lastSast?.createdAt?.toISOString() ?? null,
      },
      {
        id: 'sca',
        label: 'SCA',
        status: scaCount > 0 ? 'operational' : 'pending',
        totalFindings: scaCount,
        lastActivity: lastSca?.createdAt?.toISOString() ?? null,
      },
      {
        id: 'reports',
        label: 'Reports',
        status: reportCount > 0 ? 'operational' : 'pending',
        totalFindings: reportCount,
        lastActivity: lastReport?.updatedAt?.toISOString() ?? null,
      },
    ];

    return {
      generatedAt: new Date().toISOString(),
      modules,
    };
  }
}
