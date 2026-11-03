import { z } from 'zod';
import {
  ISSUE_CATEGORIES,
  TICKET_LIMITS,
  TICKET_PRIORITIES,
  TICKET_REFERENCE_PATTERN,
  TICKET_STATUSES,
} from '../../shared/support.ts';

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:]+@[^\s@<>()[\]\\,;:]+\.[A-Za-z]{2,}$/;

/** Removes control characters (except newlines/tabs) and null bytes, then trims. */
function cleanText(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();
}

const text = (max: number, message?: string) =>
  z.preprocess(cleanText, z.string().max(max, message));
const requiredText = (max: number, min: number, message: string, maxMessage: string) =>
  z.preprocess(cleanText, z.string().min(min, message).max(max, maxMessage));

export const ISSUE_CATEGORY_VALUES = ISSUE_CATEGORIES.map((entry) => entry.value);
export const PRIORITY_VALUES = TICKET_PRIORITIES.map((entry) => entry.value);
export const STATUS_VALUES = TICKET_STATUSES.map((entry) => entry.value);

export const createTicketSchema = z.object({
  name: requiredText(
    TICKET_LIMITS.name,
    2,
    'Enter your full name (at least 2 characters).',
    `Keep your name under ${TICKET_LIMITS.name} characters.`,
  ),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z
      .string()
      .max(TICKET_LIMITS.email)
      .regex(EMAIL_PATTERN, 'Enter a valid email address.'),
  ),
  category: z.enum(ISSUE_CATEGORY_VALUES as [string, ...string[]]),
  subject: requiredText(
    TICKET_LIMITS.subject,
    4,
    'Add a short subject (at least 4 characters).',
    `Keep the subject under ${TICKET_LIMITS.subject} characters.`,
  ),
  description: requiredText(
    TICKET_LIMITS.description,
    30,
    'Add at least 30 characters so the team can understand the issue.',
    `Keep the description under ${TICKET_LIMITS.description} characters.`,
  ),
  priority: z.enum(PRIORITY_VALUES as [string, ...string[]]).default('normal'),
  browserInfo: text(TICKET_LIMITS.browserInfo, `Keep browser details under ${TICKET_LIMITS.browserInfo} characters.`).optional(),
  // Honeypot: real users never see or fill this field.
  website: z
    .preprocess(cleanText, z.string().max(0, 'Rejected.').optional())
    .optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const lookupTicketSchema = z.object({
  reference: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toUpperCase() : value),
    z
      .string()
      .regex(TICKET_REFERENCE_PATTERN, 'Enter a valid ticket reference (for example RZ-ABC123).'),
  ),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.string().max(TICKET_LIMITS.email).regex(EMAIL_PATTERN, 'Enter a valid email address.'),
  ),
});

export const updateTicketSchema = z.object({
  status: z.enum(STATUS_VALUES as [string, ...string[]]),
  message: z.preprocess(cleanText, z.string().max(4000).optional()),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && key !== 'website' && !result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}
