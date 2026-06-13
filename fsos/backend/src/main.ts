import { config as loadEnv } from 'dotenv';
loadEnv();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { config } from './config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { logger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.use(helmet.default({
    contentSecurityPolicy: config.isProd ? undefined : false,
  }));
  app.use(compression());

  app.enableCors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-request-id'],
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req, res) => {
    res.status(200).json({
      message: 'FSOS API',
      version: '1.0.0',
      status: 'ok',
      endpoints: {
        login: '/api/v1/tenant/login',
        health: '/api/v1/health',
      },
    });
  });

  app.enableShutdownHooks();

  const server = await app.listen(config.port, () => {
    logger.info(`FSOS API running on port ${config.port}`, { context: 'Bootstrap' });
    logger.info(`Environment: ${config.nodeEnv}`, { context: 'Bootstrap' });
  });

  const gracefulShutdown = async (signal: string) => {
    logger.log(`${signal} received. Starting graceful shutdown...`, 'Bootstrap');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});
