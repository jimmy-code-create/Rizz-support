import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { IssueCategory } from '../../shared/support.ts';
import type { PublicIssue } from '../../shared/issues.ts';

interface IssueRow {
  id: number;
  public_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  votes: number;
  voted: number;
}

interface IssueIdentityRow {
  id: number;
  public_id: string;
}

export interface NewIssue {
  title: string;
  description: string;
  category: IssueCategory;
}

export interface IssueStore {
  list(voterHash: string): PublicIssue[];
  create(input: NewIssue, voterHash: string): PublicIssue;
  toggleVote(publicId: string, voterHash: string): PublicIssue | null;
  count(): number;
}

const MAX_BOARD_SIZE = 100;

function toPublicIssue(row: IssueRow): PublicIssue {
  return {
    id: row.public_id,
    title: row.title,
    description: row.description,
    category: row.category as IssueCategory,
    status: 'open',
    votes: Number(row.votes),
    voted: Boolean(row.voted),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateIssueId(): string {
  return `IS-${randomBytes(3).toString('hex').toUpperCase()}`;
}

export function createIssueStore(db: DatabaseSync): IssueStore {
  const listStatement = db.prepare(`
    SELECT
      i.id,
      i.public_id,
      i.title,
      i.description,
      i.category,
      i.status,
      i.created_at,
      i.updated_at,
      COUNT(v.voter_hash) AS votes,
      EXISTS (
        SELECT 1 FROM issue_votes own
        WHERE own.issue_id = i.id AND own.voter_hash = ?
      ) AS voted
    FROM issues i
    LEFT JOIN issue_votes v ON v.issue_id = i.id
    GROUP BY i.id
    ORDER BY votes DESC, i.created_at DESC
    LIMIT ${MAX_BOARD_SIZE}
  `);

  const findByIdentity = db.prepare('SELECT * FROM issues WHERE public_id = ?');

  const findForVoter = db.prepare(`
    SELECT
      i.id,
      i.public_id,
      i.title,
      i.description,
      i.category,
      i.status,
      i.created_at,
      i.updated_at,
      (SELECT COUNT(*) FROM issue_votes where_votes WHERE where_votes.issue_id = i.id) AS votes,
      EXISTS (
        SELECT 1 FROM issue_votes own
        WHERE own.issue_id = i.id AND own.voter_hash = ?
      ) AS voted
    FROM issues i
    WHERE i.public_id = ?
  `);

  const insertIssue = db.prepare(`
    INSERT INTO issues (
      public_id, title, title_normalized, description, category, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'open', ?, ?)
  `);

  const insertVote = db.prepare(`
    INSERT INTO issue_votes (issue_id, voter_hash, created_at) VALUES (?, ?, ?)
  `);

  const deleteVote = db.prepare(`
    DELETE FROM issue_votes WHERE issue_id = ? AND voter_hash = ?
  `);

  const findVote = db.prepare(`
    SELECT 1 FROM issue_votes WHERE issue_id = ? AND voter_hash = ?
  `);

  const countIssues = db.prepare('SELECT COUNT(*) AS total FROM issues');

  function list(voterHash: string): PublicIssue[] {
    const rows = listStatement.all(voterHash) as unknown as IssueRow[];
    return rows.map(toPublicIssue);
  }

  function create(input: NewIssue, voterHash: string): PublicIssue {
    const now = new Date().toISOString();
    const titleNormalized = input.title.toLowerCase().replace(/\s+/g, ' ').trim();

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const publicId = generateIssueId();
      if (findByIdentity.get(publicId)) continue;

      try {
        db.exec('BEGIN IMMEDIATE');
        const result = insertIssue.run(
          publicId,
          input.title,
          titleNormalized,
          input.description,
          input.category,
          now,
          now,
        );
        const issueId = Number(result.lastInsertRowid);
        // The reporter's own upvote is a real vote, not a synthetic count.
        insertVote.run(issueId, voterHash, now);
        db.exec('COMMIT');

        const row = findForVoter.get(voterHash, publicId) as unknown as IssueRow | undefined;
        if (!row) throw new Error('Created issue could not be read back.');
        return toPublicIssue(row);
      } catch (error) {
        try {
          db.exec('ROLLBACK');
        } catch {
          /* no active transaction */
        }
        const message = error instanceof Error ? error.message : '';
        if (message.includes('UNIQUE constraint failed: issues.public_id')) continue;
        throw error;
      }
    }

    throw new Error('Could not allocate a unique issue id.');
  }

  function toggleVote(publicId: string, voterHash: string): PublicIssue | null {
    const identity = findByIdentity.get(publicId) as unknown as IssueIdentityRow | undefined;
    if (!identity) return null;

    const now = new Date().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try {
      const existing = findVote.get(identity.id, voterHash);
      if (existing) deleteVote.run(identity.id, voterHash);
      else insertVote.run(identity.id, voterHash, now);
      db.exec('COMMIT');
    } catch (error) {
      try {
        db.exec('ROLLBACK');
      } catch {
        /* no active transaction */
      }
      throw error;
    }

    const row = findForVoter.get(voterHash, publicId) as unknown as IssueRow | undefined;
    return row ? toPublicIssue(row) : null;
  }

  function count(): number {
    const row = countIssues.get() as unknown as { total: number };
    return row.total;
  }

  return { list, create, toggleVote, count };
}
