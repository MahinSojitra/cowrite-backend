import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '@backend/packages/database/src/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    workspaceId?: string;
    actorId?: string;
    action: AuditAction;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        actorId: params.actorId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        payload: params.payload as any
      }
    });
  }
}
