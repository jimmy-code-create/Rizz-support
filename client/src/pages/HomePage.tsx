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
import { Reveal } from '@/components/ui/Reveal';

export function HomePage() {
  usePageMeta({
    title: 'Rizz Support Center — Help, FAQs & Request Tracking',
    description:
      'Find answers, troubleshoot issues, and get the support you need to enjoy Rizz. Search help articles, browse FAQs, submit a request, and track its status.',
  });

  return (
    <>
      <Hero />

      <section className="section" aria-labelledby="categories-heading">
        <Reveal className="container-page">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow">Get help</p>
              <h2 id="categories-heading" className="section-title-bold mt-3.5">
                Browse support <span className="text-lime">categories</span>
              </h2>
              <p className="mt-3 max-w-[52ch] text-[13px] leading-[1.7] text-muted">
                Choose the area that matches your question. Every category leads to guides and the
                right request form.
              </p>
            </div>
            <Link
              to="/submit"
              className={buttonClasses({
                variant: 'ghost',
                size: 'sm',
                className: 'self-start sm:self-auto',
              })}
            >
              Can&rsquo;t find it? Submit a request
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>

          <div className="mt-8 sm:mt-10">
            <CategoryGrid />
          </div>
        </Reveal>
      </section>

      <Reveal>
        <PopularArticles />
      </Reveal>
      <Reveal>
        <TrackTeaser />
      </Reveal>
      <Reveal>
        <FaqPreview />
      </Reveal>
      <Reveal>
        <ContactCTA />
      </Reveal>
    </>
  );
}
