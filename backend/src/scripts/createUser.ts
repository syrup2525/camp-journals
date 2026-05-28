import { closeDatabase } from '../config/database.js';
import { closeRedis } from '../config/redis.js';
import { createUser } from '../services/authService.js';

const [, , username, password, displayNameArg] = process.argv;

if (!username || !password) {
  console.error('Usage: npm run create-user -- <username> <password> [displayName]');
  process.exit(1);
}

try {
  const user = await createUser(username, password, displayNameArg ?? username);
  console.log(`Created user: ${user.username} (#${user.id})`);
} finally {
  await closeDatabase();
  await closeRedis();
}

