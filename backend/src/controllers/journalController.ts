import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionUserId } from '../middlewares/auth.js';
import * as journalService from '../services/journalService.js';
import { AppError } from '../utils/errors.js';
import { idParamSchema, journalInputSchema } from '../utils/validators.js';

export async function listJournals(_request: FastifyRequest, reply: FastifyReply) {
  const journals = await journalService.listJournals();
  return reply.send({ data: { journals } });
}

export async function getJournal(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(request.params);
  const journal = await journalService.getJournal(id);
  return reply.send({ data: { journal } });
}

export async function createJournal(request: FastifyRequest, reply: FastifyReply) {
  const userId = getSessionUserId(request);

  if (!userId) {
    throw new AppError('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }

  const input = journalInputSchema.parse(request.body);
  const journal = await journalService.createJournal(userId, input);

  return reply.code(201).send({ data: { journal } });
}

export async function updateJournal(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(request.params);
  const input = journalInputSchema.parse(request.body);
  const journal = await journalService.updateJournal(id, input);

  return reply.send({ data: { journal } });
}

export async function deleteJournal(request: FastifyRequest, reply: FastifyReply) {
  const { id } = idParamSchema.parse(request.params);
  await journalService.deleteJournal(id);

  return reply.send({ data: { ok: true } });
}

