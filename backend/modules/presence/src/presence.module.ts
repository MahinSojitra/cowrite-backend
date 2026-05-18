import { Module } from '@nestjs/common';
import { PresenceManager } from './presence.manager';
import { PresenceController } from './presence.controller';
import { RedisService } from '@backend/packages/redis/src/redis.service';

@Module({
  providers: [PresenceManager, RedisService],
  controllers: [PresenceController],
  exports: [PresenceManager]
})
export class PresenceModule {}
