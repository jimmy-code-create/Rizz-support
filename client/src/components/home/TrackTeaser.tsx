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
    <section className="container-page py-16 md:py-20" aria-labelledby="track-teaser-heading">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_280px_at_88%_0%,rgba(183,255,50,0.11),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-lime/25 to-transparent"
        />
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-12 md:items-center md:gap-10 md:p-10">
          <div className="md:col-span-7">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
              <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
              Ticket tracking
            </p>
            <h2
              id="track-teaser-heading"
              className="mt-3 text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[1.75rem]"
            >
              Already submitted a request?
            </h2>
            <p className="mt-2.5 max-w-md text-[13px] leading-[1.7] text-muted">
              Check its real status and any responses from the support team. You will need the
              reference number and the email address you used.
            </p>
            <Link
              to="/track"
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-lime transition-colors hover:text-lime-deep"
            >
              Open full ticket tracking
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <div className="md:col-span-5">
            <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-line bg-[#0c100b]/80 p-4">
              <label htmlFor="teaser-reference" className="text-[11.5px] font-medium text-muted">
                Ticket reference
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <LifeBuoy
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-moss-soft"
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
                    className="h-10 w-full rounded-lg border border-line bg-surface/80 pl-9 pr-3 font-mono text-[12.5px] uppercase tracking-[0.04em] text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-lime/40 focus:outline-none focus:ring-2 focus:ring-lime/10 aria-[invalid=true]:border-red-400/50"
                  />
                </div>
                <Button type="submit" size="sm" className="h-10 shrink-0 px-4">
                  Track request
                </Button>
              </div>
              {error ? (
                <p id="teaser-reference-error" role="alert" className="mt-2 flex items-center gap-1 text-[11px] text-red-300">
                  <SearchXIcon aria-hidden="true" className="size-3" />
                  {error}
                </p>
              ) : (
                <p id="teaser-reference-hint" className="mt-2 text-[10.5px] text-muted">
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
