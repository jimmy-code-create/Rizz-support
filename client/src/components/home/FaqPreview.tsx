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
    <section className="section border-y border-line-subtle bg-surface/40" aria-labelledby="faq-preview-heading">
      <div className="container-page">
        <div className="grid gap-9 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow">Common questions</p>
              <h2 id="faq-preview-heading" className="section-title mt-3.5">
                Answers, without the runaround
              </h2>
              <p className="mt-3 max-w-[30ch] text-[13px] leading-[1.7] text-muted">
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
