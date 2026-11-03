import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Menu, Plus, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { BrandHomeLink } from '@/components/ui/Brand';
import { useSearchPalette } from '@/components/search/SearchPalette';
import { buttonClasses } from '@/components/ui/Button';
import { RIZZ_SITE_URL } from '@shared/support';

const NAV_LINKS = [
  { label: 'Home', to: '/', match: (pathname: string) => pathname === '/' },
  {
    label: 'Help Articles',
    to: '/help',
    match: (pathname: string) => pathname === '/help' || pathname.startsWith('/help/'),
  },
  { label: 'FAQs', to: '/faqs', match: (pathname: string) => pathname === '/faqs' },
] as const;

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad/.test(navigator.userAgent);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openPalette } = useSearchPalette();
  const { pathname } = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [shortcut, setShortcut] = useState('Ctrl K');

  useEffect(() => {
    setShortcut(isMac() ? '⌘ K' : 'Ctrl K');
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.requestAnimationFrame(() => firstLinkRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200',
        scrolled || mobileOpen
          ? 'border-line-subtle bg-base/90 shadow-[0_1px_0_rgba(245,247,242,0.02)] backdrop-blur-xl'
          : 'border-line-subtle/70 bg-base/70 backdrop-blur-md',
      )}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-7">
            <BrandHomeLink compact />
            <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={link.match(pathname) ? 'page' : undefined}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openPalette}
              className="hidden h-8 items-center gap-2 rounded-lg border border-transparent px-2 text-[12px] text-muted transition-colors hover:border-line hover:bg-white/[0.02] hover:text-ink sm:inline-flex"
              aria-label="Search the support center"
            >
              <Search aria-hidden="true" className="size-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="ml-0.5 hidden rounded border border-line bg-raised px-1.5 py-0.5 font-sans text-[9.5px] text-faint md:inline-flex">
                {shortcut}
              </kbd>
            </button>

            <Link
              to="/submit"
              className={buttonClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Submit a request
            </Link>

            <a
              href={RIZZ_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({
                variant: 'ghost',
                size: 'sm',
                className: 'hidden lg:inline-flex',
              })}
            >
              Back to Rizz
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="flex size-11 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-ink transition-colors hover:border-line-strong hover:bg-white/[0.04] lg:hidden"
            >
              {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div
          ref={drawerRef}
          id="mobile-menu"
          className="animate-drawer fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line-subtle bg-base lg:hidden"
        >
          <div className="container-page flex min-h-full flex-col py-6">
            <p className="eyebrow-plain">Navigate</p>
            <nav aria-label="Mobile" className="mt-3 divide-y divide-line-subtle border-y border-line-subtle">
              {NAV_LINKS.map((link, index) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.to}
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex min-h-14 items-center justify-between gap-4 py-3.5 text-[15px] font-medium tracking-[-0.015em] transition-colors',
                      active ? 'text-lime' : 'text-ink hover:text-lime',
                    )}
                  >
                    {link.label}
                    <ArrowRight
                      aria-hidden="true"
                      className={cn('size-4', active ? 'text-lime' : 'text-faint')}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openPalette();
                }}
                className={buttonClasses({ variant: 'secondary', size: 'md', className: 'w-full' })}
              >
                <Search aria-hidden="true" className="size-4" />
                Search help
              </button>
              <Link
                to="/submit"
                onClick={() => setMobileOpen(false)}
                className={buttonClasses({ size: 'lg', className: 'w-full' })}
              >
                Submit a support request
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href={RIZZ_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className={buttonClasses({ variant: 'ghost', size: 'md', className: 'w-full justify-between' })}
              >
                Back to Rizz
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>

            <p className="mt-auto pt-8 text-[11px] leading-relaxed text-faint">
              Help articles, answers, and real request tracking for Rizz.
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
