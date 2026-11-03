function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Highlights the individual words from a search query inside a string. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .map(escapeRegExp);

  if (!tokens.length) return <>{text}</>;

  const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
  const testPattern = new RegExp(`^(?:${tokens.join('|')})$`, 'i');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        testPattern.test(part) ? (
          <mark key={index} className="rounded-[3px] bg-lime/15 px-0.5 text-lime">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}
