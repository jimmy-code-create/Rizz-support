import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

export interface AccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  className?: string;
  idPrefix?: string;
}

function hashId(): string {
  return window.location.hash.replace(/^#/, '');
}

/**
 * Accessible disclosure list. Opening an item via a URL hash works too,
 * which is what search results and shared links rely on.
 */
export function Accordion({ items, defaultOpenId, className, idPrefix = 'faq' }: AccordionProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [openId, setOpenId] = useState<string | null>(() => {
    const fromHash = hashId();
    if (fromHash && items.some((item) => item.id === fromHash)) return fromHash;
    return defaultOpenId ?? null;
  });

  useEffect(() => {
    const syncFromHash = () => {
      const fromHash = hashId();
      if (fromHash && items.some((item) => item.id === fromHash)) {
        setOpenId(fromHash);
        window.requestAnimationFrame(() => {
          document.getElementById(fromHash)?.scrollIntoView({ block: 'start' });
        });
      }
    };
    window.addEventListener('hashchange', syncFromHash);
    syncFromHash();
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [items]);

  const toggle = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <div className={cn('divide-y divide-line-subtle overflow-hidden rounded-card border border-line-subtle bg-card/70', className)}>
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${idPrefix}-panel-${item.id}`;
        const buttonId = `${idPrefix}-button-${item.id}`;
        return (
          <div key={item.id} id={item.id} className="scroll-mt-28">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  'group flex min-h-[60px] w-full items-center justify-between gap-6 px-5 py-4.5 text-left transition-colors duration-200 sm:px-6',
                  open ? 'bg-white/[0.025]' : 'hover:bg-white/[0.02]',
                )}
              >
                <span
                  className={cn(
                    'text-[14px] font-medium leading-snug tracking-[-0.012em] transition-colors sm:text-[14.5px]',
                    open ? 'text-ink' : 'text-ink/90 group-hover:text-ink',
                  )}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color,color,background-color] duration-250',
                    open ? 'rotate-180 border-line-strong bg-white/[0.04] text-lime' : 'border-line text-faint group-hover:border-line-strong group-hover:text-muted',
                  )}
                >
                  <ChevronDown className="size-3.5" />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-open={open}
              aria-hidden={!open}
              inert={!open}
              className="accordion-panel"
            >
              <div className="accordion-inner">
                <motion.div
                  initial={false}
                  animate={{ opacity: open ? 1 : 0, y: open ? 0 : -3 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                  className="max-w-[64ch] px-5 pb-5 pr-12 text-[13px] leading-[1.8] text-muted sm:px-6 sm:text-[13.5px]"
                >
                  {item.answer}
                </motion.div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
