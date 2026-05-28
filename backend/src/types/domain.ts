export type Id = number;

export type MediaType = 'image' | 'video';

export interface User {
  id: Id;
  username: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalInput {
  campingDate: string;
  placeName: string;
  address: string;
  shortMemo: string;
  isPrivate: boolean;
  hashtags: string[];
}

export interface MediaItem {
  id: Id;
  journalId: Id;
  type: MediaType;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface Journal {
  id: Id;
  userId: Id;
  campingDate: string;
  placeName: string;
  address: string;
  shortMemo: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  media: MediaItem[];
  hashtags: string[];
}
