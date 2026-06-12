const path = require('path');
const fs = require('fs');

delete process.env.PORT;

let handler;

async function bootstrap() {
  const distPath = path.join(__dirname, '..', 'dist', 'src', 'app.module');

  // Debug: check what files exist
  const checkDir = (p) => {
    try {
      const entries = fs.readdirSync(p);
      return `exists: [${entries.slice(0, 10).join(', ')}]`;
    } catch (e) {
      return `not found: ${e.message}`;
    }
  };

  console.log('[Vercel] __dirname:', __dirname);
  console.log('[Vercel] dist/src/app.module path:', distPath);
  console.log('[Vercel] parent dir:', checkDir(path.join(__dirname, '..')));
  console.log('[Vercel] dist dir:', checkDir(path.join(__dirname, '..', 'dist')));
  console.log('[Vercel] dist/src dir:', checkDir(path.join(__dirname, '..', 'dist', 'src')));

  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('../dist/src/app.module');
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
      console.error('[Vercel] Bootstrap failed:', err.message);
      console.error('[Vercel] Stack:', err.stack?.split('\n').slice(0, 10).join('\n'));
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bootstrap failed',
        detail: err.message,
        dirs: {
          parent: fs.existsSync(path.join(__dirname, '..')) ? fs.readdirSync(path.join(__dirname, '..')).slice(0, 20) : 'N/A',
          dist: fs.existsSync(path.join(__dirname, '..', 'dist')) ? fs.readdirSync(path.join(__dirname, '..', 'dist')).slice(0, 20) : 'N/A'
        }
      }));
      return;
    }
  }
  return handler(req, res);
};
