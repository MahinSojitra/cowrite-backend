import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { AuditService } from '@backend/modules/audit/src/audit.service';
import { DocumentsRepository } from './documents.repository';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly auditService: AuditService
  ) {}

  async create(authorId: string, dto: CreateDocumentDto) {
    const doc = await this.documentsRepository.create({
      workspaceId: dto.workspaceId,
      title: dto.title,
      parentId: dto.parentId,
      createdById: authorId
    });

    await this.auditService.log({
      workspaceId: dto.workspaceId,
      actorId: authorId,
      action: 'DOCUMENT_CREATE',
      resourceType: 'document',
      resourceId: doc.id
    });

    return doc;
  }

  list(workspaceId: string) {
    return this.documentsRepository.listByWorkspace(workspaceId);
  }
}
