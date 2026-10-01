<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Arc UI rules for this app

This app is built on Arc (https://uiarc.dev). Full guidance: https://uiarc.dev/r/skills/arc/SKILL.md

- Use an existing Arc component from `components/arc/` before writing UI. Add new ones with `bunx shadcn@latest add @uiarc/<name>` and read `https://uiarc.dev/components/<name>/markdown` first. Use documented props only.
- Free items only. There is no Arc Pro licence: never add or reconstruct Pro components.
- Styling is CSS modules with Arc's semantic tokens (`--background`, `--surface`, `--foreground`, `--text-secondary`, `--border`, `--accent`, `--space-*`, `--radius-*`, `--text-*`). No Tailwind, no raw hex outside `app/globals.css`, weights 400 and 500 only.
- Brand: the accent is Melanin Kapital green, set in `app/globals.css`. Spend it on selection, progress and emphasis, not on headings or card backgrounds.
- One page container (`components/shell/page.module.css`). Blocks fill their column.
- Motion comes from `components/arc/lib/motion-tokens`, animates transform and opacity, and always has a reduced-motion branch.
- Copy is sentence case, with no eyebrow labels and no em dashes.
- Every data region has loading (`skeleton`), empty (`empty-state`) and error (`alert`) states.
- Investors see money as bands and revenue as an index. Never add exact financial figures, owner contact details or documents to this app.
- `lib/types.ts` mirrors `mk-backend/src/modules/investor-showcase/investor-showcase.model.ts`; change them together.

# Brand and language (added after the first design pass)

- The app shares the public website's look: dark canvas by default (light is a toggle), Neue Montreal for all text, the dotted backdrop with green, sky and pink blooms (`app/globals.css`), and the logo lockup in `components/shell/logo.tsx`. Arc's "no decoration" rule is relaxed for brand surfaces: the banner, sector tiles, video stage and photo overlays.
- Every piece of interface text lives in `lib/messages.ts` in four languages (en, fr, pt-MZ, sw), the same set as mk-biz-frontend. Use `useT()` in client components and `<T k="..."/>` in server components; never hard-code visible text. Add the English first, then the other three.
- Video plays through `components/player/player.tsx`, which draws our own controls. Do not use the browser's or YouTube's controls.
- Photos in `public/media`: `meeting.jpg`, `founders.jpg` and `award.jpg` are real Melanin Kapital photographs. The rest are stock placeholders used only by demo data; do not use them on real screens.
- Sector tiles use stock photographs in `public/media/sectors` (free Unsplash licence, sources in `SOURCES.md` there). The user dislikes generated-looking icon and line-art graphics: prefer real photography, and never use Unsplash+ (paid) images.
