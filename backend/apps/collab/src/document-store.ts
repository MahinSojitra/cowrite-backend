import { PrismaClient } from '@prisma/client';
import * as Y from 'yjs';

export class DocumentStore {
  constructor(private readonly prisma: PrismaClient) {}

  async load(documentId: string): Promise<Uint8Array> {
    const snapshot = await this.prisma.snapshot.findFirst({
      where: { documentId },
      orderBy: { sequence: 'desc' }
    });

    const updates = await this.prisma.documentUpdate.findMany({
      where: {
        documentId,
        sequence: { gt: snapshot?.sequence ?? 0 }
      },
      orderBy: { sequence: 'asc' }
    });

    const ydoc = new Y.Doc();

    if (snapshot?.stateVector && snapshot.snapshotData) {
      Y.applyUpdate(ydoc, Buffer.from(snapshot.snapshotData, 'base64'));
    }

    for (const update of updates) {
      Y.applyUpdate(ydoc, Buffer.from(update.updateData, 'base64'));
    }

    return Y.encodeStateAsUpdate(ydoc);
  }

  async appendUpdate(documentId: string, update: Uint8Array, actorId?: string): Promise<void> {
    const latest = await this.prisma.documentUpdate.findFirst({
      where: { documentId },
      orderBy: { sequence: 'desc' },
      select: { sequence: true }
    });

    await this.prisma.documentUpdate.create({
      data: {
        documentId,
        sequence: (latest?.sequence ?? 0) + 1,
        updateData: Buffer.from(update).toString('base64'),
        actorId
      }
    });
  }
}
