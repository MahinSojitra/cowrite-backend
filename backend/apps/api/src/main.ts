import 'reflect-metadata';

import { NestFactory, HttpAdapterHost } from '@nestjs/core';

import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { AppModule } from './app.module';

import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';

import { appValidationPipe } from '@backend/packages/validation/src/validation.pipe';
import { getEnv } from '@backend/packages/config/src/env';

async function bootstrap(): Promise<void> {
  const env = getEnv();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true
    })
  );

  await app.register(cors, {
    origin: env.CLIENT_URL,
    credentials: true
  });

  await app.register(helmet);

  await app.register(cookie);

  await app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(appValidationPipe);

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalFilters(
    new HttpExceptionFilter(httpAdapterHost)
  );

  app.useGlobalInterceptors(
    new RequestContextInterceptor()
  );

  await app.listen({
    port: env.PORT,
    host: '0.0.0.0'
  });
}

bootstrap();