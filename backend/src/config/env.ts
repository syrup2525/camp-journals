import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default('camp_db_name'),
  DB_USER: z.string().default('camp_user_id'),
  DB_PASSWORD: z.string().default('camp_password'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  UPLOAD_DIR: z.string().default('./uploads'),
  PUBLIC_UPLOAD_BASE_URL: z.string().url().default('http://localhost:8080/uploads'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  AUTH_COOKIE_NAME: z.string().default('session_name'),
  AUTH_COOKIE_SECURE: z.coerce.boolean().default(false),
  AUTH_SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(28800),
  AUTH_SESSION_SECRET: z.string().min(32).default('local-development-session-secret-please-change'),
});

export const env = schema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

