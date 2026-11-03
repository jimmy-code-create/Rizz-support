import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock,
  HelpCircle,
  Info,
  LifeBuoy,
} from 'lucide-react';
import { categoryById } from '@shared/support';
import {
  articleBySlug,
  readingTimeMinutes,
  relatedArticles,
  type ArticleBlock,
} from '@/content/articles';
import { formatDate, formatReadingTime } from '@/lib/format';
import { usePageMeta } from '@/lib/seo';
import { PageHeader } from '@/components/support/PageHeader';
import { InlineText } from '@/components/ui/InlineText';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { ArticleCard } from '@/components/support/ArticleCard';
import { NotFoundPage } from '@/pages/NotFoundPage';

function slugFor(index: number): string {
  return `section-${index}`;
}

function Block({ block, index }: { block: ArticleBlock; index: number }) {
  if (block.type === 'h2') {
    return (
      <h2 id={slugFor(index)}>
        <InlineText text={block.text} />
      </h2>
    );
  }
  if (block.type === 'p') {
    return (
      <p>
        <InlineText text={block.text} />
      </p>
    );
  }
  if (block.type === 'steps') {
    return (
      <ol>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <span>
              <InlineText text={item} />
            </span>
          </li>
        ))}
      </ol>
    );
  }
  if (block.type === 'list') {
    return (
      <ul>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <span>
              <InlineText text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <aside className="my-6 flex gap-3 rounded-xl border border-lime/20 bg-lime/[0.04] p-4">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-lime" />
      <div>
        {block.title ? (
          <p className="text-[12.5px] font-medium text-ink">{block.title}</p>
        ) : null}
        <p className="mt-1 text-[12.5px] leading-[1.75] text-[#b9c1b4]">
          <InlineText text={block.text} />
        </p>
      </div>
    </aside>
  );
}

export function ArticlePage() {
  const { slug = '' } = useParams();
  const article = articleBySlug(slug);
  const category = article ? categoryById(article.categoryId) : undefined;

  usePageMeta({
    title: article ? article.title : 'Article not found',
    description: article?.description ?? 'The requested help article could not be found.',
    noindex: !article,
  });

  if (!article) return <NotFoundPage />;

  const updated = formatDate(article.updatedAt);
  const minutes = readingTimeMinutes(article);
  const headings = article.blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => block.type === 'h2');

  return (
    <article>
      <PageHeader
        eyebrow={category?.title}
        breadcrumbs={[
          { label: 'Support', to: '/' },
          { label: 'Help Articles', to: '/help' },
          { label: article.title },
        ]}
        title={article.title}
        description={article.description}
      >
        <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-muted">
          {category ? (
            <Link to={`/help?category=${category.id}`}>
              <Badge tone="lime" dot>
                {category.title}
              </Badge>
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-3.5" />
            {formatReadingTime(minutes)}
          </span>
          {updated ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              Updated {updated}
            </span>
          ) : null}
        </div>
      </PageHeader>

      <div className="container-page py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-16">
          <div className="min-w-0 max-w-2xl">
            <div className="prose-support">
              {article.blocks.map((block, index) => (
                <Block key={`${block.type}-${index}`} block={block} index={index} />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-card p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.02] text-lime">
                  <LifeBuoy aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-ink">Still stuck on this?</p>
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    Send the details and we will take it from there.
                  </p>
                </div>
              </div>
              <Link to="/submit" className={buttonClasses({ size: 'sm', className: 'shrink-0' })}>
                Submit a request
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <Link
                to="/help"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
              >
                <ArrowLeft aria-hidden="true" className="size-3.5" />
                All help articles
              </Link>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-muted">
                <HelpCircle aria-hidden="true" className="size-3" />
                Maintained by the Rizz Support Center
              </span>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-3">
              {headings.length > 0 ? (
                <nav aria-label="On this page" className="rounded-2xl border border-line bg-card p-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-moss-soft">On this page</p>
                  <ul className="mt-3 space-y-2 border-l border-line pl-3">
                    {headings.map(({ block, index }) => (
                      <li key={index}>
                        <a
                          href={`#${slugFor(index)}`}
                          className="block text-[11.5px] leading-relaxed text-muted transition-colors hover:text-lime"
                        >
                          {block.type === 'h2' ? block.text : ''}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}

              <div className="rounded-2xl border border-line bg-card p-4">
                <p className="text-[12.5px] font-medium text-ink">Need a person?</p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                  Submit a request and track the real status with your reference number.
                </p>
                <div className="mt-4 grid gap-2">
                  <Link to="/submit" className={buttonClasses({ size: 'sm', className: 'w-full' })}>
                    Submit a request
                  </Link>
                  <Link
                    to="/track"
                    className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'w-full' })}
                  >
                    Track a request
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-line pt-10" aria-labelledby="related-heading">
          <div className="flex items-end justify-between gap-4">
            <h2
              id="related-heading"
              className="text-[1.2rem] font-semibold tracking-[-0.02em] text-ink"
            >
              Related articles
            </h2>
            <Link
              to="/help"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted transition-colors hover:text-lime"
            >
              View all
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles(article, 3).map((related) => (
              <ArticleCard key={related.slug} article={related} />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
