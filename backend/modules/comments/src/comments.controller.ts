import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('v1/documents/:id/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  list(@Param('id') documentId: string) {
    return this.commentsService.list(documentId);
  }

  @Post()
  create(
    @Param('id') documentId: string,
    @Req() req: { user: { sub: string } },
    @Body() dto: CreateCommentDto
  ) {
    return this.commentsService.create(documentId, req.user.sub, dto);
  }
}
