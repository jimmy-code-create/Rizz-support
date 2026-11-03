import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import { categoryById } from '@shared/support';
import { popularArticles, readingTimeMinutes } from '@/content/articles';
import { formatReadingTime } from '@/lib/format';
import { buttonClasses } from '@/components/ui/Button';

export function PopularArticles() {
  const [featured, ...rest] = popularArticles(6);

  return (
    <section
      className="section border-b border-line-subtle bg-surface/40"
      aria-labelledby="popular-articles-heading"
    >
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Popular guides</p>
              <h2 id="popular-articles-heading" className="section-title mt-3.5">
                Popular help articles
              </h2>
              <p className="mt-3 max-w-[30ch] text-[13px] leading-[1.7] text-muted">
                Practical guides for the questions people ask most, written to be read in a couple of
                minutes.
              </p>
              <Link
                to="/help"
                className={buttonClasses({
                  variant: 'secondary',
                  size: 'sm',
                  className: 'mt-6',
                })}
              >
                Browse all articles
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-8">
            {featured ? (
              <Link
                to={`/help/${featured.slug}`}
                className="group block rounded-card border border-line-subtle bg-card p-5 transition-colors hover:border-line-strong hover:bg-elevated/60 sm:p-7"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-moss-soft">
                    {categoryById(featured.categoryId)?.title}
                  </p>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[9.5px] uppercase tracking-[0.1em] text-faint">
                    Featured
                  </span>
                </div>

                <h3 className="mt-3 max-w-[24ch] text-[clamp(1.3rem,2.4vw,1.7rem)] font-medium leading-[1.2] tracking-[-0.03em] text-ink transition-colors group-hover:text-lime">
                  {featured.title}
                </h3>
                <p className="mt-2.5 max-w-[60ch] text-[13px] leading-[1.7] text-muted">
                  {featured.description}
                </p>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-line-subtle pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
                    <Clock aria-hidden="true" className="size-3" />
                    {formatReadingTime(readingTimeMinutes(featured))}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors group-hover:text-lime">
                    Read guide
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            ) : null}

            <ul className="mt-2">
              {rest.map((article) => {
                const category = categoryById(article.categoryId);
                return (
                  <li key={article.slug} className="border-b border-line-subtle last:border-b-0">
                    <Link
                      to={`/help/${article.slug}`}
                      className="group flex items-start gap-4 py-4 transition-colors sm:gap-6 sm:py-5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-moss-soft">
                            {category?.title}
                          </p>
                          <span aria-hidden="true" className="size-0.5 rounded-full bg-line-strong" />
                          <p className="inline-flex items-center gap-1 text-[10.5px] text-faint">
                            <Clock aria-hidden="true" className="size-2.5" />
                            {formatReadingTime(readingTimeMinutes(article))}
                          </p>
                        </div>
                        <h3 className="mt-1.5 text-[14.5px] font-medium leading-snug tracking-[-0.012em] text-ink transition-colors group-hover:text-lime">
                          {article.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-[13px] leading-relaxed text-muted">
                          {article.description}
                        </p>
                      </div>
                      <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-transparent text-faint transition-colors group-hover:border-line group-hover:text-lime">
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
