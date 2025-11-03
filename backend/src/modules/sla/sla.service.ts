import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VulnerabilitiesService } from '../vulnerabilities/vulnerabilities.service';
import { SLA_DEADLINES } from '../../common/utils/sla';
import { UpdateSlaConfigDto } from './dto/update-sla-config.dto';

const PROVIDER = 'sla-defaults';

@Injectable()
export class SlaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vulnerabilitiesService: VulnerabilitiesService,
  ) {}

  async getConfig() {
    const config = await this.prisma.integrationConfig.findFirst({ where: { provider: PROVIDER } });
    const settings = (config?.settings ?? SLA_DEADLINES) as Record<string, number>;
    return {
      critical: Number(settings.critical ?? SLA_DEADLINES.critical),
      high: Number(settings.high ?? SLA_DEADLINES.high),
      medium: Number(settings.medium ?? SLA_DEADLINES.medium),
      low: Number(settings.low ?? SLA_DEADLINES.low),
    };
  }

  async updateConfig(input: UpdateSlaConfigDto) {
    const current = await this.getConfig();
    const settings = { ...current, ...input };
    const existing = await this.prisma.integrationConfig.findFirst({ where: { provider: PROVIDER } });
    if (existing) {
      await this.prisma.integrationConfig.update({ where: { id: existing.id }, data: { settings } });
    } else {
      await this.prisma.integrationConfig.create({ data: { provider: PROVIDER, settings } });
    }
    return settings;
  }

  async dashboard() {
    const summary = await this.vulnerabilitiesService.getSlaSummary();
    const config = await this.getConfig();
    return {
      config,
      summary,
    };
  }
}
