# Design System

A design system is a small set of decisions applied consistently. Build it once, extend it
deliberately, and delete what is unused. The system must describe the product's identity, not a
generic dashboard.

## 1. Token architecture

Use semantic tokens with raw values defined once.

```
primitive:  --raw-lime: #b7ff32;
semantic:   --color-accent: var(--raw-lime);
component:  var(--color-accent) used directly in components
```

Recommended semantic groups:

| Group | Purpose | Examples |
| --- | --- | --- |
| Surface | page and elevation hierarchy | `base`, `surface`, `card`, `raised`, `elevated` |
| Line | borders and separators | `line-subtle`, `line`, `line-strong` |
| Ink | text hierarchy | `ink`, `ink-soft`, `muted`, `faint` |
| Accent | primary action and active state | `accent`, `accent-deep`, `accent-soft` |
| Feedback | status | `success`, `warning`, `error`, `info` |
| Focus | focus ring | `focus-ring` |

Rules:

- Components use semantic tokens, never raw hex values. Raw colours belong in the token block.
- Text must meet WCAG AA at its actual size. Muted metadata may be lighter, but never below
  readable contrast for body copy.
- Accent colour is for actions, selected state and small emphasis. Use it sparingly enough that
  it still signals "act here".
- A new token needs at least two consumers or a clear semantic role.

### Spacing scale

Use a 4px base:

```
2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

Choose from the scale. Section rhythm can be fluid:

```css
.section         { padding-block: clamp(3rem, 5vw, 5rem); }
.section-compact { padding-block: clamp(2.5rem, 4vw, 3.75rem); }
```

Do not add `mt-[13px]` because a gap "looks slightly off". Fix the layout relationship.

### Type scale

A practical product scale:

```
display    clamp(2.4rem, 6vw, 4.5rem)   tight tracking, 1.02–1.1 line-height
h1         1.8–2.4rem                   1.15
h2         1.35–1.75rem                 1.2
h3         1.05–1.25rem                 1.3
body       0.95–1rem                    1.6–1.75
small      0.8–0.875rem                 1.5–1.65
meta       0.68–0.75rem                 uppercase, tracked, used sparingly
```

- Use weight and colour for hierarchy before adding another size.
- Keep body line length around 60–75 characters.
- Uppercase eyebrows need letter-spacing and a small size; never use them for sentences.
- Avoid more than three font families. One variable font plus a mono is usually enough.

### Radius, border, elevation

```
control  6–8px
input    8–10px
card     12–16px
panel    16–20px
pill     999px

border:       1px solid line
shadow-card:  0 1px 2px rgba(0,0,0,.25)
shadow-pop:   0 18px 50px rgba(0,0,0,.45)
```

- One border plus one surface step is usually enough. Shadows indicate elevation, not decoration.
- Keep shadows dark and soft; avoid coloured glows unless they communicate focus/status.
- Nested cards should use a surface change, not another border and shadow.

### Z-index scale

Define named layers and never guess:

```
content     0
sticky     10
header     50
drawer     60
overlay    70–90
panel      95
toast     100
```

Overlays that must escape clipping use a portal and the correct layer. Do not solve stacking with
`z-[9999]` or by reordering unrelated elements.

## 2. Layout

- One page container: `width:100%; max-width:80rem; margin-inline:auto;` with responsive gutters
  (e.g. 18px mobile, 28px tablet, 40px desktop).
- Header, main sections and footer share that container so their left/right edges align.
- Use CSS Grid for two-dimensional composition and Flexbox for one-dimensional rows.
- Define column behaviour explicitly: `minmax(0, 1fr)` prevents overflow from long content.
- Use `gap` for spacing inside grids/flex; do not mix margins and gaps arbitrarily.
- Sticky sub-navigation must account for the sticky header height with `scroll-margin-top`.
- Centring a reading column inside the main container is valid when it is a deliberate editorial
  composition. Do not centre some sections and left-align others by accident.
- Breakpoints should follow content needs: roughly 640, 768, 1024, 1280, 1536. Test rather than
  assuming a breakpoint is enough.

## 3. Component contract

Every interactive component documents and implements:

| State | Requirement |
| --- | --- |
| default | Clear affordance: shape, label, contrast |
| hover | Small, non-essential enhancement |
| focus-visible | Visible ring with offset; never removed |
| active | Tactile feedback, e.g. 1px translation or darker surface |
| disabled | Reduced emphasis, `cursor:not-allowed`, no hover action |
| loading | Spinner or skeleton + text change; `aria-busy`; prevents double submit |
| error | Specific message near the control; input preserved |
| empty | Explains what is missing and offers the next real action |
| selected | Not colour alone; check icon / border / `aria-current`/`aria-selected` |

Rules:

- Buttons look like buttons; links look like links. A link that navigates is an `<a>` and supports
  open-in-new-tab. A control that changes local state is a `<button>`.
- Never put a button inside a link or a link inside a button.
- Minimum target: 44×44 CSS px on touch layouts. In dense desktop UI, 32–36px is acceptable only
  when spacing prevents mis-taps.
- Icon-only controls need an accessible name and a tooltip/title where the icon is ambiguous.
- One primary action per section. Secondary actions use outline/ghost treatments.
- Use `aria-pressed`, `aria-expanded`, `aria-controls`, `aria-current` and `aria-selected`
  according to the actual widget pattern.

## 4. Forms

- Labels are always visible; placeholders are examples, never labels.
- Group fields by meaning (section title + short description), not by decoration.
- Keep input heights consistent and align labels/controls on a shared grid.
- Validate after the field is touched or on submit; do not show every error on first render.
- On submit failure, keep values, focus the error summary, and describe each field error inline.
- Required fields are marked visually and with `aria-required`; optional fields say "optional".
- Inputs should be at least 16px on mobile to avoid browser zoom.
- Native `<select>` is preferable to a custom menu unless there is a strong reason.
- Use a real file input with a visible selected-file state and size/type guidance.

## 5. Content surfaces

- Cards need a reason: comparison, repeated item, or a self-contained action. Do not wrap every
  paragraph in a card.
- Card headers align; card footers align; equal-height cards use flex column with `mt-auto` for
  metadata.
- Article lists show title, category, short description and one useful meta row. Do not invent
  reading times or update dates.
- Search results show hierarchy: query summary, grouped result type, title, category metadata,
  description, and a clear "see all" exit. Keep row height comfortable and truncate gracefully.
- Empty states include: what happened, why it might have happened, and one or two real next steps.

## 6. Motion tokens

```
micro      120–180ms   colour, border, opacity, small transform
enter      180–240ms   menus, popovers, toasts, page fade
exit       140–200ms   faster than enter
spring     stiffness 350–450, damping 30–38, mass 0.7–0.9
stagger    20–40ms between siblings, maximum 5 items
```

Motion must communicate origin and state. It must never be required to understand or operate the
interface. Wrap the app in a reduced-motion configuration and check each custom animation.

## 7. Project calibration

Before applying this system to an existing product:

1. Inventory current tokens, component variants, container widths, breakpoints and motion.
2. Keep the brand's existing type, accent, surfaces and voice.
3. Replace only the inconsistent values; do not introduce a parallel system.
4. Document removed or changed tokens and why.
5. Verify every route at mobile, tablet and desktop widths.
