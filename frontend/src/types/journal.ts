export type MediaKind = 'image' | 'video';

export type Id = number | string;

export interface User {
  id: Id;
  username: string;
  displayName?: string;
}

export interface MediaItem {
  id: Id;
  journalId?: Id;
  type: MediaKind;
  fileName?: string;
  url?: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
}

export interface Journal {
  id: Id;
  campingDate: string;
  placeName: string;
  address: string;
  shortMemo: string;
  createdAt: string;
  updatedAt: string;
  media: MediaItem[];
  hashtags: string[];
}

export interface JournalInput {
  campingDate: string;
  placeName: string;
  address: string;
  shortMemo: string;
  hashtags: string[];
}

export interface ApiErrorBody {
  message: string;
  code?: string;
}
