# Cursor regression check

Tested against the local Next.js development server at `http://127.0.0.1:3000`, using an isolated, headless Google Chrome profile through the already-installed Playwright dependency. No chat messages were sent.

## Findings and fix

The old cursor was a DOM element moved by GSAP while CSS hid the real cursor. It could remain invisible before the first mouse movement, after blur/focus, and after switching Calm to Full while stationary. The global `cursor: none !important` rule also suppressed text, disabled-control, and drawing cursors. The earlier idle timer had already been removed, but these other paths could still hide the cursor.

The fix removes the DOM follower, its event listeners, and GSAP interpolation. The existing 40×40 SVG is now used by the native CSS `cursor` property with a 5×4 hotspot and visible browser fallback. The artwork is unchanged. Text fields, disabled controls, and the drawing canvas retain their appropriate cursors. Full/Calm and pointer capability changes are handled in CSS. Styles are scoped to the portfolio shell, excluding Studio.

Four initial regression checks failed before this change and passed afterward. The expanded suite has 16 passing checks:

- Initial page load without pointer movement.
- Simulated blur/focus without subsequent movement.
- Calm → Full while stationary, using the keyboard.
- Chat input, enabled/disabled controls, and expanded privacy details.
- Ten seconds of inactivity.
- Repeated exits through the top, left, and right viewport edges, then re-entry.
- Browser tab activation changes without subsequent movement.
- Work, case-study, and playground navigation plus reload and drawing cursor.
- OS reduced motion with an explicit Full override.
- Fine → coarse → fine pointer emulation.
- Blocked SVG request with a configured visible fallback.
- JavaScript disabled.
- Click interaction at 1× display scale.
- Click interaction at 2× display scale.
- Cursor SVG successfully decoded at 40×40.
- Touchscreen interaction without a synthetic cursor.

TypeScript, focused ESLint, and the six existing unit tests passed. A separate code review found no substantive React/TypeScript regression.

## Coverage limits

Headless assertions check cursor CSS, image loading, interactions, and absence of the old painted overlay. They do not capture the OS-rendered pointer. The failed-image test checks the browser fallback declaration; the display-scale tests check interaction and configured hotspot, not pixel-perfect cursor rendering. Physical dual-monitor movement and Chrome toolbar crossing still need a manual check. Production deployment and non-Chrome browsers were not tested in this pass.

## Re-run

Start the portfolio on port 3000 with `pnpm dev`, then run `pnpm test:cursor`. Chrome must be installed. Screenshots and traces are saved under `test-results/` on failure.

Implementation reference: [MDN cursor property, image hotspots and browser fallbacks](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor).
