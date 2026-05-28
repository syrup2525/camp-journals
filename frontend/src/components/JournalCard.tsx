import { CalendarDays, Lock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HashtagList } from './HashtagList';
import { formatDateKo } from '../utils/date';
import { getMediaUrl, isImage } from '../utils/media';
import type { Journal } from '../types/journal';

interface JournalCardProps {
  journal: Journal;
}

export function JournalCard({ journal }: JournalCardProps) {
  const cover = journal.media.find(isImage);
  const coverUrl = getMediaUrl(cover);
  const excerpt = journal.shortMemo.length > 96 ? `${journal.shortMemo.slice(0, 96)}...` : journal.shortMemo;

  return (
    <Link
      className="focus-ring group grid overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#ded6c6] transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[260px_1fr]"
      to={`/journals/${journal.id}`}
    >
      <div className="aspect-[16/10] bg-[#dfe7dc] md:aspect-auto">
        {coverUrl ? (
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" src={coverUrl} alt="" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[#647260]">No Photo</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-5 p-5">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#647260]">
            {journal.isPrivate ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f6ddd8] px-2 py-1 text-xs font-bold text-[#93372b]">
                <Lock className="size-3.5" aria-hidden="true" />
                비밀글
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDateKo(journal.campingDate)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{journal.address || '-'}</span>
            </span>
          </div>
          <h2 className="truncate text-2xl font-black text-[#213127]">{journal.placeName || '이름 없는 장소'}</h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#59645d]">{excerpt || '남겨진 메모가 없습니다.'}</p>
          {journal.hashtags.length > 0 ? (
            <div className="mt-4">
              <HashtagList compact hashtags={journal.hashtags} />
            </div>
          ) : null}
        </div>
        <div className="text-sm font-bold text-[#31533b]">자세히 보기</div>
      </div>
    </Link>
  );
}
