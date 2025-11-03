import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { parse as parseCsv } from 'csv-parse/sync';
import { PrismaService } from '../../prisma/prisma.service';
import { VulnerabilitiesService } from '../vulnerabilities/vulnerabilities.service';
import { AuditService } from '../audit/audit.service';
import { FindingType } from '@prisma/client';
import { IntegrationsService } from '../integrations/integrations.service';
import { DependencyFindingsService, DependencyFindingInput } from '../dependency-findings/dependency-findings.service';

interface SemgrepCsvRow {
  [key: string]: any;
}

interface ScaCsvRow {
  [key: string]: any;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vulnerabilitiesService: VulnerabilitiesService,
    private readonly auditService: AuditService,
    private readonly integrationsService: IntegrationsService,
    private readonly dependencyFindingsService: DependencyFindingsService,
  ) {}

  async importSast(buffer: Buffer, actorId?: string, filename?: string) {
    const text = buffer.toString('utf-8');
    try {
      const rows = parseCsv(text, { columns: true, skip_empty_lines: true }) as SemgrepCsvRow[];

      const applications = await this.prisma.application.findMany({
        select: { id: true, name: true, repository: true },
      });

      let created = 0;

      for (const row of rows) {
        const title = this.extractSastTitle(row);
        const severity = this.normalizeSeverity(
          this.getValue(row, ['severity', 'extra.severity', 'extra_severity'], 'medium'),
        );
        const filePath = this.getValue(row, ['path', 'file', 'target', 'filename']);
        const ruleId = this.getValue(row, ['check_id', 'rule_id', 'rule', 'id'], title);
        const message = this.getValue(row, ['message', 'extra.message', 'details', 'extra_message'], title);
        const context = this.getValue(row, ['lines', 'code', 'source']);
        const lineNumber = this.parseLineNumber(
          this.getValue(row, ['start', 'start_line', 'line', 'line_number']),
        );
        const applicationId = this.resolveApplicationId(
          applications,
          filePath,
          this.getValue(row, ['application', 'app', 'project']),
          this.getValue(row, ['repository', 'repo', 'url']),
        );

        const vulnerability = await this.vulnerabilitiesService.create({
          title,
          severity,
          description: `${message}\nArquivo: ${filePath ?? 'desconhecido'}`,
          tool: 'Semgrep',
          type: 'sast',
          applicationId: applicationId ?? undefined,
          cwe: this.getValue(row, ['cwe', 'extra.metadata.cwe']),
          owasp: this.getValue(row, ['owasp', 'extra.metadata.owasp']),
        } as any);

        await this.vulnerabilitiesService.recordFinding(vulnerability.id, {
          source: 'Semgrep',
          rawData: row,
          type: FindingType.sast,
          filePath: filePath,
          lineNumber: lineNumber ?? undefined,
          ruleId,
          message,
          context: context ?? undefined,
        });

        created += 1;
      }

      await this.auditService.log('import', 'semgrep-sast', actorId, { findings: created, filename });
      await this.prisma.importLog.create({
        data: {
          tool: 'Semgrep SAST',
          findings: created,
          filename,
          actorId,
        },
      });
      await this.integrationsService.sendAlert(
        `Semgrep SAST importou ${created} findings${filename ? ` (${filename})` : ''}.`,
      );

      return { created };
    } catch (error) {
      this.logger.error(`Falha ao interpretar CSV SAST: ${error}`);
      throw new BadRequestException('Não foi possível interpretar o CSV do Semgrep.');
    }
  }

  async importSca(buffer: Buffer, actorId?: string, filename?: string) {
    const text = buffer.toString('utf-8');
    try {
      const rows = parseCsv(text, { columns: true, skip_empty_lines: true }) as ScaCsvRow[];

      const applications = await this.prisma.application.findMany({
        select: { id: true, name: true, repository: true },
      });

      const entries: DependencyFindingInput[] = [];

      for (const row of rows) {
        const packageName = this.getValue(row, ['package', 'name', 'dependency', 'component']);
        if (!packageName) {
          continue;
        }
        const dependencyFile = this.getValue(row, ['file', 'dependency_file', 'manifest', 'source', 'path']);
        const applicationId = this.resolveApplicationId(
          applications,
          dependencyFile,
          this.getValue(row, ['application', 'app', 'project']),
          this.getValue(row, ['repository', 'repo', 'url']),
        );
        entries.push({
          package: packageName,
          version: this.getValue(row, ['version', 'detected_version', 'current_version']),
          ecosystem: this.getValue(row, ['ecosystem', 'package_manager', 'language']),
          severity: this.normalizeSeverity(this.getValue(row, ['severity'], 'medium')),
          advisoryId: this.getValue(row, ['advisory_id', 'cve', 'vulnerability_id', 'advisory']),
          dependencyFile,
          tool: this.getValue(row, ['tool'], 'Semgrep SCA'),
          applicationId: applicationId ?? null,
          rawData: row,
        });
      }

      const result = await this.dependencyFindingsService.createMany(entries);

      await this.auditService.log('import', 'semgrep-sca', actorId, { findings: result.created, filename });
      await this.prisma.importLog.create({
        data: {
          tool: 'Semgrep SCA',
          findings: result.created,
          filename,
          actorId,
        },
      });
      await this.integrationsService.sendAlert(
        `Semgrep SCA importou ${result.created} dependências vulneráveis${filename ? ` (${filename})` : ''}.`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Falha ao interpretar CSV SCA: ${error}`);
      throw new BadRequestException('Não foi possível interpretar o CSV de SCA.');
    }
  }

  private extractSastTitle(row: SemgrepCsvRow) {
    return row.title || row.check_id || row.rule_id || row.id || 'Semgrep Finding';
  }

  private parseLineNumber(...values: Array<string | number | undefined>) {
    for (const value of values) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }

  private resolveApplicationId(
    applications: Array<{ id: string; name: string; repository: string | null }>,
    filePath?: string,
    declaredApplication?: string,
    declaredRepository?: string,
  ) {
    if (!applications.length) {
      return undefined;
    }

    if (declaredApplication) {
      const matchByName = applications.find(
        (app) => app.name?.toLowerCase() === String(declaredApplication).toLowerCase(),
      );
      if (matchByName) {
        return matchByName.id;
      }
    }

    if (declaredRepository) {
      const repositorySlug = this.extractRepositorySlug(declaredRepository);
      if (repositorySlug) {
        const matchByRepo = applications.find((app) => {
          const appSlug = this.extractRepositorySlug(app.repository);
          return appSlug ? repositorySlug.includes(appSlug) || appSlug.includes(repositorySlug) : false;
        });
        if (matchByRepo) {
          return matchByRepo.id;
        }
      }
    }

    if (filePath) {
      const normalized = String(filePath).toLowerCase();
      const matchByFile = applications.find((app) => {
        if (!app) return false;
        const nameMatch = normalized.includes(app.name.toLowerCase());
        const repoSlug = this.extractRepositorySlug(app.repository);
        const repoMatch = repoSlug ? normalized.includes(repoSlug) : false;
        return nameMatch || repoMatch;
      });
      if (matchByFile) {
        return matchByFile.id;
      }
    }

    return undefined;
  }

  private extractRepositorySlug(repository?: string | null) {
    if (!repository) {
      return undefined;
    }
    const parts = repository.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1].replace(/\.git$/, '').toLowerCase() : repository.toLowerCase();
  }

  private normalizeSeverity(severity: string) {
    const normalized = severity?.toString().toLowerCase();
    if (['critical', 'blocker'].includes(normalized)) return 'critical';
    if (['high', 'major'].includes(normalized)) return 'high';
    if (['medium', 'moderate'].includes(normalized)) return 'medium';
    return 'low';
  }

  private getValue(row: Record<string, any>, keys: string[], fallback?: any) {
    for (const key of keys) {
      if (key === undefined || key === null) {
        continue;
      }
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return row[key];
      }
      const underscored = key.replace(/\./g, '_');
      if (row[underscored] !== undefined && row[underscored] !== null && row[underscored] !== '') {
        return row[underscored];
      }
      const nested = key.split('.').reduce<any>((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
          return acc[part];
        }
        return undefined;
      }, row);
      if (nested !== undefined && nested !== null && nested !== '') {
        return nested;
      }
    }
    return fallback;
  }
}
