import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SkipLink } from '@/components/layout/SkipLink';
import { RouteFallback } from '@/components/layout/RouteFallback';

export function Layout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-base">
      <SkipLink />
      <Navbar />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 focus:outline-none">
        <div key={pathname} className="animate-fade-in">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
