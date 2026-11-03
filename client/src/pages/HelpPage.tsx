import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { categoryById, SUPPORT_CATEGORIES } from '@shared/support';
import { ARTICLES } from '@/content/articles';
import { filterArticles } from '@/lib/search';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { ArticleCard } from '@/components/support/ArticleCard';
import { buttonClasses } from '@/components/ui/Button';

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

  const results = useMemo(
    () => filterArticles(query, category === 'all' ? undefined : category),
    [query, category],
  );
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
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
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
              className="h-12 w-full rounded-input border border-line bg-card pl-11 pr-11 text-[16px] text-ink sm:text-[14px] transition-[border-color,box-shadow,background-color] placeholder:text-faint hover:border-line-strong focus:border-lime/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-lime/10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {draft ? (
              <button
                type="button"
                onClick={() => {
                  setDraft('');
                  updateParams('', category);
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-faint transition-colors hover:bg-white/5 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => updateParams(query, 'all')}
              aria-pressed={category === 'all'}
              className="filter-chip shrink-0"
            >
              All articles
              <span className="filter-count">{ARTICLES.length}</span>
            </button>
            {SUPPORT_CATEGORIES.map((entry) => {
              const count = ARTICLES.filter((article) => article.categoryId === entry.id).length;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => updateParams(query, entry.id)}
                  aria-pressed={category === entry.id}
                  className="filter-chip shrink-0"
                >
                  {entry.title}
                  {count > 0 ? <span className="filter-count">{count}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      </PageHeader>

      <section className="container-page section-compact">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-subtle pb-4">
          <p className="text-[12px] text-faint" aria-live="polite">
            <span className="font-medium tabular-nums text-ink">{results.length}</span>{' '}
            {results.length === 1 ? 'article' : 'articles'}
            {activeCategory ? ` in ${activeCategory.title}` : ''}
            {query.trim() ? ` for “${query.trim()}”` : ''}
          </p>
          {query.trim() || category !== 'all' ? (
            <button
              type="button"
              onClick={() => updateParams('', 'all')}
              className="inline-flex min-h-11 items-center gap-1 text-[11.5px] font-medium text-muted transition-colors hover:text-lime sm:min-h-9"
            >
              <X aria-hidden="true" className="size-3" />
              Clear filters
            </button>
          ) : null}
        </div>

        <h2 className="sr-only">Article results</h2>
        {results.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={article.slug} article={article} query={query} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-start rounded-card border border-line-subtle bg-card px-6 py-10 sm:items-center sm:py-14 sm:text-center">
            <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-faint">
              <SearchX aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-[16px] font-medium tracking-[-0.02em] text-ink">
              No articles match that search
            </h2>
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

        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-card border border-line-subtle bg-surface/60 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-[14px] font-medium text-ink">Not finding what you need?</h2>
            <p className="mt-1 text-[12px] text-muted">
              Send us the specifics and we will look into it.
            </p>
          </div>
          <Link to="/submit" className={buttonClasses({ variant: 'subtle', size: 'sm' })}>
            Submit a support request
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
