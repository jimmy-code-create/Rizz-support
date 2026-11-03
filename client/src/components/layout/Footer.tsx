import { Link } from 'react-router-dom';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { BrandLockup } from '@/components/ui/Brand';
import { RIZZ_SITE_URL } from '@shared/support';
import { preferredScrollBehavior } from '@/lib/motion';

const SUPPORT_LINKS = [
  { label: 'Help articles', to: '/help' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Submit a request', to: '/submit' },
  { label: 'Track a request', to: '/track' },
];

const RIZZ_LINKS = [
  { label: 'Official website', href: RIZZ_SITE_URL },
  { label: 'Claim your @', href: 'https://rizzapp.onrender.com/signup' },
  { label: 'Log in', href: 'https://rizzapp.onrender.com/login' },
  { label: 'Explore the feed', href: 'https://rizzapp.onrender.com/feed' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-surface/60">
      <div className="container-page">
        <div className="grid gap-10 py-12 md:grid-cols-12 md:gap-8 md:py-16">
          <div className="md:col-span-5">
            <BrandLockup />
            <p className="mt-4 max-w-xs text-[13px] leading-[1.75] text-muted">
              Help articles, clear answers, and real request tracking for the Rizz social platform.
            </p>
            <a
              href={RIZZ_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-lime transition-colors hover:text-lime-deep"
            >
              Visit rizzapp.onrender.com
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">Support</h2>
            <ul className="mt-4 space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">Rizz</h2>
            <ul className="mt-4 space-y-2.5">
              {RIZZ_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                    <ArrowUpRight aria-hidden="true" className="size-3 text-moss-soft" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11.5px] leading-relaxed text-muted/80">
            © {year} Rizz Support Center. Rizz itself is unchanged by this support portal.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })}
            className="inline-flex items-center gap-1.5 self-start text-[11.5px] text-muted transition-colors hover:text-lime sm:self-auto"
          >
            Back to top
            <ArrowUp aria-hidden="true" className="size-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
