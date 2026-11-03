RIZZ SUPPORT CENTER — PREMIUM UI/UX REDESIGN

Act as a senior product designer, UI/UX architect, CSS specialist and frontend design engineer.

Your task is to transform the existing Rizz Support Center into a highly polished, premium, production-quality support experience.

Website identity: Rizz Support Center
Main product: https://rizzapp.onrender.com/
Visual direction: Minimal Apple-inspired design + modern SaaS aesthetics + Rizz's signature lime identity.

IMPORTANT: This is an existing, functional application. You are upgrading its design, not rebuilding it from scratch.

Do not destroy existing functionality, routes, backend integrations, ticket systems, search logic or data structures.

---

1. DESIGN PHILOSOPHY

The website should feel like a premium product created by a professional design team.

Visual inspiration:

- Apple's product and support websites.
- Linear's interface design.
- Stripe's visual hierarchy.
- Vercel's minimal aesthetic.
- Modern premium SaaS dashboards.

Do not directly copy these websites.

Create a unique Rizz design language.

The interface should communicate:

- Simplicity.
- Clarity.
- Reliability.
- Professionalism.
- Modern technology.
- Attention to detail.

Avoid:

- Generic AI-generated website aesthetics.
- Excessive gradients.
- Excessive glowing effects.
- Overuse of glassmorphism.
- Random decorative elements.
- Oversized empty spaces.
- Unnecessary rounded cards everywhere.
- Excessive lime-colored backgrounds.
- Generic template-like layouts.

The result must look intentionally designed.

2. DESIGN SYSTEM

Create a consistent design system before modifying individual pages.

Color palette

Use these colors as the starting point:

Background:

- Primary: #080A08
- Secondary: #0D100D
- Elevated surface: #121712
- Card surface: #151A15

Borders:

- Primary: #252D22
- Subtle: #1B211A

Brand:

- Rizz Lime: #B7FF32
- Lime Hover: #A8F522
- Lime Muted: #789E37

Typography:

- Primary: #F5F7F2
- Secondary: #A0A69A
- Muted: #72796E
- Disabled: #51584F

Feedback:

- Success: #65D68A
- Warning: #F2BD61
- Error: #FF7777
- Information: #73B8FF

Use colors consistently.

Do not make every border lime. Most borders should be neutral and subtle.

Typography system

Use Inter or an equivalent modern sans-serif font.

Establish clear typography levels:

- Hero heading: 52–76px desktop, 38–48px mobile.
- Page heading: 36–48px desktop.
- Section heading: 26–34px.
- Card heading: 18–21px.
- Body: 15–17px.
- Supporting text: 13–14px.
- Metadata: 12–13px.

Use appropriate font weights, line heights and letter spacing.

Avoid making every heading bold.

Spacing system

Use a consistent 4px-based spacing scale.

Recommended:
4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120.

Establish consistent page containers.

Desktop:

- Maximum content width: approximately 1200–1320px.
- Comfortable horizontal padding.
- Consistent section spacing.

Mobile:

- 18–24px horizontal padding.
- Avoid horizontal overflow.
- Avoid unnecessary vertical gaps.

Border radius

Use a restrained radius system:

- Small controls: 8px.
- Inputs: 12px.
- Cards: 16px.
- Large sections: 20–24px.
- Pills: fully rounded.

Do not use oversized rounding on every element.

3. HEADER AND NAVIGATION REDESIGN

The current mobile header is too crowded.

Redesign it completely.

Desktop header:

- Rizz icon and brand.
- Support Center label.
- Navigation links.
- Submit Request primary button.
- Back to Rizz link.

Keep the header clean, aligned and balanced.

Use a subtle bottom border.

Consider a sticky header with a restrained backdrop blur.

Mobile header:

- Left: Rizz logo and compact Support label.
- Right: hamburger menu.
- Keep the submit request action accessible without cramming everything into one row.
- Place secondary links inside the mobile navigation drawer.
- Ensure the menu opens and closes correctly.
- Prevent navigation drawer content from overlapping page content.
- Implement proper scroll locking while the drawer is open.
- Close the menu when a navigation link is selected.

The mobile header must fit comfortably on a 360px-wide screen.

4. HOMEPAGE HERO — COMPLETE VISUAL UPGRADE

The current hero has a heading and search field but lacks a distinctive composition.

Create a premium support landing hero.

Structure:

Small brand badge:
"RIZZ SUPPORT CENTER"

Main heading:
"How can we help you?"

Supporting description:
"Find answers, solve problems, and get the most out of Rizz."

Search interface:

