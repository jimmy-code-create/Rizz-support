import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

const OFFICIAL_LOGO = 'https://rizzapp.onrender.com/brand/rizz-cat-logo.svg';
const FALLBACK_LOGO = '/brand/rizz-mark.svg';

export function BrandMark({ size = 30, className }: { size?: number; className?: string }) {
  const [src, setSrc] = useState(OFFICIAL_LOGO);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-line-strong bg-[#0f140e]',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        width={size - 8}
        height={size - 8}
        className="object-contain"
        onError={() => setSrc(FALLBACK_LOGO)}
        draggable={false}
      />
    </span>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <BrandMark size={compact ? 28 : 32} />
      <span className="flex items-baseline gap-2">
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Rizz</span>
        <span aria-hidden="true" className="h-3.5 w-px self-center bg-line-strong" />
        <span className="text-[13px] font-normal tracking-[-0.01em] text-muted">Support Center</span>
      </span>
    </span>
  );
}

export function BrandHomeLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" aria-label="Rizz Support Center home" className="group inline-flex rounded-lg">
      <BrandLockup compact={compact} />
    </Link>
  );
}
