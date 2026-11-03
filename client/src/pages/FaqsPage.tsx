import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { SUPPORT_CATEGORIES, categoryById } from '@shared/support';
import { FAQS } from '@/data/faqs';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { Accordion } from '@/components/ui/Accordion';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

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
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
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
              className="h-12 w-full rounded-xl border border-line-strong bg-[#0e130d]/90 pl-11 pr-11 text-sm text-ink transition-[border-color,box-shadow] placeholder:text-muted hover:border-lime/25 focus:border-lime/45 focus:outline-none focus:ring-2 focus:ring-lime/10 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter questions by category">
            <button
              type="button"
              onClick={() => setCategory('all')}
              aria-pressed={category === 'all'}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                category === 'all'
                  ? 'border-lime/30 bg-lime/10 text-lime'
                  : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-ink',
              )}
            >
              All questions
            </button>
            {SUPPORT_CATEGORIES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setCategory(entry.id)}
                aria-pressed={category === entry.id}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                  category === entry.id
                    ? 'border-lime/30 bg-lime/10 text-lime'
                    : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {entry.title}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="container-page py-10 md:py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[12px] text-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
            {query.trim() ? ` for “${query.trim()}”` : ''}
          </p>
          {query.trim() || category !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
              className="text-[11.5px] font-medium text-lime transition-colors hover:text-lime-deep"
            >
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
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-line bg-card px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-white/[0.02] text-muted">
              <SearchX aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-[16px] font-medium text-ink">No questions match that search</h2>
            <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-muted">
              Try different wording, or send the question to support directly. If it comes up often,
              we will add it here.
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

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-5 sm:flex-row sm:items-center sm:p-6">
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
      </section>
    </>
  );
}
