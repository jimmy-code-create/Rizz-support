import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Info, ShieldAlert } from 'lucide-react';
import { ISSUE_CATEGORIES, type IssueCategory } from '@shared/support';
import { ISSUE_LIMITS } from '@shared/issues';
import { ApiError, createPublicIssue } from '@/lib/api';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface FormValues {
  title: string;
  category: IssueCategory | '';
  description: string;
  website: string;
}

type FormErrors = Partial<Record<'title' | 'category' | 'description', string>>;

const EMPTY_VALUES: FormValues = {
  title: '',
  category: '',
  description: '',
  website: '',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();

  if (title.length < 4) errors.title = 'Add a short issue title (at least 4 characters).';
  else if (title.length > ISSUE_LIMITS.title)
    errors.title = `Keep the title under ${ISSUE_LIMITS.title} characters.`;

  if (!values.category) errors.category = 'Choose the category that fits best.';

  if (description.length < 20) {
    errors.description = `Describe the issue in at least 20 characters (${description.length} so far).`;
  } else if (description.length > ISSUE_LIMITS.description) {
    errors.description = `Keep the description under ${ISSUE_LIMITS.description} characters.`;
  }

  return errors;
}

export function NewIssuePage() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const formTopRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  usePageMeta({
    title: 'Report a Public Issue',
    description:
      'Add a public bug or feature report to the Rizz community issue board. Other people can upvote it. Do not include private account details.',
  });

  const errorCount = Object.keys(errors).length;

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as keyof FormErrors]) return current;
      const next = { ...current };
      delete next[key as keyof FormErrors];
      return next;
    });
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);
    setServerError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.requestAnimationFrame(() => {
        if (nextErrors.title) document.getElementById('issue-title')?.focus();
        else if (nextErrors.category) document.getElementById('issue-category')?.focus();
        else document.getElementById('issue-description')?.focus();
      });
      return;
    }

    if (!values.category) return;
    setPending(true);
    try {
      const data = await createPublicIssue({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        website: values.website,
      });
      toast({
        title: 'Issue published',
        description: 'Your report is now on the community board.',
        tone: 'success',
      });
      navigate('/issues', { state: { createdIssueId: data.issue.id } });
    } catch (error) {
      if (error instanceof ApiError) {
        if (Object.keys(error.fields).length > 0) {
          const fieldErrors: FormErrors = {};
          if (error.fields.title) fieldErrors.title = error.fields.title;
          if (error.fields.category) fieldErrors.category = error.fields.category;
          if (error.fields.description) fieldErrors.description = error.fields.description;
          setErrors(fieldErrors);
        }
        setServerError(error.message);
      } else {
        setServerError('We could not publish the issue. Check your connection and try again.');
      }
      window.requestAnimationFrame(() => formTopRef.current?.focus());
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community"
        breadcrumbs={[
          { label: 'Support', to: '/' },
          { label: 'Issue board', to: '/issues' },
          { label: 'Report an issue' },
        ]}
        title="Report a public issue"
        description="Describe a bug or request so other people can see it and upvote it. This goes on the public board, so keep private account details out of it."
      >
        <Link
          to="/issues"
          className="inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink sm:min-h-9"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to the issue board
        </Link>
      </PageHeader>

      <div className="container-page section-compact">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:gap-14">
          <form
            ref={formTopRef}
            tabIndex={-1}
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
            className="relative min-w-0 rounded-panel border border-line-subtle bg-card p-5 shadow-card focus:outline-none sm:p-7"
          >
            {errorCount > 0 || serverError ? (
              <div
                role="alert"
                className="animate-result-in mb-6 rounded-xl border border-error/25 bg-error/[0.06] p-4 text-[12px] leading-relaxed text-error"
              >
                {serverError ??
                  `Please check the ${errorCount === 1 ? 'highlighted field' : `${errorCount} highlighted fields`} and try again.`}
              </div>
            ) : null}

            <div className="space-y-5">
              <Input
                id="issue-title"
                name="title"
                label="Issue title"
                required
                value={values.title}
                onChange={(event) => update('title', event.target.value)}
                error={attempted ? errors.title : undefined}
                hint="Say what is wrong in one clear sentence."
                maxLength={ISSUE_LIMITS.title}
                placeholder="Example: Images fail to upload in a realm channel"
                autoComplete="off"
              />

              <Select
                id="issue-category"
                name="category"
                label="Category"
                required
                value={values.category}
                onChange={(event) => update('category', event.target.value as IssueCategory)}
                error={attempted ? errors.category : undefined}
                hint="Choose where this report belongs on the board."
              >
                <option value="">Choose a category</option>
                {ISSUE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>

              <Textarea
                id="issue-description"
                name="description"
                label="What is happening?"
                required
                value={values.description}
                onChange={(event) => update('description', event.target.value)}
                error={attempted ? errors.description : undefined}
                hint="Include what you expected, what happened, and the steps that lead to it. Do not include personal details."
                maxLength={ISSUE_LIMITS.description}
                placeholder="Describe the problem and how someone else can reproduce it."
              />

              {/* Honeypot: hidden from people, filled by naive bots. */}
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="issue-website">Website</label>
                <input
                  id="issue-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(event) => update('website', event.target.value)}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-2 border-t border-line-subtle pt-6 sm:flex-row">
              <Button type="submit" size="lg" loading={pending} loadingLabel="Publishing">
                Publish issue
                {!pending ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
              </Button>
              <Link to="/issues" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
                Cancel
              </Link>
            </div>

            <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-faint">
              <Info aria-hidden="true" className="mt-px size-3.5 shrink-0" />
              Public reports cannot be edited after publishing. Keep contact details out of the
              description.
            </p>
          </form>

          <aside className="space-y-3 lg:sticky lg:top-28">
            <div className="rounded-card border border-line-subtle bg-surface/60 p-5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                <ShieldAlert aria-hidden="true" className="size-4 text-warning" />
                Keep it public-safe
              </h2>
              <p className="mt-2 text-[11.5px] leading-[1.7] text-muted">
                Do not include your email, password, ticket reference, or anything private about
                your account. The public board does not support private replies.
              </p>
              <p className="mt-3 text-[11.5px] leading-[1.7] text-muted">
                Need an answer from the team? Use the private request form instead.
              </p>
              <Link
                to="/submit"
                className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'mt-4 w-full' })}
              >
                Submit a private request
              </Link>
            </div>

            <div className="rounded-card border border-line-subtle bg-card p-5">
              <h2 className="text-[12.5px] font-medium text-ink">What happens next</h2>
              <p className="mt-2 text-[11.5px] leading-[1.7] text-muted">
                Your report appears on the issue board immediately. Other visitors can upvote it
                if they are experiencing the same problem.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
