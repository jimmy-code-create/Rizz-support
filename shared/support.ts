/**
 * Shared contract between the support API and the web client.
 * Keeping these constants in one place means validation, filters and
 * labels can never drift apart.
 */

export const RIZZ_SITE_URL = 'https://rizzapp.onrender.com/';

export type CategoryId =
  | 'account'
  | 'bugs'
  | 'features'
  | 'safety'
  | 'payments'
  | 'general';

export interface SupportCategory {
  id: CategoryId;
  title: string;
  description: string;
  /** Search keywords used by the help search */
  keywords: string[];
}

export const SUPPORT_CATEGORIES: readonly SupportCategory[] = [
  {
    id: 'account',
    title: 'Account & Login',
    description: 'Get help with registration, authentication, and account access.',
    keywords: ['account', 'login', 'sign in', 'sign up', 'username', 'password', 'email code'],
  },
  {
    id: 'bugs',
    title: 'Bugs & Technical Issues',
    description: 'Report errors, crashes, loading problems, and unexpected behavior.',
    keywords: ['bug', 'error', 'crash', 'broken', 'loading', 'technical'],
  },
  {
    id: 'features',
    title: 'Features & Feedback',
    description: 'Share ideas and suggest improvements for Rizz.',
    keywords: ['feature', 'feedback', 'idea', 'suggestion', 'request'],
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    description: 'Get assistance with account security, abuse, and suspicious activity.',
    keywords: ['safety', 'security', 'abuse', 'harassment', 'phishing', 'report'],
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    description: 'Get help with payment-related issues, if applicable.',
    keywords: ['payment', 'billing', 'charge', 'refund', 'card'],
  },
  {
    id: 'general',
    title: 'General Support',
    description: "Questions that don't fit into other categories.",
    keywords: ['general', 'contact', 'support', 'other', 'help'],
  },
] as const;

export const ISSUE_CATEGORIES = [
  { value: 'account', label: 'Account issue' },
  { value: 'technical', label: 'Technical issue' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
] as const;

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number]['value'];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low', hint: 'A question or small inconvenience' },
  { value: 'normal', label: 'Normal', hint: 'Something is not working as expected' },
  { value: 'high', label: 'High', hint: 'Blocking an important task' },
  { value: 'urgent', label: 'Urgent', hint: 'Security or safety concern' },
] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number]['value'];

export const TICKET_STATUSES = [
  { value: 'open', label: 'Open', description: 'Your request has been received.' },
  {
    value: 'in_progress',
    label: 'In Progress',
    description: 'The support team is reviewing your request.',
  },
  {
    value: 'waiting_for_user',
    label: 'Waiting for User',
    description: 'Support needs more information from you.',
  },
  {
    value: 'resolved',
    label: 'Resolved',
    description: 'A resolution has been provided.',
  },
  { value: 'closed', label: 'Closed', description: 'This request is no longer active.' },
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number]['value'];

export const TICKET_LIMITS = {
  name: 120,
  email: 254,
  subject: 160,
  description: 5000,
  browserInfo: 300,
  attachmentBytes: 5 * 1024 * 1024,
  attachmentName: 180,
} as const;

export const ALLOWED_ATTACHMENT_TYPES = [
  { mime: 'image/png', extension: '.png', label: 'PNG image' },
  { mime: 'image/jpeg', extension: '.jpg', label: 'JPEG image' },
  { mime: 'image/webp', extension: '.webp', label: 'WebP image' },
  { mime: 'application/pdf', extension: '.pdf', label: 'PDF document' },
  { mime: 'text/plain', extension: '.txt', label: 'Text file' },
] as const;

export const TICKET_REFERENCE_PATTERN = /^RZ-[0-9A-Z]{6}$/;

export function categoryById(id: string): SupportCategory | undefined {
  return SUPPORT_CATEGORIES.find((category) => category.id === id);
}

export function issueCategoryLabel(value: string): string {
  return ISSUE_CATEGORIES.find((category) => category.value === value)?.label ?? 'Other';
}

export function statusMeta(status: string) {
  return TICKET_STATUSES.find((entry) => entry.value === status) ?? TICKET_STATUSES[0];
}

export function priorityLabel(value: string): string {
  return TICKET_PRIORITIES.find((entry) => entry.value === value)?.label ?? 'Normal';
}
