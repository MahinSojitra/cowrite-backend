import { Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { getEnv } from '@backend/packages/config/src/env';
import { SnapshotProcessor } from './processors/snapshot.processor';

const env = getEnv();
const redis = new URL(env.REDIS_URL);
const connection: RedisOptions = {
  host: redis.hostname,
  port: Number(redis.port || '6379'),
  username: redis.username || undefined,
  password: redis.password || undefined,
  maxRetriesPerRequest: null
};

const snapshotProcessor = new SnapshotProcessor();
const snapshotWorker = snapshotProcessor.createWorker(connection);

const noopWorker = new Worker(
  'cleanup-queue',
  async () => {
    return { ok: true };
  },
  { connection }
);

for (const worker of [snapshotWorker, noopWorker]) {
  worker.on('completed', (job) => {
    console.log(`[worker] completed ${job.queueName}:${job.name}:${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[worker] failed ${job?.queueName}:${job?.name}:${job?.id}`, error);
  });
}
