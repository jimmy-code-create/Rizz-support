import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface Database {
  db: DatabaseSync;
  dataDir: string;
  uploadsDir: string;
  close: () => void;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  subject_normalized TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  browser_info TEXT,
  attachment_name TEXT,
  attachment_path TEXT,
  attachment_size INTEGER,
  attachment_mime TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_lookup
  ON tickets (reference, email_normalized);
CREATE INDEX IF NOT EXISTS idx_tickets_dedupe
  ON tickets (email_normalized, subject_normalized, created_at);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author TEXT NOT NULL CHECK (author IN ('support', 'system', 'user')),
  body TEXT NOT NULL,
  status TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket
  ON ticket_messages (ticket_id, created_at);

CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_normalized TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_issues_board
  ON issues (created_at DESC);

CREATE TABLE IF NOT EXISTS issue_votes (
  issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (issue_id, voter_hash)
);
`;

export function openDatabase(dataDir: string): Database {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const uploadsDir = path.join(dataDir, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o700 });

  const databasePath = path.join(dataDir, 'support.sqlite');
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(SCHEMA);

  // Tickets contain personal data; keep the database files owner-only.
  for (const file of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) {
    try {
      fs.chmodSync(file, 0o600);
    } catch {
      /* WAL/SHM files may not exist yet */
    }
  }

  return {
    db,
    dataDir,
    uploadsDir,
    close: () => {
      try {
        db.close();
      } catch {
        /* already closed */
      }
    },
  };
}
