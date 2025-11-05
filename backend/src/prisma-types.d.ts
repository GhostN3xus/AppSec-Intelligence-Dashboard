declare module '@prisma/client' {
  export enum UserRole {
    admin = 'admin',
    analyst = 'analyst',
    owner = 'owner',
    auditor = 'auditor'
  }

  export enum UserStatus {
    active = 'active',
    suspended = 'suspended'
  }

  export enum FindingType {
    sast = 'sast',
    sca = 'sca',
    manual = 'manual'
  }

  export enum DomainType {
    domain = 'domain',
    subdomain = 'subdomain',
    ip = 'ip',
    api = 'api'
  }

  export enum DomainStatus {
    active = 'active',
    monitoring = 'monitoring',
    deprecated = 'deprecated'
  }

  export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    status: UserStatus;
    language?: string | null;
    title?: string | null;
    lastLogin?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Application {
    id: string;
    name: string;
    description?: string | null;
    stack?: string | null;
    repository?: string | null;
    status: string;
    ownerId?: string | null;
    responsibleId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    vulnerabilities?: any[];
  }

  export interface Vulnerability {
    id: string;
    title: string;
    severity: string;
    description?: string | null;
    status: string;
    detectedAt: Date;
    dueDate: Date;
    tool?: string | null;
    type?: string | null;
    cwe?: string | null;
    owasp?: string | null;
    owaspApi?: string | null;
    cvss?: number | null;
    applicationId?: string | null;
    responsibleId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Finding {
    id: string;
    source: string;
    rawData: any;
    falsePositive: boolean;
    type: FindingType;
    filePath?: string | null;
    lineNumber?: number | null;
    ruleId?: string | null;
    message?: string | null;
    context?: string | null;
    vulnerabilityId?: string | null;
    createdAt: Date;
  }

  export interface DependencyFinding {
    id: string;
    package: string;
    version?: string | null;
    ecosystem?: string | null;
    severity?: string | null;
    advisoryId?: string | null;
    dependencyFile?: string | null;
    tool?: string | null;
    applicationId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    rawData?: any;
  }

  export interface Responsible {
    id: string;
    name: string;
    email: string;
    title?: string | null;
    department?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Domain {
    id: string;
    name: string;
    type: DomainType;
    value: string;
    status: DomainStatus;
    environment?: string | null;
    notes?: string | null;
    applicationId?: string | null;
    responsibleId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Report {
    id: string;
    name: string;
    format: string;
    payload: any;
    vulnerabilityId?: string | null;
    templateId?: string | null;
    createdAt: Date;
  }

  export interface ReportTemplate {
    id: string;
    name: string;
    category: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface KnowledgeDocument {
    id: string;
    title: string;
    slug: string;
    category: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface IntegrationConfig {
    id: string;
    provider: string;
    settings: any;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface AuditLog {
    id: string;
    actorId?: string | null;
    action: string;
    entity: string;
    meta?: any;
    createdAt: Date;
  }

  export interface LoginLog {
    id: string;
    userId?: string | null;
    email: string;
    success: boolean;
    ip?: string | null;
    userAgent?: string | null;
    createdAt: Date;
  }

  export interface ImportLog {
    id: string;
    tool: string;
    filename?: string | null;
    findings: number;
    actorId?: string | null;
    createdAt: Date;
  }

  export interface PasswordResetToken {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    usedAt?: Date | null;
    createdAt: Date;
  }

  export class PrismaClient {
    user: any;
    application: any;
    vulnerability: any;
    finding: any;
    dependencyFinding: any;
    responsible: any;
    domain: any;
    report: any;
    reportTemplate: any;
    knowledgeDocument: any;
    integrationConfig: any;
    auditLog: any;
    loginLog: any;
    importLog: any;
    passwordResetToken: any;

    constructor();
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $on(event: string, callback: Function): void;
    $executeRaw(...args: any[]): Promise<any>;
    $queryRaw(...args: any[]): Promise<any>;
    $transaction<T = any>(callback: any): Promise<T>;
  }

  export namespace Prisma {
    export type UserCreateInput = any;
    export type ApplicationCreateInput = any;
    export type VulnerabilityCreateInput = any;
    export type FindingCreateInput = any;
  }
}
