import { Redis } from '@upstash/redis';
import { errors } from './errors';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRateLimit(
  userId: string,
  action: string,
  maxPerHour: number,
) {
  const hour = Math.floor(Date.now() / 3_600_000);
  const key = `rl:${action}:${userId}:${hour}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  if (count > maxPerHour) {
    throw errors.rateLimited();
  }
}
