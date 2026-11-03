import { cn } from '@/lib/cn';
import { statusMeta } from '@shared/support';

export type BadgeTone = 'lime' | 'blue' | 'amber' | 'mint' | 'neutral' | 'red';

const TONE_CLASSES: Record<BadgeTone, string> = {
  lime: 'border-lime/25 bg-lime/10 text-lime',
  blue: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  mint: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  neutral: 'border-line bg-white/[0.03] text-muted',
  red: 'border-red-400/25 bg-red-400/10 text-red-200',
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
