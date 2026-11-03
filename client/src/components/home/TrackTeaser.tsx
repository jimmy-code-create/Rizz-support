import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LifeBuoy, SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TICKET_REFERENCE_PATTERN } from '@shared/support';

export function TrackTeaser() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = reference.trim().toUpperCase();
    if (!value) {
      setError('Enter the reference number from your confirmation.');
      return;
    }
    if (!TICKET_REFERENCE_PATTERN.test(value)) {
      setError('References look like RZ-ABC123.');
      return;
    }
    setError(null);
    navigate(`/track?ticket=${encodeURIComponent(value)}`);
  };

  return (
    <section className="container-page section-compact" aria-labelledby="track-teaser-heading">
      <div className="relative overflow-hidden rounded-panel border border-line-subtle bg-surface/70">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(480px_220px_at_96%_-10%,rgba(183,255,50,0.06),transparent_72%)]"
        />
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-12 md:items-center md:gap-12 md:p-10">
          <div className="md:col-span-7">
            <p className="eyebrow">Ticket tracking</p>
            <h2 id="track-teaser-heading" className="section-title mt-3.5">
              Already submitted a request?
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.7] text-muted">
              Check its real status and any responses from the support team. You will need the
              reference number and the email address you used.
            </p>
            <Link
              to="/track"
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-lime sm:min-h-9"
            >
              Open full ticket tracking
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <div className="md:col-span-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-card border border-line bg-card p-4 shadow-card"
            >
              <label htmlFor="teaser-reference" className="text-[11.5px] font-medium text-ink">
                Ticket reference
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <LifeBuoy
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-faint"
                  />
                  <input
                    id="teaser-reference"
                    name="reference"
                    value={reference}
                    onChange={(event) => {
                      setReference(event.target.value.toUpperCase());
                      if (error) setError(null);
                    }}
                    placeholder="RZ-ABC123"
                    maxLength={9}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? 'teaser-reference-error' : 'teaser-reference-hint'}
                    className="h-11 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 sm:h-10 font-mono text-[16px] sm:text-[12.5px] uppercase tracking-[0.04em] text-ink transition-[border-color,box-shadow] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-faint focus:border-lime/40 focus:outline-none focus:ring-2 focus:ring-lime/10 aria-[invalid=true]:border-error/50"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 w-full shrink-0 px-4 sm:w-auto">
                  Track request
                </Button>
              </div>
              {error ? (
                <p
                  id="teaser-reference-error"
                  role="alert"
                  className="mt-2 flex items-center gap-1 text-[11px] text-error"
                >
                  <SearchXIcon aria-hidden="true" className="size-3" />
                  {error}
                </p>
              ) : (
                <p id="teaser-reference-hint" className="mt-2 text-[10.5px] text-faint">
                  The email address is entered on the next screen.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
