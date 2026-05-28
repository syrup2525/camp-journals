import type { Id, Journal, MediaItem, MediaKind, User } from '../types/journal';

function valueFrom<T>(source: Record<string, unknown>, keys: string[], fallback: T) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }

  return fallback;
}

function normalizeMediaKind(raw: Record<string, unknown>): MediaKind {
  const rawType = String(valueFrom(raw, ['type', 'mediaType', 'media_type', 'kind'], '')).toLowerCase();
  const mimeType = String(valueFrom(raw, ['mimeType', 'mime_type'], '')).toLowerCase();

  if (rawType.includes('video') || mimeType.startsWith('video/')) {
    return 'video';
  }

  return 'image';
}

function normalizeBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'y'].includes(value.trim().toLowerCase());
  }

  return false;
}

export function normalizeMedia(rawMedia: unknown): MediaItem {
  const raw = rawMedia as Record<string, unknown>;

  return {
    id: valueFrom<Id>(raw, ['id', 'mediaId', 'media_id'], crypto.randomUUID()),
    journalId: valueFrom<Id | undefined>(raw, ['journalId', 'journal_id'], undefined),
    type: normalizeMediaKind(raw),
    fileName: valueFrom<string | undefined>(raw, ['fileName', 'file_name', 'filename'], undefined),
    url: valueFrom<string | undefined>(raw, ['url', 'publicUrl', 'public_url', 'src'], undefined),
    mimeType: valueFrom<string | undefined>(raw, ['mimeType', 'mime_type'], undefined),
    size: valueFrom<number | undefined>(raw, ['size', 'fileSize', 'file_size'], undefined),
    createdAt: valueFrom<string | undefined>(raw, ['createdAt', 'created_at'], undefined),
  };
}

export function normalizeJournal(rawJournal: unknown): Journal {
  const raw = rawJournal as Record<string, unknown>;
  const media = [
    ...((raw.media as unknown[] | undefined) ?? []),
    ...((raw.photos as unknown[] | undefined) ?? []),
    ...((raw.videos as unknown[] | undefined) ?? []),
  ].map(normalizeMedia);
  const hashtags = ((valueFrom<unknown[]>(raw, ['hashtags', 'tags'], []) ?? []) as unknown[])
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.replace(/^#+/, '').trim())
    .filter(Boolean);

  return {
    id: valueFrom<Id>(raw, ['id', 'journalId', 'journal_id'], ''),
    userId: valueFrom<Id>(raw, ['userId', 'user_id', 'authorId', 'author_id'], ''),
    campingDate: valueFrom<string>(raw, ['campingDate', 'camping_date', 'date'], ''),
    placeName: valueFrom<string>(raw, ['placeName', 'place_name', 'locationName', 'location_name'], ''),
    address: valueFrom<string>(raw, ['address', 'shortAddress', 'short_address'], ''),
    shortMemo: valueFrom<string>(raw, ['shortMemo', 'short_memo', 'memo', 'review', 'content'], ''),
    isPrivate: normalizeBoolean(valueFrom(raw, ['isPrivate', 'is_private', 'private'], false)),
    createdAt: valueFrom<string>(raw, ['createdAt', 'created_at'], ''),
    updatedAt: valueFrom<string>(raw, ['updatedAt', 'updated_at'], ''),
    media,
    hashtags,
  };
}

export function normalizeUser(rawUser: unknown): User {
  const raw = rawUser as Record<string, unknown>;

  return {
    id: valueFrom<Id>(raw, ['id', 'userId', 'user_id'], ''),
    username: valueFrom<string>(raw, ['username', 'loginId', 'login_id'], ''),
    displayName: valueFrom<string | undefined>(raw, ['displayName', 'display_name', 'name'], undefined),
  };
}
