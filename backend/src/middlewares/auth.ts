import type { FastifyReply, FastifyRequest } from 'fastify';
import { getUserById } from '../services/authService.js';
import { AppError } from '../utils/errors.js';

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  const userId = request.session.get('userId');

  if (!userId) {
    throw new AppError('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }

  const user = await getUserById(userId);

  if (!user) {
    await request.session.destroy();
    throw new AppError('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }
}

export function getSessionUserId(request: FastifyRequest) {
  return request.session.get('userId');
}

