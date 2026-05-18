import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@backend/packages/database/src/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(documentId: string, authorId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        documentId,
        authorId,
        body: dto.body,
        parentId: dto.parentId,
        anchor: (dto.anchor ?? Prisma.JsonNull) as Prisma.InputJsonValue
      }
    });
  }

  list(documentId: string) {
    return this.prisma.comment.findMany({ where: { documentId, deletedAt: null }, orderBy: { createdAt: 'asc' } });
  }
}
