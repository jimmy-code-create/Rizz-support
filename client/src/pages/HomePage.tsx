import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageMeta } from '@/lib/seo';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/support/CategoryGrid';
import { PopularArticles } from '@/components/home/PopularArticles';
import { TrackTeaser } from '@/components/home/TrackTeaser';
import { FaqPreview } from '@/components/home/FaqPreview';
import { ContactCTA } from '@/components/home/ContactCTA';
import { buttonClasses } from '@/components/ui/Button';

export function HomePage() {
  usePageMeta({
    title: 'Rizz Support Center — Help, FAQs & Request Tracking',
    description:
      'Find answers, troubleshoot issues, and get the support you need to enjoy Rizz. Search help articles, browse FAQs, submit a request, and track its status.',
  });

  return (
    <>
      <Hero />

      <section className="container-page py-16 md:py-20" aria-labelledby="categories-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
              <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
              Get help
            </p>
            <h2
              id="categories-heading"
              className="mt-3 text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[1.85rem]"
            >
              Browse support categories
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-[1.7] text-muted">
              Choose the area that matches your question. Every category leads to guides and the
              right request form.
            </p>
          </div>
          <Link
            to="/submit"
            className={buttonClasses({
              variant: 'ghost',
              size: 'sm',
              className: 'self-start text-muted sm:self-auto',
            })}
          >
            Can&rsquo;t find it? Submit a request
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <div className="mt-8">
          <CategoryGrid />
        </div>
      </section>

      <PopularArticles />
      <TrackTeaser />
      <FaqPreview />
      <ContactCTA />
    </>
  );
}
