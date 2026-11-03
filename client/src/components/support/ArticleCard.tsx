import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { categoryById } from '@shared/support';
import { readingTimeMinutes, type HelpArticle } from '@/content/articles';
import { formatDate, formatReadingTime } from '@/lib/format';
import { Highlight } from '@/components/ui/Highlight';

export function ArticleCard({ article, query = '' }: { article: HelpArticle; query?: string }) {
  const category = categoryById(article.categoryId);
  const updated = formatDate(article.updatedAt);

  return (
    <Link
      to={`/help/${article.slug}`}
      className="group card-lift flex h-full flex-col rounded-card border border-line-subtle bg-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.13em] text-moss-soft">
          {category?.title}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
        />
      </div>

      <h3 className="mt-3 text-[16.5px] font-medium leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-lime">
        <Highlight text={article.title} query={query} />
      </h3>
      <p className="mt-2 line-clamp-2 text-[13px] leading-[1.65] text-muted">{article.description}</p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3.5 gap-y-1 pt-5 text-[11px] text-faint">
        <span className="inline-flex items-center gap-1.5">
          <Clock aria-hidden="true" className="size-3" />
          {formatReadingTime(readingTimeMinutes(article))}
        </span>
        {updated ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden="true" className="size-3" />
            Updated {updated}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
