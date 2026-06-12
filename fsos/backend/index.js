delete process.env.PORT;

let handler;

async function bootstrap() {
  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('./dist/src/app.module');
  const { ValidationPipe } = require('@nestjs/common');
  const helmet = require('helmet');
  const compression = require('compression');

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.use(helmet.default({ contentSecurityPolicy: false }));
  app.use(compression());
  app.enableCors({ origin: true, credentials: true });
  await app.init();
  return app.getHttpAdapter().getInstance();
}

module.exports = async (req, res) => {
  if (!handler) {
    try {
      handler = await bootstrap();
    } catch (err) {
      console.error('NestJS bootstrap failed', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bootstrap failed', detail: err.message }));
      return;
    }
  }
  return handler(req, res);
};
