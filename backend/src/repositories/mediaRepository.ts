import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { db } from '../config/database.js';
import { mapMedia, type MediaRow } from '../models/mappers.js';
import type { Id, MediaItem, MediaType } from '../types/domain.js';

type MediaRecord = MediaRow & RowDataPacket;

export interface CreateMediaInput {
  journalId: Id;
  type: MediaType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function findMediaByJournalIds(journalIds: Id[]): Promise<Map<Id, MediaItem[]>> {
  const map = new Map<Id, MediaItem[]>();

  if (journalIds.length === 0) {
    return map;
  }

  const placeholders = journalIds.map(() => '?').join(', ');
  const [rows] = await db.query<MediaRecord[]>(
    `SELECT * FROM journal_media WHERE journal_id IN (${placeholders}) ORDER BY created_at ASC, id ASC`,
    journalIds,
  );

  rows.forEach((row) => {
    const media = mapMedia(row);
    const list = map.get(media.journalId) ?? [];
    list.push(media);
    map.set(media.journalId, list);
  });

  return map;
}

export async function findMediaById(id: Id): Promise<MediaItem | null> {
  const [rows] = await db.query<MediaRecord[]>('SELECT * FROM journal_media WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? mapMedia(rows[0]) : null;
}

export async function createMedia(input: CreateMediaInput): Promise<MediaItem> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO journal_media
      (journal_id, media_type, file_name, original_name, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.journalId, input.type, input.fileName, input.originalName, input.mimeType, input.size],
  );

  const media = await findMediaById(result.insertId);

  if (!media) {
    throw new Error('Failed to create media');
  }

  return media;
}

export async function deleteMedia(id: Id) {
  await db.execute('DELETE FROM journal_media WHERE id = ?', [id]);
}

