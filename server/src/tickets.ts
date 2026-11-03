import type { DatabaseSync } from 'node:sqlite';
import type {
  IssueCategory,
  TicketPriority,
  TicketStatus,
} from '../../shared/support.ts';
import type { TicketDetail, TicketMessage, TicketSummary } from '../../shared/ticket.ts';
import { generateReference } from './reference.ts';

interface TicketRow {
  id: number;
  reference: string;
  name: string;
  email: string;
  email_normalized: string;
  category: string;
  subject: string;
  subject_normalized: string;
  description: string;
  priority: string;
  browser_info: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  attachment_size: number | null;
  attachment_mime: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: number;
  author: string;
  body: string;
  status: string | null;
  created_at: string;
}

export interface NewTicket {
  name: string;
  email: string;
  category: IssueCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  browserInfo?: string | undefined;
  attachment?: {
    storedPath: string;
    originalName: string;
    size: number;
    mime: string;
  } | undefined;
}

export interface AttachmentRecord {
  storedPath: string;
  originalName: string;
  size: number;
  mime: string;
}

function toSummary(row: TicketRow): TicketSummary {
  return {
    reference: row.reference,
    subject: row.subject,
    category: row.category as IssueCategory,
    priority: row.priority as TicketPriority,
    status: row.status as TicketStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachmentName: row.attachment_name,
  };
}

function toMessage(row: MessageRow): TicketMessage {
  return {
    id: row.id,
    author: row.author as TicketMessage['author'],
    body: row.body,
    status: row.status as TicketStatus | null,
    createdAt: row.created_at,
  };
}

export interface TicketStore {
  create(input: NewTicket): { ticket: TicketSummary; id: number };
  findDuplicate(email: string, subject: string, windowMinutes: number): TicketSummary | null;
  lookup(reference: string, email: string): TicketDetail | null;
  updateStatus(
    reference: string,
    status: TicketStatus,
    message?: string,
  ): { ticket: TicketSummary; message: TicketMessage } | null;
  count(): number;
}

export function createTicketStore(db: DatabaseSync): TicketStore {
  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      reference, name, email, email_normalized, category, subject, subject_normalized,
      description, priority, browser_info, attachment_name, attachment_path,
      attachment_size, attachment_mime, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)
  `);

  const insertMessage = db.prepare(`
    INSERT INTO ticket_messages (ticket_id, author, body, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const findByReference = db.prepare('SELECT * FROM tickets WHERE reference = ?');

  const findDuplicateStatement = db.prepare(`
    SELECT * FROM tickets
    WHERE email_normalized = ?
      AND subject_normalized = ?
      AND status != 'closed'
      AND created_at >= ?
    ORDER BY created_at DESC
    LIMIT 1
  `);

  const lookupTicket = db.prepare(`
    SELECT * FROM tickets WHERE reference = ? AND email_normalized = ?
  `);

  const listMessages = db.prepare(`
    SELECT id, author, body, status, created_at
    FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC, id ASC
  `);

  const updateStatusStatement = db.prepare(`
    UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?
  `);

  function create(input: NewTicket): { ticket: TicketSummary; id: number } {
    const now = new Date().toISOString();
    const subjectNormalized = input.subject.toLowerCase().replace(/\s+/g, ' ').trim();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const reference = generateReference();
      const existing = findByReference.get(reference);
      if (existing) continue;

      try {
        db.exec('BEGIN IMMEDIATE');
        const result = insertTicket.run(
          reference,
          input.name,
          input.email,
          input.email.toLowerCase(),
          input.category,
          input.subject,
          subjectNormalized,
          input.description,
          input.priority,
          input.browserInfo?.trim() || null,
          input.attachment?.originalName ?? null,
          input.attachment?.storedPath ?? null,
          input.attachment?.size ?? null,
          input.attachment?.mime ?? null,
          now,
          now,
        );
        const ticketId = Number(result.lastInsertRowid);
        insertMessage.run(ticketId, 'system', 'Request received and queued for review.', 'open', now);
        db.exec('COMMIT');

        return {
          id: ticketId,
          ticket: {
            reference,
            subject: input.subject,
            category: input.category,
            priority: input.priority,
            status: 'open',
            createdAt: now,
            updatedAt: now,
            attachmentName: input.attachment?.originalName ?? null,
          },
        };
      } catch (error) {
        try {
          db.exec('ROLLBACK');
        } catch {
          /* no active transaction */
        }
        const message = error instanceof Error ? error.message : '';
        if (message.includes('UNIQUE constraint failed: tickets.reference')) continue;
        throw error;
      }
    }

    throw new Error('Could not allocate a unique ticket reference.');
  }

  function findDuplicate(email: string, subject: string, windowMinutes: number): TicketSummary | null {
    const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
    const normalizedSubject = subject.toLowerCase().replace(/\s+/g, ' ').trim();
    const row = findDuplicateStatement.get(
      email.toLowerCase(),
      normalizedSubject,
      since,
    ) as unknown as TicketRow | undefined;
    return row ? toSummary(row) : null;
  }

  function lookup(reference: string, email: string): TicketDetail | null {
    const row = lookupTicket.get(reference, email.toLowerCase()) as unknown as TicketRow | undefined;
    if (!row) return null;
    const messages = listMessages.all(row.id) as unknown as MessageRow[];
    return {
      ...toSummary(row),
      description: row.description,
      browserInfo: row.browser_info,
      messages: messages.map(toMessage),
    };
  }

  function updateStatus(
    reference: string,
    status: TicketStatus,
    message?: string,
  ): { ticket: TicketSummary; message: TicketMessage } | null {
    const row = findByReference.get(reference) as unknown as TicketRow | undefined;
    if (!row) return null;
    const now = new Date().toISOString();
    const body = message?.trim() || `Status updated to ${status.replaceAll('_', ' ')}.`;

    db.exec('BEGIN IMMEDIATE');
    try {
      updateStatusStatement.run(status, now, row.id);
      const result = insertMessage.run(row.id, 'support', body, status, now);
      db.exec('COMMIT');
      const updatedRow = findByReference.get(reference) as unknown as TicketRow;
      return {
        ticket: toSummary(updatedRow),
        message: {
          id: Number(result.lastInsertRowid),
          author: 'support',
          body,
          status,
          createdAt: now,
        },
      };
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {
        /* no active transaction */
      }
      throw error;
    }
  }

  function count(): number {
    const row = db.prepare('SELECT COUNT(*) AS total FROM tickets').get() as unknown as { total: number };
    return row.total;
  }

  return { create, findDuplicate, lookup, updateStatus, count };
}
