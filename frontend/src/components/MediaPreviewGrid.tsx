import { X } from 'lucide-react';
import type { FilePreview } from '../hooks/useObjectUrls';
import { Button } from './Button';

interface MediaPreviewGridProps {
  previews: FilePreview[];
  onRemove: (file: File) => void;
}

export function MediaPreviewGrid({ onRemove, previews }: MediaPreviewGridProps) {
  if (previews.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {previews.map((preview) => (
        <div className="overflow-hidden rounded-lg bg-white ring-1 ring-[#ded6c6]" key={`${preview.file.name}-${preview.file.lastModified}`}>
          <div className="aspect-video bg-[#e4ecdf]">
            {preview.kind === 'video' ? (
              <video className="h-full w-full object-cover" controls src={preview.url} />
            ) : (
              <img className="h-full w-full object-cover" src={preview.url} alt="" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <p className="min-w-0 truncate text-sm font-semibold text-[#354238]">{preview.file.name}</p>
            <Button
              aria-label={`${preview.file.name} 제거`}
              className="min-h-8 px-2 py-1"
              icon={<X className="size-4" aria-hidden="true" />}
              onClick={() => onRemove(preview.file)}
              variant="ghost"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

