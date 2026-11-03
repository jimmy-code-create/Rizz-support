import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, HelpCircle, LifeBuoy } from 'lucide-react';
import { ARTICLES } from '@/content/articles';
import { FAQS } from '@/content/faqs';
import { SearchBox } from '@/components/search/SearchBox';

const QUICK_PATHS = [
  {
    to: '/help',
    label: 'Browse help articles',
    detail: 'Step-by-step guides for common problems',
    icon: BookOpen,
  },
  {
    to: '/faqs',
    label: 'Read the FAQs',
    detail: 'Short answers about Rizz and support',
    icon: HelpCircle,
  },
  {
    to: '/track',
    label: 'Track a request',
    detail: 'Check the real status of a ticket',
    icon: LifeBuoy,
  },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line-subtle">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-canvas" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="container-page relative">
        <div className="grid gap-12 pb-16 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.025] py-1.5 pl-2.5 pr-3.5 text-[10.5px] font-medium uppercase tracking-[0.15em] text-muted">
              <span className="relative flex size-3.5 items-center justify-center" aria-hidden="true">
                <span className="absolute size-3.5 rounded-full bg-lime/10" />
                <span className="size-1.5 rounded-full bg-lime" />
              </span>
              Rizz Support Center
            </span>

            <h1 className="display mt-6 max-w-[13ch]">How can we help you?</h1>

            <p className="lede mt-5 max-w-[46ch]">
              Find answers, solve problems, and get the most out of Rizz.
            </p>

            <div className="mt-8 w-full max-w-[38rem]">
              <SearchBox variant="hero" showPopular />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-faint">
              <span>{ARTICLES.length} help articles</span>
              <span aria-hidden="true" className="size-0.5 rounded-full bg-line-strong" />
              <span>{FAQS.length} answers</span>
              <span aria-hidden="true" className="size-0.5 rounded-full bg-line-strong" />
              <span>Real ticket tracking</span>
            </div>
          </div>

          <aside aria-label="Quick support paths" className="animate-fade-up lg:justify-self-end lg:w-full" style={{ animationDelay: '90ms' }}>
            <div className="overflow-hidden rounded-panel border border-line-subtle bg-gradient-to-b from-[#121712] to-[#0c100c] shadow-card">
              <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-3.5">
                <p className="text-[12px] font-medium tracking-[-0.005em] text-ink">Start here</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-faint">Self-serve</p>
              </div>

              <div className="divide-y divide-line-subtle">
                {QUICK_PATHS.map(({ to, label, detail, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex min-h-[68px] items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-white/[0.025]"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-line bg-white/[0.02] text-muted transition-colors group-hover:border-line-strong group-hover:text-lime">
                      <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium tracking-[-0.015em] text-ink">
                        {label}
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-faint">
                        {detail}
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 shrink-0 text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-lime"
                    />
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-line-subtle bg-black/20 px-4 py-3">
                <span className="size-1.5 rounded-full bg-lime/80" aria-hidden="true" />
                <p className="text-[10.5px] leading-relaxed text-faint">
                  Every request gets a real, trackable reference.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
