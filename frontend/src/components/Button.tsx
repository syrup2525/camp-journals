import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils/cx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#31533b] text-white hover:bg-[#26442f]',
  secondary: 'bg-white text-[#24372b] ring-1 ring-[#cfc7b6] hover:bg-[#f4efe5]',
  danger: 'bg-[#b44535] text-white hover:bg-[#93372b]',
  ghost: 'bg-transparent text-[#31533b] hover:bg-[#e9efe8]',
};

export function Button({ children, className, icon, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      className={cx(
        'focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-55',
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

