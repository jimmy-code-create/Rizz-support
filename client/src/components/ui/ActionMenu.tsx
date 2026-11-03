import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePrefersReducedMotion } from '@/lib/use-reduced-motion';

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onSelect?: () => void | Promise<void>;
  to?: string;
  tone?: 'default' | 'danger';
}

interface ActionMenuProps {
  label: string;
  items: ActionMenuItem[];
  className?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

const MENU_WIDTH = 216;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;
const HEADER_OFFSET = 72;

export function ActionMenu({ label, items, className }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const shouldFocusRef = useRef(false);
  const menuId = useId();

  const close = useCallback((restoreFocus = false) => {
    shouldFocusRef.current = false;
    setOpen(false);
    setPosition(null);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportHeight = viewport?.height ?? window.innerHeight;
    const viewportTop = viewport?.offsetTop ?? 0;
    const width = Math.min(MENU_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
    const measuredHeight = menu.offsetHeight || items.length * 40 + 12;
    const minTop = viewportTop + HEADER_OFFSET;
    const availableBelow = viewportTop + viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const availableAbove = rect.top - minTop - MENU_GAP;
    const openAbove = availableBelow < measuredHeight && availableAbove > availableBelow;

    let top = openAbove ? rect.top - Math.min(measuredHeight, availableAbove) - MENU_GAP : rect.bottom + MENU_GAP;
    let maxHeight = openAbove ? availableAbove : availableBelow;

    top = Math.min(
      Math.max(top, minTop),
      Math.max(minTop, viewportTop + viewportHeight - VIEWPORT_MARGIN - Math.min(measuredHeight, maxHeight)),
    );
    maxHeight = Math.max(0, Math.min(maxHeight, viewportTop + viewportHeight - top - VIEWPORT_MARGIN));

    let left = rect.right - width;
    left = Math.min(Math.max(left, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, viewportWidth - width - VIEWPORT_MARGIN));

    setPosition({
      top: Math.round(top),
      left: Math.round(left),
      width: Math.round(width),
      maxHeight: Math.round(maxHeight),
    });
  }, [items.length]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);

    const onResize = () => updatePosition();
    const onScroll = (event: Event) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      close(false);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open, updatePosition, close]);

  useLayoutEffect(() => {
    if (!open || !position || !shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    itemRefs.current[0]?.focus();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const focusItem = (index: number) => {
    if (!items.length) return;
    const next = (index + items.length) % items.length;
    itemRefs.current[next]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(current < 0 ? 0 : current + 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusItem(current < 0 ? items.length - 1 : current - 1);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      focusItem(0);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      focusItem(items.length - 1);
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    }
  };

  const runAction = (item: ActionMenuItem) => {
    shouldFocusRef.current = false;
    setOpen(false);
    setPosition(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
    if (item.onSelect) void item.onSelect();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) close(false);
          else {
            shouldFocusRef.current = true;
            setPosition(null);
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            shouldFocusRef.current = true;
            setPosition(null);
            setOpen(true);
          }
        }}
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border border-transparent text-faint transition-colors hover:border-line hover:bg-white/[0.04] hover:text-ink',
          open && 'border-line bg-white/[0.04] text-ink',
          className,
        )}
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </button>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <div role="region" aria-label={`${label} menu`}>
                <motion.div
                  ref={menuRef}
                  id={menuId}
                  role="menu"
                  aria-label={`${label} menu`}
                  onKeyDown={onMenuKeyDown}
                  initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3, scale: 0.985 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 480, damping: 36, mass: 0.65 }
                  }
                  style={{
                    position: 'fixed',
                    top: position?.top ?? 0,
                    left: position?.left ?? 0,
                    width: position?.width ?? MENU_WIDTH,
                    maxHeight: position?.maxHeight ?? 320,
                    zIndex: 45,
                    visibility: position ? 'visible' : 'hidden',
                  }}
                  className="overflow-y-auto overscroll-contain rounded-xl border border-line-strong bg-surface p-1.5 shadow-pop"
                >
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const itemClass = cn(
                      'flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[12.5px] transition-colors focus:bg-white/[0.06] focus:outline-none',
                      item.tone === 'danger'
                        ? 'text-error hover:bg-error/[0.08]'
                        : 'text-ink hover:bg-white/[0.05]',
                    );
                    return item.to ? (
                      <Link
                        key={item.label}
                        ref={(node) => {
                          itemRefs.current[index] = node;
                        }}
                        to={item.to}
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => close(false)}
                        className={itemClass}
                      >
                        <Icon aria-hidden="true" className="size-3.5 shrink-0 opacity-70" />
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        key={item.label}
                        ref={(node) => {
                          itemRefs.current[index] = node;
                        }}
                        type="button"
                        role="menuitem"
                        tabIndex={-1}
                        onClick={() => runAction(item)}
                        className={itemClass}
                      >
                        <Icon aria-hidden="true" className="size-3.5 shrink-0 opacity-70" />
                        {item.label}
                      </button>
                    );
                  })}
                </motion.div>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
