import { FastifyReply } from 'fastify';

export function workspaceMiddleware(
  req: { raw: { headers: Record<string, string | string[] | undefined> }; workspaceId?: string },
  _res: FastifyReply,
  done: () => void
): void {
  const workspaceId = req.raw.headers['x-workspace-id'];
  if (typeof workspaceId === 'string' && workspaceId.length > 0) {
    req.workspaceId = workspaceId;
  }
  done();
}
