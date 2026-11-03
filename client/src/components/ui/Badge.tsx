import { cn } from '@/lib/cn';
import { statusMeta } from '@shared/support';

export type BadgeTone = 'lime' | 'blue' | 'amber' | 'mint' | 'neutral' | 'red';

const TONE_CLASSES: Record<BadgeTone, string> = {
  lime: 'border-lime/20 bg-lime/[0.08] text-lime',
  blue: 'border-info/20 bg-info/10 text-info',
  amber: 'border-warning/20 bg-warning/10 text-warning',
  mint: 'border-success/20 bg-success/10 text-success',
  neutral: 'border-line bg-white/[0.03] text-muted',
  red: 'border-error/25 bg-error/10 text-error',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
  dot = false,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none tracking-[0.01em]',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, BadgeTone> = {
  open: 'lime',
  in_progress: 'blue',
  waiting_for_user: 'amber',
  resolved: 'mint',
  closed: 'neutral',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = statusMeta(status);
  return (
    <Badge tone={STATUS_TONES[meta.value] ?? 'neutral'} dot className={className}>
      {meta.label}
    </Badge>
  );
}
