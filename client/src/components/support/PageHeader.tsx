import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('relative overflow-hidden border-b border-line-subtle', className)}>
      <div className="hero-ambient opacity-70" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent"
      />
      <div className="container-page relative py-9 sm:py-11 md:py-14">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-7">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
                    {crumb.to && !last ? (
                      <Link to={crumb.to} className="transition-colors hover:text-ink">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn('truncate', last ? 'max-w-[16rem] text-muted' : '')}
                        aria-current={last ? 'page' : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                    {!last ? <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-faint/70" /> : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow mb-3.5">{eyebrow}</p> : null}
          <h1 className="page-title">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-[62ch] text-[13.5px] leading-[1.75] text-muted sm:text-[14px]">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </header>
  );
}
