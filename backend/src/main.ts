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

  app.enableShutdownHooks();

  const server = await app.listen(config.port, () => {
    logger.log(`FSOS API running on port ${config.port}`, 'Bootstrap');
    logger.log(`Environment: ${config.nodeEnv}`, 'Bootstrap');
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
