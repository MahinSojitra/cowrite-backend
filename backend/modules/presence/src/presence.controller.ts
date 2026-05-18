import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { RedisService } from '@backend/packages/redis/src/redis.service';

@Controller('v1/presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private readonly redis: RedisService) {}

  @Get(':workspaceId/:documentId')
  async list(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string) {
    const keys = await this.redis.client.keys(`presence:${workspaceId}:${documentId}:*`);
    if (!keys.length) return [];
    const values = await this.redis.client.mget(keys);
    return values.flatMap((value) => (value ? [JSON.parse(value)] : []));
  }
}
