import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const TOKEN_PATTERN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

function isSafeHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('https://') || href.startsWith('http://');
}

/**
 * Minimal, deliberately restrictive inline formatter for help content.
 * Supports **bold** and [label](href). No raw HTML is ever rendered.
 */
export function InlineText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  TOKEN_PATTERN.lastIndex = 0;

  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const [full, linkLabel, href, boldText] = match;

    if (linkLabel && href) {
      if (isSafeHref(href)) {
        const external = href.startsWith('http');
        const className = 'font-medium text-lime underline decoration-lime/35 underline-offset-[3px] hover:decoration-lime';
        nodes.push(
          external ? (
            <a key={match.index} href={href} target="_blank" rel="noopener noreferrer" className={className}>
              {linkLabel}
            </a>
          ) : (
            <Link key={match.index} to={href} className={className}>
              {linkLabel}
            </Link>
          ),
        );
      } else {
        nodes.push(linkLabel);
      }
    } else if (boldText) {
      nodes.push(
        <strong key={match.index} className="font-semibold text-ink">
          {boldText}
        </strong>,
      );
    } else {
      nodes.push(full);
    }

    cursor = match.index + full.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return (
    <>
      {nodes.map((node, index) =>
        typeof node === 'string' ? <span key={`text-${index}`}>{node}</span> : node,
      )}
    </>
  );
}
