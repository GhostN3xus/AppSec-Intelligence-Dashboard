import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(action: string, entity: string, actorId?: string, meta?: Record<string, any>) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entity,
        actorId,
        meta,
      },
    });
  }

  findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    });
  }

  loginAttempts(limit = 200) {
    return this.prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: true },
    });
  }
}
