import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parse as parseCsv } from 'csv-parse/sync';
import { VulnerabilitiesService } from '../vulnerabilities/vulnerabilities.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
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
    private readonly emailService: EmailService,
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

  async importDast(buffer: Buffer, tool: string, actorId?: string, filename?: string) {
    const text = buffer.toString('utf-8');
    let findings: GenericFinding[] = [];

    try {
      const json = JSON.parse(text);

      // Support for ZAP format
      if (json.site && Array.isArray(json.site)) {
        findings = this.parseZap(json);
      }
      // Support for Burp format
      else if (json.issues && Array.isArray(json.issues)) {
        findings = this.parseBurp(json);
      }
      // Support for OWASP ZAP JSON format
      else if (json['@programName'] === 'ZAP') {
        findings = this.parseZapAlternative(json);
      }
      // Generic format
      else if (Array.isArray(json)) {
        findings = json.map((item: any) => this.mapGenericFinding(item));
      } else if (json.findings && Array.isArray(json.findings)) {
        findings = json.findings.map((item: any) => this.mapGenericFinding(item));
      }
    } catch (error) {
      // Try CSV format
      try {
        const records = parseCsv(text, { columns: true });
        findings = records.map((record: any) => ({
          title: record.name || record.title || record.alert || 'DAST Finding',
          severity: this.normalizeSeverity(record.severity || record.risk || 'medium'),
          description: record.description || record.detail,
          cwe: record.cwe || record.cweid,
          owasp: record.owasp,
          evidence: record.evidence || record.uri,
        }));
      } catch (csvError) {
        throw new BadRequestException('Não foi possível interpretar o arquivo DAST (JSON ou CSV)');
      }
    }

    return this.ingestFindings(tool || 'DAST', findings, actorId, filename);
  }

  private parseZap(json: any): GenericFinding[] {
    const findings: GenericFinding[] = [];
    for (const site of json.site) {
      if (site.alerts && Array.isArray(site.alerts)) {
        for (const alert of site.alerts) {
          findings.push({
            title: alert.alert || alert.name,
            severity: this.normalizeSeverity(alert.riskdesc?.split(' ')[0] || alert.risk || 'medium'),
            description: alert.desc || alert.description,
            cwe: alert.cweid?.toString(),
            owasp: alert.reference,
            evidence: alert.uri || alert.url,
          });
        }
      }
    }
    return findings;
  }

  private parseBurp(json: any): GenericFinding[] {
    return json.issues.map((issue: any) => ({
      title: issue.name || issue.issue_type,
      severity: this.normalizeSeverity(issue.severity || 'medium'),
      description: issue.issue_detail || issue.issue_background,
      cwe: issue.vulnerability_classifications?.cwe_id,
      owasp: issue.vulnerability_classifications?.owasp,
      evidence: issue.path || issue.url,
    }));
  }

  private parseZapAlternative(json: any): GenericFinding[] {
    const findings: GenericFinding[] = [];
    if (json.site && Array.isArray(json.site)) {
      for (const site of json.site) {
        if (site.alerts) {
          for (const alert of site.alerts) {
            for (const instance of alert.instances || []) {
              findings.push({
                title: alert.name,
                severity: this.normalizeSeverity(alert.riskdesc?.split(' ')[0] || 'medium'),
                description: alert.desc,
                cwe: alert.cweid?.toString(),
                owasp: alert.reference,
                evidence: instance.uri,
              });
            }
          }
        }
      }
    }
    return findings;
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
    // Send Telegram alert
    try {
      const telegramConfig = await this.prisma.integrationConfig.findFirst({ where: { provider: 'telegram' } });
      if (telegramConfig) {
        const settings = (telegramConfig.settings ?? {}) as { botToken?: string; chatId?: string; enabled?: boolean };
        if (settings.enabled && settings.botToken && settings.chatId) {
          await axios.post(`https://api.telegram.org/bot${settings.botToken}/sendMessage`, {
            chat_id: settings.chatId,
            text: message,
            parse_mode: 'HTML',
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Falha ao enviar alerta para o Telegram: ${error.message}`);
    }

    // Send Email alert
    try {
      const emailConfig = await this.prisma.integrationConfig.findFirst({ where: { provider: 'email' } });
      if (emailConfig && this.emailService.isConfigured()) {
        const settings = (emailConfig.settings ?? {}) as { recipients?: string[]; enabled?: boolean };
        if (settings.enabled && settings.recipients && settings.recipients.length > 0) {
          await this.emailService.sendAlertEmail(message, settings.recipients);
        }
      }
    } catch (error) {
      this.logger.warn(`Falha ao enviar alerta por email: ${error.message}`);
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
