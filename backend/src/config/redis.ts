import { Redis } from 'ioredis';
import { env } from './env.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

export async function connectRedis() {
  if (redis.status === 'wait') {
    await redis.connect();
  }
}

export async function closeRedis() {
  if (redis.status === 'wait' || redis.status === 'end') {
    return;
  }

  await redis.quit();
}
