# Agent instructions — Rizz Support Center

This repository is the standalone support center for the Rizz social platform. It is **not** the
Rizz app itself. Do not modify or make claims about rizzapp.onrender.com beyond verified facts.

## Stack

- Vite 7 + React 19 + TypeScript, React Router 7
- Tailwind CSS v4 via `@tailwindcss/vite`; design tokens and component classes live in
  `client/src/styles/globals.css`
- `lucide-react` icons, `@fontsource-variable/inter`, `motion` (`motion/react`)
- Express + `node:sqlite` API in `server/src`, shared contracts in `shared/`
- Vitest + Testing Library + axe-core

## Commands

```bash
npm run typecheck     # client + server TypeScript
npm run build         # Vite client build + server tsc
npm test              # all Vitest suites
npm run check         # full gate (typecheck, format check, tests, build)
npm run dev           # client 5173 + API proxy to 3000
npm start             # production server on PORT (default 3000)
```

`client/dist` is generated and ignored; build before running the production server or the API's
SPA-serving test.

## Design work

For any UI/CSS/layout/interaction task, use the **Premium Design Engineer** skill:

- `skills/premium-design-engineer/SKILL.md` — workflow, judgement, hard rules
- `skills/premium-design-engineer/DESIGN_SYSTEM.md` — tokens, layout, components, motion
- `skills/premium-design-engineer/CSS_ENGINEERING.md` — layout/stacking/overlay implementation
- `skills/premium-design-engineer/VISUAL_QA.md` — mandatory QA and evidence standard

This is a refinement codebase. Preserve the Rizz identity (dark surfaces, lime accent, existing
type and radii), the routes, the Express API, the ticket system, search indexing and data
structures. Extend the existing system; do not introduce a second design language or a new UI
framework.

## Product constraints

- Only verified Rizz facts: feed, realms, voice rooms, messages, 24h stories; `/signup` and `/login`
  exist. There are no `/privacy` or `/terms` pages — do not link them.
- Never invent policies, contact addresses, response times, support hours, integrations or features.
- No mock tickets, fake tracking results, fake counts, reading times, update dates or success
  messages. Ticket submission and lookup must use the real API.
- Do not show all validation errors on load; validate after interaction or submit.
- Do not hide errors. Keep user input and explain what failed.

## Interaction and accessibility rules

- Buttons are `<button>`, navigation is `<Link>`/`<a>`; never nest interactive elements.
- Every interactive element needs default, hover, focus-visible, active, disabled/loading and error
  states where applicable. Icon-only controls need accessible names.
- Never ship decorative three-dot menus or controls without an implementation. If an operation is
  missing, name it in the report instead of faking it.
- Respect `prefers-reduced-motion` for both CSS and Motion (`MotionConfig reducedMotion="user"` plus
  component-level checks).
- Overlays that must escape clipping belong in a portal with viewport-clamped fixed positioning and
  `visualViewport` handling. Close on Escape, outside pointerdown and route change; restore focus.
- Do not solve alignment with random margins or arbitrary absolute positioning. Use the container,
  grid and spacing tokens.

## Verification

Before claiming completion:

1. `npm run typecheck && npm run build && npm test`
2. Start the production build and sweep every route, one real ticket lookup and an invalid one.
3. Check all new interactions and responsive states. Use a browser preview when available; when it
   is not, state clearly which conclusions are code/test-based rather than visually verified.
4. Report missing functionality and remaining limitations explicitly. Never claim something works
   without evidence.

## Repository hygiene

- Do not commit `client/dist`, `server/dist`, `data/`, `.env`, logs or generated artifacts.
- Use `git check-ignore -v <path>` when adding directories whose names could match ignored data
  folders.
- Keep dependencies minimal. Motion is already available; do not add another animation library.
