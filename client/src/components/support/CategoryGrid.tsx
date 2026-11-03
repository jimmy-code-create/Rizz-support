import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bug,
  CreditCard,
  LifeBuoy,
  Lightbulb,
  LogIn,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { SUPPORT_CATEGORIES, type CategoryId } from '@shared/support';
import { articlesInCategory } from '@/content/articles';

const ICONS: Record<CategoryId, LucideIcon> = {
  account: LogIn,
  bugs: Bug,
  features: Lightbulb,
  safety: ShieldCheck,
  payments: CreditCard,
  general: LifeBuoy,
};

interface CategoryGridProps {
  limit?: number;
}

export function CategoryGrid({ limit }: CategoryGridProps) {
  const categories = limit ? SUPPORT_CATEGORIES.slice(0, limit) : SUPPORT_CATEGORIES;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = ICONS[category.id];
        const count = articlesInCategory(category.id).length;
        return (
          <Link
            key={category.id}
            to={`/help?category=${category.id}`}
            className="group card-lift flex min-h-[204px] flex-col rounded-card border border-line-subtle bg-card p-5 focus-visible:outline-offset-4 sm:min-h-[216px] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-[10px] border border-line bg-white/[0.02] text-muted transition-colors duration-200 group-hover:border-line-strong group-hover:text-lime">
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.7} />
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="mt-0.5 size-4 text-faint transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime"
              />
            </div>

            <h3 className="mt-5 text-[17px] font-medium leading-snug tracking-[-0.018em] text-ink sm:text-[18px]">
              {category.title}
            </h3>
            <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-muted">
              {category.description}
            </p>

            <p className="mt-4 flex items-center gap-2 border-t border-line-subtle pt-3.5 text-[11.5px] text-faint">
              <span className="tabular-nums">
                {count > 0 ? `${count} ${count === 1 ? 'article' : 'articles'}` : 'Browse category'}
              </span>
              <span aria-hidden="true" className="ml-auto text-[10px] uppercase tracking-[0.1em] text-faint/80">
                View
              </span>
            </p>
          </Link>
        );
      })}
    </div>
  );
}
