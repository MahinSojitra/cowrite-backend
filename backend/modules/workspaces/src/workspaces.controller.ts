import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';

@Controller('v1/workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(req.user.sub, dto);
  }
}
