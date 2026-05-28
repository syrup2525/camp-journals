import { useEffect, useMemo, useState } from 'react';

export interface FilePreview {
  file: File;
  url: string;
  kind: 'image' | 'video';
}

export function useObjectUrls(files: File[]) {
  const fileKey = useMemo(
    () => files.map((file) => `${file.name}:${file.size}:${file.lastModified}`).join('|'),
    [files],
  );
  const [previews, setPreviews] = useState<FilePreview[]>([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? ('video' as const) : ('image' as const),
    }));

    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [fileKey, files]);

  return previews;
}

