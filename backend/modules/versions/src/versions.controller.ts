import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { PrismaService } from '@backend/packages/database/src/prisma.service';

@Controller('v1/documents/:id/versions')
@UseGuards(JwtAuthGuard)
export class VersionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Param('id') documentId: string, @Query('cursor') cursor?: string) {
    return this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      take: 20,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });
  }
}
