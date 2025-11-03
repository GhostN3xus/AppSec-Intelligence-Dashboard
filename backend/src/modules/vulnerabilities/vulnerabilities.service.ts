import { Injectable } from '@nestjs/common';
import { FindingType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVulnerabilityDto } from './dto/create-vulnerability.dto';
import { UpdateVulnerabilityDto } from './dto/update-vulnerability.dto';
import { calculateDueDate, getSlaStatus } from '../../common/utils/sla';

@Injectable()
export class VulnerabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateVulnerabilityDto) {
    const detectedAt = data.detectedAt ? new Date(data.detectedAt) : new Date();
    const dueDate = calculateDueDate(data.severity, detectedAt);
    return this.prisma.vulnerability.create({
      data: {
        ...data,
        detectedAt,
        dueDate,
      },
    });
  }

  findAll(
    params: { status?: string; applicationId?: string; severity?: string; type?: string; from?: string; to?: string } = {},
  ) {
    const { status, applicationId, severity, type, from, to } = params;
    return this.prisma.vulnerability.findMany({
      where: {
        status,
        applicationId,
        severity,
        type,
        detectedAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        application: true,
        responsible: true,
        findings: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.vulnerability.findUnique({
      where: { id },
      include: {
        application: true,
        responsible: true,
        findings: true,
      },
    });
  }

  update(id: string, data: UpdateVulnerabilityDto) {
    return this.prisma.vulnerability.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.vulnerability.delete({ where: { id } });
  }

  async getSlaSummary() {
    const vulns = await this.prisma.vulnerability.findMany();
    const summary = {
      overdue: 0,
      atRisk: 0,
      onTrack: 0,
    };
    vulns.forEach((vuln) => {
      const status = getSlaStatus(vuln.dueDate);
      if (status === 'overdue') summary.overdue += 1;
      if (status === 'at-risk') summary.atRisk += 1;
      if (status === 'on-track') summary.onTrack += 1;
    });
    return summary;
  }

  async correlateFindings() {
    const vulns = await this.prisma.vulnerability.findMany({ include: { findings: true } });
    return vulns.map((vuln) => ({
      ...vuln,
      correlatedSources: Array.from(new Set(vuln.findings.map((f) => f.source))).join(', '),
    }));
  }

  async recordFinding(
    vulnerabilityId: string,
    data: {
      source: string;
      rawData: any;
      type?: FindingType;
      filePath?: string;
      lineNumber?: number;
      ruleId?: string;
      message?: string;
      context?: string;
    },
  ) {
    const finding = await this.prisma.finding.create({
      data: {
        vulnerabilityId,
        source: data.source,
        rawData: data.rawData,
        type: data.type ?? FindingType.sast,
        filePath: data.filePath,
        lineNumber: data.lineNumber,
        ruleId: data.ruleId,
        message: data.message,
        context: data.context,
      },
    });
    return finding;
  }
}
