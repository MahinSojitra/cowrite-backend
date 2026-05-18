declare module 'fastify' {
  interface FastifyRequest {
    requestId?: string;
    workspaceId?: string;
    userId?: string;
  }
}