- Large, elegant search field.
- Search icon.
- Clear focus state.
- Search suggestions.
- Keyboard interaction.
- Search results dropdown.
- Empty state.
- Loading state if applicable.

Popular search suggestions:

- Account issues.
- Login problems.
- Bug reports.
- Feature requests.
- Safety and reporting.

Make suggestions visually refined and interactive.

Add subtle visual depth behind the hero using CSS.

Possible effects:

- Very subtle radial gradient.
- Fine grid texture.
- Restrained lime illumination.
- Soft surface contrast.

Do not create a giant glowing green circle.

The hero should feel premium, not flashy.

5. SUPPORT CATEGORY CARDS

Redesign the category section.

Current categories include:

- Account & Login.
- Bugs & Technical Issues.
- Features & Feedback.
- Safety & Reporting.
- Other Support.

Use the actual categories present in the existing application.

Desktop:

- Use a responsive grid.
- 3 columns where appropriate.
- Balanced card heights.
- Consistent icon positioning.

Mobile:

- Single-column layout or carefully designed compact cards.
- Comfortable spacing.
- No clipped text.

Each category card should contain:

- Minimal icon.
- Category title.
- Short description.
- Article count.
- Subtle directional arrow.

Interactions:

- Slight surface change on hover.
- Border transition.
- Small arrow movement.
- Accessible focus-visible state.
- Smooth 160–220ms transition.

Avoid excessive transforms or bouncing animations.

6. POPULAR HELP ARTICLES

The current article listing is too plain.

Create a premium article discovery section.

Each article should show:

- Category label.
- Article title.
- Short description.
- Reading time.
- Directional arrow.

Use refined separators and typography.

Desktop:

- Use a balanced grid or editorial list.
- Highlight one featured article if the actual content supports it.

Mobile:

- Clean stacked article rows.
- Readable descriptions.
- No text overflow.
- Comfortable touch targets.

Add:

- Hover states.
- Focus states.
- Clear clickable areas.
- Consistent metadata.

Do not invent additional article content.

7. FAQ SECTION

Redesign the FAQ interface.

Use elegant accordion components.

Requirements:

- Smooth open and close animation.
- Clear question hierarchy.
- Proper spacing.
- Subtle separators.
- Accessible keyboard navigation.
- Correct ARIA attributes.
- Only animate height when appropriate.

Use a restrained icon animation.

Make expanded answers readable and comfortable.

Preserve existing FAQ data and functionality.

8. SUPPORT REQUEST FORM

This is one of the most important pages.

The current form looks functional but needs a substantial visual upgrade.

Create a professional multi-section form.

Sections:

01 — Your details

- Email address.
- Any existing required identity fields.

02 — The issue

- Issue category.
- Subject.
- Detailed description.

03 — Additional information

- Browser/device information.
- Any existing optional fields.

04 — Submission

- Clear privacy note.
- Submit button.
- Loading state.
- Success state.
- Error state.

Design requirements:

- Clear section hierarchy.
- Consistent field spacing.
- Refined input backgrounds.
- Proper focus rings.
- Accessible labels.
- Clear required indicators.
- Helpful validation messages.
- Character counter for description.
- Consistent error styling.
- Proper mobile keyboard behavior.

IMPORTANT:
Do not display every validation error before the user has interacted with the form or attempted submission.

Avoid showing red borders on every empty field immediately after page load.

Use inline validation at the appropriate time.

The form should feel trustworthy and easy to complete.

Never simulate a successful ticket submission.

Preserve actual backend validation and submission behavior.

9. TRACK SUPPORT REQUEST

Improve the ticket tracking experience.

If existing functionality supports tracking:

- Provide a clear ticket lookup form.
- Show useful loading states.
- Show understandable error states.
- Present ticket status clearly.
- Distinguish pending, open, resolved and closed states only if supported by the actual backend.
- Display available ticket information in a structured layout.

Do not fabricate ticket data.

10. ARTICLE DETAIL PAGES

Create a polished reading experience.

Include:

- Breadcrumb navigation.
- Article category.
- Title.
- Description or introduction.
- Reading time.
- Article content.
- Related articles.
- Helpful/not helpful feedback if supported.

Use a comfortable reading width.

Make long-form content easy to read on mobile.

Use clear headings, lists, callouts and code blocks where the existing content requires them.

11. FOOTER REDESIGN

The current footer is too vertically stretched on mobile.

Create a structured footer.

Desktop:

- Rizz branding and short description.
- Support navigation.
- Rizz product links.
- Legal or policy links only when actual destinations exist.

