import pino from 'pino';
import path from 'path';

// Logger configuration
const isProduction = process.env.NODE_ENV === 'production';

const transport = pino.transport({
  targets: [
    // 1. Console for development
    {
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    },
    // 2. Persistent file for forensic audit
    {
      target: 'pino/file',
      level: 'info',
      options: {
        destination: path.join(process.cwd(), 'data', 'conan.log'),
        mkdir: true,
      },
    },
  ],
});

export const logger = pino(
  {
    level: isProduction ? 'info' : 'debug',
    base: {
      env: process.env.NODE_ENV,
    },
  },
  transport
);
