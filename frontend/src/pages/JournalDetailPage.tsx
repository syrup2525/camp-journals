import { CalendarDays, Edit3, MapPin, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { HashtagList } from '../components/HashtagList';
import { StateBlock } from '../components/StateBlock';
import { useAuth } from '../contexts/AuthContext';
import { deleteJournal, getJournal } from '../services/journalService';
import type { Journal } from '../types/journal';
import { formatDateKo, formatDateTimeKo } from '../utils/date';
import { getMediaUrl, isImage, isVideo } from '../utils/media';

type LoadState = 'loading' | 'ready' | 'error';

export function JournalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    getJournal(id)
      .then((item) => {
        if (!mounted) {
          return;
        }
        setJournal(item);
        setState('ready');
      })
      .catch((error: Error) => {
        if (!mounted) {
          return;
        }
        setErrorMessage(error.message);
        setState('error');
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const photos = useMemo(() => journal?.media.filter(isImage) ?? [], [journal]);
  const videos = useMemo(() => journal?.media.filter(isVideo) ?? [], [journal]);

  const handleDelete = async () => {
    if (!journal) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteJournal(journal.id);
      navigate('/');
    } finally {
      setIsDeleting(false);
    }
  };

  if (state === 'loading') {
    return <StateBlock kind="loading" title="일지를 불러오는 중" />;
  }

  if (state === 'error' || !journal) {
    return <StateBlock description={errorMessage} kind="error" title="일지를 불러오지 못했습니다" />;
  }

  return (
    <article className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#687267]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatDateKo(journal.campingDate)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{journal.address || '-'}</span>
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#213127] sm:text-4xl">{journal.placeName || '이름 없는 장소'}</h2>
          {journal.hashtags.length > 0 ? (
            <div className="mt-4">
              <HashtagList hashtags={journal.hashtags} />
            </div>
          ) : null}
        </div>
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Button icon={<Edit3 className="size-4" aria-hidden="true" />} onClick={() => navigate(`/journals/${journal.id}/edit`)} variant="secondary">
              수정
            </Button>
            <Button icon={<Trash2 className="size-4" aria-hidden="true" />} onClick={() => setIsConfirmOpen(true)} variant="danger">
              삭제
            </Button>
          </div>
        ) : null}
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-[#ded6c6]">
        <h3 className="text-lg font-black text-[#213127]">메모</h3>
        <p className="mt-3 whitespace-pre-line text-base leading-7 text-[#4f5d53]">{journal.shortMemo || '남겨진 메모가 없습니다.'}</p>
        <dl className="mt-6 grid gap-3 border-t border-[#eee8dc] pt-4 text-sm text-[#687267] sm:grid-cols-2">
          <div>
            <dt className="font-bold text-[#354238]">작성일</dt>
            <dd className="mt-1">{formatDateTimeKo(journal.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-bold text-[#354238]">수정일</dt>
            <dd className="mt-1">{formatDateTimeKo(journal.updatedAt)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-black text-[#213127]">사진</h3>
        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <a className="focus-ring overflow-hidden rounded-lg bg-white ring-1 ring-[#ded6c6]" href={getMediaUrl(photo)} key={photo.id} target="_blank">
                <img className="aspect-[4/3] h-full w-full object-cover" src={getMediaUrl(photo)} alt="" />
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-white p-5 text-sm text-[#687267] ring-1 ring-[#ded6c6]">등록된 사진이 없습니다.</p>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-black text-[#213127]">동영상</h3>
        {videos.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {videos.map((video) => (
              <video className="aspect-video w-full rounded-lg bg-black ring-1 ring-[#ded6c6]" controls key={video.id} src={getMediaUrl(video)} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-white p-5 text-sm text-[#687267] ring-1 ring-[#ded6c6]">등록된 동영상이 없습니다.</p>
        )}
      </section>

      <div>
        <Link className="focus-ring inline-flex rounded-md px-3 py-2 text-sm font-bold text-[#31533b] hover:bg-[#e4ecdf]" to="/">
          목록으로
        </Link>
      </div>

      <ConfirmDialog
        confirmLabel="삭제"
        description="삭제한 일지는 되돌릴 수 없습니다."
        isOpen={isConfirmOpen}
        isSubmitting={isDeleting}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="일지를 삭제할까요?"
      />
    </article>
  );
}
