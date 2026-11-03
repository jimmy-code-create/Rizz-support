import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  LifeBuoy,
  Paperclip,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import {
  ALLOWED_ATTACHMENT_TYPES,
  ISSUE_CATEGORIES,
  TICKET_LIMITS,
  TICKET_PRIORITIES,
  issueCategoryLabel,
  priorityLabel,
  type IssueCategory,
  type TicketPriority,
} from '@shared/support';
import { ISSUE_ID_PATTERN } from '@shared/issues';
import type { TicketSummary } from '@shared/ticket';
import { ApiError, submitSupportRequest } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import { usePageMeta } from '@/lib/seo';
import { preferredScrollBehavior } from '@/lib/motion';
import { PageHeader } from '@/components/support/PageHeader';
import { Button } from '@/components/ui/Button';
import { buttonClasses } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { CopyButton } from '@/components/ui/CopyButton';
import { StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[A-Za-z]{2,}$/;
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.txt'];

interface FormValues {
  name: string;
  email: string;
  category: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  browserInfo: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMPTY_VALUES: FormValues = {
  name: '',
  email: '',
  category: '',
  subject: '',
  description: '',
  priority: 'normal',
  browserInfo: '',
};

const CATEGORY_FROM_TOPIC: Record<string, IssueCategory> = {
  account: 'account',
  bugs: 'bug',
  features: 'feature',
  safety: 'safety',
  payments: 'other',
  general: 'other',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your full name (at least 2 characters).';
  if (!values.email.trim()) errors.email = 'Enter the email address linked to your request.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address, such as you@example.com.';
  if (!ISSUE_CATEGORIES.some((category) => category.value === values.category)) {
    errors.category = 'Choose the issue category that fits best.';
  }
  if (values.subject.trim().length < 4) errors.subject = 'Add a short subject (at least 4 characters).';
  if (values.description.trim().length < 30) {
    errors.description = `Add at least 30 characters so we can understand the issue (${values.description.trim().length} so far).`;
  }
  if (values.browserInfo.trim().length > TICKET_LIMITS.browserInfo) {
    errors.browserInfo = `Keep this under ${TICKET_LIMITS.browserInfo} characters.`;
  }
  return errors;
}

function validateFile(file: File): string | null {
  const dot = file.name.lastIndexOf('.');
  const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Attach a PNG, JPEG, WebP, PDF, or TXT file.';
  }
  const declaredType = file.type.toLowerCase();
  const mimeAllowed = ALLOWED_ATTACHMENT_TYPES.some(
    (entry) => entry.mime === declaredType || (entry.mime === 'image/jpeg' && declaredType === 'image/jpg'),
  );
  if (declaredType && !mimeAllowed) {
    return 'That file type is not supported. Attach a PNG, JPEG, WebP, PDF, or TXT file.';
  }
  if (file.size === 0) return 'That file is empty. Choose another file.';
  if (file.size > TICKET_LIMITS.attachmentBytes) return 'That file is larger than 5 MB. Choose a smaller file.';
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line-subtle pt-7 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.02] font-mono text-[10.5px] text-muted">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-[14px] font-medium tracking-[-0.01em] text-ink">{title}</h2>
          <p className="mt-1 max-w-[52ch] text-[11.5px] leading-relaxed text-faint">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function SubmitPage() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('category') ?? '';
  const subjectParam = searchParams.get('subject') ?? '';
  const descriptionParam = searchParams.get('description') ?? '';
  const issueParam = searchParams.get('issue')?.toUpperCase() ?? '';
  const relatedIssue = ISSUE_ID_PATTERN.test(issueParam) ? issueParam : '';
  const initialValues = useMemo<FormValues>(
    () => ({
      ...EMPTY_VALUES,
      category: CATEGORY_FROM_TOPIC[topic] ?? '',
      subject: subjectParam.slice(0, TICKET_LIMITS.subject),
      description: descriptionParam.slice(0, TICKET_LIMITS.description),
    }),
    [topic, subjectParam, descriptionParam],
  );

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [duplicateReference, setDuplicateReference] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketSummary | null>(null);
  const [pending, setPending] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const submittingRef = useRef(false);
  const { toast } = useToast();

  usePageMeta({
    title: ticket ? 'Request received' : 'Submit a Support Request',
    description: ticket
      ? 'Your support request has been saved. Keep your reference number to track its status.'
      : 'Submit a support request to Rizz. Include the details the team needs and get a real ticket reference you can track.',
    noindex: Boolean(ticket),
  });

  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    if (ticket) successHeadingRef.current?.focus();
  }, [ticket]);

  useEffect(() => {
    if (!topic) return;
    const mapped = CATEGORY_FROM_TOPIC[topic];
    if (mapped) setValues((current) => ({ ...current, category: mapped }));
  }, [topic]);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
    if (serverError) setServerError(null);
  };

  const handleFile = (candidate: File | null) => {
    if (!candidate) {
      setFile(null);
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const message = validateFile(candidate);
    if (message) {
      setFile(null);
      setFileError(message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(candidate);
    setFileError(null);
  };

  const focusFirstError = (nextErrors: FormErrors) => {
    const order: Array<keyof FormValues> = [
      'name',
      'email',
      'category',
      'subject',
      'description',
      'priority',
      'browserInfo',
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    window.requestAnimationFrame(() => {
      const element = document.getElementById(`ticket-${first}`);
      element?.focus({ preventScroll: false });
      element?.scrollIntoView({ block: 'center', behavior: preferredScrollBehavior() });
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    setAttempted(true);
    setServerError(null);
    setDuplicateReference(null);

    const nextErrors = validate(values);
    if (fileError) setFileError(fileError);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || fileError) {
      focusFirstError(nextErrors);
      return;
    }

    submittingRef.current = true;

    const body = new FormData();
    body.append('name', values.name.trim());
    body.append('email', values.email.trim());
    body.append('category', values.category);
    body.append('subject', values.subject.trim());
    body.append('description', values.description.trim());
    body.append('priority', values.priority);
    if (values.browserInfo.trim()) body.append('browserInfo', values.browserInfo.trim());
    body.append('website', '');
    if (file) body.append('attachment', file);

    try {
      setPending(true);
      const response = await submitSupportRequest(body);
      if (!response?.ticket?.reference) {
        throw new ApiError('The request was submitted but no reference was returned. Please contact us again.', {
          status: 502,
          code: 'MISSING_REFERENCE',
        });
      }
      setTicket(response.ticket);
      toast({
        title: 'Request received',
        description: `Your reference is ${response.ticket.reference}.`,
        tone: 'success',
      });
      window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === 'DUPLICATE_REQUEST' && error.reference) {
          setDuplicateReference(error.reference);
          setServerError(error.message);
        } else {
          if (Object.keys(error.fields).length > 0) {
            setErrors((current) => ({ ...current, ...error.fields }));
            focusFirstError(error.fields as FormErrors);
          }
          setServerError(error.message);
        }
      } else {
        setServerError('Something went wrong while submitting your request. Please try again.');
      }
      toast({ title: 'Request not submitted', tone: 'error' });
      formTopRef.current?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
    } finally {
      setPending(false);
      submittingRef.current = false;
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setAttempted(false);
    setFile(null);
    setFileError(null);
    setServerError(null);
    setDuplicateReference(null);
    setTicket(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: preferredScrollBehavior() });
  };

  if (ticket) {
    const submitted = formatDateTime(ticket.createdAt);
    return (
      <section className="relative overflow-hidden">
        <div className="hero-ambient opacity-80" aria-hidden="true" />
        <div className="container-page relative max-w-3xl section-compact">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
            className="rounded-panel border border-line-subtle bg-card p-6 shadow-card sm:p-9"
          >
            <span className="flex size-12 items-center justify-center rounded-2xl border border-lime/25 bg-lime/[0.08] text-lime">
              <CheckCircle2 aria-hidden="true" className="size-6" />
            </span>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">Request received</p>
            <h1
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-2.5 text-[1.9rem] font-semibold leading-tight tracking-[-0.035em] text-ink focus:outline-none sm:text-[2.2rem]"
            >
              Your request is in.
            </h1>
            <p className="mt-3 max-w-xl text-[13.5px] leading-[1.75] text-muted">
              Your support request was saved and is queued for review. Keep the reference below — you
              will need it, together with this email address, to track the request.
            </p>

            <div className="mt-7 flex flex-col gap-3 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10.5px] uppercase tracking-[0.14em] text-moss-soft">Ticket reference</p>
                <p className="mt-1.5 select-all font-mono text-[19px] tracking-[0.06em] text-lime">
                  {ticket.reference}
                </p>
              </div>
              <CopyButton value={ticket.reference} label="Copy reference" />
            </div>

            <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-line-subtle pt-6 sm:grid-cols-2">
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Subject</dt>
                <dd className="mt-1 break-words text-[13px] text-ink">{ticket.subject}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Category</dt>
                <dd className="mt-1 text-[13px] text-ink">{issueCategoryLabel(ticket.category)}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Priority</dt>
                <dd className="mt-1 text-[13px] text-ink">{priorityLabel(ticket.priority)}</dd>
              </div>
              {submitted ? (
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Submitted</dt>
                  <dd className="mt-1 text-[13px] text-ink">{submitted}</dd>
                </div>
              ) : null}
              {ticket.attachmentName ? (
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.12em] text-moss-soft">Attachment</dt>
                  <dd className="mt-1 truncate text-[13px] text-ink">{ticket.attachmentName}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-8 flex flex-col gap-2 border-t border-line-subtle pt-6 sm:flex-row">
              <Link
                to={`/track?ticket=${encodeURIComponent(ticket.reference)}`}
                className={buttonClasses({ size: 'lg' })}
              >
                Track this request
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <button type="button" onClick={resetForm} className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
                Submit another request
              </button>
            </div>

            <p className="mt-5 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
              <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              Tracking requires the ticket reference and the email address you entered above. This
              portal does not send an email confirmation.
            </p>
          </motion.div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { step: '01', title: 'Queued', body: 'Your request is saved with an Open status.' },
              { step: '02', title: 'Review', body: 'The team reads it and may ask for more detail.' },
              { step: '03', title: 'Tracking', body: 'Follow real updates with your reference.' },
            ].map((item) => (
              <div key={item.step} className="rounded-card border border-line-subtle bg-surface/60 p-4">
                <p className="font-mono text-[10px] text-moss-soft">{item.step}</p>
                <p className="mt-2 text-[12.5px] font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Submit a request"
        breadcrumbs={[
          { label: 'Support', to: '/' },
          { label: 'Submit a request' },
        ]}
        title="Tell us what's going on"
        description="Share the details once and get a real ticket reference back. Fields marked with an asterisk are required."
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-faint">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-moss-soft" />
            Never share your password or sign-in codes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Info aria-hidden="true" className="size-3.5 text-moss-soft" />
            Four short sections
          </span>
        </div>
      </PageHeader>

      <div className="container-page section-compact" ref={formTopRef}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-14">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-w-0 rounded-panel border border-line-subtle bg-card/60 p-5 sm:p-7"
          >
            {relatedIssue ? (
              <div
                role="note"
                className="mb-6 flex items-start gap-2.5 rounded-xl border border-lime/20 bg-lime/[0.05] p-4 text-[11.5px] leading-relaxed text-ink-soft"
              >
                <Info aria-hidden="true" className="mt-px size-4 shrink-0 text-lime" />
                <p>
                  Following up on public issue{' '}
                  <Link to={`/issues#${relatedIssue}`} className="font-mono text-lime hover:text-lime-deep">
                    {relatedIssue}
                  </Link>
                  . The board text is filled in below; add what happened for you. This request stays
                  private.
                </p>
              </div>
            ) : null}
            <div className="space-y-7">
              <FormSection
                step="01"
                title="Your details"
                description="So the team knows who to reply to. Use an email address you can access."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    id="ticket-name"
                    name="name"
                    label="Full name"
                    required
                    autoComplete="name"
                    maxLength={TICKET_LIMITS.name}
                    placeholder="Alex Rivera"
                    value={values.name}
                    onChange={(event) => update('name', event.target.value)}
                    error={attempted ? errors.name : undefined}
                  />
                  <Input
                    id="ticket-email"
                    name="email"
                    type="email"
                    label="Email address"
                    required
                    autoComplete="email"
                    inputMode="email"
                    maxLength={TICKET_LIMITS.email}
                    placeholder="you@example.com"
                    hint="Use the address you can access; tracking is tied to it."
                    value={values.email}
                    onChange={(event) => update('email', event.target.value)}
                    error={attempted ? errors.email : undefined}
                  />
                </div>
              </FormSection>

              <FormSection
                step="02"
                title="The issue"
                description="Tell us what happened, what you expected, and the steps that lead to it."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Select
                    id="ticket-category"
                    name="category"
                    label="Issue category"
                    required
                    value={values.category}
                    onChange={(event) => update('category', event.target.value)}
                    error={attempted ? errors.category : undefined}
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {ISSUE_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    id="ticket-subject"
                    name="subject"
                    label="Subject"
                    required
                    maxLength={TICKET_LIMITS.subject}
                    placeholder="A short summary of the problem"
                    value={values.subject}
                    onChange={(event) => update('subject', event.target.value)}
                    error={attempted ? errors.subject : undefined}
                  />
                </div>

                <div>
                  <Textarea
                    id="ticket-description"
                    name="description"
                    label="Detailed description"
                    required
                    rows={7}
                    maxLength={TICKET_LIMITS.description}
                    placeholder="What happened, what you expected, and anything you had already tried. Include the steps that lead to the problem if it can be reproduced."
                    hint="The more specific you are, the less back-and-forth we need. Never include your password or an email sign-in code."
                    value={values.description}
                    onChange={(event) => update('description', event.target.value)}
                    error={attempted ? errors.description : undefined}
                  />
                  <p
                    className={cn(
                      'mt-1.5 text-right font-mono text-[10px] tabular-nums',
                      values.description.length > TICKET_LIMITS.description - 200
                        ? 'text-warning'
                        : 'text-faint',
                    )}
                  >
                    {values.description.length.toLocaleString()} /{' '}
                    {TICKET_LIMITS.description.toLocaleString()}
                  </p>
                </div>
              </FormSection>

              <FormSection
                step="03"
                title="Additional information"
                description="Context that helps the team understand the issue. Browser details and attachments are optional."
              >
                <Input
                  id="ticket-browserInfo"
                  name="browserInfo"
                  label="Browser / device information"
                  optionalLabel="Optional"
                  maxLength={TICKET_LIMITS.browserInfo}
                  placeholder="Chrome on Windows 11, Safari on iPhone, or the Rizz app version"
                  hint="Useful for technical issues and bug reports. Do not include passwords or private messages."
                  value={values.browserInfo}
                  onChange={(event) => update('browserInfo', event.target.value)}
                  error={attempted ? errors.browserInfo : undefined}
                />

                <fieldset>
                  <legend className="text-[13px] font-medium text-ink">
                    Priority <span className="text-lime" aria-hidden="true">*</span>
                  </legend>
                  <p className="mt-1 text-[11.5px] text-faint" id="priority-hint">
                    Priority tells us how urgent the issue feels to you. It does not guarantee a response time.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {TICKET_PRIORITIES.map((priority) => {
                      const selected = values.priority === priority.value;
                      return (
                        <label
                          key={priority.value}
                          className={cn(
                            'relative flex cursor-pointer flex-col rounded-[10px] border p-3.5 transition-[border-color,background-color,box-shadow] focus-within:ring-2 focus-within:ring-lime/30',
                            selected
                              ? 'border-line-strong bg-white/[0.045]'
                              : 'border-line-subtle bg-surface/50 hover:border-line hover:bg-surface',
                          )}
                        >
                          <input
                            type="radio"
                            name="priority"
                            value={priority.value}
                            checked={selected}
                            onChange={() => update('priority', priority.value)}
                            className="sr-only"
                            aria-describedby="priority-hint"
                          />
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-medium text-ink">
                              {priority.label}
                            </span>
                            <span
                              aria-hidden="true"
                              className={cn(
                                'flex size-3.5 items-center justify-center rounded-full border',
                                selected ? 'border-lime bg-lime' : 'border-line-strong',
                              )}
                            >
                              {selected ? <span className="size-1.5 rounded-full bg-[#0A0E08]" /> : null}
                            </span>
                          </span>
                          <span className="mt-1 text-[10.5px] leading-snug text-faint">
                            {priority.hint}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-[13px] font-medium text-ink">
                    Screenshot or attachment{' '}
                    <span className="font-normal text-[11.5px] text-faint">Optional</span>
                  </legend>
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                      event.preventDefault();
                      setDragging(false);
                      handleFile(event.dataTransfer.files?.[0] ?? null);
                    }}
                    className={cn(
                      'relative mt-2 rounded-input border border-dashed p-5 transition-[border-color,background-color,box-shadow] focus-within:border-lime/50 focus-within:ring-2 focus-within:ring-lime/20',
                      dragging
                        ? 'border-lime/40 bg-lime/[0.04]'
                        : 'border-line-strong bg-surface/40 hover:border-line',
                      fileError ? 'border-error/50' : '',
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      id="ticket-attachment"
                      name="attachment"
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,image/png,image/jpeg,image/webp,application/pdf,text/plain"
                      aria-label="Attach a screenshot or supporting file"
                      onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                      aria-describedby={fileError ? 'attachment-error' : 'attachment-hint'}
                      aria-invalid={fileError ? true : undefined}
                      className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                    />
                    <div className="pointer-events-none flex flex-col items-center text-center">
                      <span className="flex size-9 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-faint">
                        <Upload aria-hidden="true" className="size-4" />
                      </span>
                      <p className="mt-2.5 text-[12px] text-ink">
                        {file ? 'Replace attachment' : 'Drop a file here or click to browse'}
                      </p>
                      <p id="attachment-hint" className="mt-1 text-[10.5px] text-faint">
                        PNG, JPEG, WebP, PDF, or TXT · up to 5 MB
                      </p>
                    </div>
                  </div>

                  {file ? (
                    <div className="relative z-20 mt-2.5 flex items-center gap-3 rounded-[10px] border border-line bg-card p-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-lime">
                        {file.type.startsWith('image/') ? (
                          <Paperclip aria-hidden="true" className="size-3.5" />
                        ) : (
                          <FileText aria-hidden="true" className="size-3.5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] text-ink">{file.name}</p>
                        <p className="text-[10.5px] text-faint">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFile(null)}
                        aria-label={`Remove ${file.name}`}
                        className="flex size-8 items-center justify-center rounded-md text-faint transition-colors hover:bg-white/5 hover:text-ink"
                      >
                        <X aria-hidden="true" className="size-3.5" />
                      </button>
                    </div>
                  ) : null}

                  {fileError ? (
                    <p id="attachment-error" role="alert" className="mt-2 flex items-center gap-1.5 text-[11.5px] text-error">
                      <AlertTriangle aria-hidden="true" className="size-3.5" />
                      {fileError}
                    </p>
                  ) : null}
                </fieldset>
              </FormSection>

              <section className="border-t border-line-subtle pt-7">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.02] font-mono text-[10.5px] text-muted">
                    04
                  </span>
                  <div>
                    <h2 className="text-[14px] font-medium tracking-[-0.01em] text-ink">
                      Review and submit
                    </h2>
                    <p className="mt-1 max-w-[52ch] text-[11.5px] leading-relaxed text-faint">
                      Check the details above, then send the request. You will get a reference number
                      only after it is saved.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="rounded-input border border-line-subtle bg-surface/40 p-4 sm:p-5">
                {errorCount > 0 && attempted ? (
                  <motion.div
                    role="alert"
                    initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    className="mb-4 rounded-xl border border-error/25 bg-error/[0.06] p-3.5 text-[12px] text-error"
                  >
                    Please check the {errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`} and try again.
                  </motion.div>
                ) : null}

                {serverError ? (
                  <motion.div
                    role="alert"
                    initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.18 }}
                    className="mb-4 rounded-xl border border-warning/25 bg-warning/[0.06] p-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
                      <div className="min-w-0">
                        <p className="text-[12.5px] text-warning">{serverError}</p>
                        {duplicateReference ? (
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="rounded-md border border-line bg-black/20 px-2 py-1 font-mono text-[11px] text-ink">
                              {duplicateReference}
                            </span>
                            <Link
                              to={`/track?ticket=${encodeURIComponent(duplicateReference)}`}
                              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-lime hover:text-lime-deep"
                            >
                              Track existing request
                              <ArrowRight aria-hidden="true" className="size-3" />
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  loading={pending}
                  loadingLabel="Submitting request..."
                  className="w-full sm:w-auto"
                >
                  Submit support request
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Button>
                <p className="mt-4 flex items-start gap-2 border-t border-line-subtle pt-4 text-[10.5px] leading-relaxed text-faint">
                  <ShieldCheck aria-hidden="true" className="mt-px size-3.5 shrink-0" />
                  We use these details only to respond to this request. Never include your password,
                  an email sign-in code, or anyone else&apos;s private information.
                </p>
                  </div>
                </div>
              </section>
            </div>
          </form>

          <aside className="space-y-3 lg:sticky lg:top-28">
            <div className="rounded-card border border-line-subtle bg-card p-5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <LifeBuoy aria-hidden="true" className="size-4 text-moss-soft" />
                Before you submit
              </h2>
              <ul className="mt-3 space-y-2.5">
                {[
                  'Search the help articles for a faster answer.',
                  'Check the FAQs for account and bug questions.',
                  'Include steps to reproduce the problem.',
                  'Blur private details in screenshots.',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-muted">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-moss-soft" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line-subtle pt-4">
                <Link to="/help" className="text-[11.5px] font-medium text-muted hover:text-lime">
                  Help articles
                </Link>
                <span aria-hidden="true" className="text-faint">·</span>
                <Link to="/faqs" className="text-[11.5px] font-medium text-muted hover:text-lime">
                  FAQs
                </Link>
              </div>
            </div>

            <div className="rounded-card border border-line-subtle bg-surface/60 p-5">
              <h2 className="text-[12.5px] font-medium text-ink">What happens next</h2>
              <ol className="mt-3 space-y-3">
                {[
                  'Your request is saved with an Open status and a unique reference.',
                  'The support team reviews it and may add a message asking for details.',
                  'You check the real status any time with your reference and email.',
                ].map((item, index) => (
                  <li key={item} className="flex gap-2.5 text-[11.5px] leading-relaxed text-muted">
                    <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[9px] text-lime">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-line pt-3 text-[10.5px] leading-relaxed text-muted">
                No response-time estimate or support hours are published here. The ticket status is the
                source of truth.
              </p>
            </div>

            <div className="rounded-card border border-line-subtle bg-surface/40 p-5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <ShieldCheck aria-hidden="true" className="size-4 text-moss-soft" />
                Keep it safe
              </h2>
              <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
                Support will never ask for your password or an email sign-in code. Do not attach private
                messages or anyone else&apos;s personal information.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
