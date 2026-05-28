import { env } from '../config/env.js';
import type { Journal, MediaItem, User } from '../types/domain.js';

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  display_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JournalRow {
  id: number;
  user_id: number;
  camping_date: string | Date;
  place_name: string;
  address: string;
  short_memo: string;
  created_at: Date;
  updated_at: Date;
}

export interface MediaRow {
  id: number;
  journal_id: number;
  media_type: 'image' | 'video';
  file_name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: Date;
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMedia(row: MediaRow): MediaItem {
  return {
    id: row.id,
    journalId: row.journal_id,
    type: row.media_type,
    fileName: row.file_name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: Number(row.size_bytes),
    url: `${env.PUBLIC_UPLOAD_BASE_URL}/${encodeURIComponent(row.file_name)}`,
    createdAt: row.created_at,
  };
}

export function mapJournal(row: JournalRow, media: MediaItem[], hashtags: string[]): Journal {
  return {
    id: row.id,
    userId: row.user_id,
    campingDate: formatDateOnly(row.camping_date),
    placeName: row.place_name,
    address: row.address,
    shortMemo: row.short_memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media,
    hashtags,
  };
}

function formatDateOnly(value: string | Date) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
