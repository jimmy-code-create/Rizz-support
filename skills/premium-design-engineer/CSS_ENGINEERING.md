# CSS Engineering

Good CSS is predictable. It uses the platform, limits global reach, and makes layout relationships
explicit. Debug by understanding the box model, containing blocks and stacking contexts — not by
adding `!important`.

## 1. Layout

### Grid vs Flex

- **Grid** for page composition, card grids, form rows and any two-dimensional relationship.
- **Flexbox** for a single row/column: icon + label, header clusters, button groups.
- Use `gap` for spacing. Avoid margins on children inside a gap-managed container.
- Use `minmax(0, 1fr)` for flexible tracks that contain truncatable text.

```css
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.5rem;
}
@media (min-width: 1024px) {
  .layout { grid-template-columns: minmax(0, 1fr) 18rem; align-items: start; }
}
```

### Containing blocks and overflow

`position: absolute` resolves against the nearest positioned ancestor. `position: fixed` resolves
against the viewport **unless** an ancestor creates a containing block via `transform`, `filter`,
`perspective`, `contain` or `will-change`. This is a common cause of "fixed" overlays being clipped
or scrolling with a section.

If an overlay must escape every parent:

1. Render it in a portal to `document.body`.
2. Position it with `fixed` and explicit viewport coordinates.
3. Measure the anchor with `getBoundingClientRect()`.
4. Recalculate on resize, scroll and `visualViewport` changes.
5. Clamp width, left, top and max-height to the visual viewport.

Never "fix" clipping by deleting `overflow-hidden` if the section genuinely needs it for decoration;
move the overlay out of that subtree instead.

### Responsive typography and spacing

```css
.page-title { font-size: clamp(2rem, 4.5vw, 3.25rem); line-height: 1.05; }
.section    { padding-block: clamp(2.5rem, 5vw, 5rem); }
```

Prefer fluid values for macro rhythm; use fixed steps for control sizes and gaps. Test at 320, 360,
375, 390, 412, 430, 768, 1024, 1280 and 1440px.

### Logical properties

Use `margin-inline`, `padding-inline`, `inset-inline`, `border-inline` when the design should adapt
to writing direction. Use physical properties only when direction is intentionally fixed.

## 2. Stacking contexts

A new stacking context is created by positioned elements with `z-index`, transforms, opacity < 1,
filters, isolation, containment and more. A child cannot escape its parent's stacking context, no
matter how large its `z-index`.

- Define a small z-index scale in tokens.
- Keep overlays as siblings near the root (portals) when they must sit above the header.
- Do not raise `z-index` blindly; inspect the nearest stacking context.
- `isolation: isolate` is useful to contain decorative layers deliberately.

## 3. Scroll and overlays

- Lock body scroll when a modal/drawer opens; restore the previous value on close.
- Prefer `overscroll-behavior: contain` on scrollable panels.
- Prevent background scroll but do not prevent keyboard scrolling inside the panel.
- Close popovers on Escape, outside pointerdown and route change.
- Return focus to the trigger on close; move focus into a modal on open.
- Use a focus trap for modal dialogs, not for non-modal suggestion panels.
- A panel must never be cut off by the viewport. Compute `max-height` from the available space and
  let the interior scroll.

### Search/popover positioning recipe

```ts
const rect = anchor.getBoundingClientRect();
const vv = window.visualViewport;
const vw = vv?.width ?? innerWidth;
const vh = vv?.height ?? innerHeight;
const top = vv?.offsetTop ?? 0;
const width = Math.min(Math.max(rect.width, 300), vw - 24);
const left = Math.min(Math.max(rect.left, 12), vw - width - 12);
const below = rect.bottom + 8;
const belowSpace = top + vh - below - 12;
const aboveSpace = rect.top - (top + headerOffset + 8) - 8;
// choose the larger side, clamp max-height, never let it exceed available space
```

Use `requestAnimationFrame` once after layout so fonts/expanded content are measured. Listen to
`resize`, capture-phase `scroll`, and `visualViewport` `resize`/`scroll`.

## 4. Modern CSS

- **Custom properties** for tokens and state-driven values; avoid property explosion.
- **Container queries** when a component's layout depends on its own width, not the viewport.
- **`:focus-visible`** for keyboard focus; never remove focus outlines without a replacement.
- **`:has()`** for parent state (e.g. a field wrapper reacting to an invalid child), with a fallback
  if support matters.
- **`color-mix()`** for derived tints when the palette is tokenized.
- **`text-wrap: balance`** for short headings; `pretty` for paragraphs where supported.
- **`scrollbar-width` / `::-webkit-scrollbar`** to hide a decorative scrollbar only when the
  content is still discoverable (e.g. a filter chip row with a visible cut-off chip).

## 5. Motion implementation

- Animate `transform` and `opacity`. Avoid animating layout properties (`width`, `height`, `top`,
  `left`) except for small, controlled accordion grids.
- CSS transitions for hover/focus and simple state changes; a motion library for orchestrated
  enter/exit, springs and layout changes.
- Use `AnimatePresence` (or the library equivalent) when exit animation is required; conditional
  rendering alone removes the node immediately.
- Reduced motion:
  - provide a hook/`matchMedia` check for JS-driven animation;
  - set `MotionConfig reducedMotion="user"` when using Motion;
  - keep CSS `@media (prefers-reduced-motion: reduce)` overrides;
  - prefer opacity or instant state changes over movement.
- Never animate a control in a way that delays the user's next action. Exit animations should not
  keep a modal interactive or block a route change.
- Loaders must have text or an accessible label; a spinning icon alone is not status.

## 6. Performance and maintainability

- Avoid `will-change` as a permanent property; use it only around known animation windows.
- Prefer compositing properties; test on a mid-range Android device.
- Keep global selectors shallow and scoped. No `!important` except a documented override.
- Delete unused CSS and component variants. Dead tokens are noise.
- Use `content-visibility: auto` only on large, below-the-fold sections and verify accessibility.
- Backdrop blur is expensive; use it on small surfaces, not the whole page.
- Check that no image/asset causes layout shift; reserve aspect ratios.

## 7. Debugging checklist

1. Is the element clipped by an ancestor's `overflow`?
2. Is an ancestor creating a containing block for `fixed`?
3. Which stacking context is the element in?
4. Is the measured rect zero because of `display:none`, hydration or an unloaded font?
5. Is a parent grid track forcing a minimum content width (missing `minmax(0,1fr)`)?
6. Is whitespace caused by a margin collapse, a line-height, or a stray empty element?
7. Does the bug disappear at another viewport because of a breakpoint, not the CSS rule in question?
8. Is the interaction broken by blur/focus order rather than styling?

Fix the cause, then re-test the exact reproduction.
