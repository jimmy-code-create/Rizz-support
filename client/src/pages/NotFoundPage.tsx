import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { usePageMeta } from '@/lib/seo';
import { buttonClasses } from '@/components/ui/Button';
import { SearchBox } from '@/components/search/SearchBox';

export function NotFoundPage() {
  const [artFailed, setArtFailed] = useState(false);
  usePageMeta({
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has moved.',
    noindex: true,
  });

  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-ambient opacity-70" />
        <div className="bg-grid absolute inset-0 opacity-60" />
      </div>
      <div className="container-page relative flex flex-col items-center py-20 text-center md:py-28">
        {!artFailed ? (
          <img
            src="https://rizzapp.onrender.com/cats/searching.svg"
            alt=""
            aria-hidden="true"
            className="mb-6 h-24 w-auto opacity-90"
            onError={() => setArtFailed(true)}
            draggable={false}
          />
        ) : (
          <span className="mb-6 flex size-14 items-center justify-center rounded-card border border-line-subtle bg-card text-muted">
            <Compass aria-hidden="true" className="size-6" />
          </span>
        )}

        <p className="font-mono text-[11px] tracking-[0.22em] text-moss-soft">404</p>
        <h1 className="page-title mt-3 max-w-xl">
          This page wandered off
        </h1>
        <p className="mt-4 max-w-md text-[13.5px] leading-[1.75] text-muted">
          The page you are looking for does not exist or has moved. Search the support center, or
          start from one of these.
        </p>

        <div className="mt-8 w-full max-w-lg">
          <SearchBox variant="compact" inputLabel="Search the support center" />
        </div>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Link to="/" className={buttonClasses({ size: 'md' })}>
            Back to support home
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link to="/help" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
            Browse help articles
          </Link>
          <Link to="/submit" className={buttonClasses({ variant: 'ghost', size: 'md' })}>
            Submit a request
          </Link>
        </div>
      </div>
    </section>
  );
}
