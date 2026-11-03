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
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = ICONS[category.id];
        const count = articlesInCategory(category.id).length;
        return (
          <Link
            key={category.id}
            to={`/help?category=${category.id}`}
            className="group card-lift relative flex flex-col rounded-2xl border border-line bg-card p-5 sm:p-6"
          >
            <div className="flex items-start justify-between">
              <span className="flex size-10 items-center justify-center rounded-[11px] border border-line-strong bg-lime/[0.06] text-lime transition-colors duration-300 group-hover:border-lime/25 group-hover:bg-lime/[0.1]">
                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 -translate-x-0.5 translate-y-0.5 text-moss-soft/60 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-lime group-hover:opacity-100"
              />
            </div>

            <h3 className="mt-5 text-[15px] font-medium tracking-[-0.015em] text-ink">
              {category.title}
            </h3>
            <p className="mt-2 flex-1 text-[12.5px] leading-[1.65] text-muted">
              {category.description}
            </p>

            <p className="mt-5 text-[11px] font-medium tracking-[0.01em] text-moss-soft transition-colors group-hover:text-lime/80">
              {count > 0 ? `${count} ${count === 1 ? 'article' : 'articles'}` : 'Browse category'}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
