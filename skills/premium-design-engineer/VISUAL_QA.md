# Visual QA

Compilation is not design. A passing test suite does not prove that a panel is not clipped, a
header is aligned or a menu fits a 360px screen. Visual QA is mandatory whenever a renderer or
preview is available, and must be reported honestly when it is not.

## 0. Evidence standard

State one of these for every claim:

- **Verified** — observed in a running build/preview, with viewport and interaction named.
- **Automated** — covered by a test (name the test).
- **Code-reviewed** — reasoned from the implementation, not observed.
- **Not verified** — no renderer/tool available.

Never write "the mobile layout is perfect" if no browser was used. Write "mobile layout was
code-reviewed and covered by DOM tests; pixel-level inspection was not possible in this environment."

## 1. Build and route gate

```bash
npm run typecheck
npm run build
npm test
```

Then start the production build and check every route, including 404 and query-string states:

- `/`
- `/help`
- `/help?category=bugs`
- `/help/:slug` (one real slug)
- `/faqs`
- `/submit`
- `/submit?category=account`
- `/track`
- `/track?ticket=<real reference>` and an invalid reference
- an unknown path → styled 404, no blank screen

Check: HTTP status, HTML content type, CSS/JS 200s, API health, security headers, console errors,
failed network requests and hydration warnings.

## 2. Viewport matrix

Inspect at minimum:

| Width | Device class | Focus |
| --- | --- | --- |
| 360 | small Android | no overflow, 44px targets, search panel fits |
| 375 | iPhone SE/8 | same, keyboard-open search |
| 390 | modern iPhone | same |
| 412 | Android | same, drawer and filters |
| 430 | large phone | same |
| 768 | tablet portrait | 2-column grids, header actions |
| 1024 | small laptop | primary nav visible, 3-column grids |
| 1280 | desktop | container gutters, hero balance |
| 1440 | large desktop | max-width behaviour, no stretched content |

At each width check:

- horizontal scrollbar (`document.documentElement.scrollWidth > innerWidth`);
- header height and sticky behaviour; logo and nav on one baseline;
- main sections share the same left/right boundary;
- headlines do not orphan/wrap badly; no clipped or overlapping text;
- grids collapse intentionally; no card taller than its row needs;
- forms: labels/controls aligned, errors wrap, buttons not off-screen;
- tables/long strings wrap or truncate with a way to read the full value;
- footer columns align and links remain tappable.

## 3. Search and overlay QA

Search is a high-risk component. Verify all of it:

- Focus the field: panel opens cleanly; inline content does not jump; no double panel.
- Type a query with hits: grouped hierarchy, title readability, category metadata, hover/active row,
  keyboard up/down, Enter opens the active result, Escape closes.
- Type a query with zero hits: a specific empty state with real next actions.
- Clear the query: suggestions return; clearing does not close the panel unexpectedly.
- Click outside: closes. Escape: closes. Selecting a result: navigates once, panel is gone.
- Scroll with the panel open: it stays anchored or closes deliberately; it never floats over an
  unrelated section or sits under the sticky header.
- Resize the window and open the Android keyboard: panel stays within the visual viewport; max-height
  shrinks; interior scrolls; results are not hidden behind the keyboard.
- Mobile: panel width fits with gutters; no horizontal overflow; touch targets ≥44px; panel is not
  clipped by a section's `overflow-hidden`.
- Desktop: panel is anchored to the search container, max width is sensible, and it does not cover
  navigation.
- Command palette: focus moves into it, Tab cycles, Escape restores focus to the opener, backdrop
  click closes, body scroll is locked and restored.
- Verify with `prefers-reduced-motion: reduce`: no movement, but the same information and states.

## 4. Menus, drawers and dropdowns

For every overlay or contextual action:

- Trigger has an accessible name, `aria-expanded`/`aria-controls` where applicable.
- Opens in the expected direction and stays inside the viewport.
- Closes on outside click, Escape and action selection.
- Keyboard: Tab reaches items, arrows work where the pattern requires them, focus is visible.
- Touch: items are at least 44px high, no hover-only actions.
- The menu does not detach from its trigger when the page scrolls or resizes.
- Every item has a real handler. If an operation does not exist, remove the item or label the
  missing functionality — never ship a decorative menu.
- If no such control exists in the product, audit the icon-only controls instead and say so.

## 5. Animation QA

- Enter/exit are visible but fast (150–250ms for micro-interactions).
- Springs settle without visible bounce on menus/modals.
- Page transitions do not block focus or delay content.
- Accordions animate height/opacity without clipping content or trapping focus.
- Toasts enter/leave without layout jumps; auto-dismiss is long enough to read.
- Buttons/cards respond on hover and press; no transform causes blurry text.
- Reduced motion: no transform-based movement; content still appears/disappears correctly.
- Animate only what communicates: origin, hierarchy, status or continuity.
- Profile on a mid-range phone if possible; backdrop blur and large shadows are suspect.

## 6. Accessibility checks

Run axe on the main routes and on the open search panel, then manually check:

- Landmarks: one `main`, header/nav, footer; portaled content inside a labelled landmark.
- One `h1`; heading order is logical.
- Focus visible on every interactive element; focus order follows reading order.
- Keyboard-only flow through nav, drawer, search, forms, accordion, tracking.
- Labels tied to controls; errors described via `aria-describedby`.
- Live regions for async status (`role="status"` / `aria-live`), no duplicate noisy announcements.
- Icon-only buttons have names; decorative icons are `aria-hidden`.
- No nested interactive elements; links navigate, buttons act.
- Contrast AA for text; focus ring contrast against adjacent surfaces.
- Touch targets; zoom/reflow at 320px and 200% text.
- `prefers-reduced-motion` and `prefers-contrast` behaviour.

## 7. Visual critique pass

After functional checks, look at the rendered page as a composition:

- Squint: is the hierarchy still obvious?
- Are there too many competing accent colours, borders or shadows?
- Is spacing between sections consistent, or does one section feel cramped?
- Do all cards share padding, radius, title size and metadata style?
- Does the hero feel balanced at 360, 768 and 1440?
- Is the footer visually quieter than the main content?
- Are empty states designed, or do they look like error leftovers?
- Does anything look like generic AI output: purple gradients, glass everywhere, random pills,
  three identical feature cards, oversized centred headings with no content hierarchy?

Fix the weakest detail. Repeat once. Stop when further changes add complexity without improving
clarity.

## 8. Final report template

Include:

1. What changed, grouped by surface.
2. Root causes found (especially for reported bugs).
3. Animation inventory and reduced-motion handling.
4. What was verified and how (build, tests, routes, widths, interactions).
5. What could not be verified and why.
6. Missing functionality or follow-ups, named explicitly.
7. Any deliberate trade-offs.
