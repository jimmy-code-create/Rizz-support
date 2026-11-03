import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  CornerDownLeft,
  FileText,
  HelpCircle,
  LayoutGrid,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';
import { Highlight } from '@/components/ui/Highlight';
import {
  POPULAR_SEARCHES,
  flattenHits,
  helpSearchHref,
  searchSupport,
  type SearchHit,
  type SearchKind,
} from '@/lib/search';

type SearchVariant = 'hero' | 'compact' | 'modal';

interface SearchBoxProps {
  variant?: SearchVariant;
  autoFocus?: boolean;
  onNavigate?: () => void;
  showPopular?: boolean;
  className?: string;
  inputLabel?: string;
}

interface PanelPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const KIND_ICON: Record<SearchKind, typeof FileText> = {
  article: FileText,
  faq: HelpCircle,
  category: LayoutGrid,
};

const VARIANT_FRAME: Record<SearchVariant, string> = {
  hero: 'h-14 rounded-[14px] px-4 sm:h-[58px]',
  compact: 'h-11 rounded-[10px] px-3.5',
  modal: 'h-[52px] rounded-xl px-4',
};

const VARIANT_INPUT: Record<SearchVariant, string> = {
  hero: 'text-[16px] sm:text-[15px]',
  compact: 'text-[16px] sm:text-sm',
  modal: 'text-[16px] sm:text-[15px]',
};

const HEADER_OFFSET = 72;
const VIEWPORT_MARGIN = 12;

