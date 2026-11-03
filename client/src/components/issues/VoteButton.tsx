import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowBigUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import type { PublicIssue } from '@shared/issues';

interface VoteButtonProps {
  issue: PublicIssue;
  pending: boolean;
  onToggle: () => void;
}

export function VoteButton({ issue, pending, onToggle }: VoteButtonProps) {
  const [burst, setBurst] = useState(false);
  const previousVoted = useRef(issue.voted);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (issue.voted && !previousVoted.current) {
      setBurst(true);
      const timer = window.setTimeout(() => setBurst(false), 460);
      previousVoted.current = issue.voted;
      return () => window.clearTimeout(timer);
    }
    previousVoted.current = issue.voted;
    return undefined;
  }, [issue.voted]);

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={issue.voted}
      aria-label={`${issue.voted ? 'Remove upvote from' : 'Upvote'} “${issue.title}” — ${issue.votes} ${issue.votes === 1 ? 'vote' : 'votes'}`}
      whileTap={reduceMotion || pending ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.14 }}
      className={cn(
        'group inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-[12px] font-medium transition-colors disabled:cursor-wait disabled:opacity-60',
        issue.voted
          ? 'border-lime/30 bg-lime/[0.09] text-lime hover:border-lime/45 hover:bg-lime/[0.13]'
          : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:bg-white/[0.04] hover:text-ink',
      )}
    >
      <span className="relative flex size-5 items-center justify-center">
        <AnimatePresence>
          {burst ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full border border-lime/65"
              initial={{ opacity: 0.7, scale: 0.55 }}
              animate={{ opacity: 0, scale: 2.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.44, ease: 'easeOut' }}
            />
          ) : null}
        </AnimatePresence>
        <motion.span
          className="flex"
          animate={burst && !reduceMotion ? { scale: [1, 1.22, 1], y: [0, -1.5, 0] } : { scale: 1, y: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <ArrowBigUp
            aria-hidden="true"
            className={cn('size-[18px] transition-colors', issue.voted ? 'text-lime' : 'text-faint group-hover:text-ink')}
            fill={issue.voted ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </motion.span>
      </span>
      <span className="tabular-nums">{issue.votes}</span>
      <span className="sr-only" aria-live="polite">
        {issue.votes} {issue.votes === 1 ? 'vote' : 'votes'}
      </span>
    </motion.button>
  );
}
