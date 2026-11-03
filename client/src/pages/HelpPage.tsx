import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { categoryById, SUPPORT_CATEGORIES } from '@shared/support';
import { ARTICLES } from '@/data/articles';
import { filterArticles } from '@/lib/search';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { ArticleCard } from '@/components/support/ArticleCard';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function HelpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const categoryParam = searchParams.get('category') ?? 'all';
  const category = SUPPORT_CATEGORIES.some((entry) => entry.id === categoryParam)
    ? categoryParam
    : 'all';
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  const results = useMemo(() => filterArticles(query, category === 'all' ? undefined : category), [query, category]);
  const activeCategory = category === 'all' ? null : categoryById(category);

  const updateParams = (nextQuery: string, nextCategory: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim().slice(0, 100));
    if (nextCategory !== 'all') params.set('category', nextCategory);
    setSearchParams(params, { replace: true });
  };

  usePageMeta({
    title: activeCategory ? `${activeCategory.title} — Help Articles` : 'Help Articles',
    description: activeCategory
      ? `${activeCategory.description} Browse practical guides from the Rizz Support Center.`
      : 'Search practical help articles about accounts, bugs, features, safety, and contacting Rizz support.',
  });

  return (
    <>
      <PageHeader
        eyebrow="Help center"
        breadcrumbs={[{ label: 'Support', to: '/' }, { label: 'Help Articles' }]}
        title="Help articles"
        description="Practical guides for getting set up, fixing common problems, and getting the right details to support the first time."
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <label htmlFor="help-search" className="sr-only">
              Search help articles
            </label>
            <input
              id="help-search"
              type="search"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                updateParams(event.target.value, category);
              }}
              placeholder="Search help articles..."
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-line-strong bg-[#0e130d]/90 pl-11 pr-11 text-sm text-ink transition-[border-color,box-shadow] placeholder:text-muted hover:border-lime/25 focus:border-lime/45 focus:outline-none focus:ring-2 focus:ring-lime/10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {draft ? (
              <button
                type="button"
                onClick={() => {
                  setDraft('');
                  updateParams('', category);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => updateParams(query, 'all')}
              aria-pressed={category === 'all'}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                category === 'all'
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-ink',
              )}
            >
              All articles
            </button>
            {SUPPORT_CATEGORIES.map((entry) => {
              const count = ARTICLES.filter((article) => article.categoryId === entry.id).length;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => updateParams(query, entry.id)}
                  aria-pressed={category === entry.id}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                    category === entry.id
                      ? 'border-lime/30 bg-lime/10 text-lime'
                      : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {entry.title}
                  {count > 0 ? <span className="ml-1.5 text-[10px] text-moss-soft">{count}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-10 md:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[12px] text-muted" aria-live="polite">
            {results.length} {results.length === 1 ? 'article' : 'articles'}
            {activeCategory ? ` in ${activeCategory.title}` : ''}
            {query.trim() ? ` for “${query.trim()}”` : ''}
          </p>
          {query.trim() || category !== 'all' ? (
            <button
              type="button"
              onClick={() => updateParams('', 'all')}
              className="text-[11.5px] font-medium text-lime transition-colors hover:text-lime-deep"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <h2 className="sr-only">Article results</h2>
        {results.length > 0 ? (
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.slug} article={article} query={query} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-card px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-muted">
              <SearchX aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-[16px] font-medium text-ink">No articles match that search</h2>
            <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
              Try a broader phrase, browse another category, or send the details to support and we
              will take a look.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => updateParams('', 'all')}
                className={buttonClasses({ variant: 'secondary', size: 'sm' })}
              >
                Clear filters
              </button>
              <Link
                to={`/submit${category !== 'all' ? `?category=${category}` : ''}`}
                className={buttonClasses({ size: 'sm' })}
              >
                Submit a request
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-[14px] font-medium text-ink">Not finding what you need?</h2>
            <p className="mt-1 text-[12px] text-muted">
              Send us the specifics and we will look into it.
            </p>
          </div>
          <Link to="/submit" className={buttonClasses({ variant: 'subtle', size: 'sm' })}>
            Submit a Support Request
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
