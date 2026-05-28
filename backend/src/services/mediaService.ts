import path from 'node:path';
import { env } from '../config/env.js';
import * as journalRepository from '../repositories/journalRepository.js';
import * as mediaRepository from '../repositories/mediaRepository.js';
import type { Id } from '../types/domain.js';
import type { MulterFile } from 'fastify-multer';
import { AppError } from '../utils/errors.js';
import { removeFileIfExists, resolveUploadPath } from '../utils/fileSystem.js';
import { mediaTypeFromMime, validateUploadSize } from '../utils/mediaPolicy.js';

export async function addMediaToJournal(journalId: Id, files: MulterFile[]) {
  const journal = await journalRepository.findJournalById(journalId);

  if (!journal) {
    await Promise.all(files.map((file) => removeFileIfExists(file.path)));
    throw new AppError('캠핑 일지를 찾을 수 없습니다.', 'JOURNAL_NOT_FOUND', 404);
  }

  const created = [];

  try {
    for (const file of files) {
      const mediaType = mediaTypeFromMime(file.mimetype);

      if (!mediaType) {
        throw new AppError('지원하지 않는 파일 형식입니다.', 'INVALID_FILE_TYPE', 400);
      }

      const sizeError = validateUploadSize(mediaType, file.size);

      if (sizeError) {
        throw new AppError(sizeError, 'FILE_TOO_LARGE', 413);
      }

      created.push(
        await mediaRepository.createMedia({
          journalId,
          type: mediaType,
          fileName: path.basename(file.filename),
          originalName: path.basename(file.originalname),
          mimeType: file.mimetype,
          size: file.size,
        }),
      );
    }
  } catch (error) {
    await Promise.all(created.map((media) => mediaRepository.deleteMedia(media.id)));
    await Promise.all(files.map((file) => removeFileIfExists(file.path)));
    throw error;
  }

  return created;
}

export async function deleteJournalMedia(journalId: Id, mediaId: Id) {
  const media = await mediaRepository.findMediaById(mediaId);

  if (!media || media.journalId !== journalId) {
    throw new AppError('미디어 파일을 찾을 수 없습니다.', 'MEDIA_NOT_FOUND', 404);
  }

  await mediaRepository.deleteMedia(mediaId);
  await removeFileIfExists(resolveUploadPath(env.UPLOAD_DIR, media.fileName));
}
