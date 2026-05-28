import { buildApp } from './app.js';
import { closeDatabase } from './config/database.js';
import { env } from './config/env.js';
import { closeRedis } from './config/redis.js';

const app = await buildApp();

const shutdown = async () => {
  await app.close();
  await closeDatabase();
  await closeRedis();
};

process.on('SIGTERM', () => {
  shutdown().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  shutdown().finally(() => process.exit(0));
});

await app.listen({ host: '0.0.0.0', port: env.PORT });

