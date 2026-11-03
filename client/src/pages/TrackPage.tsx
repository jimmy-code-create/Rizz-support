import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CircleAlert,
  Clock3,
  LifeBuoy,
  Mail,
  MessageSquare,
  RefreshCw,
  SearchX,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import {
  TICKET_REFERENCE_PATTERN,
  TICKET_STATUSES,
  issueCategoryLabel,
  priorityLabel,
} from '@shared/support';
import type { TicketDetail } from '@shared/ticket';
import { ApiError, lookupSupportTicket } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { usePageMeta } from '@/lib/seo';
import { preferredScrollBehavior } from '@/lib/motion';
import { PageHeader } from '@/components/support/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { buttonClasses } from '@/components/ui/Button';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[A-Za-z]{2,}$/;

const STATUS_DOT: Record<string, string> = {
  open: 'bg-lime',
  in_progress: 'bg-info',
  waiting_for_user: 'bg-warning',
  resolved: 'bg-success',
  closed: 'bg-muted/60',
};

type ViewState = 'idle' | 'loading' | 'found' | 'notfound' | 'error';

const AUTHOR_LABEL: Record<string, string> = {
  support: 'Rizz Support',
  system: 'Support system',
  user: 'You',
};

function ResultSkeleton() {
  return (
    <div className="mt-5 rounded-card border border-line-subtle bg-card p-6" aria-busy="true" aria-label="Loading request">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/5" />
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-7 h-24 w-full" />
    </div>
  );
}

