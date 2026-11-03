import type { IssueCategory, TicketPriority, TicketStatus } from './support.ts';

export interface TicketSummary {
  reference: string;
  subject: string;
  category: IssueCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  attachmentName: string | null;
}

export interface TicketMessage {
  id: number;
  author: 'support' | 'system' | 'user';
  body: string;
  status: TicketStatus | null;
  createdAt: string;
}

export interface TicketDetail extends TicketSummary {
  description: string;
  browserInfo: string | null;
  messages: TicketMessage[];
}

export interface CreateTicketResponse {
  ticket: TicketSummary;
}

export interface LookupTicketResponse {
  ticket: TicketDetail;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    reference?: string;
  };
}
