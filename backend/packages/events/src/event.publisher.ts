import { RedisService } from '@backend/packages/redis/src/redis.service';
import { DomainEvent } from './domain-event';

export class EventPublisher {
  constructor(private readonly redis: RedisService) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.redis.client.xadd('domain-events', '*', 'event', JSON.stringify(event));
  }
}
