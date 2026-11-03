import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';

export function ContactCTA() {
  return (
    <section className="container-page py-16 md:py-20" aria-labelledby="contact-cta-heading">
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-gradient-to-b from-[#121810] to-[#0b0e0a] px-6 py-14 text-center sm:px-10 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_300px_at_50%_-10%,rgba(183,255,50,0.13),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-lime/40 to-transparent"
        />
        <div className="relative mx-auto max-w-xl">
          <p className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
            <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
            Contact support
          </p>
          <h2
            id="contact-cta-heading"
            className="mt-3.5 text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-[2.25rem]"
          >
            Still need a hand?
          </h2>
          <p className="mx-auto mt-3.5 max-w-md text-[13.5px] leading-[1.75] text-muted sm:text-sm">
            Our team is here to help you get back on track.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link to="/submit" className={buttonClasses({ size: 'lg' })}>
              Submit a Support Request
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link to="/help" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Explore Help Articles
            </Link>
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-[10.5px] text-muted">
            Support requests are handled through this Support Center.
            <a
              href="https://rizzapp.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-lime"
            >
              Back to Rizz
              <ArrowUpRight aria-hidden="true" className="size-3" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
