import { useRef, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, HelpCircle, LifeBuoy, Sparkles, ThumbsUp } from 'lucide-react';
import { ARTICLES } from '@/content/articles';
import { FAQS } from '@/content/faqs';
import { SearchBox } from '@/components/search/SearchBox';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

const QUICK_PATHS = [
  {
    to: '/help',
    label: 'Browse help articles',
    detail: 'Step-by-step guides for common problems',
    icon: BookOpen,
  },
  {
    to: '/faqs',
    label: 'Read the FAQs',
    detail: 'Short answers about Rizz and support',
    icon: HelpCircle,
  },
  {
    to: '/track',
    label: 'Track a request',
    detail: 'Check the real status of a ticket',
    icon: LifeBuoy,
  },
  {
    to: '/issues',
    label: 'Community issue board',
    detail: 'Upvote bugs and requests from other people',
    icon: ThumbsUp,
  },
] as const;

// Only verified Rizz surfaces — see AGENTS.md product constraints.
const TOPICS = ['Feed', 'Realms', 'Voice rooms', 'Messages', '24h stories', 'Your @', 'Log in'];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    sectionRef.current.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    sectionRef.current.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  const word = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: '0.45em', filter: 'blur(8px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.7, ease: EASE, delay },
        };

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="hero-shell relative overflow-hidden border-b border-line-subtle"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="hero-canvas" />
        <div className="bg-grid absolute inset-0" />
        <div className="hero-spotlight" />
        <div className="hero-orb hero-orb-a" />
        <div className="hero-orb hero-orb-b" />
      </div>

      <div className="container-page relative">
        <div className="grid gap-12 pb-14 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-14 lg:pb-20 lg:pt-20">
          <div>
            <motion.span
              {...word(0)}
              className="inline-flex items-center gap-2 rounded-full border border-lime/25 bg-lime/[0.06] py-1.5 pl-2 pr-3.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-lime"
            >
              <span className="relative flex size-3.5 items-center justify-center" aria-hidden="true">
                <span className="pulse-ring absolute size-3.5 rounded-full bg-lime/30" />
                <span className="size-1.5 rounded-full bg-lime" />
              </span>
              Rizz Support Center
            </motion.span>

            <h1 className="display-xl mt-6">
              <motion.span {...word(0.08)} className="inline-block">
                How
              </motion.span>{' '}
              <motion.span {...word(0.16)} className="inline-block">
                can
              </motion.span>{' '}
              <motion.span {...word(0.24)} className="inline-block">
                we
              </motion.span>{' '}
              <motion.span {...word(0.32)} className="inline-block">
                help
              </motion.span>{' '}
              <motion.span {...word(0.42)} className="text-shine inline-block">
                you?
              </motion.span>
            </h1>

            <motion.p {...word(0.55)} className="lede mt-6 max-w-[44ch] !text-[1.0625rem] text-ink-soft">
              Stuck on something? <span className="font-semibold text-ink">Get unstuck fast.</span>{' '}
              Search answers, fix problems, and get back to the good stuff on Rizz.
            </motion.p>

            <motion.div {...word(0.65)} className="mt-8 w-full max-w-[38rem]">
              <SearchBox variant="hero" showPopular />
            </motion.div>

            <motion.div
              {...word(0.75)}
              className="mt-7 flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted"
            >
              <span className="stat-pill">
                <strong className="text-lime">{ARTICLES.length}</strong> help articles
              </span>
              <span className="stat-pill">
                <strong className="text-lime">{FAQS.length}</strong> answers
              </span>
              <span className="stat-pill">
                <Sparkles aria-hidden="true" className="size-3 text-lime" /> Real ticket tracking
              </span>
            </motion.div>
          </div>

          <motion.aside
            aria-label="Quick support paths"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="lg:w-full lg:justify-self-end"
          >
            <div className="glow-border rounded-panel">
              <div className="overflow-hidden rounded-panel border border-line-subtle bg-gradient-to-b from-card to-surface shadow-card">
                <div className="flex items-center justify-between gap-4 border-b border-line-subtle px-4 py-3.5">
                  <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-ink">Start here</h2>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-lime/80">
                    Self-serve
                  </p>
                </div>

                <div className="divide-y divide-line-subtle">
                  {QUICK_PATHS.map(({ to, label, detail, icon: Icon }, index) => (
                    <motion.div
                      key={to}
                      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.5 + index * 0.08 }}
                    >
                      <Link
                        to={to}
                        className="quick-path group flex min-h-[72px] items-center gap-3.5 px-4 py-3.5"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-line bg-white/[0.02] text-muted transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:border-lime/40 group-hover:bg-lime group-hover:text-on-lime">
                          <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold tracking-[-0.015em] text-ink">
                            {label}
                          </span>
                          <span className="mt-1 block text-[12px] leading-snug text-faint">{detail}</span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-1 group-hover:text-lime"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 border-t border-line-subtle bg-black/20 px-4 py-3">
                  <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
                  <p className="text-[10.5px] leading-relaxed text-faint">
                    Every request gets a real, trackable reference.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <div className="marquee relative border-t border-line-subtle bg-lime text-on-lime" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-group">
              {TOPICS.map((topic) => (
                <span key={topic} className="marquee-item">
                  {topic}
                  <span className="marquee-dot">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
