import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Plus, RefreshCw, ThumbsUp } from 'lucide-react';
import { ISSUE_CATEGORIES, type IssueCategory } from '@shared/support';
import type { PublicIssue } from '@shared/issues';
import { ApiError, listPublicIssues, togglePublicIssueVote } from '@/lib/api';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { IssueCard } from '@/components/issues/IssueCard';
import { buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { preferredScrollBehavior } from '@/lib/motion';
import { useToast } from '@/components/ui/Toast';

type BoardState = 'loading' | 'ready' | 'error';

export function IssuesPage() {
  const [issues, setIssues] = useState<PublicIssue[]>([]);
  const [state, setState] = useState<BoardState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [category, setCategory] = useState<IssueCategory | 'all'>('all');
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const location = useLocation();
  const createdIssueId =
    (location.state as { createdIssueId?: string } | null)?.createdIssueId ?? null;
  const linkedIssueId = /^#IS-[0-9A-Z]{6}$/i.test(location.hash)
    ? location.hash.slice(1).toUpperCase()
    : null;
  const focusIssueId = createdIssueId ?? linkedIssueId;

  usePageMeta({
    title: 'Community Issue Board',
    description:
      'See public bugs and requests reported by the Rizz community, upvote the issues you also experience, and submit a new report.',
  });

  const load = useCallback(async () => {
    setState('loading');
    setErrorMessage('');
    try {
      const data = await listPublicIssues();
      setIssues(data.issues);
      setState('ready');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'The issue board could not be loaded. Check your connection and try again.',
      );
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (state !== 'ready' || !focusIssueId) return;
    const node = document.getElementById(focusIssueId);
    if (!node) return;
    const timer = window.setTimeout(() => {
      node.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'center' });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [state, focusIssueId]);

  const counts = useMemo(() => {
    const next = new Map<string, number>();
    for (const issue of issues) next.set(issue.category, (next.get(issue.category) ?? 0) + 1);
    return next;
  }, [issues]);

  const visibleIssues = useMemo(
    () => (category === 'all' ? issues : issues.filter((issue) => issue.category === category)),
    [issues, category],
  );

  const handleVote = async (issue: PublicIssue) => {
    if (pendingVotes[issue.id]) return;
    setPendingVotes((current) => ({ ...current, [issue.id]: true }));
    setIssues((current) =>
      current.map((entry) =>
        entry.id === issue.id
          ? {
              ...entry,
              voted: !entry.voted,
              votes: Math.max(0, entry.votes + (entry.voted ? -1 : 1)),
            }
          : entry,
      ),
    );

    try {
      const data = await togglePublicIssueVote(issue.id);
      setIssues((current) => current.map((entry) => (entry.id === data.issue.id ? data.issue : entry)));
    } catch (error) {
      setIssues((current) => current.map((entry) => (entry.id === issue.id ? issue : entry)));
      toast({
        title: 'Your vote was not saved',
        description:
          error instanceof ApiError ? error.message : 'Check your connection and try again.',
        tone: 'error',
      });
    } finally {
      setPendingVotes((current) => {
        const next = { ...current };
        delete next[issue.id];
        return next;
      });
    }
  };

  const total = issues.length;
  const summary =
    state === 'ready'
      ? `${total} ${total === 1 ? 'community report' : 'community reports'}`
      : state === 'loading'
        ? 'Loading community reports'
        : 'Community reports unavailable';

  return (
    <>
      <PageHeader
        eyebrow="Community"
        breadcrumbs={[{ label: 'Support', to: '/' }, { label: 'Issue board' }]}
        title="Community issue board"
        description="See what other people are running into, upvote the issues that affect you too, and add a public report. Votes are saved so the most widespread problems are easy to spot."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/issues/new" className={buttonClasses({ size: 'md' })}>
            <Plus aria-hidden="true" className="size-4" />
            Report an issue
          </Link>
          <p className="text-[11.5px] text-faint" aria-live="polite">
            {summary}
          </p>
        </div>
      </PageHeader>

      <section className="container-page section-compact" aria-labelledby="issue-list-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-14">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="issue-list-heading" className="text-[13px] font-medium text-ink">
                Public reports
              </h2>
              <p className="text-[11px] text-faint">Sorted by upvotes</p>
            </div>

            <div
              className="no-scrollbar -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1"
              role="group"
              aria-label="Filter issues by category"
            >
              <button
                type="button"
                onClick={() => setCategory('all')}
                aria-pressed={category === 'all'}
                className="filter-chip shrink-0"
              >
                All reports
                <span className="filter-count">{total}</span>
              </button>
              {ISSUE_CATEGORIES.map((entry) => {
                const count = counts.get(entry.value) ?? 0;
                return (
                  <button
                    key={entry.value}
                    type="button"
                    onClick={() => setCategory(entry.value)}
                    aria-pressed={category === entry.value}
                    className="filter-chip shrink-0"
                  >
                    {entry.label}
                    {count > 0 ? <span className="filter-count">{count}</span> : null}
                  </button>
                );
              })}
            </div>

            {state === 'loading' ? (
              <div className="mt-5 space-y-3" aria-label="Loading public reports">
                {[0, 1, 2].map((entry) => (
                  <div
                    key={entry}
                    className="rounded-panel border border-line-subtle bg-card p-5 sm:p-6"
                  >
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="mt-5 h-5 w-3/4" />
                    <Skeleton className="mt-3 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <Skeleton className="mt-6 h-11 w-28" />
                  </div>
                ))}
              </div>
            ) : null}

            {state === 'error' ? (
              <div
                role="alert"
                className="mt-5 rounded-card border border-error/25 bg-error/[0.05] p-5 sm:p-6"
              >
                <p className="text-[13px] font-medium text-ink">The issue board did not load</p>
                <p className="mt-1.5 max-w-[48ch] text-[12px] leading-relaxed text-muted">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'mt-4' })}
                >
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Try again
                </button>
              </div>
            ) : null}

            {state === 'ready' && visibleIssues.length > 0 ? (
              <div className="mt-5 space-y-3">
                {visibleIssues.map((issue, index) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    index={index}
                    pending={Boolean(pendingVotes[issue.id])}
                    highlighted={issue.id === focusIssueId}
                    onToggleVote={() => void handleVote(issue)}
                  />
                ))}
              </div>
            ) : null}

            {state === 'ready' && visibleIssues.length === 0 ? (
              <div className="mt-5 flex flex-col items-start rounded-card border border-line-subtle bg-card px-6 py-10 sm:items-center sm:py-14 sm:text-center">
                <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-faint">
                  <ThumbsUp aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 text-[16px] font-medium tracking-[-0.02em] text-ink">
                  {total === 0 ? 'No public reports yet' : 'No reports in this category'}
                </h3>
                <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
                  {total === 0
                    ? 'Be the first to describe a bug or request. Other people can upvote it once it is on the board.'
                    : 'Try another category, or add the first report for this one.'}
                </p>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  {total > 0 ? (
                    <button
                      type="button"
                      onClick={() => setCategory('all')}
                      className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                    >
                      Show all reports
                    </button>
                  ) : null}
                  <Link to="/issues/new" className={buttonClasses({ size: 'sm' })}>
                    Report an issue
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          <aside aria-label="About the issue board" className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line-subtle bg-card p-5">
              <p className="text-[12.5px] font-medium text-ink">How this board works</p>
              <p className="mt-2 text-[11.5px] leading-[1.7] text-muted">
                Upvote a report if you are experiencing the same thing. Votes are saved and help
                show which problems affect the most people.
              </p>
              <p className="mt-3 text-[11.5px] leading-[1.7] text-muted">
                Reports are public. Do not include email addresses, passwords, or private account
                details.
              </p>
            </div>

            <div className="rounded-card border border-line-subtle bg-surface/60 p-5">
              <p className="text-[12.5px] font-medium text-ink">Need a private reply?</p>
              <p className="mt-2 text-[11.5px] leading-[1.7] text-muted">
                Submit a support request with your contact details. Off the public board, only the
                support team can see it.
              </p>
              <div className="mt-4 grid gap-2">
                <Link to="/submit" className={buttonClasses({ size: 'sm', className: 'w-full' })}>
                  Submit a request
                </Link>
                <Link
                  to="/track"
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'w-full' })}
                >
                  Track a request
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
