import * as journalRepository from '../repositories/journalRepository.js';
import type { Id, JournalInput } from '../types/domain.js';
import { AppError } from '../utils/errors.js';
import { removeFileIfExists, resolveUploadPath } from '../utils/fileSystem.js';
import { env } from '../config/env.js';

export function listJournals() {
  return journalRepository.findAllJournals();
}

export async function getJournal(id: Id) {
  const journal = await journalRepository.findJournalById(id);

  if (!journal) {
    throw new AppError('캠핑 일지를 찾을 수 없습니다.', 'JOURNAL_NOT_FOUND', 404);
  }

  return journal;
}

export function createJournal(userId: Id, input: JournalInput) {
  return journalRepository.createJournal(userId, input);
}

export async function updateJournal(id: Id, input: JournalInput) {
  const existing = await journalRepository.findJournalById(id);

  if (!existing) {
    throw new AppError('캠핑 일지를 찾을 수 없습니다.', 'JOURNAL_NOT_FOUND', 404);
  }

  const journal = await journalRepository.updateJournal(id, input);

  if (!journal) {
    throw new AppError('캠핑 일지를 찾을 수 없습니다.', 'JOURNAL_NOT_FOUND', 404);
  }

  return journal;
}

export async function deleteJournal(id: Id) {
  const existing = await journalRepository.findJournalById(id);

  if (!existing) {
    throw new AppError('캠핑 일지를 찾을 수 없습니다.', 'JOURNAL_NOT_FOUND', 404);
  }

  await journalRepository.deleteJournal(id);
  await Promise.all(existing.media.map((media) => removeFileIfExists(resolveUploadPath(env.UPLOAD_DIR, media.fileName))));
}

