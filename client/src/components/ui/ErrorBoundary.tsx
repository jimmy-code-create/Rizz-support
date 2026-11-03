import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { BrandMark } from '@/components/ui/Brand';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[support-ui] unhandled error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-base px-6 text-center">
        <BrandMark size={40} />
        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-moss-soft">
          Something went wrong
        </p>
        <h1 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          This page hit an unexpected error
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The issue is on our side. Reload the page to try again, or head back to the support home.
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-lime px-5 text-sm font-medium text-[#0A0E08] hover:bg-lime-deep"
          >
            <RotateCcw className="size-4" />
            Reload page
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-raised/60 px-5 text-sm font-medium text-ink hover:bg-raised"
          >
            Back to support home
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    );
  }
}
