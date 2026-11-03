import { ARTICLES, articleSearchText, type HelpArticle } from '@/content/articles';
import { FAQS, type Faq } from '@/content/faqs';
import { SUPPORT_CATEGORIES, categoryById } from '@shared/support';

export type SearchKind = 'article' | 'faq' | 'category' | 'page';

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  description: string;
  href: string;
  categoryTitle?: string;
  meta?: string;
}

export interface SearchGroup {
  kind: SearchKind;
  label: string;
  hits: SearchHit[];
}

interface IndexEntry extends SearchHit {
  haystack: string;
  titleNormalized: string;
  keywords: string;
  description: string;
  scoreBase: number;
}

const KIND_LABEL: Record<SearchKind, string> = {
  article: 'Help articles',
  faq: 'FAQs',
  category: 'Categories',
  page: 'Support pages',
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s@#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactCategory(categoryId: string): string {
  return categoryById(categoryId)?.title ?? 'General Support';
}

function articleHit(article: HelpArticle): IndexEntry {
  const categoryTitle = compactCategory(article.categoryId);
  return {
    kind: 'article',
    id: article.slug,
    title: article.title,
    description: article.description,
    href: `/help/${article.slug}`,
    categoryTitle,
    keywords: article.keywords.join(' '),
    titleNormalized: normalize(article.title),
    haystack: normalize(
      [article.title, article.description, categoryTitle, article.keywords.join(' '), articleSearchText(article)].join(' '),
    ),
    scoreBase: 4,
  };
}

function faqHit(faq: Faq): IndexEntry {
  const categoryTitle = compactCategory(faq.categoryId);
  return {
    kind: 'faq',
    id: faq.id,
    title: faq.question,
    description: faq.answer,
    href: `/faqs#${faq.id}`,
    categoryTitle,
    keywords: faq.keywords.join(' '),
    titleNormalized: normalize(faq.question),
    haystack: normalize([faq.question, faq.answer, categoryTitle, faq.keywords.join(' ')].join(' ')),
    scoreBase: 2,
  };
}

const PAGE_INDEX: IndexEntry[] = [
  {
    kind: 'page',
    id: 'help',
    title: 'Help articles',
    description: 'Browse every step-by-step guide in the support center.',
    href: '/help',
    keywords: 'help articles guides browse',
    titleNormalized: normalize('Help articles'),
    haystack: normalize('help articles guides browse every step by step guide support center'),
    scoreBase: 3,
  },
  {
    kind: 'page',
    id: 'faqs',
    title: 'Frequently asked questions',
    description: 'Short answers about Rizz accounts, safety, and support.',
    href: '/faqs',
    keywords: 'faqs questions answers frequently asked',
    titleNormalized: normalize('Frequently asked questions'),
    haystack: normalize('faqs questions answers frequently asked rizz accounts safety support'),
    scoreBase: 3,
  },
  {
    kind: 'page',
    id: 'issues',
    title: 'Community issue board',
    description: 'See public reports, upvote a problem, or report a new issue.',
    href: '/issues',
    keywords: 'issues bug reports upvote community board problem',
    titleNormalized: normalize('Community issue board'),
    haystack: normalize('issues bug reports upvote community board problem public report new issue'),
    scoreBase: 3,
  },
  {
    kind: 'page',
    id: 'submit',
    title: 'Submit a support request',
    description: 'Send the details privately and get a real ticket reference.',
    href: '/submit',
    keywords: 'submit contact support request ticket help',
    titleNormalized: normalize('Submit a support request'),
    haystack: normalize('submit support request ticket contact help private'),
    scoreBase: 3,
  },
  {
    kind: 'page',
    id: 'track',
    title: 'Track a support request',
    description: 'Check the real status of a ticket with its reference and email.',
    href: '/track',
    keywords: 'track ticket status reference lookup',
    titleNormalized: normalize('Track a support request'),
    haystack: normalize('track ticket status reference lookup check request'),
    scoreBase: 3,
  },
];

const CATEGORY_INDEX: IndexEntry[] = SUPPORT_CATEGORIES.map((category) => ({
  kind: 'category',
  id: category.id,
  title: category.title,
  description: category.description,
  href: `/help?category=${category.id}`,
  keywords: category.keywords.join(' '),
  titleNormalized: normalize(category.title),
  haystack: normalize([category.title, category.description, category.keywords.join(' ')].join(' ')),
  scoreBase: 1,
}));

const INDEX: IndexEntry[] = [...ARTICLES.map(articleHit), ...FAQS.map(faqHit), ...CATEGORY_INDEX, ...PAGE_INDEX];

export function searchSupport(query: string, limitPerGroup = 5): SearchGroup[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = normalized.split(' ').filter(Boolean);

  const scored = INDEX.flatMap((entry) => {
    if (!tokens.every((token) => entry.haystack.includes(token))) return [];
    let score = entry.scoreBase;
    if (entry.titleNormalized === normalized) score += 120;
    else if (entry.titleNormalized.startsWith(normalized)) score += 60;
    else if (entry.titleNormalized.includes(normalized)) score += 30;
    for (const token of tokens) {
      if (entry.titleNormalized.includes(token)) score += 12;
      if (normalize(entry.keywords).includes(token)) score += 6;
    }
    return [{ entry, score }];
  }).sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length);

  const groups: SearchGroup[] = (['article', 'faq', 'page', 'category'] as const).flatMap((kind) => {
    const hits = scored
      .filter((item) => item.entry.kind === kind)
      .slice(0, limitPerGroup)
      .map(({ entry }) => ({
        kind: entry.kind,
        id: entry.id,
        title: entry.title,
        description: entry.description,
        href: entry.href,
        categoryTitle: entry.categoryTitle,
        meta: entry.meta,
      }));
    return hits.length ? [{ kind, label: KIND_LABEL[kind], hits }] : [];
  });

  return groups;
}

export function totalHits(groups: SearchGroup[]): number {
  return groups.reduce((sum, group) => sum + group.hits.length, 0);
}

export function flattenHits(groups: SearchGroup[]): SearchHit[] {
  return groups.flatMap((group) => group.hits);
}

export const POPULAR_SEARCHES = [
  { label: 'Account issues', query: 'account' },
  { label: 'Login problems', query: 'login' },
  { label: 'Bug reports', query: 'bug' },
  { label: 'Feature requests', query: 'feature' },
  { label: 'Safety and reporting', query: 'safety' },
] as const;

/** Turns a free-text hero search into the help page URL. */
export function helpSearchHref(query: string): string {
  const trimmed = query.trim();
  return trimmed ? `/help?q=${encodeURIComponent(trimmed)}` : '/help';
}

/** Full-text filter for the help index, used by the Help Articles page. */
export function filterArticles(query: string, categoryId?: string): HelpArticle[] {
  const normalized = normalize(query);
  const tokens = normalized ? normalized.split(' ') : [];
  return ARTICLES.filter((article) => {
    if (categoryId && article.categoryId !== categoryId) return false;
    if (!tokens.length) return true;
    const haystack = normalize(
      [
        article.title,
        article.description,
        categoryById(article.categoryId)?.title ?? '',
        article.keywords.join(' '),
        articleSearchText(article),
      ].join(' '),
    );
    return tokens.every((token) => haystack.includes(token));
  });
}
