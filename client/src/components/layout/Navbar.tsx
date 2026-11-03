import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, Plus, Search, X } from 'lucide-react';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [shortcut, setShortcut] = useState('Ctrl K');

  useEffect(() => {
    setShortcut(isMac() ? '⌘ K' : 'Ctrl K');
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current?.contains(event.target as Node)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || mobileOpen
          ? 'border-line bg-[#080a08]/88 backdrop-blur-xl'
          : 'border-transparent bg-[#080a08]/60 backdrop-blur-md',
      )}
    >
      <div className="container-page">
        <div className="flex h-[66px] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <BrandHomeLink />
            <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    data-active={active}
                    className={cn(
                      'link-underline py-1 text-[13px] font-medium tracking-[-0.005em] transition-colors duration-200',
                      active ? 'text-ink' : 'text-muted hover:text-ink',
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openPalette}
              className="hidden h-9 items-center gap-2 rounded-[10px] border border-line bg-white/[0.02] pl-2.5 pr-1.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-ink sm:inline-flex"
              aria-label="Search the support center"
            >
              <Search aria-hidden="true" className="size-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="ml-0.5 rounded border border-line bg-raised/70 px-1.5 py-0.5 font-sans text-[9.5px] text-muted/90">
                {shortcut}
              </kbd>
            </button>

            <Link to="/submit" className={buttonClasses({ size: 'sm', className: 'hidden sm:inline-flex' })}>
              <Plus aria-hidden="true" className="size-3.5" />
              Submit a Request
            </Link>

            <a
              href={RIZZ_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({
                variant: 'ghost',
                size: 'sm',
                className: 'hidden xl:inline-flex',
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
              className="flex size-9 items-center justify-center rounded-[10px] border border-line bg-white/[0.02] text-ink transition-colors hover:border-line-strong hover:bg-white/[0.04] lg:hidden"
            >
              {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-66px)] overflow-y-auto border-t border-line bg-[#080a08]/98 shadow-pop backdrop-blur-xl lg:hidden"
        >
          <div className="container-page py-4">
            <nav aria-label="Mobile" className="flex flex-col">
              {NAV_LINKS.map((link) => {
                const active = link.match(pathname);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between border-b border-line/60 py-3.5 text-[14px] font-medium transition-colors',
                      active ? 'text-lime' : 'text-ink hover:text-lime',
                    )}
                  >
                    {link.label}
                    {active ? <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" /> : null}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2">
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
              <Link to="/submit" className={buttonClasses({ size: 'md', className: 'w-full' })}>
                Submit a Support Request
              </Link>
              <a
                href={RIZZ_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: 'ghost', size: 'md', className: 'w-full' })}
              >
                Back to Rizz
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
