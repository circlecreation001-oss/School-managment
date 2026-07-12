import pino from 'pino';
import { env } from './env.js';

const transport =
  env.logFormat === 'pretty'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

export const logger = pino({
  level: env.logLevel,
  transport: env.isDevelopment() ? transport : undefined,
  base: {
    service: env.appName,
    env: env.nodeEnv,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.passwordHash'],
});

export type Logger = typeof logger;
