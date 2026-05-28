import { API_BASE_URL } from '../services/apiClient';
import type { MediaItem } from '../types/journal';

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';
export const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';
export const IMAGE_MAX_BYTES = 50 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;

export function getMediaUrl(media?: MediaItem) {
  const raw = media?.url ?? media?.fileName;

  if (!raw) {
    return '';
  }

  if (/^(https?:|blob:|data:)/.test(raw)) {
    return raw;
  }

  if (raw.startsWith('/uploads')) {
    return `${API_BASE_URL}${raw}`;
  }

  if (raw.startsWith('/')) {
    return raw;
  }

  return `${API_BASE_URL}/uploads/${raw}`;
}

export function isImage(media: MediaItem) {
  return media.type === 'image';
}

export function isVideo(media: MediaItem) {
  return media.type === 'video';
}

export function validateFiles(files: File[]) {
  const errors: string[] = [];

  files.forEach((file) => {
    if (file.type.startsWith('image/')) {
      if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
        errors.push(`${file.name}: 지원하지 않는 이미지 형식입니다.`);
      }
      if (file.size > IMAGE_MAX_BYTES) {
        errors.push(`${file.name}: 이미지는 50MB 이하만 업로드할 수 있습니다.`);
      }
      return;
    }

    if (file.type.startsWith('video/')) {
      if (!VIDEO_ACCEPT.split(',').includes(file.type)) {
        errors.push(`${file.name}: 지원하지 않는 동영상 형식입니다.`);
      }
      if (file.size > VIDEO_MAX_BYTES) {
        errors.push(`${file.name}: 동영상은 200MB 이하만 업로드할 수 있습니다.`);
      }
      return;
    }

    errors.push(`${file.name}: 사진 또는 동영상 파일만 업로드할 수 있습니다.`);
  });

  return errors;
}

