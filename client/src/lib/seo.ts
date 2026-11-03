import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = 'Rizz Support Center — Help, FAQs & Request Tracking';
const DEFAULT_DESCRIPTION =
  'Find answers, troubleshoot issues, and get the support you need to enjoy Rizz. Search help articles, browse FAQs, submit a request, and track its status.';

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = href;
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/** Keeps the document title, description and social metadata in sync with the route. */
export function usePageMeta({ title, description, noindex = false }: PageMeta): void {
  useEffect(() => {
    const fullTitle = title.includes('Rizz Support Center') ? title : `${title} — Rizz Support Center`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', 'name', 'description', description || DEFAULT_DESCRIPTION);
    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;
    setCanonical(canonicalUrl);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description || DEFAULT_DESCRIPTION);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description || DEFAULT_DESCRIPTION);
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex ? 'noindex, nofollow' : 'index, follow',
    );
  }, [title, description, noindex]);
}

export { DEFAULT_DESCRIPTION, DEFAULT_TITLE };
