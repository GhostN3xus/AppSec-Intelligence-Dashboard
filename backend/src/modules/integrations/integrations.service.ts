import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parse as parseCsv } from 'csv-parse/sync';
import { VulnerabilitiesService } from '../vulnerabilities/vulnerabilities.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FindingType } from '@prisma/client';
import axios from 'axios';

interface GenericFinding {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  cwe?: string;
  owasp?: string;
  cvss?: number;
  evidence?: string;
}

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly vulnerabilitiesService: VulnerabilitiesService,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async importSemgrep(buffer: Buffer, actorId?: string, filename?: string) {
    const text = buffer.toString('utf-8');
    let findings: GenericFinding[] = [];
    if (text.trim().startsWith('{')) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json.results)) {
          findings = json.results.map((result: any) => ({
            title: result.check_id,
            severity: this.normalizeSeverity(result.extra?.severity ?? 'medium'),
            description: result.extra?.message,
            cwe: result.extra?.metadata?.cwe,
            owasp: result.extra?.metadata?.owasp,
            evidence: result.path?.text,
          }));
        }
      } catch (error) {
        throw new BadRequestException('Não foi possível interpretar o JSON do Semgrep');
      }
    } else {
      const records = parseCsv(text, { columns: true });
      findings = records.map((record: any) => ({
        title: record.check_id || record.rule_id || record.title,
        severity: this.normalizeSeverity(record.severity ?? 'medium'),
        description: record.message ?? record.details,
        cwe: record.cwe,
        owasp: record.owasp,
      }));
    }
    return this.ingestFindings('Semgrep', findings, actorId, filename);
  }

  async importTool(tool: string, data: any, actorId?: string, filename?: string) {
    if (!tool) {
      throw new BadRequestException('Provider da ferramenta é obrigatório');
    }
    let findings: GenericFinding[] = [];
    let payload = data;
    if (typeof data === 'string') {
      try {
        payload = JSON.parse(data);
      } catch (error) {
        throw new BadRequestException('Payload inválido, envie JSON válido');
      }
    }
    if (Array.isArray(payload)) {
      findings = payload.map((item) => this.mapGenericFinding(item));
    } else if (payload && Array.isArray((payload as any).findings)) {
      findings = (payload as any).findings.map((item: any) => this.mapGenericFinding(item));
    }
    return this.ingestFindings(tool, findings, actorId, filename);
  }

  private async ingestFindings(tool: string, findings: GenericFinding[], actorId?: string, filename?: string) {
    const created = [];
    for (const finding of findings) {
      const vulnerability = await this.vulnerabilitiesService.create({
        title: finding.title,
        severity: finding.severity,
        description: finding.description,
        cwe: finding.cwe,
        owasp: finding.owasp,
        cvss: finding.cvss,
        tool,
      } as any);
      await this.vulnerabilitiesService.recordFinding(vulnerability.id, {
        source: tool,
        rawData: finding,
        type: FindingType.manual,
        message: finding.description,
      });
      created.push(vulnerability);
    }
    await this.auditService.log('import', tool, actorId, { count: created.length });
    await this.prisma.importLog.create({
      data: {
        tool,
        findings: created.length,
        filename,
        actorId,
      },
    });
    await this.sendAlert(`${tool} importou ${created.length} findings.`);
    return { tool, created: created.length };
  }

  history(limit = 50) {
    return this.prisma.importLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: true },
    });
  }

  async saveIntegrationConfig(provider: string, settings: Record<string, any>) {
    const existing = await this.prisma.integrationConfig.findFirst({ where: { provider } });
    if (existing) {
      return this.prisma.integrationConfig.update({ where: { id: existing.id }, data: { settings } });
    }
    return this.prisma.integrationConfig.create({ data: { provider, settings } });
  }

  async getIntegrationStatuses() {
    const configs = await this.prisma.integrationConfig.findMany();
    return configs.map((config) => ({
      provider: config.provider,
      enabled: Boolean((config.settings as any)?.enabled),
      details: config.settings,
      updatedAt: config.updatedAt,
    }));
  }

  async sendAlert(message: string) {
    try {
      const telegramConfig = await this.prisma.integrationConfig.findFirst({ where: { provider: 'telegram' } });
      if (!telegramConfig) {
        return;
      }
      const settings = (telegramConfig.settings ?? {}) as { botToken?: string; chatId?: string; enabled?: boolean };
      if (!settings.enabled || !settings.botToken || !settings.chatId) {
        return;
      }
      await axios.post(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
        chat_id: settings.chatId,
        text: message,
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.warn(`Falha ao enviar alerta para o Telegram: ${error.message}`);
    }
  }

  private normalizeSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    const normalized = severity.toLowerCase();
    if (['critical', 'blocker'].includes(normalized)) return 'critical';
    if (['high', 'major'].includes(normalized)) return 'high';
    if (['medium', 'moderate'].includes(normalized)) return 'medium';
    return 'low';
  }

  private mapGenericFinding(item: any): GenericFinding {
    return {
      title: item.title ?? item.name ?? 'Finding',
      severity: this.normalizeSeverity(item.severity ?? 'medium'),
      description: item.description ?? item.detail,
      cwe: item.cwe ?? item.cweId,
      owasp: item.owasp,
      cvss: item.cvss?.baseScore ?? item.cvss,
      evidence: item.evidence ?? item.proof,
    };
  }
}
