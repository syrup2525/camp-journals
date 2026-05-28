import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MulterFile } from 'fastify-multer';
import * as mediaService from '../services/mediaService.js';
import { AppError } from '../utils/errors.js';
import { idParamSchema, mediaParamSchema } from '../utils/validators.js';

interface RequestWithFiles extends FastifyRequest {
  files?: MulterFile[] | Record<string, MulterFile[]>;
}

export async function uploadMedia(request: RequestWithFiles, reply: FastifyReply) {
  const { id } = idParamSchema.parse(request.params);
  const files = normalizeFiles(request.files);

  if (files.length === 0) {
    throw new AppError('업로드할 파일이 없습니다.', 'NO_FILES', 400);
  }

  const media = await mediaService.addMediaToJournal(id, files);
  return reply.code(201).send({ data: { media } });
}

export async function deleteMedia(request: FastifyRequest, reply: FastifyReply) {
  const { id, mediaId } = mediaParamSchema.parse(request.params);
  await mediaService.deleteJournalMedia(id, mediaId);

  return reply.send({ data: { ok: true } });
}

function normalizeFiles(files?: MulterFile[] | Record<string, MulterFile[]>) {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files;
  }

  return Object.values(files).flat();
}

