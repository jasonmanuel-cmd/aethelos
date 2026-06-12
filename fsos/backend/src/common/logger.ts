import * as winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'fsos-api' },
  transports: [
    new winston.transports.Console({
      format: config.isProd
        ? winston.format.json()
        : winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const ctx = context ? `[${context}] ` : '';
              const metaStr = Object.keys(meta).length > 1 ? ` ${JSON.stringify(meta)}` : '';
              return `${timestamp} ${level}: ${ctx}${message}${metaStr}`;
            }),
          ),
    }),
  ],
});
