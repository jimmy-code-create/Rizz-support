# Admin Support Workspace — Detailed Implementation Plan

**Status:** Proposal only. No application code has been changed for this plan.
**Scope chosen:** a protected support-admin workspace using the existing Express + SQLite + React stack.
**Target:** one focused admin feature set: ticket queue → ticket detail → real reply / status update → attachment access.

---

## 1. Objective

Give the support team a private, production-credible workspace to operate the existing ticket system:

- find a ticket by reference, subject, requester name, or email;
- filter by status and priority;
- read the full request, requester details, browser context, attachment, and real response history;
- post a real response that the requester sees on `/track`;
- move a ticket through the existing status model;
- download the private attachment that the requester uploaded.

Success means the public site stays unchanged for visitors, while an authenticated operator can do the above without inventing data, mock states, or a second backend.

### Non-negotiable constraints inherited from this repo

- No fake tickets, counts, statuses, success messages, response times, or policies.
- No new support channels or contact addresses; the workspace only operates existing tickets.
- No new framework, UI library, or animation library.
- Preserve the Rizz dark/lime identity, existing tokens, Inter, Lucide, and `motion/react`.
- Public `/track` must show the same real data the admin writes.
- Every admin request is authorised server-side; hiding UI is not security.
- Admin pages must be `noindex` and excluded from robots.
- When a browser preview is unavailable, visual conclusions must be reported as code/test-based, not as pixel verification.

---

## 2. Current-state audit (verified in this checkout)

### 2.1 Server

| Area | Current fact | File |
| --- | --- | --- |
| Admin auth | `SUPPORT_ADMIN_TOKEN` must be ≥16 chars; Bearer token; timing-safe compare; API returns 404 when disabled | `server/src/config.ts`, `server/src/app.ts` |
| Admin API | **One endpoint:** `PATCH /api/admin/tickets/:reference/status` with `{ status, message? }` | `server/src/app.ts` |
| Admin rate limit | 60 requests / 15 min | `server/src/rate-limit.ts` |
| Ticket store | `create`, `findDuplicate`, `lookup(reference,email)`, `updateStatus`, `count` | `server/src/tickets.ts` |
| Ticket schema | `tickets` + `ticket_messages`; messages have `author` (`support/system/user`) and optional `status` | `server/src/db.ts` |
| Public contract | `TicketSummary` omits requester; `TicketDetail` includes description, browser info, messages | `shared/ticket.ts` |
| Attachments | Stored privately under `$DATA_DIR/uploads`, never served publicly; metadata stored in `tickets` | `server/src/uploads.ts`, `server/src/db.ts` |
| Public lookup | Reference + matching email; wrong email and unknown reference both return 404 | `server/src/app.ts` |

### 2.2 Client

| Area | Current fact | File |
| --- | --- | --- |
| Routes | `/`, `/help`, `/help/:slug`, `/faqs`, `/submit`, `/track`, `/issues`, `/issues/new`, `*` | `client/src/App.tsx` |
| Public shell | Sticky public navbar + footer in `Layout` | `client/src/components/layout/Layout.tsx` |
| API client | Public ticket/issue helpers only; no admin helpers | `client/src/lib/api.ts` |
| Tracking timeline | Public ticket detail already renders real messages and status history | `client/src/pages/TrackPage.tsx` |
| Design system | Dark surfaces, lime accent, `.container-page`, `.section`, cards, badges, fields, toast, motion conventions | `client/src/styles/globals.css` |

### 2.3 Gaps this plan closes

1. No way to list/search tickets as an operator.
2. No admin-safe ticket detail response with requester contact information.
3. No way to reply without also changing status.
4. No way to read or download the private attachment.
5. No admin UI at all.
6. Admin rate limit is too low for a list/detail workspace.
7. `/admin` does not exist and is not marked `noindex`.

---

## 3. Product scope

### 3.1 In scope (v1)

- Token-gated admin workspace at `/admin`.
- Ticket queue with status/priority/search filters and pagination.
- Queue counts by status.
- Ticket detail with requester, description, browser info, attachment metadata, and full timeline.
- Single response composer that can:
  - send a reply without changing status;
  - change status with or without a reply.
- Attachment download through an authenticated API request.
- Manual refresh, loading/empty/error/unauthorised/disabled states.
- Copy reference and requester email.
- Responsive queue/detail layouts and keyboard/focus handling.
- Tests and documentation.

### 3.2 Explicitly out of scope for v1

These would need product or data decisions that do not exist yet:

- Admin user accounts, roles, multiple operators, or login sessions.
- Assigning tickets to people or teams.
- SLA timers, due dates, or response-time promises.
- Internal-only notes (existing messages are public/visible to the requester).
- Bulk actions, CSV export, or PII analytics.
- Ticket deletion or editing past messages.
- Outbound email notifications.
- Public replies from requesters inside this portal.
- Inline attachment preview (download only).
- Background polling or realtime push.
- Search across resolved tickets older than the current pagination window beyond the server filters.

### 3.3 Decisions made in this plan

