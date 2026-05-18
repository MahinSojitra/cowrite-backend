import { Injectable } from '@nestjs/common';
import { RedisService } from '@backend/packages/redis/src/redis.service';

@Injectable()
export class PresenceManager {
  constructor(private readonly redis: RedisService) {}

  async heartbeat(key: string, payload: Record<string, unknown>, ttlSeconds = 30): Promise<void> {
    await this.redis.client.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
  }

  async remove(key: string): Promise<void> {
    await this.redis.client.del(key);
  }
}
