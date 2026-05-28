import path from 'node:path';
import type { MediaType } from '../types/domain.js';

export const IMAGE_MAX_BYTES = 50 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 20;

const allowedExtensionsByMime = new Map<string, string[]>([
  ['image/jpeg', ['.jpg', '.jpeg']],
  ['image/png', ['.png']],
  ['image/webp', ['.webp']],
  ['video/mp4', ['.mp4']],
  ['video/webm', ['.webm']],
  ['video/quicktime', ['.mov', '.qt']],
]);

export function mediaTypeFromMime(mimeType: string): MediaType | null {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return null;
}

export function getSafeExtension(originalName: string, mimeType: string) {
  const extension = path.extname(path.basename(originalName)).toLowerCase();
  const allowedExtensions = allowedExtensionsByMime.get(mimeType);

  if (!allowedExtensions?.includes(extension)) {
    return null;
  }

  return extension;
}

export function isAllowedUpload(originalName: string, mimeType: string) {
  return Boolean(getSafeExtension(originalName, mimeType));
}

export function validateUploadSize(mediaType: MediaType, size: number) {
  if (mediaType === 'image' && size > IMAGE_MAX_BYTES) {
    return '이미지는 50MB 이하만 업로드할 수 있습니다.';
  }

  if (mediaType === 'video' && size > VIDEO_MAX_BYTES) {
    return '동영상은 200MB 이하만 업로드할 수 있습니다.';
  }

  return null;
}