export function SearchBox({
  variant = 'hero',
  autoFocus = false,
  onNavigate,
  showPopular = false,
  className,
  inputLabel = 'Search help, articles, or common issues',
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const panelId = `${listboxId}-panel`;
  const hintId = useId();

  const groups = useMemo(() => searchSupport(query, variant === 'hero' ? 5 : 4), [query, variant]);
  const hits = useMemo(() => flattenHits(groups), [groups]);
  const hasQuery = query.trim().length > 0;
  const showPanel = open;
  const showInlinePopular = showPopular && !hasQuery;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const updatePosition = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportTop = viewport?.offsetTop ?? 0;
    const width = Math.min(Math.max(rect.width, 300), viewportWidth - VIEWPORT_MARGIN * 2);
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN),
    );
    const hasLayout = rect.width > 0 || rect.height > 0;
    if (
      hasLayout &&
      (rect.bottom < HEADER_OFFSET + 4 ||
        rect.top > (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight))
    ) {
      close();
      return;
    }

    const belowTop = rect.bottom + 8;
    const belowSpace = viewportTop + viewportHeight - belowTop - VIEWPORT_MARGIN;
    const minTop = viewportTop + HEADER_OFFSET + 8;
    const aboveSpace = rect.top - minTop - 8;

    let top = belowTop;
    let maxHeight = Math.min(430, belowSpace);

    // Flip above the field when the viewport (or an open Android keyboard)
    // leaves too little room underneath.
    if (belowSpace < 220 && aboveSpace > belowSpace) {
      maxHeight = Math.min(430, aboveSpace);
      top = rect.top - maxHeight - 8;
    }

    if (top < minTop) {
      top = minTop;
      maxHeight = viewportTop + viewportHeight - top - VIEWPORT_MARGIN;
    }

    setPosition({
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(width),
      maxHeight: Math.round(Math.max(0, Math.min(430, maxHeight))),
    });
  }, [close]);

  useLayoutEffect(() => {
    if (!showPanel) return;
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.visualViewport?.addEventListener('resize', updatePosition);
    window.visualViewport?.addEventListener('scroll', updatePosition);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.visualViewport?.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, [showPanel, updatePosition]);

  useEffect(() => {
    if (!showPanel) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [showPanel, close]);

  const goToHit = (hit: SearchHit) => {
    close();
    setQuery('');
    onNavigate?.();
    navigate(hit.href);
  };

  const goToAllResults = () => {
    if (!query.trim()) return;
    close();
    onNavigate?.();
    navigate(helpSearchHref(query));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!showPanel) {
        setOpen(true);
        return;
      }
      setActiveIndex((current) => (hits.length ? (current + 1) % hits.length : -1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!showPanel) return;
      setActiveIndex((current) =>
        hits.length ? (current <= 0 ? hits.length - 1 : current - 1) : -1,
      );
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const hit = activeIndex >= 0 ? hits[activeIndex] : undefined;
      if (hit) goToHit(hit);
      else goToAllResults();
      return;
    }
    if (event.key === 'Escape') {
      if (showPanel) {
        event.preventDefault();
        close();
      }
      return;
    }
  };

  const runPopularSearch = (value: string) => {
    setQuery(value);
    setOpen(true);
    inputRef.current?.focus();
  };

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;
  const modal = variant === 'modal';

  const panel =
    position && showPanel ? (
      <motion.div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-label="Search suggestions"
        initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.995 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 430, damping: 34, mass: 0.7 }
        }
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
          zIndex: modal ? 95 : 45,
        }}
        className="flex flex-col overflow-hidden rounded-xl border border-line-strong bg-surface shadow-pop"
        data-search-panel
      >
        {hasQuery ? (
          <>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-subtle px-3.5 py-2.5">
              <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
                Results for <span className="text-muted">“{query.trim()}”</span>
              </p>
              <span className="shrink-0 text-[10px] tabular-nums text-faint">
                {hits.length} {hits.length === 1 ? 'match' : 'matches'}
              </span>
            </div>

            {hits.length > 0 ? (
              <>
                <div
                  id={listboxId}
                  role="listbox"
                  aria-label="Search results"
                  className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
                >
                  {groups.map((group) => {
                    let runningIndex = 0;
                    const preceding = groups
                      .slice(0, groups.indexOf(group))
                      .reduce((sum, entry) => sum + entry.hits.length, 0);
                    return (
                      <div key={group.kind} role="group" aria-label={group.label} className="pb-1.5">
                        <p
                          aria-hidden="true"
                          className="px-2.5 pb-1 pt-2 text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint"
                        >
                          {group.label}
                        </p>
                        <div>
                          {group.hits.map((hit) => {
                            const index = preceding + runningIndex;
                            runningIndex += 1;
                            const active = index === activeIndex;
                            const Icon = KIND_ICON[hit.kind];
                            return (
                              <div
                                key={`${hit.kind}-${hit.id}`}
                                id={`${listboxId}-option-${index}`}
                                role="option"
                                aria-selected={active}
                                aria-label={`${hit.title}${hit.categoryTitle ? ` — ${hit.categoryTitle}` : ''}`}
                                tabIndex={-1}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => goToHit(hit)}
                                className={cn(
                                  'flex min-h-[54px] cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-150',
                                  active ? 'bg-white/[0.055]' : 'hover:bg-white/[0.03]',
                                )}
                              >
                                <span
                                  className={cn(
                                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                                    active
                                      ? 'border-lime/25 bg-lime/[0.07] text-lime'
                                      : 'border-line bg-white/[0.02] text-muted',
                                  )}
                                >
                                  <Icon aria-hidden="true" className="size-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[13.5px] font-medium text-ink">
                                    <Highlight text={hit.title} query={query} />
                                  </span>
                                  <span className="mt-1 block truncate text-[11.5px] text-faint">
                                    {hit.categoryTitle ? (
                                      <span className="text-moss-soft">{hit.categoryTitle}</span>
                                    ) : null}
                                    {hit.categoryTitle ? ' · ' : ''}
                                    {hit.description}
                                  </span>
                                </span>
                                <ArrowRight
                                  aria-hidden="true"
                                  className={cn(
                                    'mt-1.5 size-3.5 shrink-0 transition-all duration-150',
                                    active
                                      ? 'translate-x-0 text-lime opacity-100'
                                      : '-translate-x-1 opacity-0',
                                  )}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line-subtle bg-black/20 px-3.5 py-2.5">
                  <span className="hidden items-center gap-1.5 text-[10.5px] text-faint sm:flex">
                    <CornerDownLeft aria-hidden="true" className="size-3" />
                    Enter to open · Esc to close
                  </span>
                  <Link
                    to={helpSearchHref(query)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      close();
                      onNavigate?.();
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-lime transition-colors hover:text-lime-deep"
                  >
                    See all results
                    <ArrowRight aria-hidden="true" className="size-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="min-h-0 overflow-y-auto px-5 py-6">
                <p className="text-[13px] font-medium text-ink">No results for “{query.trim()}”</p>
                <p className="mt-1.5 max-w-[42ch] text-[12px] leading-relaxed text-muted">
                  Try a shorter phrase, browse the FAQs, or send the details to support and we will
                  look into it.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to="/submit"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      close();
                      onNavigate?.();
                    }}
                    className="inline-flex h-9 items-center rounded-lg bg-lime px-3 text-[11.5px] font-medium text-[#0A0E08] transition-colors hover:bg-lime-deep active:bg-[#9bea26]"
                  >
                    Submit a request
                    <ArrowRight aria-hidden="true" className="ml-1.5 size-3" />
                  </Link>
                  <Link
                    to="/faqs"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      close();
                      onNavigate?.();
                    }}
                    className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-raised/60 px-3 text-[11.5px] font-medium text-ink transition-colors hover:bg-raised active:bg-elevated"
                  >
                    Browse FAQs
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="min-h-0 overflow-y-auto p-3.5 sm:p-4">
            <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint">
              Popular searches
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runPopularSearch(entry.query)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-3 py-2 text-[11.5px] text-muted transition-colors hover:border-line-strong hover:bg-white/[0.04] hover:text-ink"
                >
                  {entry.label}
                  <ArrowUpRight aria-hidden="true" className="size-3 text-faint" />
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-line-subtle pt-3">
              <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint">
                Browse
              </p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                <Link
                  to="/help"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    close();
                    onNavigate?.();
                  }}
                  className="flex min-h-10 items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[12.5px] text-ink transition-colors hover:bg-white/[0.04]"
                >
                  All help articles
                  <ArrowRight aria-hidden="true" className="size-3.5 text-faint" />
                </Link>
                <Link
                  to="/faqs"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    close();
                    onNavigate?.();
                  }}
                  className="flex min-h-10 items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-[12.5px] text-ink transition-colors hover:bg-white/[0.04]"
                >
                  Frequently asked questions
                  <ArrowRight aria-hidden="true" className="size-3.5 text-faint" />
                </Link>
              </div>
            </div>

            <p className="mt-2 border-t border-line-subtle px-1 pt-3 text-[10.5px] text-faint">
              Type a word like “login”, “bug”, or “realm”.
            </p>
          </div>
        )}
      </motion.div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={cn('relative w-full', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const hit = activeIndex >= 0 ? hits[activeIndex] : undefined;
          if (hit) goToHit(hit);
          else goToAllResults();
        }}
      >
        <div
          ref={frameRef}
          className={cn('search-frame group', VARIANT_FRAME[variant], showPanel && 'border-lime/40')}
        >
          <Search
            aria-hidden="true"
            className={cn(
              'shrink-0 transition-colors duration-200',
              variant === 'hero' ? 'size-[18px]' : 'size-4',
              showPanel ? 'text-lime' : 'text-muted group-focus-within:text-lime',
            )}
          />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={showPanel ? panelId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label={inputLabel}
            aria-describedby={hintId}
            autoComplete="off"
            spellCheck={false}
            placeholder={
              variant === 'hero'
                ? 'Search help articles, FAQs, or an issue...'
                : 'Search for help, articles, or common issues...'
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              'min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted/80 focus:outline-none',
              VARIANT_INPUT[variant],
            )}
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="flex size-9 items-center justify-center rounded-md text-faint transition-colors hover:bg-white/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden shrink-0 rounded-md border border-line bg-raised/70 px-1.5 py-1 font-sans text-[10px] font-medium text-faint sm:inline-flex">
              Enter
            </kbd>
          )}
        </div>
        <span id={hintId} className="sr-only">
          Results update as you type. Use the up and down arrow keys to browse results and Enter to open one.
        </span>
      </form>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>{panel}</AnimatePresence>,
            document.body,
          )
        : null}

      {showInlinePopular ? (
        <div className={cn('mt-4 flex flex-wrap items-center gap-2', showPanel && 'invisible')}>
          <span className="mr-0.5 text-[10.5px] uppercase tracking-[0.12em] text-faint">Popular</span>
          {POPULAR_SEARCHES.map((entry) => (
            <button
              key={entry.label}
              type="button"
              onClick={() => runPopularSearch(entry.query)}
              className="rounded-full border border-line bg-white/[0.02] px-3 py-2 text-[11.5px] text-muted transition-[color,border-color,background-color] duration-150 hover:border-line-strong hover:bg-white/[0.04] hover:text-ink"
            >
              {entry.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
