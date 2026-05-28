import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { JournalCard } from '../components/JournalCard';
import { StateBlock } from '../components/StateBlock';
import { useAuth } from '../contexts/AuthContext';
import { getJournals } from '../services/journalService';
import type { Journal } from '../types/journal';
import { sortByCampingDateDesc } from '../utils/date';

type LoadState = 'loading' | 'ready' | 'error';

export function JournalListPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setState('loading');
    setErrorMessage('');

    getJournals()
      .then((items) => {
        if (!mounted) {
          return;
        }
        setJournals(sortByCampingDateDesc(items));
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
  }, [user?.id]);

  if (state === 'loading') {
    return <StateBlock kind="loading" title="일지를 불러오는 중" />;
  }

  if (state === 'error') {
    return (
      <StateBlock
        action={
          <Button onClick={() => window.location.reload()} variant="secondary">
            다시 시도
          </Button>
        }
        description={errorMessage}
        kind="error"
        title="일지를 불러오지 못했습니다"
      />
    );
  }

  if (journals.length === 0) {
    return (
      <StateBlock
        action={
          isAuthenticated ? (
            <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => navigate('/journals/new')}>
              새 일지
            </Button>
          ) : null
        }
        kind="empty"
        title="등록된 캠핑 일지가 없습니다"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-[#213127]">최근 캠핑</h2>
          <p className="mt-1 text-sm text-[#687267]">{journals.length.toLocaleString('ko-KR')}개의 일지</p>
        </div>
        {isAuthenticated ? (
          <Button icon={<Plus className="size-4" aria-hidden="true" />} onClick={() => navigate('/journals/new')}>
            새 일지
          </Button>
        ) : null}
      </div>
      <div className="grid gap-4">
        {journals.map((journal) => (
          <JournalCard journal={journal} key={journal.id} />
        ))}
      </div>
    </div>
  );
}
