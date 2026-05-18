import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = typeof response === 'string' ? response : (response as any).message ?? 'Request failed';
      const details = typeof response === 'object' ? (response as any).details : undefined;

      reply.code(status).send({
        code: `HTTP_${status}`,
        message,
        details,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    reply.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
}