1. **One route:** `/admin` only. The selected ticket is client state, not a URL, so a ticket reference does not land in browser history or analytics.
2. **API is authoritative:** the client gate is a usability layer; every endpoint validates the bearer token.
3. **Memory-first token:** the token lives in React state by default. An explicit “Keep unlocked in this tab” option may use `sessionStorage`; never `localStorage`, never a query string, never a cookie.
4. **Real writes only:** after a reply/status update, the client refreshes the ticket detail and the queue from the API rather than inventing a local state.
5. **Private attachments are downloaded, not embedded.**
6. **No admin link in the public header or footer.**
7. **No polling.** A visible Refresh action and post-mutation refresh are the only automatic reads.

---

## 4. Users and primary flows

### 4.1 Persona

A support operator who has been given the deployment’s `SUPPORT_ADMIN_TOKEN` and needs to triage a small queue quickly.

### 4.2 Primary flow

1. Open `/admin`.
2. Enter the admin token.
3. Land on the queue, default filter “All”, sorted by most recently updated.
4. Search by reference or requester, or choose a status/priority filter.
5. Select a ticket.
6. Read the description, browser info, attachment, and timeline.
7. Write a reply and/or choose a new status.
8. Submit; the returned message and status become visible in the timeline immediately and on the public tracking page.
9. Refresh the queue to see the updated position.

### 4.3 Secondary flows

- **Find one ticket fast:** paste `RZ-ABC123` into search.
- **Triage waiting tickets:** status filter “Waiting for user”, scan requesters/subjects.
- **Download evidence:** open detail → Download attachment.
- **No matching tickets:** clear filters or search a different term.
- **Token expired/wrong:** API 401 → workspace locks, token field returns with an explanatory alert.
- **Admin disabled:** session check 404 → clear “disabled on this server” state, not a misleading “wrong token”.
- **Rate limited:** show the server message and keep current data; retry later.
- **Mobile:** list → detail in place with a Back to queue control; no horizontal scrolling.
- **Keyboard:** token form → queue → ticket → composer; focus moves to the detail heading on selection and back to the selected row on return.

---

## 5. Server design

### 5.1 Shared contracts

Create `shared/admin.ts` (public `shared/ticket.ts` remains unchanged so the public lookup cannot accidentally grow PII fields).

```ts
import type { TicketDetail, TicketMessage, TicketSummary } from './ticket.ts';
import type { TicketPriority, TicketStatus } from './support.ts';

export interface AdminTicketSummary extends TicketSummary {
  requesterName: string;
  requesterEmailMasked: string;
}

export interface AdminAttachment {
  name: string;
  size: number;
  mime: string;
}

export interface AdminTicketDetail extends TicketDetail {
  requester: { name: string; email: string };
  attachment: AdminAttachment | null;
}

export type AdminStatusFilter = TicketStatus | 'all';
export type AdminPriorityFilter = TicketPriority | 'all';

export interface AdminTicketCounts {
  all: number;
  open: number;
  in_progress: number;
  waiting_for_user: number;
  resolved: number;
  closed: number;
}

export interface ListAdminTicketsResponse {
  tickets: AdminTicketSummary[];
  total: number;
  counts: AdminTicketCounts;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GetAdminTicketResponse {
  ticket: AdminTicketDetail;
}

export interface AddAdminMessageResponse {
  message: TicketMessage;
  ticket: AdminTicketSummary;
}

export interface UpdateAdminStatusResponse {
  ticket: AdminTicketSummary;
  message: TicketMessage;
}

export interface AdminSessionResponse {
  authenticated: true;
}
```

`requesterEmailMasked` example: `a***@example.com` (preserve first character and full domain). Full email only in the detail response.

### 5.2 Endpoints

