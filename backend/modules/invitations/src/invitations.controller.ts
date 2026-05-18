import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { RbacGuard } from '@backend/apps/api/src/common/guards/rbac.guard';
import { Roles } from '@backend/apps/api/src/common/decorators/roles.decorator';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('v1/invitations')
@UseGuards(JwtAuthGuard, RbacGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@Req() req: { user: { sub: string } }, @Body() dto: CreateInvitationDto) {
    return this.invitationsService.create(req.user.sub, dto);
  }
}
