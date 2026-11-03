# Rizz Support Center

A premium, responsive support portal for **Rizz** — the browser-based social app at
[rizzapp.onrender.com](https://rizzapp.onrender.com/). It gives people one place to search help
articles, read FAQs, submit a support request, and track the **real** status of that request.

The Rizz application itself is not modified or redesigned. This repository contains only the
separate support site and its isolated support API. The public Rizz app does not expose a support or
ticketing API, so the service in `server/` is intentionally isolated: it never calls into or mutates
the Rizz application, and it owns its own database and uploads directory.

---

## What is included

- **Support landing page** with instant search across articles, FAQs, and categories.
- **Six support categories** with real article counts (never invented numbers).
- **8 help articles** written about verified Rizz behaviour — feed, realms, voice rooms, messages,
  stories, sign-up, and sign-in — with reading time calculated from the text.
- **14 FAQs** with an accessible accordion, category filters, live filtering, and FAQ structured data.
- **Support request form** with client and server validation, priority selection, optional restricted
  attachment, duplicate protection, genuine submitted/error states, and a real ticket reference.
- **Ticket tracking** backed by SQLite: reference + email, current status, submission and update
  timestamps, and the actual response history.
- **Global search palette** (`⌘K` / `Ctrl K` or `/`) and keyboard-navigable inline search.
- Responsive navigation and layouts tested by breakpoint from 375 px to 1920 px, reduced-motion
  support, visible focus states, skip link, semantic landmarks, and meaningful page metadata.
- **Admin status API** to move tickets through Open → In Progress → Waiting for User → Resolved →
  Closed and add a support response, protected by an environment token.

### Deliberately absent

These were not added because no verified destination or policy exists:

- **Community link** — Rizz does not expose a verified community destination.
- **Privacy Policy / Terms of Service links** — `/privacy` and `/terms` return 404 on the Rizz site.
- **Support email, phone, Discord invite, response-time promise, or support hours** — none are
  published, so the site does not invent them.
- **Fake ticket statuses, fake success messages, or placeholder article counts.**

Brand artwork is loaded from the official Rizz site (`/brand/rizz-cat-logo.svg`) with a local
fallback mark, so a network failure never breaks the header. All help copy was checked against the
live Rizz pages (`/`, `/signup`, `/login`); sign-in uses **email + password**, with a verified
`/reset-password` flow behind the "Forgot?" link.

---

## Stack

| Layer     | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| UI        | React 19, TypeScript, Vite 7                                  |
| Styling   | Tailwind CSS 4 with the lime-dark design tokens in `globals.css` |
| Icons     | Lucide                                                        |
| Routing   | React Router 7 (lazy-loaded routes)                           |
| API       | Express 5, Zod validation, Helmet, express-rate-limit, Multer |
| Database  | SQLite via Node's built-in `node:sqlite` (no native builds)    |
| Tests     | Vitest 5, Testing Library, Supertest, axe-core                 |

**Requires Node.js 22.5 or newer** because the API uses `node:sqlite`.

---

## Getting started

```bash
npm ci

# API on :3000 (tsx watch) + Vite on :5173 with /api proxied to the API
npm run dev
```

Open <http://localhost:5173>.

Help content lives in `client/src/content` (kept out of the ignored runtime `/data/` directory).
If you are updating an older checkout and Vite still reports a missing `@/content/...` module,
stop the dev server, remove the Vite cache, and pull the latest `main` before restarting:

```bash
git pull
rm -rf node_modules/.vite
npm run dev
```

### Production

```bash
npm run build     # builds client/dist and server/dist
npm start          # serves UI + API on http://0.0.0.0:3000
```

`PORT`, `DATA_DIR`, and `SUPPORT_ADMIN_TOKEN` can be supplied as environment variables. A local `.env` file is loaded automatically by the API entry point (see
[`.env.example`](./.env.example)).

| Variable              | Default                 | Purpose                                                                 |
| --------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `PORT`                | `3000`                  | HTTP port                                                               |
| `DATA_DIR`            | `./data`                | SQLite database + private attachment storage                            |
| `SUPPORT_ADMIN_TOKEN` | _(empty)_               | Enables the admin API when set to a value of at least 16 characters     |
| `CLIENT_DIST`         | `./client/dist`         | Optional override for the built UI location                             |

The admin API is **completely disabled** (404) when `SUPPORT_ADMIN_TOKEN` is unset.

---

## Architecture

```text
client/
  src/
    components/
      home/        hero, categories, popular articles, tracking teaser, FAQ preview, contact CTA
      layout/      navbar, footer, skip link, route loading state
      search/      inline combobox + global command palette
      support/     page header, category grid, article cards
      ui/          buttons, fields, accordion, badge, toast, copy button, error boundary
    content/       help articles and FAQs (single source of truth) + search index
    lib/           API client, formatting, SEO, search
    pages/         home, help, article, FAQs, submit, track, 404
server/
  src/
    app.ts         Express app, security headers, routes, static SPA fallback
    db.ts          SQLite schema and migration
    tickets.ts     ticket repository (create, dedupe, lookup, status updates)
    uploads.ts     magic-byte validation and private file storage
    validation.ts  Zod schemas and friendly field errors
    rate-limit.ts  request limits
shared/            API contract shared by client and server
```

---

## API

All responses are JSON and `Cache-Control: no-store`.

| Method | Route                                | Notes                                              |
| ------ | ------------------------------------ | -------------------------------------------------- |
| GET    | `/api/health`                        | Liveness                                           |
| POST   | `/api/tickets`                       | Multipart form; 201 with `{ ticket }`              |
| POST   | `/api/tickets/lookup`                | `{ reference, email }`; requires both to match     |
| PATCH  | `/api/admin/tickets/:ref/status`     | Bearer token; `{ status, message? }`               |

### Creating a ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -F 'name=Alex Rivera' \
  -F 'email=alex@example.com' \
  -F 'category=bug' \
  -F 'subject=Upload spinner never finishes' \
  -F 'description=When I choose a PNG in #art-dump the upload spinner runs forever.' \
  -F 'priority=high' \
  -F 'browserInfo=Chrome 131 on Windows 11' \
  -F 'attachment=@screenshot.png'
```

Issue categories: `account`, `technical`, `bug`, `feature`, `safety`, `other`.
Priorities: `low`, `normal`, `high`, `urgent`.

Rejected with **409 `DUPLICATE_REQUEST`** if the same email and subject were submitted in the last
10 minutes; the response includes the existing reference. The client shows the existing reference
and a tracking link instead of pretending a second ticket exists.

### Tracking a ticket

```bash
curl -X POST http://localhost:3000/api/tickets/lookup \
  -H 'Content-Type: application/json' \
  -d '{"reference":"RZ-ABC123","email":"alex@example.com"}'
```

A wrong email and an unknown reference return the same generic **404**. Tickets are never listed or
enumerated publicly, and the response omits the requester's name and email.

### Updating status (admin)

```bash
export SUPPORT_ADMIN_TOKEN="a-long-random-secret-at-least-16-chars"
npm start

curl -X PATCH http://localhost:3000/api/admin/tickets/RZ-ABC123/status \
  -H "Authorization: Bearer $SUPPORT_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"in_progress","message":"We are looking into this and will update you here."}'
```

Allowed statuses: `open`, `in_progress`, `waiting_for_user`, `resolved`, `closed`.
Each update is appended to the ticket's response history with its timestamp.

---

## Storage, uploads, and limits

- SQLite database: `$DATA_DIR/support.sqlite` (WAL mode, foreign keys on).
- Attachments: `$DATA_DIR/uploads/` with random UUID filenames, mode `0600`, **never served publicly**.
- Accepted files: PNG, JPEG, WebP, PDF, plain text; maximum **5 MB**, one file per request.
- File **contents** are checked with magic bytes, not just the declared MIME type. SVG uploads are
  rejected.
- Submitted fields are trimmed, length-limited, control characters stripped, and validated with Zod
  on the server. React escapes all rendered user content.
- Rate limits: 180 requests/minute per IP overall, 8 ticket submissions per 10 minutes, 15 tracking
  lookups per 10 minutes, 60 admin calls per 15 minutes.
- The API sends a strict CSP, `nosniff`, frame protection suitable for the preview host, and a
  same-origin referrer policy.

For a multi-instance deployment, replace the in-memory rate-limit store with a shared store (e.g.
Redis) and move SQLite to a single-writer managed database. Mount `$DATA_DIR` on a persistent volume
so tickets survive redeploys.

---

## Docker

```bash
docker build -t rizz-support .
docker run --rm -p 3000:3000 \
  -v rizz-support-data:/data \
  -e SUPPORT_ADMIN_TOKEN="a-long-random-secret" \
  rizz-support
```

The image runs as the non-root `node` user, stores data under `/data`, and exposes port 3000.

---

## Quality checks

```bash
npm run typecheck   # client + server TypeScript
npm test            # 36 Vitest tests
npm audit --omit=dev
```

The suite covers API creation, lookup privacy, duplicate protection, friendly validation errors,
honeypot rejection, magic-byte upload checks, file-size rejection, admin authentication and status
history, rate limiting, SPA fallback/security headers, search ranking and filtering, accordion
behaviour, search navigation, form validation/success/failure states, full-app routing, and an
axe-core accessibility audit of the home, help, article, FAQ, submit, and track pages.

---

## Design notes

The visual system follows the requested lime-dark palette: `#080A08` base, `#0D100D` surface,
`#111511` card, `#161C16` elevated card, `#B7FF32` primary lime, `#9BEA26` secondary lime, `#526B35`
muted lime, `#F5F7F2` primary text, `#969E91` secondary text, and `rgba(183,255,50,0.12)` borders.
Small uppercase labels use an accessible lighter muted-lime (`#7D9A58`) instead of the decorative
`#526B35`, which would fall below WCAG AA at 11 px.

Lime is reserved for accents, primary actions, focus, and active states. Cards use restrained
borders and ambient radial light rather than heavy glass effects. Animations are short
(150–550 ms), GPU-friendly, and disabled under `prefers-reduced-motion`.
