import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MulterFile } from 'fastify-multer';
import { getSessionUserId } from '../middlewares/auth.js';
import * as mediaService from '../services/mediaService.js';
import { AppError } from '../utils/errors.js';
import { idParamSchema, mediaParamSchema, uploadFileParamSchema } from '../utils/validators.js';

interface RequestWithFiles extends FastifyRequest {
  files?: MulterFile[] | Record<string, MulterFile[]>;
}

export async function uploadMedia(request: RequestWithFiles, reply: FastifyReply) {
  const { id } = idParamSchema.parse(request.params);
  const userId = getSessionUserId(request);
  const files = normalizeFiles(request.files);

  if (!userId) {
    throw new AppError('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }

  if (files.length === 0) {
    throw new AppError('업로드할 파일이 없습니다.', 'NO_FILES', 400);
  }

  const media = await mediaService.addMediaToJournal(id, userId, files);
  return reply.code(201).send({ data: { media } });
}

export async function deleteMedia(request: FastifyRequest, reply: FastifyReply) {
  const { id, mediaId } = mediaParamSchema.parse(request.params);
  const userId = getSessionUserId(request);

  if (!userId) {
    throw new AppError('로그인이 필요합니다.', 'UNAUTHORIZED', 401);
  }

  await mediaService.deleteJournalMedia(id, mediaId, userId);

  return reply.send({ data: { ok: true } });
}

export async function serveMedia(request: FastifyRequest, reply: FastifyReply) {
  const { fileName } = uploadFileParamSchema.parse(request.params);
  const { filePath, isPrivate, media } = await mediaService.getReadableMedia(fileName, getSessionUserId(request));
  const stat = await statUploadFile(filePath);
  const range = getRangeHeader(request);

  reply
    .header('Accept-Ranges', 'bytes')
    .header('Cache-Control', isPrivate ? 'private, no-store' : 'public, max-age=86400')
    .type(media.mimeType);

  if (range) {
    const parsedRange = parseRange(range, stat.size);

    if (!parsedRange) {
      return reply.code(416).header('Content-Range', `bytes */${stat.size}`).send();
    }

    const { end, start } = parsedRange;
    return reply
      .code(206)
      .header('Content-Range', `bytes ${start}-${end}/${stat.size}`)
      .header('Content-Length', end - start + 1)
      .send(fs.createReadStream(filePath, { start, end }));
  }

  return reply.header('Content-Length', stat.size).send(fs.createReadStream(filePath));
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

async function statUploadFile(filePath: string) {
  try {
    return await fsPromises.stat(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new AppError('미디어 파일을 찾을 수 없습니다.', 'MEDIA_NOT_FOUND', 404);
    }

    throw error;
  }
}

function getRangeHeader(request: FastifyRequest) {
  const range = request.headers.range;

  if (Array.isArray(range)) {
    return range[0];
  }

  return range;
}

function parseRange(range: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);

  if (!match || size <= 0) {
    return null;
  }

  const [, rawStart, rawEnd] = match;
  const hasStart = rawStart !== '';
  const hasEnd = rawEnd !== '';

  if (!hasStart && !hasEnd) {
    return null;
  }

  const start = hasStart ? Number(rawStart) : Math.max(size - Number(rawEnd), 0);
  const end = hasEnd ? Math.min(Number(rawEnd), size - 1) : size - 1;

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || end >= size) {
    return null;
  }

  return { start, end };
}
