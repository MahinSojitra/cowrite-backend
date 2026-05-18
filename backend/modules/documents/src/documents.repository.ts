import { Injectable } from '@nestjs/common';
import { PrismaService } from '@backend/packages/database/src/prisma.service';
import { BaseRepository } from '@backend/packages/database/src/base.repository';

@Injectable()
export class DocumentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: { workspaceId: string; title: string; parentId?: string; createdById: string }) {
    return this.prisma.document.create({ data });
  }

  listByWorkspace(workspaceId: string) {
    return this.prisma.document.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { updatedAt: 'desc' }
    });
  }

  softDeleteById(id: string) {
    return this.softDelete(this.prisma.document, id);
  }
}
