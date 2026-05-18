import IORedis, { Redis } from 'ioredis';
import { getEnv } from '@backend/packages/config/src/env';

export class RedisService {
  readonly client: Redis;

  constructor() {
    this.client = new IORedis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
      enableAutoPipelining: true
    });
  }

  duplicate(): Redis {
    return this.client.duplicate();
  }

  async quit(): Promise<void> {
    await this.client.quit();
  }
}
