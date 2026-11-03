import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp, type CreatedApp } from '../src/app.ts';
import { TICKET_REFERENCE_PATTERN } from '../../shared/support.ts';
import { ISSUE_ID_PATTERN } from '../../shared/issues.ts';

const VALID = {
  name: 'Test Person',
  email: 'person@example.com',
  category: 'bug',
  subject: 'Images fail to upload in a realm channel',
  description:
    'When I choose a PNG in #art-dump, the upload spinner runs forever and no error message appears.',
  priority: 'high',
  browserInfo: 'Chrome 131 on Windows 11',
};

let app: CreatedApp;
let dataDir: string;

beforeAll(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rizz-support-test-'));
  app = createApp({
    dataDir,
    adminToken: 'test-admin-token-0123456789',
    rateLimit: false,
    clientDist: path.resolve(process.cwd(), 'client/dist'),
  });
});

afterAll(() => {
  app.close();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('support API', () => {
  it('reports health', async () => {
    const response = await request(app.app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('creates a ticket with a real reference and a system event', async () => {
    const response = await request(app.app)
      .post('/api/tickets')
      .field(VALID)
      .expect(201);

    const ticket = response.body.ticket;
    expect(ticket.reference).toMatch(TICKET_REFERENCE_PATTERN);
    expect(ticket.status).toBe('open');
    expect(ticket.subject).toBe(VALID.subject);
    expect(ticket.attachmentName).toBeNull();

    const lookup = await request(app.app)
      .post('/api/tickets/lookup')
      .send({ reference: ticket.reference, email: VALID.email })
      .expect(200);

    expect(lookup.body.ticket.description).toBe(VALID.description);
    expect(lookup.body.ticket.messages).toHaveLength(1);
    expect(lookup.body.ticket.messages[0].author).toBe('system');
  });

  it('looks tickets up case-insensitively and hides them behind a matching email', async () => {
    const created = await request(app.app).post('/api/tickets').field({ ...VALID, subject: 'Case sensitivity check' });
    const reference = created.body.ticket.reference as string;

    const ok = await request(app.app)
      .post('/api/tickets/lookup')
      .send({ reference: reference.toLowerCase(), email: VALID.email.toUpperCase() })
      .expect(200);
    expect(ok.body.ticket.reference).toBe(reference);

    const wrong = await request(app.app)
      .post('/api/tickets/lookup')
      .send({ reference, email: 'someone-else@example.com' })
      .expect(404);
    expect(wrong.body.error.code).toBe('TICKET_NOT_FOUND');
  });

  it('blocks duplicate submissions within the dedupe window', async () => {
    const first = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Duplicate protection check' })
      .expect(201);

    const second = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Duplicate protection check' })
      .expect(409);

    expect(second.body.error.code).toBe('DUPLICATE_REQUEST');
    expect(second.body.error.reference).toBe(first.body.ticket.reference);
  });

  it('returns friendly field errors for invalid submissions', async () => {
    const response = await request(app.app)
      .post('/api/tickets')
      .field({ name: 'A', email: 'not-an-email', category: 'nope', subject: 'x', description: 'short', priority: 'urgent' })
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields.name).toContain('full name');
    expect(response.body.error.fields.email).toContain('valid email');
    expect(response.body.error.fields.description).toContain('30 characters');
  });

  it('rejects a honeypot submission without creating a ticket', async () => {
    const before = app.store.count();
    await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Honeypot check', website: 'https://spam.example' })
      .expect(400);
    expect(app.store.count()).toBe(before);
  });

  it('accepts a real PNG attachment and stores it privately', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    );
    const response = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Attachment acceptance check' })
      .attach('attachment', png, { filename: 'screenshot.png', contentType: 'image/png' })
      .expect(201);

    expect(response.body.ticket.attachmentName).toBe('screenshot.png');
    const stored = fs.readdirSync(path.join(dataDir, 'uploads'));
    expect(stored).toHaveLength(1);
    const mode = fs.statSync(path.join(dataDir, 'uploads', stored[0]!)).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it('rejects a disguised file whose contents do not match its type', async () => {
    const response = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Disguised attachment check' })
      .attach('attachment', Buffer.from('<script>alert(1)</script>'), {
        filename: 'evil.png',
        contentType: 'image/png',
      })
      .expect(415);

    expect(response.body.error.code).toBe('INVALID_ATTACHMENT');
  });

  it('rejects unsupported attachment types', async () => {
    await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Unsupported attachment check' })
      .attach('attachment', Buffer.from('<svg></svg>'), {
        filename: 'image.svg',
        contentType: 'image/svg+xml',
      })
      .expect(415);
  });

  it('rejects oversized attachments', async () => {
    const response = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Oversized attachment check' })
      .attach('attachment', Buffer.alloc(5 * 1024 * 1024 + 32, 0x41), {
        filename: 'too-big.txt',
        contentType: 'text/plain',
      })
      .expect(413);

    expect(response.body.error.message).toContain('5 MB');
  });

  it('protects the admin status endpoint and records real updates', async () => {
    const created = await request(app.app)
      .post('/api/tickets')
      .field({ ...VALID, subject: 'Admin status check' })
      .expect(201);
    const reference = created.body.ticket.reference as string;

    await request(app.app)
      .patch(`/api/admin/tickets/${reference}/status`)
      .send({ status: 'in_progress' })
      .expect(401);

    await request(app.app)
      .patch(`/api/admin/tickets/${reference}/status`)
      .set('Authorization', 'Bearer wrong-token')
      .send({ status: 'in_progress' })
      .expect(401);

    const updated = await request(app.app)
      .patch(`/api/admin/tickets/${reference}/status`)
      .set('Authorization', 'Bearer test-admin-token-0123456789')
      .send({ status: 'waiting_for_user', message: 'Could you share a screenshot of the error?' })
      .expect(200);

    expect(updated.body.ticket.status).toBe('waiting_for_user');

    const lookup = await request(app.app)
      .post('/api/tickets/lookup')
      .send({ reference, email: VALID.email })
      .expect(200);

    expect(lookup.body.ticket.status).toBe('waiting_for_user');
    expect(lookup.body.ticket.messages).toHaveLength(2);
    expect(lookup.body.ticket.messages[1].author).toBe('support');
    expect(lookup.body.ticket.messages[1].body).toContain('screenshot');
    expect(lookup.body.ticket.updatedAt).not.toBe(lookup.body.ticket.createdAt);
  });

  it('returns 404 for an admin update to an unknown reference', async () => {
    await request(app.app)
      .patch('/api/admin/tickets/RZ-ZZZZZZ/status')
      .set('Authorization', 'Bearer test-admin-token-0123456789')
      .send({ status: 'resolved' })
      .expect(404);
  });

  it('creates, lists and toggles votes on public issues', async () => {
    const creator = request.agent(app.app);
    const created = await creator
      .post('/api/issues')
      .send({
        title: 'Voice room joins fail on a slow connection',
        description:
          'Joining a voice room sometimes leaves the join button spinning without entering the room.',
        category: 'technical',
      })
      .expect(201);

    const issue = created.body.issue;
    expect(issue.id).toMatch(ISSUE_ID_PATTERN);
    expect(issue.votes).toBe(1);
    expect(issue.voted).toBe(true);
    expect(issue.status).toBe('open');

    const listed = await creator.get('/api/issues').expect(200);
    const listedIssue = listed.body.issues.find((entry: { id: string }) => entry.id === issue.id);
    expect(listedIssue).toBeTruthy();
    expect(listedIssue.votes).toBe(1);
    expect(listedIssue.voted).toBe(true);
    expect(listedIssue.description).toBe(
      'Joining a voice room sometimes leaves the join button spinning without entering the room.',
    );

    const otherVoter = request.agent(app.app);
    const upvoted = await otherVoter.post(`/api/issues/${issue.id.toLowerCase()}/vote`).expect(200);
    expect(upvoted.body.issue.votes).toBe(2);
    expect(upvoted.body.issue.voted).toBe(true);

    const removed = await otherVoter.post(`/api/issues/${issue.id}/vote`).expect(200);
    expect(removed.body.issue.votes).toBe(1);
    expect(removed.body.issue.voted).toBe(false);
  });

  it('rejects invalid public issues and unknown issue votes', async () => {
    await request(app.app)
      .post('/api/issues')
      .send({ title: 'No', description: 'too short', category: 'nope' })
      .expect(422);

    await request(app.app)
      .post('/api/issues')
      .send({ title: 'Honeypot check', description: 'This should never reach the board.', category: 'bug', website: 'spam.example' })
      .expect(400);

    await request(app.app).post('/api/issues/IS-ZZZZZZ/vote').expect(404);
  });

  it('returns 404 for a missing static asset instead of the SPA shell', async () => {
    const response = await request(app.app).get('/assets/does-not-exist.js').expect(404);
    expect(response.text).toBe('Not found');
    expect(response.headers['content-type']).toContain('text/plain');
  });

  it('rejects oversized JSON payloads cleanly', async () => {
    const response = await request(app.app)
      .post('/api/tickets/lookup')
      .set('Content-Type', 'application/json')
      .send({ reference: 'RZ-ABC123', email: 'a@example.com', padding: 'x'.repeat(70_000) })
      .expect(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('serves the single-page app and its security headers', async () => {
    const response = await request(app.app).get('/help/anything').expect(200);
    expect(response.headers['content-type']).toContain('text/html');
    expect(response.headers['x-frame-options']).toBeUndefined();
    expect(response.headers['content-security-policy']).toContain("frame-ancestors 'self' https://*.e2b.app");
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('rate limiting', () => {
  it('limits repeated ticket creation from one client', async () => {
    const limitedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rizz-support-rate-'));
    const limited = createApp({ dataDir: limitedDir, rateLimit: true });

    try {
      for (let index = 0; index < 8; index += 1) {
        await request(limited.app)
          .post('/api/tickets')
          .field({ ...VALID, email: `rate${index}@example.com`, subject: `Rate limit check ${index}` })
          .expect(201);
      }

      const blocked = await request(limited.app)
        .post('/api/tickets')
        .field({ ...VALID, email: 'rate-blocked@example.com', subject: 'Rate limit check blocked' })
        .expect(429);

      expect(blocked.body.error.code).toBe('RATE_LIMITED');
    } finally {
      limited.close();
      fs.rmSync(limitedDir, { recursive: true, force: true });
    }
  });
});
