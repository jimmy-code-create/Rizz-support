import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

const CONTROL_CLASSES =
  'w-full rounded-input border border-line bg-surface px-3.5 text-[16px] text-ink sm:text-[14px] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-faint hover:border-line-strong focus:border-lime/40 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-lime/10 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-error/50 aria-[invalid=true]:focus:border-red-400/60 aria-[invalid=true]:focus:ring-red-400/10';

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
  counter?: ReactNode;
}

export function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  optionalLabel,
  children,
  className,
  counter,
}: FieldShellProps) {
  const descriptionId = `${id}-description`;
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[12.5px] font-medium text-ink">
          {label}
          {required ? (
            <span className="ml-1 text-lime" aria-hidden="true">
              *
            </span>
          ) : optionalLabel ? (
            <span className="ml-1.5 text-[11.5px] font-normal text-muted/80">{optionalLabel}</span>
          ) : null}
        </label>
        {counter}
      </div>
      {children}
      {hint && !error ? (
        <p id={descriptionId} className="text-xs leading-relaxed text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={`${id}-error`}
          className="animate-result-in flex items-start gap-1.5 text-[11.5px] leading-relaxed text-error"
        >
          <AlertCircle aria-hidden="true" className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, optionalLabel, leadingIcon, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      optionalLabel={optionalLabel}
    >
      <div className="relative">
        {leadingIcon ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted"
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint && !error ? `${fieldId}-description` : '', error ? `${fieldId}-error` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(CONTROL_CLASSES, 'h-11', leadingIcon ? 'pl-10' : '', className)}
          {...props}
        />
      </div>
    </FieldShell>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, optionalLabel, className, id, required, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      optionalLabel={optionalLabel}
    >
      <textarea
        ref={ref}
        id={fieldId}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint && !error ? `${fieldId}-description` : '', error ? `${fieldId}-error` : '']
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={cn(CONTROL_CLASSES, 'min-h-[160px] resize-y py-3 text-[16px] leading-[1.7] sm:text-[14px]', className)}
        {...props}
      />
    </FieldShell>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  optionalLabel?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, optionalLabel, className, id, required, children, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      required={required}
      hint={hint}
      error={error}
      optionalLabel={optionalLabel}
    >
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint && !error ? `${fieldId}-description` : '', error ? `${fieldId}-error` : '']
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            CONTROL_CLASSES,
            'h-11 cursor-pointer appearance-none bg-surface pr-10',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-faint"
        />
      </div>
    </FieldShell>
  );
});
