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
    'bg-lime text-[#0A0E08] shadow-[0_1px_0_rgba(255,255,255,0.22)_inset] hover:bg-lime-deep active:bg-[#9bea26]',
  secondary:
    'border border-line bg-raised text-ink hover:border-line-strong hover:bg-elevated',
  ghost: 'text-muted hover:bg-white/[0.04] hover:text-ink',
  subtle:
    'border border-line bg-white/[0.025] text-ink hover:border-line-strong hover:bg-white/[0.045]',
  danger:
    'border border-error/25 bg-error/10 text-error hover:border-error/40 hover:bg-error/15',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13px] gap-2 rounded-[10px]',
  lg: 'h-11 px-5 text-[13.5px] gap-2 rounded-xl',
};

export function buttonClasses({ variant = 'primary', size = 'md', className }: StyleOptions = {}): string {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium tracking-[-0.005em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
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
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel = 'Loading',
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
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
