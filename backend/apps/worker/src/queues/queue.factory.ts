import { Queue, QueueEvents } from 'bullmq';
import { RedisOptions } from 'ioredis';

export function createQueue(name: string, connection: RedisOptions): { queue: Queue; events: QueueEvents } {
  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 }
    }
  });

  const events = new QueueEvents(name, { connection });
  return { queue, events };
}
