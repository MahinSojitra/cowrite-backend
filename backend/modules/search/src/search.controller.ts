import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { PrismaService } from '@backend/packages/database/src/prisma.service';

@Controller('v1/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('documents')
  async searchDocuments(@Query('workspaceId') workspaceId: string, @Query('q') q: string) {
    return this.prisma.document.findMany({
      where: {
        workspaceId,
        deletedAt: null,
        title: { contains: q, mode: 'insensitive' }
      },
      take: 25,
      orderBy: { updatedAt: 'desc' }
    });
  }
}
