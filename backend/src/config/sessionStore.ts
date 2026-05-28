import type { Session } from 'fastify';
import type fastifySession from '@fastify/session';
import type { Redis } from 'ioredis';
import { env } from './env.js';

export class RedisSessionStore implements fastifySession.SessionStore {
  constructor(private readonly client: Redis) {}

  set(sessionId: string, session: Session, callback: (error?: unknown) => void): void {
    const ttlSeconds = Math.max(1, Math.floor(env.AUTH_SESSION_TTL_SECONDS));
    const value = JSON.stringify(session);

    this.client
      .set(`session:${sessionId}`, value, 'EX', ttlSeconds)
      .then(() => callback())
      .catch(callback);
  }

  get(sessionId: string, callback: (error: unknown, result?: Session | null) => void): void {
    this.client
      .get(`session:${sessionId}`)
      .then((value: string | null) => {
        if (!value) {
          callback(null, null);
          return;
        }

        const session = JSON.parse(value) as Session;

        if (session.cookie?.expires) {
          session.cookie.expires = new Date(session.cookie.expires);
        }

        callback(null, session);
      })
      .catch((error: unknown) => callback(error));
  }

  destroy(sessionId: string, callback: (error?: unknown) => void): void {
    this.client
      .del(`session:${sessionId}`)
      .then(() => callback())
      .catch(callback);
  }
}