All are under `/api/admin`, use the existing `requireAdmin` middleware, return `Cache-Control: no-store`, and are JSON except the attachment stream.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/session` | Validate token; returns `{ authenticated: true }` |
| `GET` | `/api/admin/tickets` | Filtered, paginated queue + counts |
| `GET` | `/api/admin/tickets/:reference` | Full admin detail |
| `POST` | `/api/admin/tickets/:reference/messages` | Add a support reply without changing status |
| `PATCH` | `/api/admin/tickets/:reference/status` | Existing endpoint; status + optional reply |
| `GET` | `/api/admin/tickets/:reference/attachment` | Authenticated private file download |

#### Session

`GET /api/admin/session`

- 200 `{ authenticated: true }`
- 401 `UNAUTHORIZED` for a wrong/missing token
- 404 `NOT_FOUND` when the server has no admin token configured (the existing “admin is invisible” behaviour)

#### List

`GET /api/admin/tickets?status=all&priority=all&q=&limit=20&offset=0`

Validation (Zod):

- `status`: `all | open | in_progress | waiting_for_user | resolved | closed`, default `all`
- `priority`: `all | low | normal | high | urgent`, default `all`
- `q`: trimmed, max 100 chars, optional
- `limit`: integer 1–50, default 20
- `offset`: integer ≥0, default 0

Ordering: `updated_at DESC, id DESC`. No client-controlled sort in v1.

Response:

```json
{
  "tickets": [
    {
      "reference": "RZ-ABC123",
      "subject": "Upload spinner never finishes",
      "category": "bug",
      "priority": "high",
      "status": "open",
      "createdAt": "2026-11-03T07:00:00.000Z",
      "updatedAt": "2026-11-03T07:00:00.000Z",
      "attachmentName": "screenshot.png",
      "requesterName": "Alex Rivera",
      "requesterEmailMasked": "a***@example.com"
    }
  ],
  "total": 12,
  "counts": {
    "all": 12,
    "open": 5,
    "in_progress": 2,
    "waiting_for_user": 1,
    "resolved": 3,
    "closed": 1
  },
  "limit": 20,
  "offset": 0,
  "hasMore": false
}
```

Semantics:

- `total` is the number of tickets matching **search + priority**, ignoring the status filter.
- `counts` are computed with **search + priority**, ignoring the status filter, so the status chips are meaningful while a status is selected.
- `hasMore = offset + tickets.length < total`.
- Search matches reference, subject, requester name, and normalized email. Escape `%`, `_`, and `\` before using `LIKE`.
- An exact reference search should be efficient enough via the unique reference index; broader substring search scans the ticket table, which is acceptable for this single-workspace app and capped by `limit`/offset. If the table grows beyond roughly 100k rows, revisit with FTS5.

#### Detail

`GET /api/admin/tickets/:reference`

- Normalize reference to uppercase; invalid/unknown → 404 `TICKET_NOT_FOUND`.
- 200 `{ ticket: AdminTicketDetail }` including:
  - public `TicketDetail` fields (description, browserInfo, messages, attachmentName, timestamps)
  - `requester: { name, email }`
  - `attachment: { name, size, mime } | null`
- Never return `attachment_path` or the absolute uploads path.

#### Reply without status change

`POST /api/admin/tickets/:reference/messages`

Body: `{ "body": "Thanks — could you share a screenshot?" }`

- Validate body 1–4000 characters after `cleanText`.
- Insert a `ticket_messages` row with `author='support'`, `body`, `status=null`, `created_at=now`.
- Update `tickets.updated_at` in the same transaction.
- Return `{ message, ticket: AdminTicketSummary }`.
- 404 unknown ticket; 422 friendly field error; 401 unauthorised.

#### Status change

Keep the existing `PATCH /api/admin/tickets/:reference/status` contract for compatibility:

```json
{ "status": "waiting_for_user", "message": "Could you share a screenshot?" }
```

- `message` optional, 0–4000 chars.
- Existing server default (`Status updated to …`) remains for an omitted message.
- Response remains `{ ticket, message }`.
- The admin UI chooses this endpoint only when the status changes.

#### Attachment

`GET /api/admin/tickets/:reference/attachment`

- 401 without token; 404 unknown ticket.
- 404 `ATTACHMENT_NOT_FOUND` when the ticket has no attachment.
- 410 `ATTACHMENT_MISSING` if metadata exists but the file is gone (or 404; choose 410 and document it).
- Streams with:
  - `Content-Type: <allowlisted stored MIME>`
  - `Content-Disposition: attachment; filename="<sanitized>"` (no inline)
  - `Content-Length`
  - `Cache-Control: private, no-store`
- Resolve `attachment_path` against `uploadsDir`; reject if the resolved path does not start with `uploadsDir + path.sep`; require a regular file.
- Do not add an unauthenticated download link to the public site.

### 5.3 Store additions (`server/src/tickets.ts`)

Add to `TicketStore`:

```ts
listAdmin(filters: {
  status?: TicketStatus;
  priority?: TicketPriority;
  query?: string;
  limit: number;
  offset: number;
}): { tickets: AdminTicketSummary[]; total: number; counts: AdminTicketCounts };

getAdminDetail(reference: string): AdminTicketDetail | null;

addSupportMessage(reference: string, body: string):
  | { ticket: AdminTicketSummary; message: TicketMessage }
  | null;

