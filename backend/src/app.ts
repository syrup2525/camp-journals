import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import session from '@fastify/session';
import { env, corsOrigins } from './config/env.js';
import { connectRedis, redis } from './config/redis.js';
import { RedisSessionStore } from './config/sessionStore.js';
import { ensureDirectory } from './utils/fileSystem.js';
import { AppError, isAppError } from './utils/errors.js';
import { authRoutes } from './routes/authRoutes.js';
import { journalRoutes } from './routes/journalRoutes.js';
import { mediaRoutes } from './routes/mediaRoutes.js';

export async function buildApp() {
  await ensureDirectory(env.UPLOAD_DIR);
  await connectRedis();

  const app = Fastify({
    logger:
      env.NODE_ENV === 'production'
        ? true
        : {
            transport: {
              target: 'pino-pretty',
              options: {
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
          },
  });

  await app.register(cors, {
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Accept-Ranges', 'Content-Length', 'Content-Range'],
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError('허용되지 않은 CORS origin입니다.', 'CORS_ORIGIN_NOT_ALLOWED', 403), false);
    },
    credentials: true,
  });

  await app.register(cookie);
  await app.register(session, {
    secret: env.AUTH_SESSION_SECRET,
    cookieName: env.AUTH_COOKIE_NAME,
    saveUninitialized: false,
    rolling: true,
    store: new RedisSessionStore(redis),
    cookie: {
      httpOnly: true,
      secure: env.AUTH_COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      maxAge: env.AUTH_SESSION_TTL_SECONDS * 1000,
    },
  });

  app.addContentTypeParser(/^multipart\/form-data(?:;.*)?$/i, (_request, _payload, done) => {
    done(null);
  });

  app.setErrorHandler((error, _request, reply) => {
    if (isAppError(error)) {
      reply.code(error.statusCode).send({ message: error.message, code: error.code });
      return;
    }

    if (error instanceof Error && error.name === 'ZodError') {
      reply.code(400).send({ message: '요청 값이 올바르지 않습니다.', code: 'VALIDATION_ERROR' });
      return;
    }

    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'FST_REQ_FILE_TOO_LARGE') {
      reply.code(413).send({ message: '파일 크기 제한을 초과했습니다.', code: 'FILE_TOO_LARGE' });
      return;
    }

    app.log.error(error);
    reply.code(500).send({ message: '서버 오류가 발생했습니다.', code: 'INTERNAL_SERVER_ERROR' });
  });

  await app.register(authRoutes);
  await app.register(journalRoutes);
  await app.register(mediaRoutes);

  app.get('/health', async () => ({
    data: {
      status: 'ok',
    },
  }));

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ message: '요청한 리소스를 찾을 수 없습니다.', code: 'NOT_FOUND' });
  });

  return app;
}
