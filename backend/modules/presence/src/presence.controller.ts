import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@backend/apps/api/src/common/guards/jwt-auth.guard';
import { RedisService } from '@backend/packages/redis/src/redis.service';

@Controller('v1/presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private readonly redis: RedisService) {}

  @Get(':workspaceId/:documentId')
  async list(@Param('workspaceId') workspaceId: string, @Param('documentId') documentId: string) {
    const match = `presence:${workspaceId}:${documentId}:*`;
    let cursor = '0';
    const keys: string[] = [];
    do {
      const [nextCursor, batch] = await this.redis.client.scan(cursor, 'MATCH', match, 'COUNT', '100');
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== '0');

    if (!keys.length) return [];
    const values = await this.redis.client.mget(keys);
    return values.flatMap((value) => (value ? [JSON.parse(value)] : []));
  }
}
