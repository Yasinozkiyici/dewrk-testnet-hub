# Dewrk Testnet Hub

A Next.js 14 App Router project that curates web3 testnets with Supabase Postgres + Prisma, typed Zod contracts, accessible UI primitives (Tailwind + shadcn), and smoke/contract testing guardrails.

## Features
- `/testnets` responsive directory with keyboard navigation, cache tagging, and zero horizontal scroll ≥1280px
- `/testnets/[slug]` detail view with conditional sections (funding, tasks, Discord roles, onboarding steps)
- `/admin` single-editor control panel with live Markdown preview, field validation, cached revalidate triggers, and Supabase-friendly payloads
- `/api/testnets` & `/api/testnets/[slug]` REST endpoints backed by Prisma + Zod schemas (list/detail/create/update/delete)
- `/api/health` uptime ping returning status/version/timestamp
- Playwright smoke test (create → publish → list → detail) and Vitest contract checks against API schemas

## Getting Started
1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Set environment variables** – see [`env.example`](./env.example)
   ```bash
   cp env.example .env.local
   ```
3. **Database** (Supabase Postgres)
   ```bash
   pnpm db:generate
   pnpm db:migrate --name init
   pnpm db:seed
   ```
4. **Run the app**
   ```bash
   pnpm dev
   ```

## Available Scripts
- `pnpm dev` – start Next.js in development mode
- `pnpm build` / `pnpm start` – production build & serve
- `pnpm lint` – ESLint via Next custom config
- `pnpm db:generate` – generate Prisma client
- `pnpm db:migrate` / `pnpm db:deploy` – apply migrations locally or in CI
- `pnpm db:seed` – populate sample testnets + tasks
- `pnpm test` / `pnpm test:watch` – Vitest contract checks
- `pnpm test:e2e` – Playwright smoke flow (spins up dev server via config)

## API Contracts
Response payloads are validated with Zod and re-exported for consumers in [`lib/zod.ts`](./lib/zod.ts):

- `testnetListResponseSchema` for `GET /api/testnets`
- `testnetDetailResponseSchema` for `GET /api/testnets/:slug`

Vitest confirms schemas stay in sync (`tests/api/contracts.test.ts`).

## Revalidation & Caching
- List fetches use `next: { tags: ['testnets'] }`
- Detail fetches opt into `next: { tags: ['testnets', 'testnet:${slug}'] }`
- Admin mutations call `revalidateTestnetsList()` and `revalidateTestnet(slug)` from [`lib/cache.ts`](./lib/cache.ts)

## Supabase Row Level Security
Reference SQL snippets and reminders live in [`lib/rls.ts`](./lib/rls.ts). Minimum policies:
```sql
alter table "Testnet" enable row level security;
create policy "public read testnets" on "Testnet" for select using (true);
create policy "admin write testnets" on "Testnet" for all using (
  auth.role() = 'authenticated' and auth.uid() = request.jwt() ->> 'sub'
);
```
Repeat similar policies for `Task` with cascading deletes enabled in Prisma.

## Accessibility & Design Guardrails
- Global glass/gradient tokens frozen in [`styles/globals.css`](./styles/globals.css)
- Skip link, semantic headings, focus rings, and AA contrast badges
- Row activation via keyboard (Enter/Space) using [`useActivateOnEnter`](./lib/a11y.ts)
- Single Markdown preview panel on `/admin` (no duplicate panes) as required

## Testing
```bash
pnpm test        # Zod contract checks
pnpm test:e2e    # Playwright smoke flow (requires local Postgres)
```
The Playwright flow expects a writable database. Seed data via `pnpm db:seed` or run against a Supabase project with matching schema.

## Troubleshooting
- **RLS 401/Forbidden** – ensure service role or authenticated admin token is used, and confirm policies above are deployed
- **`relation "Testnet" does not exist`** – run `pnpm db:migrate` (or `pnpm db:deploy` in CI) before boot
- **Connection limits (Supabase)** – enable the connection pooler and set `?pgbouncer=true` on `DATABASE_URL`
- **Decimal serialization** – Prisma Decimals emit strings; format via `formatUSD` helper on the client
- **Cache not updating** – confirm admin API routes resolve successfully; they always call both revalidation helpers

## Folder Structure
```
app/
  testnets/              # list route + filters table
  testnets/[slug]/       # detail route
  admin/                 # admin shell + editor
  api/                   # health + testnets REST handlers
components/ui/           # shadcn-inspired primitives
components/cards/        # (extension point for future cards)
lib/                     # db, cache, formatting, accessibility
prisma/                  # schema + seed script
public/logos/            # sample logos used by seed data
tests/                   # vitest + playwright suites
styles/globals.css       # frozen mesh + tokens
```

## Deployment Notes (Vercel)
- Add Supabase secrets to Vercel env (`DATABASE_URL`, `DIRECT_URL`, `SHADOW_DATABASE_URL`, Supabase keys)
- Run `pnpm db:deploy` in a protected migration step (see CI template below)
- Ensure `pnpm db:seed` is run only in lower environments

### CI Template Snippet
```yaml
- name: Install
  run: pnpm install --frozen-lockfile
- name: Prisma Generate
  run: pnpm db:generate
- name: Lint & Contracts
  run: pnpm lint && pnpm test
- name: Playwright Smoke
  run: pnpm test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

For additional Supabase-specific policies and caveats see [`lib/rls.ts`](./lib/rls.ts).
