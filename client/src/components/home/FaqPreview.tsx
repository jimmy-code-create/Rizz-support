import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FAQS } from '@/content/faqs';
import { Accordion } from '@/components/ui/Accordion';
import { buttonClasses } from '@/components/ui/Button';

const PREVIEW_IDS = [
  'what-is-rizz',
  'how-do-i-create-an-account',
  'cannot-log-in',
  'how-to-report-a-bug',
  'how-to-suggest-a-feature',
  'why-website-not-loading',
];

export function FaqPreview() {
  const items = PREVIEW_IDS.flatMap((id) => {
    const faq = FAQS.find((entry) => entry.id === id);
    if (!faq) return [];
    return [
      {
        id: faq.id,
        question: faq.question,
        answer: <p>{faq.answer}</p>,
      },
    ];
  });

  return (
    <section className="border-y border-line bg-surface/40 py-16 md:py-20" aria-labelledby="faq-preview-heading">
      <div className="container-page">
        <div className="grid gap-9 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-moss-soft">
                <span className="size-1 rounded-full bg-lime" aria-hidden="true" />
                Common questions
              </p>
              <h2
                id="faq-preview-heading"
                className="mt-3 text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[1.85rem]"
              >
                Answers, without the runaround
              </h2>
              <p className="mt-3 max-w-xs text-[13px] leading-[1.7] text-muted">
                Straight answers about accounts, reporting problems, and getting in touch with the
                support team.
              </p>
              <Link
                to="/faqs"
                className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'mt-6' })}
              >
                See all FAQs
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-8">
            <Accordion items={items} idPrefix="home-faq" />
          </div>
        </div>
      </div>
    </section>
  );
}
