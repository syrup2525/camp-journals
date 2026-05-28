import { Hash, ImagePlus, Lock, Save, Trash2, Unlock, Video } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { HashtagList } from '../components/HashtagList';
import { MediaPreviewGrid } from '../components/MediaPreviewGrid';
import { StateBlock } from '../components/StateBlock';
import { useAuth } from '../contexts/AuthContext';
import { useObjectUrls } from '../hooks/useObjectUrls';
import {
  createJournal,
  deleteJournalMedia,
  getJournal,
  updateJournal,
  uploadJournalMedia,
} from '../services/journalService';
import type { Id, Journal, JournalInput, MediaItem } from '../types/journal';
import { toDateInputValue } from '../utils/date';
import { formatHashtags, parseHashtagText } from '../utils/hashtags';
import { getMediaUrl, IMAGE_ACCEPT, isImage, isVideo, validateFiles, VIDEO_ACCEPT } from '../utils/media';

interface JournalFormPageProps {
  mode: 'create' | 'edit';
}

const emptyForm: JournalInput = {
  campingDate: '',
  placeName: '',
  address: '',
  shortMemo: '',
  isPrivate: false,
  hashtags: [],
};

export function JournalFormPage({ mode }: JournalFormPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<JournalInput>(emptyForm);
  const [hashtagText, setHashtagText] = useState('');
  const [journal, setJournal] = useState<Journal | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<Id[]>([]);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const photoPreviews = useObjectUrls(photoFiles);
  const videoPreviews = useObjectUrls(videoFiles);

  useEffect(() => {
    if (mode !== 'edit' || !id) {
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setErrorMessage('');

    getJournal(id)
      .then((item) => {
        if (!mounted) {
          return;
        }

        if (String(item.userId) !== String(user?.id)) {
          setErrorMessage('일지를 수정할 권한이 없습니다.');
          return;
        }

        setJournal(item);
        setForm({
          campingDate: toDateInputValue(item.campingDate),
          placeName: item.placeName,
          address: item.address,
          shortMemo: item.shortMemo,
          isPrivate: item.isPrivate,
          hashtags: item.hashtags,
        });
        setHashtagText(formatHashtags(item.hashtags));
      })
      .catch((error: Error) => {
        if (!mounted) {
          return;
        }
        setErrorMessage(error.message);
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, mode, user?.id]);

  const visibleMedia = useMemo(
    () => journal?.media.filter((media) => !removedMediaIds.includes(media.id)) ?? [],
    [journal, removedMediaIds],
  );

  const existingPhotos = visibleMedia.filter(isImage);
  const existingVideos = visibleMedia.filter(isVideo);

  const updateField = <K extends keyof JournalInput>(field: K, value: JournalInput[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, kind: 'photo' | 'video') => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    const validationErrors = validateFiles(selectedFiles);

    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join('\n'));
      event.currentTarget.value = '';
      return;
    }

    if (kind === 'photo') {
      setPhotoFiles((current) => [...current, ...selectedFiles]);
    } else {
      setVideoFiles((current) => [...current, ...selectedFiles]);
    }

    setErrorMessage('');
    event.currentTarget.value = '';
  };

  const removeFile = (file: File, kind: 'photo' | 'video') => {
    if (kind === 'photo') {
      setPhotoFiles((current) => current.filter((item) => item !== file));
    } else {
      setVideoFiles((current) => current.filter((item) => item !== file));
    }
  };

  const markMediaRemoved = (media: MediaItem) => {
    setRemovedMediaIds((current) => (current.includes(media.id) ? current : [...current, media.id]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        hashtags: parseHashtagText(hashtagText),
      };
      const savedJournal =
        mode === 'create' ? await createJournal(payload) : await updateJournal(id as Id, payload);

      await Promise.all(removedMediaIds.map((mediaId) => deleteJournalMedia(savedJournal.id, mediaId)));
      await uploadJournalMedia(savedJournal.id, [...photoFiles, ...videoFiles]);

      navigate(`/journals/${savedJournal.id}`);
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <StateBlock kind="loading" title="일지를 불러오는 중" />;
  }

  if (mode === 'edit' && errorMessage && !journal) {
    return <StateBlock description={errorMessage} kind="error" title="일지를 불러오지 못했습니다" />;
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black text-[#213127]">{mode === 'create' ? '새 일지' : '일지 수정'}</h2>
        </div>
        <Button disabled={isSubmitting} icon={<Save className="size-4" aria-hidden="true" />} type="submit">
          {isSubmitting ? '저장 중' : '저장'}
        </Button>
      </div>

      {errorMessage ? (
        <div className="whitespace-pre-line rounded-lg bg-[#f6ddd8] p-4 text-sm font-semibold text-[#93372b]">{errorMessage}</div>
      ) : null}

      <section className="grid gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-[#ded6c6] sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#354238]">
          캠핑 날짜
          <input
            className="focus-ring min-h-11 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127]"
            onChange={(event) => updateField('campingDate', event.target.value)}
            required
            type="date"
            value={form.campingDate}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#354238]">
          장소명
          <input
            className="focus-ring min-h-11 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127]"
            onChange={(event) => updateField('placeName', event.target.value)}
            required
            type="text"
            value={form.placeName}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#354238] sm:col-span-2">
          간략한 주소
          <input
            className="focus-ring min-h-11 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127]"
            onChange={(event) => updateField('address', event.target.value)}
            required
            type="text"
            value={form.address}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#354238] sm:col-span-2">
          짧은 후기
          <textarea
            className="focus-ring min-h-36 resize-y rounded-md border border-[#cfc7b6] bg-white px-3 py-3 text-[#213127]"
            onChange={(event) => updateField('shortMemo', event.target.value)}
            required
            value={form.shortMemo}
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#354238] sm:col-span-2">
          해시태그
          <div className="flex min-h-11 items-center gap-2 rounded-md border border-[#cfc7b6] bg-white px-3 text-[#213127] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#df8a3d]">
            <Hash className="size-4 shrink-0 text-[#687267]" aria-hidden="true" />
            <input
              className="min-h-10 flex-1 border-0 bg-transparent text-[#213127] outline-none"
              onChange={(event) => setHashtagText(event.target.value)}
              type="text"
              value={hashtagText}
            />
          </div>
        </label>
        {parseHashtagText(hashtagText).length > 0 ? (
          <div className="sm:col-span-2">
            <HashtagList compact hashtags={parseHashtagText(hashtagText)} />
          </div>
        ) : null}
        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-md border border-[#cfc7b6] bg-[#fbfaf6] px-4 py-3 text-sm font-bold text-[#354238] sm:col-span-2">
          <span className="inline-flex min-w-0 items-center gap-2">
            {form.isPrivate ? (
              <Lock className="size-4 shrink-0 text-[#93372b]" aria-hidden="true" />
            ) : (
              <Unlock className="size-4 shrink-0 text-[#687267]" aria-hidden="true" />
            )}
            <span>비밀글</span>
          </span>
          <span className="inline-flex items-center gap-3 text-xs font-semibold text-[#687267]">
            <span>{form.isPrivate ? '작성자만 볼 수 있음' : '전체 공개'}</span>
            <input
              checked={form.isPrivate}
              className="focus-ring size-5 accent-[#31533b]"
              onChange={(event) => updateField('isPrivate', event.target.checked)}
              type="checkbox"
            />
          </span>
        </label>
      </section>

      {mode === 'edit' ? (
        <section className="space-y-4">
          <h3 className="text-xl font-black text-[#213127]">기존 파일</h3>
          <ExistingMedia title="사진" items={existingPhotos} onRemove={markMediaRemoved} />
          <ExistingMedia title="동영상" items={existingVideos} onRemove={markMediaRemoved} />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <label className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#24372b] ring-1 ring-[#cfc7b6] transition hover:bg-[#f4efe5]">
            <ImagePlus className="size-4" aria-hidden="true" />
            사진 추가
            <input
              accept={IMAGE_ACCEPT}
              className="sr-only"
              multiple
              onChange={(event) => handleFileChange(event, 'photo')}
              type="file"
            />
          </label>
          <label className="focus-ring inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#24372b] ring-1 ring-[#cfc7b6] transition hover:bg-[#f4efe5]">
            <Video className="size-4" aria-hidden="true" />
            동영상 추가
            <input
              accept={VIDEO_ACCEPT}
              className="sr-only"
              multiple
              onChange={(event) => handleFileChange(event, 'video')}
              type="file"
            />
          </label>
        </div>

        <MediaPreviewGrid previews={photoPreviews} onRemove={(file) => removeFile(file, 'photo')} />
        <MediaPreviewGrid previews={videoPreviews} onRemove={(file) => removeFile(file, 'video')} />
      </section>
    </form>
  );
}

function ExistingMedia({
  items,
  onRemove,
  title,
}: {
  items: MediaItem[];
  onRemove: (media: MediaItem) => void;
  title: string;
}) {
  if (items.length === 0) {
    return <p className="rounded-lg bg-white p-4 text-sm text-[#687267] ring-1 ring-[#ded6c6]">등록된 {title}이 없습니다.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((media) => (
        <div className="overflow-hidden rounded-lg bg-white ring-1 ring-[#ded6c6]" key={media.id}>
          <div className="aspect-video bg-[#e4ecdf]">
            {media.type === 'video' ? (
              <video className="h-full w-full object-cover" controls src={getMediaUrl(media)} />
            ) : (
              <img className="h-full w-full object-cover" src={getMediaUrl(media)} alt="" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <p className="min-w-0 truncate text-sm font-semibold text-[#354238]">{media.fileName || title}</p>
            <Button
              aria-label={`${media.fileName || title} 삭제`}
              className="min-h-8 px-2 py-1"
              icon={<Trash2 className="size-4" aria-hidden="true" />}
              onClick={() => onRemove(media)}
              variant="ghost"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
