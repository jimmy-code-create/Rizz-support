const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "Nov 3, 2026" — returns null for an invalid or missing date. */
export function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = toDate(value);
  return date ? DATE_FORMAT.format(date) : null;
}

/** "Nov 3, 2026, 2:40 PM" */
export function formatDateTime(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const date = toDate(value);
  return date ? DATE_TIME_FORMAT.format(date) : null;
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
