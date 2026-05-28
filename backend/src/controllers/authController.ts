import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionUserId } from '../middlewares/auth.js';
import * as authService from '../services/authService.js';
import { loginSchema } from '../utils/validators.js';

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const payload = loginSchema.parse(request.body);
  const user = await authService.verifyLogin(payload.username, payload.password);

  await request.session.regenerate();
  request.session.set('userId', user.id);
  await request.session.save();

  return reply.send({ data: { user } });
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  await request.session.destroy();
  return reply.send({ data: { ok: true } });
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request);

  if (!userId) {
    return reply.code(401).send({ message: '로그인이 필요합니다.', code: 'UNAUTHORIZED' });
  }

  const user = await authService.getUserById(userId);

  if (!user) {
    await request.session.destroy();
    return reply.code(401).send({ message: '로그인이 필요합니다.', code: 'UNAUTHORIZED' });
  }

  return reply.send({ data: { user } });
}
