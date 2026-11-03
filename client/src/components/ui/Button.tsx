import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-lime text-[#0A0E08] hover:bg-lime-deep active:bg-[#8ed71f] shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_10px_30px_-12px_rgba(183,255,50,0.45)]',
  secondary:
    'border border-line-strong bg-raised/60 text-ink hover:bg-raised hover:border-lime/30',
  ghost: 'text-muted hover:text-ink hover:bg-white/[0.045]',
  subtle: 'border border-lime/20 bg-lime/[0.08] text-lime hover:bg-lime/[0.13] hover:border-lime/30',
  danger:
    'border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15 hover:border-red-400/40',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2 rounded-xl',
};

export function buttonClasses({ variant = 'primary', size = 'md', className }: StyleOptions = {}): string {
  return cn(
    'inline-flex select-none items-center justify-center font-medium tracking-[-0.01em] transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, loadingLabel = 'Loading', className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});
