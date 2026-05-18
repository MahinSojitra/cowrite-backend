import { FastifyReply } from 'fastify';

export function workspaceMiddleware(req: any, _res: FastifyReply, done: () => void): void {
  const workspaceId = req.headers['x-workspace-id'];
  if (typeof workspaceId === 'string' && workspaceId.length > 0) {
    req.workspaceId = workspaceId;
  }
  done();
}
