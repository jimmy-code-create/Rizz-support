import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { SearchBox } from '@/components/search/SearchBox';

interface PaletteContextValue {
  openPalette: () => void;
}

const PaletteContext = createContext<PaletteContextValue | null>(null);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * Global command palette: ⌘K / Ctrl+K from anywhere, or "/" outside inputs.
 */
export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const openPalette = useCallback(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    const target = restoreFocusRef.current;
    if (target && document.contains(target)) window.setTimeout(() => target.focus(), 0);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) closePalette();
        else openPalette();
        return;
      }
      if (event.key === '/' && !isEditableTarget(event.target) && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        openPalette();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, openPalette, closePalette]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePalette();
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closePalette]);

  const value = useMemo(() => ({ openPalette }), [openPalette]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/70 px-4 pb-8 pt-[10vh] backdrop-blur-[6px] sm:pt-[14vh]"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closePalette();
              }}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Search the Rizz Support Center"
                className="animate-scale-in w-full max-w-2xl overflow-hidden rounded-panel border border-line-strong bg-base shadow-pop"
              >
                <div className="flex items-center justify-between border-b border-line-subtle px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-moss-soft">
                    <Search aria-hidden="true" className="size-3.5" />
                    Search support
                  </div>
                  <button
                    type="button"
                    onClick={closePalette}
                    aria-label="Close search"
                    className="flex items-center gap-1.5 rounded-md border border-line bg-white/[0.02] px-2 py-1 text-[10px] text-muted transition-colors hover:text-ink"
                  >
                    <X aria-hidden="true" className="size-3" />
                    Esc
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <SearchBox
                    variant="modal"
                    autoFocus
                    showPopular
                    onNavigate={closePalette}
                    inputLabel="Search the support center"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line-subtle bg-black/20 px-4 py-2.5 text-[10.5px] text-faint sm:px-5">
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-line bg-raised/70 px-1 py-0.5 text-[9.5px]">↑</kbd>
                    <kbd className="rounded border border-line bg-raised/70 px-1 py-0.5 text-[9.5px]">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="rounded border border-line bg-raised/70 px-1 py-0.5 text-[9.5px]">↵</kbd>
                    to open
                  </span>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </PaletteContext.Provider>
  );
}

export function useSearchPalette(): PaletteContextValue {
  const context = useContext(PaletteContext);
  if (!context) throw new Error('useSearchPalette must be used inside SearchPaletteProvider');
  return context;
}
