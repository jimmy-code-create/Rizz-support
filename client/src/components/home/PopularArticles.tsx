import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import { categoryById } from '@shared/support';
import { popularArticles, readingTimeMinutes } from '@/data/articles';
import { formatReadingTime } from '@/lib/format';
import { buttonClasses } from '@/components/ui/Button';

export function PopularArticles() {
  const articles = popularArticles(6);

  return (
    <section className="border-b border-line bg-surface/50 py-16 md:py-20" aria-labelledby="popular-articles-heading">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
                <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
                Most read
              </p>
              <h2
                id="popular-articles-heading"
                className="mt-3 text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[1.85rem]"
              >
                Popular help articles
              </h2>
              <p className="mt-3 max-w-xs text-[13px] leading-[1.7] text-muted">
                Practical guides for the questions people ask most, written to be read in a couple of minutes.
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

          <div className="lg:col-span-8">
            <ul className="divide-y divide-line border-y border-line">
              {articles.map((article) => {
                const category = categoryById(article.categoryId);
                return (
                  <li key={article.slug}>
                    <Link
                      to={`/help/${article.slug}`}
                      className="group flex items-start gap-4 py-5 transition-colors sm:gap-6"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] font-medium uppercase tracking-[0.11em] text-moss-soft">
                          {category?.title}
                        </p>
                        <h3 className="mt-1.5 text-[14.5px] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-lime sm:text-[15px]">
                          {article.title}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-[12.5px] leading-relaxed text-muted">
                          {article.description}
                        </p>
                        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-muted">
                          <Clock aria-hidden="true" className="size-3" />
                          {formatReadingTime(readingTimeMinutes(article))}
                        </p>
                      </div>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-moss-soft/60 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
                      />
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
