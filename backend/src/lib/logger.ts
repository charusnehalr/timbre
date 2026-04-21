import pino from 'pino';

// pino-pretty uses ThreadStream which exits early in Next.js App Router workers.
// Use the default (stdout JSON) transport in all environments to avoid crashes.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});
