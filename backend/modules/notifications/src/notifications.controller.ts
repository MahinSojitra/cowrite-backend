import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { PrismaService } from '@backend/packages/database/src/prisma.service';

@Controller('v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Req() req: { user: { sub: string } }) {
    return this.prisma.notification.findMany({
      where: { userId: req.user.sub, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
}
