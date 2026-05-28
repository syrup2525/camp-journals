import { AlertTriangle, Loader2, TentTree } from 'lucide-react';
import { cx } from '../utils/cx';

interface StateBlockProps {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function StateBlock({ action, description, kind, title }: StateBlockProps) {
  const Icon = kind === 'loading' ? Loader2 : kind === 'error' ? AlertTriangle : TentTree;

  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-12">
      <div className="max-w-md text-center">
        <div
          className={cx(
            'mx-auto mb-4 flex size-12 items-center justify-center rounded-full',
            kind === 'error' ? 'bg-[#f6ddd8] text-[#b44535]' : 'bg-[#e4ecdf] text-[#31533b]',
          )}
        >
          <Icon className={cx('size-6', kind === 'loading' && 'animate-spin')} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-[#213127]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-[#687267]">{description}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}

