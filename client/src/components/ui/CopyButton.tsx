import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToast } from '@/components/ui/Toast';

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('Copy failed');
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      await copyText(value);
      setCopied(true);
      toast({ title: 'Copied to clipboard', tone: 'success' });
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Select the text and copy it manually.',
        tone: 'error',
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${label}: ${value}`}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-raised/60 px-2.5 text-[12px] font-medium text-muted transition-colors hover:border-lime/30 hover:text-lime active:bg-elevated',
        className,
      )}
    >
      {copied ? <Check aria-hidden="true" className="size-3.5 text-lime" /> : <Copy aria-hidden="true" className="size-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