Mobile:

- Stacked sections.
- Consistent spacing.
- Optional collapsible link groups if useful.
- Proper bottom padding.

Include a subtle copyright line.

Preserve existing working destinations.

12. ADVANCED CSS ENGINEERING

Use modern CSS techniques to create a polished interface.

Use:

- CSS custom properties.
- Modern Flexbox and Grid.
- clamp() for responsive typography.
- min(), max() and minmax() where appropriate.
- Container queries when beneficial.
- :focus-visible.
- :has() only where browser support is appropriate.
- prefers-reduced-motion.
- Responsive fluid spacing.
- Layered gradients used sparingly.
- Carefully controlled shadows.
- Backdrop-filter only where useful.
- CSS transitions for micro-interactions.

Create reusable design tokens.

Avoid:

- Massive CSS overrides.
- Repeated !important declarations.
- Duplicate CSS rules.
- Arbitrary pixel values everywhere.
- Unnecessary inline styles.
- Unused CSS.
- Conflicting global styles.

Organize styles by component or feature in the existing project architecture.

Do not introduce a new styling framework unless the project genuinely needs one.

13. ANIMATION AND INTERACTIONS

Use the free Motion library if it is already installed or can be added safely.

Use imports from motion/react.

Animation direction:

- Smooth.
- Subtle.
- Responsive.
- Purposeful.

Examples:

- Hero content fades in.
- Search suggestions appear smoothly.
- Category cards subtly respond to hover.
- Accordions expand naturally.
- Navigation drawer slides in.
- Modals animate without excessive movement.
- Buttons have restrained interaction feedback.

Use approximately 150–250ms for common micro-interactions.

Avoid excessive scroll-triggered animations.

Respect prefers-reduced-motion.

Do not sacrifice performance for animation.

14. MOBILE-FIRST RESPONSIVENESS

This is critical.

The current application is being tested on Android Chrome.

Optimize specifically for:

- 360px.
- 375px.
- 390px.
- 412px.
- 430px.
- Tablet.
- Desktop.
- Large desktop.

Test:

- Header alignment.
- Navigation drawer.
- Search field.
- Category cards.
- Article listings.
- FAQ accordions.
- Support request form.
- Footer.
- Long text wrapping.
- Touch targets.
- Horizontal overflow.

No element should be cut off or overlap another.

Use at least 44px touch targets for primary interactive controls where practical.

15. ACCESSIBILITY

Ensure:

- Semantic HTML.
- Proper heading hierarchy.
- Keyboard accessibility.
- Accessible form labels.
- Visible focus indicators.
- Correct button types.
- Appropriate ARIA attributes.
- Sufficient text contrast.
- Reduced motion support.
- Screen-reader-friendly feedback.

16. TECHNICAL REQUIREMENTS

The existing project uses React 19, TypeScript and TanStack Start.

Keep the existing framework and architecture.

Before editing:

1. Inspect the complete source structure.
2. Identify existing routes.
3. Identify shared components.
4. Inspect CSS architecture.
5. Inspect the actual data models.
6. Inspect all existing functionality.

Do not:

- Migrate frameworks.
- Replace the backend.
- Delete existing routes.
- Rename data models unnecessarily.
- Replace real data with dummy content.
- Break authentication.
- Break ticket creation.
- Break search.
- Break article navigation.
- Introduce unnecessary dependencies.

Preserve the existing brand logo and visual identity.

17. QUALITY ASSURANCE

After implementation:

1. Run the existing production build.
2. Run TypeScript checks.
3. Fix all CSS and runtime errors.
4. Verify every existing route.
5. Test all navigation links.
6. Test search.
7. Test FAQ interactions.
8. Test ticket form validation.
9. Test ticket submission against the real backend where configured.
10. Test the layout at mobile and desktop widths.
11. Check browser console errors.
12. Remove unused CSS and broken imports.

Do not hide errors to make the interface appear functional.

18. FINAL DESIGN EXPECTATION

The finished Rizz Support Center should look like a premium, carefully crafted SaaS support product.

The design must be:

- Minimal.
- Elegant.
- Distinctive.
- Fast.
- Responsive.
- Accessible.
- Consistent.
- Production-ready.

The lime accent should be recognizable as Rizz branding without dominating the entire interface.

Most importantly, do not simply add more effects.

Improve composition, hierarchy, typography, spacing, alignment, contrast and usability.

Prioritize excellent design decisions over visual decoration.

Implement the complete redesign directly in the existing project.

At the end, provide a report of all modified files, implemented improvements, build results and any remaining issues.