export function TrackPage() {
  const [searchParams] = useSearchParams();
  const initialReference = (searchParams.get('ticket') ?? '').toUpperCase();
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ reference?: string; email?: string }>({});
  const [view, setView] = useState<ViewState>('idle');
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const inFlight = useRef(false);
  const reduceMotion = usePrefersReducedMotion();

  usePageMeta({
    title: 'Track a Support Request',
    description:
      'Check the real status of a Rizz support request using your ticket reference and email address.',
  });

  useEffect(() => {
    const fromUrl = (searchParams.get('ticket') ?? '').toUpperCase();
    if (fromUrl) setReference(fromUrl);
  }, [searchParams]);

  const validate = () => {
    const next: { reference?: string; email?: string } = {};
    if (!reference.trim()) next.reference = 'Enter your ticket reference.';
    else if (!TICKET_REFERENCE_PATTERN.test(reference.trim().toUpperCase())) {
      next.reference = 'References look like RZ-ABC123.';
    }
    if (!email.trim()) next.email = 'Enter the email address used on the request.';
    else if (!EMAIL_PATTERN.test(email.trim())) next.email = 'Enter a valid email address.';
    return next;
  };

  const runLookup = async (nextReference: string, nextEmail: string, isRefresh = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (isRefresh) setRefreshing(true);
    else setView('loading');
    setMessage(null);

    try {
      const response = await lookupSupportTicket(nextReference.toUpperCase(), nextEmail.trim());
      setTicket(response.ticket);
      setView('found');
      if (!isRefresh) {
        window.requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
          resultHeadingRef.current?.focus({ preventScroll: true });
        });
      }
    } catch (error) {
      setTicket(null);
      if (error instanceof ApiError && error.status === 404) {
        setView('notfound');
        setMessage(error.message);
      } else {
        setView('error');
        setMessage(
          error instanceof ApiError
            ? error.message
            : 'We could not reach the support service. Check your connection and try again.',
        );
      }
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const first = nextErrors.reference ? 'track-reference' : 'track-email';
      document.getElementById(first)?.focus();
      return;
    }
    void runLookup(reference.trim(), email);
  };

  const resetLookup = () => {
    setView('idle');
    setTicket(null);
    setMessage(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Ticket tracking"
        breadcrumbs={[{ label: 'Support', to: '/' }, { label: 'Track a request' }]}
        title="Track a support request"
        description="Enter the reference from your confirmation and the email address you used. Status and responses are read directly from your support record."
      />

      <div className="container-page section-compact">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_296px] lg:items-start lg:gap-14">
          <div className="min-w-0">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-panel border border-line-subtle bg-card p-5 shadow-card sm:p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="track-reference"
                  name="reference"
                  label="Ticket reference"
                  required
                  autoFocus={Boolean(initialReference)}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={9}
                  placeholder="RZ-ABC123"
                  hint="Nine characters, including the RZ- prefix."
                  className="font-mono uppercase tracking-[0.04em]"
                  value={reference}
                  onChange={(event) => {
                    setReference(event.target.value.toUpperCase());
                    setErrors((current) => ({ ...current, reference: undefined }));
                    if (view === 'found' || view === 'notfound' || view === 'error') resetLookup();
                  }}
                  error={attempted ? errors.reference : undefined}
                />
                <Input
                  id="track-email"
                  name="email"
                  type="email"
                  label="Email address"
                  required
                  autoComplete="email"
                  inputMode="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  hint="Must match the email on the original request."
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: undefined }));
                    if (view === 'found' || view === 'notfound' || view === 'error') resetLookup();
                  }}
                  error={attempted ? errors.email : undefined}
                />
              </div>
              <div className="mt-5 flex flex-col gap-3 border-t border-line-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-1.5 text-[10.5px] text-muted">
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  Only a matching reference and email reveal a request.
                </p>
                <Button type="submit" loading={view === 'loading'} loadingLabel="Checking..." className="w-full sm:w-auto">
                  <Ticket aria-hidden="true" className="size-4" />
                  Check status
                </Button>
              </div>
            </form>

            <div ref={resultRef} className="scroll-mt-28" aria-live="polite">
              {view === 'loading' ? <ResultSkeleton /> : null}

              {view === 'found' && ticket ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-5 overflow-hidden rounded-panel border border-line-subtle bg-card shadow-card"
                >
                  <div className="border-b border-line-subtle p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10.5px] uppercase tracking-[0.14em] text-moss-soft">Ticket reference</p>
                        <div className="mt-1.5 flex items-center gap-2.5">
                          <p className="font-mono text-[17px] tracking-[0.05em] text-lime">{ticket.reference}</p>
                          <CopyButton value={ticket.reference} label="Copy" />
                        </div>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>

                    <h2
                      ref={resultHeadingRef}
                      tabIndex={-1}
                      className="mt-4 break-words text-[1.15rem] font-medium leading-snug tracking-[-0.02em] text-ink focus:outline-none"
                    >
                      {ticket.subject}
                    </h2>

                    <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-line-subtle pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-moss-soft">Submitted</dt>
                        <dd className="mt-1 break-words text-[12px] text-ink">{formatDateTime(ticket.createdAt) ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-moss-soft">Last updated</dt>
                        <dd className="mt-1 break-words text-[12px] text-ink">{formatDateTime(ticket.updatedAt) ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-moss-soft">Category</dt>
                        <dd className="mt-1 text-[12px] text-ink">{issueCategoryLabel(ticket.category)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.12em] text-moss-soft">Priority</dt>
                        <dd className="mt-1">
                          <Badge tone={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'amber' : 'neutral'}>
                            {priorityLabel(ticket.priority)}
                          </Badge>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-moss-soft">Your description</h3>
                    <p className="mt-2.5 whitespace-pre-line break-words text-[13px] leading-[1.8] text-ink-soft">
                      {ticket.description}
                    </p>
                    {ticket.browserInfo ? (
                      <p className="mt-3 text-[11px] text-muted">
                        <span className="text-moss-soft">Browser / device:</span> {ticket.browserInfo}
                      </p>
                    ) : null}
                    {ticket.attachmentName ? (
                      <p className="mt-2 text-[11px] text-muted">
                        <span className="text-moss-soft">Attachment:</span> {ticket.attachmentName}
                      </p>
                    ) : null}
                  </div>

                  <div className="border-t border-line-subtle bg-surface/40 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-moss-soft">Response history</h3>
                      <button
                        type="button"
                        onClick={() => void runLookup(reference, email, true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-lime disabled:opacity-60"
                      >
                        <RefreshCw aria-hidden="true" className={cn('size-3', refreshing && 'animate-spin')} />
                        {refreshing ? 'Refreshing' : 'Refresh'}
                      </button>
                    </div>

                    {ticket.messages.length > 0 ? (
                      <ol className="mt-4 space-y-0">
                        {ticket.messages.map((entry, index) => {
                          const when = formatDateTime(entry.createdAt);
                          const isSupport = entry.author === 'support';
                          return (
                            <li key={entry.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                              {index < ticket.messages.length - 1 ? (
                                <span aria-hidden="true" className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-line" />
                              ) : null}
                              <span
                                className={cn(
                                  'relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border',
                                  isSupport
                                    ? 'border-lime/30 bg-lime/10 text-lime'
                                    : 'border-line bg-raised text-muted',
                                )}
                              >
                                {isSupport ? (
                                  <MessageSquare aria-hidden="true" className="size-3" />
                                ) : (
                                  <Clock3 aria-hidden="true" className="size-3" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1 rounded-xl border border-line bg-card p-3.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[11.5px] font-medium text-ink">
                                    {AUTHOR_LABEL[entry.author] ?? 'Support'}
                                  </p>
                                  {entry.status ? <StatusBadge status={entry.status} /> : null}
                                  {when ? <span className="text-[10px] text-muted">{when}</span> : null}
                                </div>
                                <p className="mt-1.5 whitespace-pre-line break-words text-[12.5px] leading-[1.75] text-ink-soft">
                                  {entry.body}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    ) : (
                      <p className="mt-3 text-[12px] text-muted">No responses have been added to this request yet.</p>
                    )}
                  </div>

                  <div className="flex flex-col items-start justify-between gap-3 border-t border-line-subtle p-5 sm:flex-row sm:items-center sm:p-6">
                    <p className="flex items-center gap-1.5 text-[10.5px] text-muted">
                      <CalendarClock aria-hidden="true" className="size-3.5" />
                      Status shown as of {formatDateTime(ticket.updatedAt) ?? 'the last update'}.
                    </p>
                    <Link to="/submit" className="text-[11.5px] font-medium text-lime transition-colors hover:text-lime-deep">
                      Submit a new request
                    </Link>
                  </div>
                </motion.div>
              ) : null}

              {view === 'notfound' ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  className="mt-5 rounded-card border border-line-subtle bg-card p-6"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-muted">
                    <SearchX aria-hidden="true" className="size-5" />
                  </span>
                  <h2 className="mt-4 text-[15px] font-medium text-ink">No matching request</h2>
                  <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
                    {message ??
                      'We could not find a request with that reference and email address.'}{' '}
                    Check that the reference is copied exactly and that the email matches the one you
                    submitted. For privacy, we cannot confirm whether a reference exists on its own.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetLookup();
                        document.getElementById('track-reference')?.focus();
                      }}
                      className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                    >
                      Try again
                    </button>
                    <Link
                      to="/submit"
                      className={buttonClasses({ size: 'sm' })}
                    >
                      Submit a request
                      <ArrowRight aria-hidden="true" className="size-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ) : null}

              {view === 'error' ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                  className="mt-5 rounded-card border border-error/25 bg-error/[0.05] p-6"
                  role="alert"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-error/25 bg-error/10 text-error">
                    <CircleAlert aria-hidden="true" className="size-5" />
                  </span>
                  <h2 className="mt-4 text-[15px] font-medium text-ink">Tracking is unavailable right now</h2>
                  <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
                    {message ?? 'We could not reach the support service. Please try again in a moment.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void runLookup(reference.trim(), email)}
                    className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'mt-5' })}
                  >
                    <RefreshCw aria-hidden="true" className="size-3.5" />
                    Retry lookup
                  </button>
                </motion.div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-28">
            <div className="rounded-card border border-line-subtle bg-card p-5">
              <h2 className="text-[12.5px] font-medium text-ink">What each status means</h2>
              <ul className="mt-3.5 space-y-3">
                {TICKET_STATUSES.map((status) => (
                  <li key={status.value} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', STATUS_DOT[status.value])}
                    />
                    <div>
                      <p className="text-[11.5px] font-medium text-ink">{status.label}</p>
                      <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted">{status.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-line-subtle bg-surface/60 p-5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <Mail aria-hidden="true" className="size-4 text-moss-soft" />
                Keep your reference
              </h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                The reference is in your confirmation screen. We do not publish support phone numbers or
                email addresses, and support will never ask for your password.
              </p>
            </div>

            <div className="rounded-card border border-line-subtle bg-surface/40 p-5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <LifeBuoy aria-hidden="true" className="size-4 text-moss-soft" />
                Lost your reference?
              </h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                Submit a new request explaining that you cannot find the original reference. Include the
                email address you used so the team can look into it.
              </p>
              <Link to="/submit" className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-lime hover:text-lime-deep">
                Submit a request
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
