import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';

@Controller('v1/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(req.user.sub, dto);
  }

  @Get()
  list(@Query('workspaceId') workspaceId: string) {
    return this.documentsService.list(workspaceId);
  }
}
