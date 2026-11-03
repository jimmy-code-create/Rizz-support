import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';

export function ContactCTA() {
  return (
    <section className="container-page section-compact" aria-labelledby="contact-cta-heading">
      <div className="relative overflow-hidden rounded-panel border border-line-subtle bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_240px_at_8%_0%,rgba(183,255,50,0.07),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-8 left-0 w-px bg-gradient-to-b from-transparent via-lime/30 to-transparent"
        />

        <div className="relative grid gap-8 p-6 sm:p-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-12 md:p-11">
          <div>
            <p className="eyebrow">Contact support</p>
            <h2 id="contact-cta-heading" className="section-title mt-3.5">
              Still need a hand?
            </h2>
            <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.7] text-muted">
              Our team is here to help you get back on track. Submit the details once and track the
              real status with your reference.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[10.5px] text-faint">
              Support requests are handled through this Support Center.
              <a
                href="https://rizzapp.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 transition-colors hover:text-lime sm:min-h-9"
              >
                Back to Rizz
                <ArrowUpRight aria-hidden="true" className="size-3" />
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:items-stretch">
            <Link to="/submit" className={buttonClasses({ size: 'lg' })}>
              Submit a request
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link to="/help" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Explore help articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
