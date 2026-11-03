import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

// Local, verified brand mark. The remote cat logo returns a server error and
// caused a broken-image flash in the header, so it is not requested at runtime.
const BRAND_MARK = '/brand/rizz-mark.svg';

export function BrandMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-[#0f140e]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={BRAND_MARK}
        alt=""
        aria-hidden="true"
        width={size - 8}
        height={size - 8}
        className="object-contain"
        draggable={false}
      />
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <BrandMark size={compact ? 28 : 30} />
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="text-[15px] font-semibold tracking-[-0.025em] text-ink">Rizz</span>
        <span aria-hidden="true" className="h-3.5 w-px self-center bg-line" />
        <span className="truncate text-[12.5px] font-normal tracking-[-0.005em] text-muted">
          <span className="sm:hidden">Support</span>
          <span className="hidden sm:inline">Support Center</span>
        </span>
      </span>
    </span>
  );
}

export function BrandHomeLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Rizz Support Center home"
      className="group inline-flex min-h-11 min-w-0 items-center rounded-lg transition-opacity hover:opacity-90"
    >
      <BrandLockup compact={compact} />
    </Link>
  );
}
