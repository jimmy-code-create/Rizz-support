import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ArrowUp, ArrowUpRight, Search } from 'lucide-react';
import { BrandLockup } from '@/components/ui/Brand';
import { buttonClasses } from '@/components/ui/Button';
import { useSearchPalette } from '@/components/search/SearchPalette';
import { RIZZ_SITE_URL } from '@shared/support';
import { preferredScrollBehavior } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

const SUPPORT_LINKS = [
  { label: 'Help articles', to: '/help' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Community issue board', to: '/issues' },
  { label: 'Submit a request', to: '/submit' },
  { label: 'Track a request', to: '/track' },
];

const RIZZ_LINKS = [
  { label: 'Official website', href: RIZZ_SITE_URL },
  { label: 'Claim your @', href: 'https://rizzapp.onrender.com/signup' },
  { label: 'Log in', href: 'https://rizzapp.onrender.com/login' },
  { label: 'Explore the feed', href: 'https://rizzapp.onrender.com/feed' },
];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const reduceMotion = usePrefersReducedMotion();
  const { openPalette } = useSearchPalette();
  // Keep the footer visible in environments without IntersectionObserver
  // (older browsers, jsdom) instead of leaving a scroll-reveal stuck hidden.
  const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window;
  const animate = !reduceMotion && canObserve;
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  };

  return (
    <footer className="footer-shell relative mt-auto overflow-hidden border-t border-line-subtle">
      <div aria-hidden="true" className="footer-sheen" />
      <div aria-hidden="true" className="footer-glow" />

      <div className="container-page relative">
        {/* CTA band */}
        <motion.div
          initial={animate ? { opacity: 0, y: 30 } : false}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-6 border-b border-line-subtle py-12 md:flex-row md:items-end md:justify-between md:py-16"
        >
          <div>
            <p className="eyebrow">Still stuck?</p>
            <h2 className="footer-hook mt-4">
              We&rsquo;ve got <span className="text-shine">your back.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/submit" className={buttonClasses({ size: 'lg', className: 'btn-glow' })}>
              Submit a request
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <button
              type="button"
              onClick={openPalette}
              aria-haspopup="dialog"
              className={buttonClasses({ variant: 'secondary', size: 'lg' })}
            >
              <Search aria-hidden="true" className="size-4" />
              Search help
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={animate ? 'hidden' : false}
          animate={!canObserve ? 'show' : undefined}
          whileInView={canObserve ? 'show' : undefined}
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduceMotion ? 0 : 0.09, delayChildren: 0.05 } },
          }}
          className="grid grid-cols-2 gap-x-6 gap-y-9 py-11 md:grid-cols-12 md:gap-8 md:py-14"
        >
          <motion.div variants={item} className="col-span-2 md:col-span-5">
            <BrandLockup />
            <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.75] text-muted">
              Help articles, clear answers, and real request tracking for the Rizz social platform.
            </p>
            <a
              href={RIZZ_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white/[0.02] px-4 text-[12px] font-medium text-ink-soft transition-all hover:border-lime/40 hover:text-lime sm:min-h-10"
            >
              Visit rizzapp.onrender.com
              <ArrowUpRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>

          <motion.div variants={item} className="col-span-1 md:col-span-3">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-lime/80">
              Support
            </h2>
            <ul className="mt-3 space-y-1">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="footer-link group -mx-1 inline-flex min-h-11 items-center gap-1.5 rounded px-1 text-[13px] text-muted transition-colors hover:text-ink sm:min-h-9"
                  >
                    <span aria-hidden="true" className="footer-link-dash" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={item} className="col-span-1 md:col-span-4">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-lime/80">Rizz</h2>
            <ul className="mt-3 space-y-1">
              {RIZZ_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link group -mx-1 inline-flex min-h-11 items-center gap-1.5 rounded px-1 text-[13px] text-muted transition-colors hover:text-ink sm:min-h-9"
                  >
                    <span aria-hidden="true" className="footer-link-dash" />
                    {link.label}
                    <ArrowUpRight aria-hidden="true" className="size-3 text-faint transition-colors group-hover:text-lime" />
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Giant wordmark */}
      <motion.div
        aria-hidden="true"
        initial={animate ? { opacity: 0, y: '30%' } : false}
        whileInView={animate ? { opacity: 1, y: '0%' } : undefined}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, ease: EASE }}
        className="footer-wordmark select-none"
      >
        RIZZ
      </motion.div>

      <div className="relative border-t border-line-subtle bg-base/80 backdrop-blur">
        <div className="container-page flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] leading-relaxed text-faint">
            © {year} Rizz Support Center. Rizz itself is unchanged by this support portal.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: preferredScrollBehavior() })}
            className="group inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line px-3.5 text-[11px] font-medium text-muted transition-all hover:border-lime/40 hover:text-lime sm:min-h-9 sm:self-auto"
          >
            Back to top
            <ArrowUp
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover:-translate-y-1"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
