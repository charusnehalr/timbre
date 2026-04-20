import { Queue } from 'bullmq';
import { Redis } from '@upstash/redis';

const connection = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const embedQueue = new Queue('embed-writing', { connection });
export const styleQueue = new Queue('analyze-style', { connection });
export const refineQueue = new Queue('refine-profile', { connection });
