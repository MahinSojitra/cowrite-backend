import 'reflect-metadata';
import { Server } from '@hocuspocus/server';
import { Redis } from '@hocuspocus/extension-redis';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { getEnv } from '@backend/packages/config/src/env';
import { RedisService } from '@backend/packages/redis/src/redis.service';
import { DocumentStore } from './document-store';
import * as Y from 'yjs';

const env = getEnv();
const prisma = new PrismaClient();
const redisService = new RedisService();
const jwt = new JwtService();
const store = new DocumentStore(prisma);

const server = new Server({
  port: env.COLLAB_PORT,
  extensions: [
    new Redis({
      host: new URL(env.REDIS_URL).hostname,
      port: Number(new URL(env.REDIS_URL).port || '6379')
    })
  ],
  async onAuthenticate(data) {
    const token = data.token;
    if (!token) throw new Error('Missing token');

    const payload = await jwt.verifyAsync<{ sub: string; sessionId: string; workspaceId: string; documentId: string }>(token, {
      secret: env.JWT_COLLAB_SECRET
    });

    if (payload.documentId !== data.documentName) {
      throw new Error('Document claim mismatch');
    }

    const permission = await prisma.documentPermission.findFirst({
      where: {
        documentId: payload.documentId,
        subjectType: 'USER',
        subjectId: payload.sub,
        deletedAt: null
      }
    });

    if (!permission) {
      const member = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: payload.workspaceId,
          userId: payload.sub,
          status: 'ACTIVE',
          deletedAt: null
        }
      });
      if (!member) throw new Error('Not authorized for workspace');
    }

    data.context.user = payload;
  },
  async onLoadDocument(data) {
    const binary = await store.load(data.documentName);
    Y.applyUpdate(data.document, binary, 'bootstrap');
  },
  async onStoreDocument(data) {
    const update = Y.encodeStateAsUpdate(data.document);
    await store.appendUpdate(data.documentName, update);
  },
  async onConnect(data) {
    const user = data.context.user as { sub: string; sessionId: string; workspaceId: string };
    const key = `presence:${user.workspaceId}:${data.documentName}:${user.sub}:${user.sessionId}`;
    await redisService.client.set(key, JSON.stringify({ online: true, connectedAt: Date.now() }), 'EX', 60);
  },
  async onDisconnect(data) {
    const user = data.context.user as { sub?: string; sessionId?: string; workspaceId?: string };
    if (!user?.sub || !user.workspaceId || !user.sessionId) return;
    const key = `presence:${user.workspaceId}:${data.documentName}:${user.sub}:${user.sessionId}`;
    await redisService.client.del(key);
  }
});

server.listen();
