import { Job, Worker } from 'bullmq';
import { Prisma, PrismaClient } from '@prisma/client';
import { RedisOptions } from 'ioredis';
import * as Y from 'yjs';

export interface SnapshotJob {
  documentId: string;
  workspaceId: string;
  requestedBy?: string;
}

export class SnapshotProcessor {
  private readonly prisma = new PrismaClient();

  createWorker(connection: RedisOptions): Worker<SnapshotJob> {
    return new Worker<SnapshotJob>(
      'snapshot-queue',
      async (job: Job<SnapshotJob>) => {
        const updates = await this.prisma.documentUpdate.findMany({
          where: { documentId: job.data.documentId },
          orderBy: { sequence: 'asc' }
        });

        const ydoc = new Y.Doc();
        for (const update of updates) {
          Y.applyUpdate(ydoc, Buffer.from(update.updateData, 'base64'));
        }

        const binary = Y.encodeStateAsUpdate(ydoc);
        const latestSequence = updates.at(-1)?.sequence ?? 0;

        await this.prisma.$transaction(async (tx) => {
          const snapshot = await tx.snapshot.create({
            data: {
              documentId: job.data.documentId,
              sequence: latestSequence,
              snapshotData: Buffer.from(binary).toString('base64'),
              stateVector: Buffer.from(Y.encodeStateVector(ydoc)).toString('base64'),
              updateCount: updates.length
            }
          });

          await tx.document.update({
            where: { id: job.data.documentId },
            data: { currentSnapshotId: snapshot.id }
          });

          await tx.backgroundJob.upsert({
            where: { idempotencyKey: `snapshot:${job.id}` },
            create: {
              queueName: 'snapshot-queue',
              jobName: 'snapshot-document',
              status: 'COMPLETED',
              workspaceId: job.data.workspaceId,
              idempotencyKey: `snapshot:${job.id}`,
              payload: job.data as unknown as Prisma.InputJsonValue
            },
            update: { status: 'COMPLETED' }
          });
        });
      },
      { connection, concurrency: 4 }
    );
  }
}
