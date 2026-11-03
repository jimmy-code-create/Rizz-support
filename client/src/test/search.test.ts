import { describe, expect, it } from 'vitest';
import { filterArticles, searchSupport, totalHits } from '@/lib/search';
import { ARTICLES, readingTimeMinutes } from '@/data/articles';
import { categoryById } from '@shared/support';

describe('support search', () => {
  it('returns nothing for an empty query', () => {
    expect(searchSupport('')).toEqual([]);
  });

  it('finds articles and FAQs for "login"', () => {
    const groups = searchSupport('login');
    const flat = groups.flatMap((group) => group.hits);
    expect(flat.length).toBeGreaterThan(0);
    expect(flat.some((hit) => hit.kind === 'article' && hit.id === 'i-cannot-access-my-account')).toBe(true);
    expect(flat.some((hit) => hit.kind === 'faq' && hit.id === 'cannot-log-in')).toBe(true);
  });

  it('finds safety content and reporting FAQs', () => {
    const flat = searchSupport('safety').flatMap((group) => group.hits);
    expect(flat.some((hit) => hit.href.includes('reporting-abuse-or-safety-concerns'))).toBe(true);
  });

  it('handles phrases with no matches and returns a zero total', () => {
    const groups = searchSupport('quantum flux capacitor');
    expect(totalHits(groups)).toBe(0);
  });

  it('caps each result group', () => {
    const groups = searchSupport('a', 3);
    groups.forEach((group) => expect(group.hits.length).toBeLessThanOrEqual(3));
  });

  it('filters articles by category', () => {
    const results = filterArticles('', 'safety');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((article) => article.categoryId === 'safety')).toBe(true);
  });

  it('only returns articles in categories that exist', () => {
    ARTICLES.forEach((article) => {
      expect(categoryById(article.categoryId)).toBeDefined();
      expect(readingTimeMinutes(article)).toBeGreaterThan(0);
    });
  });

  it('finds troubleshooting content by body text', () => {
    const results = filterArticles('incognito');
    expect(results.some((article) => article.slug === 'troubleshooting-common-website-issues')).toBe(true);
  });
});
