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

  async bulkUpdate(ids: string[], data: Partial<UpdateVulnerabilityDto>) {
    const updated = await this.prisma.vulnerability.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return {
      count: updated.count,
      message: `${updated.count} vulnerabilidades atualizadas com sucesso`,
    };
  }

  async bulkDelete(ids: string[]) {
    // Delete related findings first
    await this.prisma.finding.deleteMany({
      where: { vulnerabilityId: { in: ids } },
    });

    // Delete vulnerabilities
    const deleted = await this.prisma.vulnerability.deleteMany({
      where: { id: { in: ids } },
    });
    return {
      count: deleted.count,
      message: `${deleted.count} vulnerabilidades removidas com sucesso`,
    };
  }

  async bulkAssign(ids: string[], responsibleId: string) {
    const updated = await this.prisma.vulnerability.updateMany({
      where: { id: { in: ids } },
      data: { responsibleId },
    });
    return {
      count: updated.count,
      message: `${updated.count} vulnerabilidades atribuídas com sucesso`,
    };
  }

  async bulkChangeStatus(ids: string[], status: string) {
    const updated = await this.prisma.vulnerability.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return {
      count: updated.count,
      message: `Status de ${updated.count} vulnerabilidades alterado com sucesso`,
    };
  }
}
