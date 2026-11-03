import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItemData {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (item: { title: string; description?: string; tone?: ToastTone }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'text-success',
  error: 'text-error',
  info: 'text-info',
};

function ToastCard({ item, onDismiss }: { item: ToastItemData; onDismiss: (id: string) => void }) {
  const Icon = ICONS[item.tone];
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setTimeout(() => onDismiss(item.id), 5000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [item.id, onDismiss]);

  return (
    <div
      className="animate-scale-in pointer-events-auto flex w-full items-start gap-3 rounded-card border border-line-strong bg-card/95 p-4 shadow-pop backdrop-blur-md"
      role="status"
    >
      <Icon aria-hidden="true" className={cn('mt-0.5 size-[18px] shrink-0', TONE_CLASSES[item.tone])} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-ink">{item.title}</p>
        {item.description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="-m-1 rounded-md p-1 text-muted transition-colors hover:bg-white/5 hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItemData[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(({ title, description, tone = 'info' }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setItems((current) => [...current.slice(-2), { id, title, description, tone }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              role="region"
              aria-label="Notifications"
              aria-live="polite"
              className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-end gap-2 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[360px]"
            >
              {items.map((item) => (
                <ToastCard key={item.id} item={item} onDismiss={dismiss} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
