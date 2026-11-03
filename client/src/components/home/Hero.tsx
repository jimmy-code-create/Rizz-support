import { ARTICLES } from '@/data/articles';
import { FAQS } from '@/data/faqs';
import { SearchBox } from '@/components/search/SearchBox';

export function Hero() {
  return (
    <section className="relative border-b border-line/70">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-ambient" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="container-page relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center pb-14 pt-16 text-center sm:pb-16 sm:pt-20 md:pb-20 md:pt-24">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.025] py-1.5 pl-2 pr-3.5 text-[11px] font-medium text-muted">
            <span className="relative flex size-4 items-center justify-center" aria-hidden="true">
              <span className="absolute size-4 rounded-full bg-lime/10" />
              <span className="size-1.5 rounded-full bg-lime" />
            </span>
            Rizz Support Center
          </div>

          <h1
            className="animate-fade-up mt-6 text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[3.4rem] md:text-[4rem]"
            style={{ animationDelay: '40ms' }}
          >
            How can we help you?
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-[14.5px] leading-[1.75] text-muted sm:text-[15.5px]"
            style={{ animationDelay: '90ms' }}
          >
            Find answers, troubleshoot issues, and get the support you need to enjoy Rizz.
          </p>

          <div className="animate-fade-up mt-9 w-full max-w-2xl" style={{ animationDelay: '140ms' }}>
            <SearchBox variant="hero" showPopular />
          </div>

          <p
            className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-muted"
            style={{ animationDelay: '190ms' }}
          >
            <span>{ARTICLES.length} help articles</span>
            <span aria-hidden="true" className="size-0.5 rounded-full bg-moss" />
            <span>{FAQS.length} answers</span>
            <span aria-hidden="true" className="size-0.5 rounded-full bg-moss" />
            <span>Real ticket tracking</span>
          </p>
        </div>
      </div>
    </section>
  );
}
