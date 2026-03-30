## Learned User Preferences

- Keep the interface free of shadows and time-based motion; state changes should read instantly (matches global CSS that zeroes animations and transitions).
- Treat the site background as solid white only; avoid extra fill colors on panels or cells unless placeholder media explicitly keeps its fill.
- The top band or header should stay sticky to the top edge, stay visually transparent (no background fill), and sit above scrolling content.
- Footer navigation should read as equal-width items within their grid span, with labels left-aligned inside each cell; hover should invert to black background with white text and border.
- Pin the site footer to the bottom of the viewport and give the main page enough bottom padding so content can scroll above it (including safe-area where relevant).
- For local checks, run the dev server on port 3000 (project scripts use Turbopack there).
- Prefer a minimal active stack: Next.js with Tailwind only; avoid pulling CMS or animation libraries back into the main app unless asked.
- On small screens, use generous uniform padding around the layout (user specified 20px on all sides).
- The `InfoColumns` component powers both the sticky top panel and the bottom panel. Always keep all three inner text-grid slots (`repeat(3, 1fr)`) even when a column's content is hidden — render an empty `<div />` placeholder to hold the grid position. The six-column `page-grid` structure must never collapse.

## Learned Workspace Facts

- The app uses Next.js 15 (App Router), React 19, and Tailwind CSS v4 with `@tailwindcss/postcss`.
- Layout follows a six-column grid (`page-grid`) with 12px margin and 120px gutter tokens defined in `globals.css` (`--spacing-margin`, `--spacing-gutter`).
- Earlier microsite code is archived under `src/archive/` rather than mixed into the current site surface.
- Global styles intentionally strip box shadows and force zero-duration transitions/animations site-wide.
- `npm run build` can still fail if archived files import packages that are no longer dependencies (for example Framer Motion under `src/archive/`).
