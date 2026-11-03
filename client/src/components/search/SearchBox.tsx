import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CornerDownLeft, FileText, HelpCircle, LayoutGrid, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
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
  const navigate = useNavigate();
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const hintId = useId();

  const groups = useMemo(() => searchSupport(query, variant === 'hero' ? 5 : 4), [query, variant]);
  const hits = useMemo(() => flattenHits(groups), [groups]);
  const hasQuery = query.trim().length > 0;
  const showPanel = open && hasQuery;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const goToHit = (hit: SearchHit) => {
    close();
    setQuery('');
    onNavigate?.();
    navigate(hit.href);
  };

  const goToAllResults = () => {
    if (!query.trim()) return;
    const href = helpSearchHref(query);
    close();
    onNavigate?.();
    navigate(href);
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

  return (
    <div
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
          className={cn(
            'search-frame group',
            VARIANT_FRAME[variant],
            showPanel && 'border-lime/40',
          )}
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
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label={inputLabel}
            aria-describedby={hintId}
            autoComplete="off"
            spellCheck={false}
            placeholder={variant === 'hero' ? 'Search help articles, FAQs, or an issue...' : 'Search for help, articles, or common issues...'}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
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
              className="flex size-8 items-center justify-center rounded-md text-faint transition-colors hover:bg-white/5 hover:text-ink"
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

      {showPanel ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 animate-scale-in overflow-hidden rounded-xl border border-line-strong bg-surface shadow-pop">
          {hits.length > 0 ? (
            <>
              <div
                id={listboxId}
                role="listbox"
                aria-label="Search results"
                className="max-h-[min(26rem,60vh)] overflow-y-auto p-2"
              >
                {groups.map((group) => {
                  let runningIndex = 0;
                  const preceding = groups
                    .slice(0, groups.indexOf(group))
                    .reduce((sum, entry) => sum + entry.hits.length, 0);
                  return (
                    <div key={group.kind} role="group" aria-label={group.label} className="pb-1.5">
                      <p aria-hidden="true" className="px-2.5 pb-1 pt-2 text-[9.5px] font-medium uppercase tracking-[0.16em] text-faint">
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
                                'flex cursor-pointer items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors duration-150',
                                active ? 'bg-white/[0.045]' : 'hover:bg-white/[0.025]',
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
                                <span className="block truncate text-[13px] font-medium text-ink">
                                  <Highlight text={hit.title} query={query} />
                                </span>
                                <span className="mt-0.5 block truncate text-[11.5px] text-muted">
                                  {hit.categoryTitle ? `${hit.categoryTitle} · ` : ''}
                                  {hit.description}
                                </span>
                              </span>
                              <ArrowRight
                                aria-hidden="true"
                                className={cn(
                                  'mt-1 size-3.5 shrink-0 transition-all',
                                  active ? 'translate-x-0 text-lime opacity-100' : '-translate-x-1 opacity-0',
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
              <div className="flex items-center justify-between gap-3 border-t border-line-subtle bg-black/20 px-4 py-2.5">
                <span className="hidden items-center gap-1.5 text-[10.5px] text-muted sm:flex">
                  <CornerDownLeft aria-hidden="true" className="size-3" />
                  Enter to open · Esc to close
                </span>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={goToAllResults}
                  className="text-[11px] font-medium text-lime transition-colors hover:text-lime-deep"
                >
                  See all results for “{query.trim()}”
                </button>
              </div>
            </>
          ) : (
            <div className="px-5 py-6">
              <p className="text-[13px] font-medium text-ink">No results for “{query.trim()}”</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Try a shorter phrase, or send us the details and we will look into it.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    close();
                    onNavigate?.();
                    navigate('/submit');
                  }}
                  className="inline-flex h-8 items-center rounded-lg bg-lime px-3 text-[11.5px] font-medium text-[#0A0E08] hover:bg-lime-deep"
                >
                  Submit a request
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    close();
                    onNavigate?.();
                    navigate('/faqs');
                  }}
                  className="inline-flex h-8 items-center rounded-lg border border-line-strong bg-raised/60 px-3 text-[11.5px] font-medium text-ink hover:bg-raised"
                >
                  Browse FAQs
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {showPopular && !hasQuery ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
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

export function PopularSearches({ onSelect, className }: { onSelect: (query: string) => void; className?: string }): ReactNode {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-[11px] text-muted/80">Popular searches</span>
      {POPULAR_SEARCHES.map((entry) => (
        <button
          key={entry.label}
          type="button"
          onClick={() => onSelect(entry.query)}
          className="rounded-full border border-line bg-white/[0.02] px-3 py-2 text-[11.5px] text-muted transition-colors hover:border-lime/30 hover:text-lime"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
