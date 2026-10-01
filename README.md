# mk-investor-web

The Melanin Kapital investor dashboard. Approved investors browse the businesses
the MK team has chosen to showcase, read their story and impact, and express
interest. Access is requested here and granted in `mk-admin`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript, Bun
- [Arc UI](https://uiarc.dev) components in `components/arc/` (CSS modules and
  tokens, no Tailwind), with Motion for animation
- Clerk for sign-in, TanStack Query for data
- API: `mk-backend`, routes under `/investor`

## Run it

```bash
bun install
cp .env.example .env.local
bun run dev
```

### Demo mode

Set `NEXT_PUBLIC_DEMO_MODE=1` to run without a backend or Clerk keys. Sign-in is
skipped and every business is sample data from `lib/demo-data.ts`. Add
`?demo=none`, `?demo=pending` or `?demo=rejected` to a URL to preview the other
access screens. Never enable it in production.

### Open access (temporary, for demos)

Set `NEXT_PUBLIC_OPEN_ACCESS=1` here and `INVESTOR_OPEN_ACCESS=true` in
`mk-backend` to open the dashboard without sign-in, on real data. Remove both
before real investors use the app.

## Layout

| Path | What it holds |
| --- | --- |
| `app/(app)` | The dashboard and business profiles (approved investors only) |
| `app/(access)` | Request access form and request status |
| `app/(auth)` | Sign in and sign up |
| `components/arc` | Arc components, installed with the shadcn CLI |
| `components/*` | App components composed from Arc |
| `lib` | API hooks, types, session, theme, demo data |

## Working with Arc

Install more components with `bunx shadcn@latest add @uiarc/<name>`. Brand colours
are set in `app/globals.css` by overriding Arc's accent tokens; everything else
uses Arc's semantic tokens. See `AGENTS.md` for the rules this app follows.

Only free Arc items are used. Do not add or recreate Arc Pro components.
