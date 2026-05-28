import { cx } from '../utils/cx';

interface HashtagListProps {
  hashtags: string[];
  compact?: boolean;
}

export function HashtagList({ compact = false, hashtags }: HashtagListProps) {
  if (hashtags.length === 0) {
    return null;
  }

  return (
    <div className={cx('flex flex-wrap', compact ? 'gap-1.5' : 'gap-2')}>
      {hashtags.map((tag) => (
        <span
          className={cx(
            'inline-flex items-center rounded-md bg-[#e7efe5] font-bold text-[#31533b] ring-1 ring-[#c9d8c5]',
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
          )}
          key={tag}
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

