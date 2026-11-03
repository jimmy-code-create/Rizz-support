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
    <header className={cn('relative overflow-hidden border-b border-line', className)}>
      <div className="hero-ambient opacity-60" aria-hidden="true" />
      <div className="container-page relative py-10 md:py-14">
        {breadcrumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
              {breadcrumbs.map((crumb, index) => {
                const last = index === breadcrumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                    {crumb.to && !last ? (
                      <Link to={crumb.to} className="transition-colors hover:text-ink">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={last ? 'text-muted/90' : ''} aria-current={last ? 'page' : undefined}>
                        {crumb.label}
                      </span>
                    )}
                    {!last ? <ChevronRight aria-hidden="true" className="size-3 text-moss-soft/70" /> : null}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : null}

        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
              <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.5rem] md:text-[2.9rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3.5 max-w-2xl text-[14px] leading-[1.75] text-muted sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </header>
  );
}
