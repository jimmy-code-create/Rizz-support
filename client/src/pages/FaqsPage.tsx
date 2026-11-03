import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { SUPPORT_CATEGORIES, categoryById } from '@shared/support';
import { FAQS } from '@/content/faqs';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { Accordion } from '@/components/ui/Accordion';
import { buttonClasses } from '@/components/ui/Button';

function matches(faq: (typeof FAQS)[number], tokens: string[]): boolean {
  if (!tokens.length) return true;
  const haystack = `${faq.question} ${faq.answer} ${faq.keywords.join(' ')} ${categoryById(faq.categoryId)?.title ?? ''}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function FaqsPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  usePageMeta({
    title: 'Frequently Asked Questions',
    description:
      'Answers about Rizz accounts, bug reports, feature requests, safety, and contacting the support team.',
  });

  const tokens = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [query],
  );

  const filtered = useMemo(
    () =>
      FAQS.filter(
        (faq) => (category === 'all' || faq.categoryId === category) && matches(faq, tokens),
      ),
    [category, tokens],
  );

  const items = useMemo(
    () =>
      filtered.map((faq) => {
        const related = faq.relatedSlug;
        return {
          id: faq.id,
          question: faq.question,
          answer: (
            <div className="space-y-3">
              <p>{faq.answer}</p>
              {related ? (
                <Link
                  to={`/help/${related}`}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-lime transition-colors hover:text-lime-deep"
                >
                  Read the full guide
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              ) : null}
            </div>
          ),
        };
      }),
    [filtered],
  );

  // FAQ structured data helps search engines surface these answers.
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Answers"
        breadcrumbs={[{ label: 'Support', to: '/' }, { label: 'FAQs' }]}
        title="Frequently asked questions"
        description="Direct answers about Rizz and how support works. If your question is not here, the request form is the fastest route to a person."
      >
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
            />
            <label htmlFor="faq-search" className="sr-only">
              Search frequently asked questions
            </label>
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions and answers..."
              autoComplete="off"
              className="h-12 w-full rounded-input border border-line bg-card pl-11 pr-11 text-[16px] text-ink sm:text-[14px] transition-[border-color,box-shadow,background-color] placeholder:text-faint hover:border-line-strong focus:border-lime/40 focus:bg-card focus:outline-none focus:ring-2 focus:ring-lime/10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-faint transition-colors hover:bg-white/5 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          <div
            className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
            role="group"
            aria-label="Filter questions by category"
          >
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className="filter-chip shrink-0"
            >
              All questions
              <span className="filter-count">{FAQS.length}</span>
            </button>
            {SUPPORT_CATEGORIES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setCategory(entry.id)}
                aria-pressed={category === entry.id}
                className="filter-chip shrink-0"
              >
                {entry.title}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="container-page section-compact">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line-subtle pb-4">
            <p className="text-[12px] text-faint" aria-live="polite">
              <span className="font-medium tabular-nums text-ink">{filtered.length}</span>{' '}
              {filtered.length === 1 ? 'question' : 'questions'}
              {query.trim() ? ` for “${query.trim()}”` : ''}
            </p>
            {query.trim() || category !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('all');
                }}
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted transition-colors hover:text-lime"
              >
                <X aria-hidden="true" className="size-3" />
                Reset filters
              </button>
            ) : null}
          </div>

          <h2 className="sr-only">Questions and answers</h2>
          {items.length > 0 ? (
            <Accordion
              key={`${category}-${query}`}
              items={items}
              idPrefix="faqs"
              className="mt-5"
            />
          ) : (
            <div className="mt-5 flex flex-col items-start rounded-card border border-line-subtle bg-card px-6 py-10 sm:items-center sm:py-14 sm:text-center">
              <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-faint">
                <SearchX aria-hidden="true" className="size-5" />
              </span>
              <h2 className="mt-4 text-[16px] font-medium tracking-[-0.02em] text-ink">
                No questions match that search
              </h2>
              <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
                Try different wording, or send the question to support directly. If it comes up
                often, we will add it here.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('all');
                  }}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                >
                  Reset filters
                </button>
                <Link to="/submit" className={buttonClasses({ size: 'sm' })}>
                  Ask support
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-card border border-line-subtle bg-surface/60 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-[14px] font-medium text-ink">Question not answered here?</h2>
              <p className="mt-1 text-[12px] text-muted">
                Submit a request and we will get back to you through ticket tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/help" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                Browse articles
              </Link>
              <Link to="/submit" className={buttonClasses({ size: 'sm' })}>
                Submit a request
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