getAttachment(reference: string): {
  storedPath: string;
  originalName: string;
  size: number;
  mime: string;
} | null;
```

Implementation notes:

- Reuse `toSummary` and `toMessage`; add `toAdminSummary` with masked email.
- Build the WHERE clause once and reuse for `rows`, `total`, and `counts` (counts omit only the status predicate).
- Use `SELECT COUNT(*)` rather than loading all rows.
- `addSupportMessage` and `updateStatus` use `BEGIN IMMEDIATE`/`COMMIT`/`ROLLBACK`, matching the existing pattern.
- `listAdmin` returns deterministic ordering with an `id DESC` tiebreak.
- `getAttachment` reads stored metadata only; the route performs filesystem checks.

### 5.4 Database and indexes

No new tables or columns are required.

Add idempotent indexes to `server/src/db.ts`:

```sql
CREATE INDEX IF NOT EXISTS idx_tickets_admin_updated
  ON tickets (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_admin_status_updated
  ON tickets (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_admin_priority_updated
  ON tickets (priority, updated_at DESC);
```

Existing databases get these indexes on next open. No destructive migration.

### 5.5 Validation (`server/src/validation.ts`)

Add:

```ts
export const adminTicketListSchema = z.object({
  status: z.enum(['all', ...STATUS_VALUES]).default('all'),
  priority: z.enum(['all', ...PRIORITY_VALUES]).default('all'),
  q: z.preprocess(cleanText, z.string().max(100).optional()),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminMessageSchema = z.object({
  body: requiredText(4000, 1, 'Write a reply before sending.', 'Keep replies under 4000 characters.'),
});
```

Notes:

- `z.coerce.number()` must reject `NaN`, decimals, and negative offsets with a 422.
- Use `fieldErrors` for friendly messages.
- Reuse `cleanText` so control characters/newline behaviour matches the public form.

### 5.6 Rate limiting (`server/src/rate-limit.ts`)

Current single admin limiter (60/15 min) will be exhausted by a normal session (queue + filters + detail refreshes).

Split it:

| Limiter | Limit | Purpose |
| --- | --- | --- |
| `adminRead` | 600 / 15 min | session, list, detail, attachment |
| `adminWrite` | 120 / 15 min | message, status |

Keep the global API limiter (180/min). Wrong-token attempts still count against the read limiter, so this does not make brute force cheaper. Update `CreatedApp`/tests if the limiter object shape changes.

### 5.7 Server routing and headers

- Put `GET /api/admin/session`, list/detail/attachment/message routes next to the existing status route.
- Keep the admin-disabled 404 behaviour.
- Add `X-Robots-Tag: noindex, nofollow` for `/admin` (SPA shell) before the static/history fallback.
- Update `robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
```

- Do not change the public API responses or CSP.

### 5.8 Error contract

Reuse the existing `{ error: { code, message, fields?, reference? } }` shape.

| Status | Code | When |
| --- | --- | --- |
| 401 | `UNAUTHORIZED` | Missing/wrong admin token |
| 404 | `NOT_FOUND` | Admin API disabled |
| 404 | `TICKET_NOT_FOUND` | Unknown reference |
| 404 | `ATTACHMENT_NOT_FOUND` | Ticket has no attachment |
| 410 | `ATTACHMENT_MISSING` | File metadata exists, file gone |
| 422 | `VALIDATION_ERROR` | Bad query/body, with `fields` |
| 429 | `RATE_LIMITED` | Limiter |

---

## 6. Client architecture

### 6.1 Route and shell

Add one lazy route in `client/src/App.tsx`:

```tsx
<Route path="admin" element={<AdminPage />} />
```

Place it **outside** the public `Layout` route element so the public navbar/footer do not appear. Keep `ToastProvider`, `MotionConfig`, and `ErrorBoundary` around it.

`AdminPage` owns the gate/session state. No `/admin/*` sub-routes in v1.

The global `SearchPaletteProvider` currently wraps every route. Public search is not part of the
admin task, and a public search overlay should not open on top of requester data. Disable the
palette's global shortcut/open button on `/admin` (a `useLocation` check inside the provider), or
render the admin route outside that provider while keeping `ToastProvider` and `ErrorBoundary`.
Decision for implementation: **exclude `/admin` from the public search palette**, with a test that
`Ctrl+K`/`/` does not open it on the admin gate or workspace.

### 6.2 New files

```text
client/src/pages/AdminPage.tsx
client/src/lib/admin-api.ts
client/src/lib/admin-session.tsx
client/src/components/admin/AdminGate.tsx
client/src/components/admin/AdminShell.tsx
client/src/components/admin/AdminQueue.tsx
client/src/components/admin/AdminFilters.tsx
client/src/components/admin/AdminTicketRow.tsx
client/src/components/admin/AdminTicketDetail.tsx
client/src/components/admin/AdminTimeline.tsx
client/src/components/admin/AdminComposer.tsx
client/src/components/admin/AdminAttachment.tsx
client/src/components/admin/AdminStates.tsx
client/src/components/admin/admin-utils.ts
client/src/test/admin.test.tsx
server/test/admin.test.ts
shared/admin.ts
docs/admin-support-workspace-plan.md   // this file
```

### 6.3 Session state

`admin-session.tsx` exports `AdminSessionProvider` + `useAdminSession`.

State machine:

```text
locked ──unlock──▶ checking ──200──▶ ready
                      │ 401 ─▶ locked (error)
                      │ 404 ─▶ disabled
                      │ 0/5xx ─▶ locked (connection error)
ready ──401 from any request──▶ locked (session expired)
ready ──lock──▶ locked
```

Rules:

- Token is held in component state; never rendered after submit.
- Default: memory only.
- Optional checkbox “Keep unlocked in this tab” stores the token under `sessionStorage['rizz_admin_token']`; unchecking/locking removes it.
- Do not use `localStorage`, cookies, URL params, or server logs.
- `adminFetch` adds `Authorization: Bearer <token>`; on 401 it clears the token and triggers the lock state once.
- Autofocus the token input when the gate is shown; restore focus on “Lock”.
- The token form uses a `type="password"` input with a 44 px show/hide control and `autocomplete="off"`.
- The gate is not an authentication claim: copy says the API validates the token.

### 6.4 API client

`admin-api.ts` wraps the existing `request` helper where possible, but must allow an Authorization header and support binary downloads.

Functions:

```ts
validateAdminSession(token): Promise<AdminSessionResponse>
listAdminTickets(token, filters, signal): Promise<ListAdminTicketsResponse>
getAdminTicket(token, reference): Promise<GetAdminTicketResponse>
addAdminMessage(token, reference, body): Promise<AddAdminMessageResponse>
updateAdminStatus(token, reference, status, message?): Promise<UpdateAdminStatusResponse>
downloadAttachment(token, reference): Promise<{ blob: Blob; filename: string }>
```

Notes:

- Use `AbortSignal` for queue requests; combine the caller signal with the 20 s timeout if needed.
- `downloadAttachment` must send the Authorization header, read the filename from `Content-Disposition` (or fall back to the detail’s attachment name), and return a blob.
- 401 handling is central in the session provider, not duplicated per component.
- 404 from session means “admin disabled”; 404 from ticket/detail means “not found”.
- Preserve `ApiError.fields` for validation.

### 6.5 Queue state

`AdminQueue`/hook state:

```ts
type QueueStatus = 'idle' | 'loading' | 'ready' | 'error';

interface QueueState {
  filters: { status: AdminStatusFilter; priority: AdminPriorityFilter; q: string };
  tickets: AdminTicketSummary[];
  total: number;
  counts: AdminTicketCounts;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  offset: number;
  hasMore: boolean;
}
```

Behavior:

- Initial load with `status='all'`, `priority='all'`, `q=''`, `limit=20`.
- Search is debounced 300 ms; status/priority apply immediately; changing any filter resets offset and replaces results.
- Abort the previous request when a new one starts; ignore stale responses by request id.
- Preserve current list during a filter refresh, with a subtle `aria-busy` / top progress state, rather than blanking the whole pane.
- “Load more” appends the next offset; dedupe by reference.
- Manual Refresh re-runs the current query.
- Counts come from the server; never increment locally.
- When a mutation succeeds, refresh the selected detail and the queue (current filters) from the API.

### 6.6 Detail state

`AdminTicketDetail` fetches on selection and exposes:

```ts
type DetailState =
  | { status: 'idle' }
  | { status: 'loading'; reference: string }
  | { status: 'ready'; ticket: AdminTicketDetail }
  | { status: 'error'; reference: string; message: string };
```

Behavior:

- Selecting a row sets the reference; desktop loads detail in the right pane; mobile swaps the queue for the detail pane.
- Focus the detail `<h1>` after load (desktop and mobile).
- Mobile “Back to queue” returns focus to the selected row (store row refs by reference).
- The queue card has `aria-current="true"` when selected.
- If a refresh returns 404, show “This ticket no longer exists” and clear selection.
- Error states keep the selected row visible and offer Retry.
- No automatic polling.

### 6.7 Composer

One component, two API modes:

| User action | Request |
| --- | --- |
| Message only, status unchanged | `POST /messages` |
| Status changed, message present | `PATCH /status` with `{ status, message }` |
| Status changed, no message | `PATCH /status` with `{ status }` |
| Nothing changed, no message | Submit disabled |

Fields:

- `select` labelled “Status” with all five statuses.
- `textarea` labelled “Reply to requester”, max 4000, live character count.
- Submit label changes by mode: “Send reply”, “Update status”, “Update and reply”.
- Helper: replies are visible to the requester on `/track`; there are no internal notes in v1.
- Loading disables the submit and shows the spinner; fields remain readable.
- Server field errors map below the field and focus the offending control.
- Network/server error is an inline `role="alert"` above the form; keep the typed message.
- Success: use the returned real message to update the timeline (or refetch detail), clear the textarea, reset status to the saved status, toast “Reply sent” / “Status updated”.
- Never claim an email was sent; the requester sees the message when they track the request.

### 6.8 Attachment

- Show file icon, name, formatted size, and MIME label in detail.
- Button “Download attachment” with loading/disabled/error states.
- Fetch with Authorization, create an object URL, trigger a temporary `<a download>`, then revoke the URL.
- On 404/410, replace the control with a clear “Attachment is no longer available” note; keep the rest of the ticket usable.
- Do not embed the file inline; do not expose a public URL.

### 6.9 Copy actions

- Copy ticket reference and requester email via `copyTextToClipboard` + existing `useToast`.
- Button labels include the value for screen readers; success/error toast.
- No mailto link in v1 (avoids implying a support mailbox).

### 6.10 Error/empty/disabled states

| State | UI |
| --- | --- |
| Wrong token | Inline alert in gate: “That token was not accepted.” Token field remains, no data loaded |
| Admin disabled | “The admin workspace is not enabled on this server.” No token retry loop |
| Network failure at unlock | Connection message + Retry; token field keeps value? Clear token only if wrong; preserve on network failure |
| Queue empty, no filters | “No tickets yet” + explanation that submitted requests appear here |
| Queue empty, filters active | “No tickets match these filters” + Clear filters |
| Detail loading | Skeleton matching the detail header/metadata/timeline |
| Detail 404 | NotFound panel + Back to queue |
| 429 | Server message + Retry; keep current data |
| 401 after unlock | Lock the workspace and show “Session expired; enter the token again” |
| Mutation validation | Field-level errors + focus |
| Attachment missing | Inline note; do not break the ticket |

---

## 7. UX and visual specification

### 7.1 Design direction

A dense, calm operator console built from the existing Rizz system:

- dark base/surface/card surfaces;
- lime reserved for primary actions, focus, selected state, and the active queue row accent;
- status colors from the existing badge tones (open lime, in progress blue, waiting amber, resolved mint, closed neutral);
- Inter typography, existing radii and shadows;
- no glassy dashboard chrome, no floating cards everywhere, no decorative charts;
- information density higher than the public site, but still generous line-height and 44 px mobile targets.

### 7.2 Admin shell

- Slim top bar (64 px desktop, 56–64 px mobile) with brand mark/lockup, “Admin workspace” label, optional “All data is live” note, and Lock button.
- Skip link to `#admin-main`.
- Main content max width 90rem (`1440px`) with 18/28/40 px padding consistent with `.container-page`; add `.container-admin` if needed rather than arbitrary margins.
- Desktop (`≥1024px`): fixed-height workspace under the top bar:
  - queue pane 360–400 px, independently scrollable;
  - detail pane `minmax(0,1fr)`, independently scrollable;
  - borders between panes, no nested page scroll.
- Mobile/tablet (`<1024px`): normal document flow; queue first; detail replaces it when selected, with a sticky “Back to queue” control at the top of detail.
- Do not use a modal for the detail on desktop. On mobile it is a page state, not a focus-trapped dialog (the queue is intentionally left).
- Sticky queue filters at the top of the queue pane.

### 7.3 Gate

- Centered card max-width 28–30rem within the admin shell.
- Local brand mark, `h1` “Support workspace”, short explanation of the token, password field, show/hide control, submit, link back to support home.
- No fake email/password fields.
- Error alert above the field, `role="alert"`.
- Footer note: token is held in this tab only unless the session checkbox is selected.

### 7.4 Queue

- Header: “Tickets” `h1` (page-level), total count, Refresh button.
- Filter block:
  - status chips (“All”, “Open”, “In progress”, “Waiting”, “Resolved”, “Closed”) with counts and `aria-pressed`;
  - priority select (All priorities / Low / Normal / High / Urgent);
  - search field with label, placeholder “Reference, subject, name, or email”;
  - “Clear filters” when any filter differs from default.
- Ticket row:
  - status badge + priority label;
  - reference in mono + subject;
  - requester name + masked email;
  - updated date/time; attachment icon if present;
  - selected row: lime left border, elevated surface, `aria-current`.
- Rows are `<button>` elements, not nested links; full-row click/tap target.
- Loading: 5 skeleton rows.
- Empty/error states as above.
- “Load more” button when `hasMore`; shows count loaded.

### 7.5 Detail

Order:

1. Back to queue (mobile).
2. Header: reference, status badge, priority badge, subject `h1`, updated time.
3. Requester card: name, full email, copy actions.
4. Metadata grid: category, priority, created, updated, browser, attachment.
5. Request description (pre-wrap, break-words, max readable width).
6. Attachment card (if any).
7. Timeline (`role="list"` or `<ol>`): author, status badge for status events, body, timestamp. System/support/user labels from real data.
8. Composer.

Use `dl` for metadata; headings for sections. No horizontal overflow; long descriptions/emails break.

### 7.6 Typography and spacing

- `h1` 24–30 px mobile/desktop; subject may wrap.
- Panel titles 13–14 px medium; body 13–14 px with 1.65–1.75 line-height.
- Metadata labels 10–11 px uppercase tracking; values 12.5–13 px.
- 8 px base spacing increments; section gaps 20–28 px; page padding via container.
- Cards use existing `rounded-card`/`panel`, `border-line-subtle`, `bg-card`, `shadow-card`; queue rows use `rounded-[12px]`.
- No arbitrary absolute positions for layout.

### 7.7 Motion

- Gate/session transition: 180 ms fade.
- Queue/detail load: 160–200 ms opacity/translate.
- Mobile detail swap: 200–220 ms slide/fade; back reverses.
- New timeline item: 180 ms fade/translate.
- Toast via existing system.
- Skeleton shimmer existing.
- Respect `prefers-reduced-motion` + `MotionConfig reducedMotion="user"` + component-level checks.
- Never block typing or the submit control with animation.

### 7.8 Accessibility

- One `h1` per view (gate: Support workspace; queue: Tickets; mobile detail: ticket subject). Desktop may keep queue `h2` and detail `h1`; ensure no duplicate `h1` at the same time. Recommended: gate `h1`; workspace `h1` “Support workspace” in the top bar? Avoid duplicate. Use `h1` “Tickets” for queue and detail subject `h2` on desktop (both visible), or `h1` subject and queue `h2` “Ticket queue”. Decide at implementation and test heading order.
- Queue filters: real buttons, `aria-pressed`; selects labelled; search labelled.
- Ticket rows: button accessible name includes reference, subject, status, requester.
- `aria-live="polite"` for queue count and mutation result; `role="alert"` for errors.
- Focus visible on every control; selected row; focus detail heading on load; return focus on back.
- Composer labels, character count, `aria-describedby`, `aria-invalid`, disabled/loading.
- Attachment download button; error alert.
- No nested interactive elements.
- Color is never the only status indicator (badges include text).
- Token input has a visible label; show/hide has an accessible name and 44 px target.
- Skip link; main landmark; admin shell has no public nav landmarks.
- Reduced motion; no auto-focus traps.

### 7.9 Responsive QA matrix

| Width | Expected |
| --- | --- |
| 360 px | Gate fits, no horizontal scroll; filters wrap/scroll; rows readable; detail single column; composer full width; 44 px targets |
| 375 px | Same, slightly wider rows |
| 390 px | Same |
| 412 px | Same |
| 430 px | Same |
| 768 px | Single-pane queue/detail; metadata 2 columns; no cramped two-pane |
| 1024 px | Two-pane starts; queue 340–360 px; detail ≥560 px; no clipped composer |
| 1280 px | Two-pane comfortable; max content width respected |
| 1440/1920 px | Centered admin container; queue does not stretch excessively |

Test with a 320 px safety check if possible; no page-level horizontal overflow. Mobile keyboard open: composer and search remain visible; no fixed-height trap.

---

## 8. Implementation sequence

### Phase 0 — Contracts and database

- Add `shared/admin.ts`.
- Add indexes to `server/src/db.ts`.
- Add validation schemas.
- Update rate limiter shape.
- **Gate:** typecheck.

### Phase 1 — Read API

- Store: `listAdmin`, `getAdminDetail`.
- Routes: session, list, detail.
- Masked email helper; count queries; pagination; search escaping.
- `X-Robots-Tag` + robots.
- **Gate:** server tests for auth, filters, pagination, counts, detail, disabled server.

### Phase 2 — Write API + attachment

- Store: `addSupportMessage`, `getAttachment`.
- Routes: message, attachment.
- Existing status route regression tests.
- **Gate:** public lookup sees the new reply/status; attachment auth/safety tests.

### Phase 3 — Client session and shell

- `admin-session.tsx`, `admin-api.ts`.
- Gate, admin shell, route.
- **Gate:** unlock/wrong/disabled/expired; token not persisted by default; axe gate.

### Phase 4 — Queue

- Filters, debounced search, pagination, counts, states.
- **Gate:** queue tests + axe; mobile widths.

### Phase 5 — Detail, timeline, composer, attachment

- Detail fetch, metadata, timeline, copy, download, composer modes.
- **Gate:** real writes reflected in timeline and public tracking; error preservation; axe.

### Phase 6 — Polish and verification

- Responsive pass, reduced motion, focus order, empty states, README.
- Full `typecheck`, `build`, `test`.
- Production route sweep and a real create → admin list/detail → reply/status → public track loop.
- Browser preview at 360/375/390/412/430/768/1024/1280 if available.
- Report any unverified visual claims.

---

## 9. Test plan

### 9.1 Server (`server/test/admin.test.ts`)

Use a temporary `DATA_DIR`, `adminToken`, `rateLimit: false`, and the real public API to create fixtures.

1. Admin disabled: all `/api/admin/*` return 404.
2. Missing/wrong token: 401, no body data.
3. Session: valid token → 200 `{ authenticated: true }`.
4. List:
   - default limit 20, updated-desc order;
   - status filter;
   - priority filter;
   - q by reference, subject, name, email;
   - q escaping `%`/`_` does not broaden unexpectedly;
   - pagination offset/limit/hasMore;
   - `total`/counts semantics with status selected;
   - invalid status/priority/limit/offset → 422 friendly fields;
   - response has no `attachment_path`, no full email in list.
5. Detail:
   - full requester, description, browser info, attachment metadata, timeline;
   - unknown/invalid reference → 404;
   - reference case-insensitive.
6. Reply:
   - valid body → 200, message author support, status null;
   - `updatedAt` changes;
   - public lookup includes the reply;
   - 1/4000 boundaries; empty/oversize → 422;
   - unknown ticket → 404.
7. Status:
   - existing auth/status/message test still passes;
   - public lookup sees status/message;
   - no duplicate message when omitted (existing default).
8. Attachment:
   - upload a PNG through public API;
   - admin download returns bytes/content type/disposition;
   - unauthorised 401;
   - no-attachment 404;
   - deleted file 410;
   - path cannot escape uploads directory (unit-level guard).
9. Headers: `/api/admin/*` `Cache-Control: no-store`; `/admin` `X-Robots-Tag`; robots disallow.
10. Rate-limit smoke with enabled limiters if practical (may be skipped if shared test app uses disabled limits; add a focused app instance).

### 9.2 Client (`client/src/test/admin.test.tsx`)

Mock `fetch` with contract-shaped responses.

1. Gate:
   - wrong token stays locked with alert;
   - disabled 404 shows disabled state;
   - valid token renders workspace;
   - token is not in localStorage; sessionStorage only when checkbox used; lock clears both;
   - show/hide control works.
2. Queue:
   - loading skeleton → rows;
   - search sends debounced `q` and aborts previous;
   - status/priority filters reset offset;
   - load more appends and dedupes;
   - empty (no tickets vs no match) and error retry;
   - counts render.
3. Detail:
   - selecting row fetches detail and displays requester, description, browser, attachment, timeline;
   - mobile back returns focus to row;
   - 401 re-locks.
4. Composer:
   - message-only uses POST `/messages`;
   - changed status + message uses PATCH `/status`;
   - changed status/no message uses PATCH;
   - unchanged/no message disables submit;
   - success clears textarea, renders real message, toasts;
   - server error preserves text and shows alert;
   - field error focuses control.
5. Attachment:
   - download fetch includes Authorization;
   - object URL created/revoked; anchor download triggered;
   - 410 shows inline unavailable state.
6. Copy reference/email uses clipboard + toast.
7. Axe: gate, queue, desktop detail, mobile detail, composer error state.
8. Heading/focus checks; no duplicate `h1`; selected row `aria-current`.

### 9.3 Manual QA / verification

1. `npm run typecheck`, `npm run build`, `npm test`.
2. Start with a real `SUPPORT_ADMIN_TOKEN` and `DATA_DIR`; open `/admin`.
3. Wrong token → 401 gate; correct token → queue.
4. Create a public ticket with an attachment.
5. Find it in admin by reference/email; open detail; verify all fields.
6. Download the attachment.
7. Send a message without status change; verify `/track` shows it.
8. Change status with a message; verify `/track` status and timeline.
9. Check filters, pagination, empty search, refresh, route reload (token should be gone unless “keep in tab” was chosen).
10. Stop/reconfigure without admin token → 404 disabled state.
11. Responsive widths 360/375/390/412/430/768/1024/1280; keyboard-only pass; reduced-motion pass.
12. Check network panel: no token in URLs, no PII in unauthorised responses, no-store headers, no console errors.
13. State clearly whether pixel QA was actually possible.

---

## 10. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Token exposure in a client bundle/history/storage | Memory default; sessionStorage only opt-in; never URL/localStorage; lock action; no logs |
| Static `/admin` route exists without auth | API is authoritative; gate shows no data; noindex/robots; X-Robots-Tag |
| PII exposure in list | Mask email in list; full email only in authorised detail |
| Attachment path traversal | Resolve + prefix check against uploads dir; regular-file check; allowlisted MIME |
| Rate limit too low for a workspace | Split read/write limits; no polling |
| Stale/out-of-order queue responses | AbortController + request id; replace on filter change |
| Admin and public data drift | Always refetch detail/queue after mutation; public `/track` is the source of truth |
| Long search scans | Cap q/limit; indexes; revisit FTS if volume grows |
| Duplicate status/message writes | Composer chooses POST vs PATCH; server transactions; disable while pending |
| Mobile composer hidden by keyboard | Normal document flow on mobile; no fixed-height pane; test with keyboard |
| Unverified visual claims | Explicit report of browser availability; code/test evidence otherwise |
| Multi-operator conflicts | Out of scope; no assignment/version field; document as future work |

---

## 11. Acceptance checklist

- [ ] `/admin` renders a token gate with no ticket data before unlock.
- [ ] Valid token unlocks; wrong token, disabled server, network failure, session expiry, and rate limit all have distinct real states.
- [ ] Token is memory-only by default; optional sessionStorage works; Lock clears it; no token in URLs/localStorage/logs.
- [ ] Queue lists real tickets with status/priority/search filters, counts, pagination, refresh, loading/empty/error states.
- [ ] Detail shows real requester, description, browser info, attachment metadata, and full timeline.
- [ ] Reply without status change writes a real `support` message visible on `/track`.
- [ ] Status change writes the existing real status event and optional message.
- [ ] Attachment download is authenticated, private, correctly named, and handles missing files.
- [ ] No fake counts, statuses, messages, SLAs, or policies.
- [ ] Responsive at 360/375/390/412/430/768/1024/1280; no horizontal overflow; 44 px mobile targets.
- [ ] Keyboard/focus path works; queue/detail focus restoration; no nested interactives.
- [ ] Axe has no violations for gate/queue/detail (with jsdom exclusions documented).
- [ ] `npm run typecheck && npm run build && npm test` pass.
- [ ] Production route sweep and real admin → public tracking loop completed.
- [ ] README documents the admin workspace, token setup, storage behaviour, and verification limits.

---

## 12. Deferred follow-ups

- Multi-operator accounts/roles and assignment.
- Internal notes with a `visibility` column and public filtering.
- Audit trail for admin reads/writes beyond the existing message history.
- Bulk actions, saved views, CSV export.
- Ticket tags/custom fields.
- FTS5 search if volume warrants it.
- Email notifications (only if a real provider/policy exists).
- Auto-lock after idle time and optional TOTP/SSO.
- Attachment preview (only after malware scanning is designed).
