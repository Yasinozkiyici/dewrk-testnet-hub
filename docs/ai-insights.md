# AI Discovery & Insights

## Overview

This module automatically surfaces emerging testnets, analyses user engagement patterns, and publishes weekly insights consumed by the admin panel and public "For You" section.

## Components

| Path | Purpose |
| --- | --- |
| `app/api/ai-discovery/route.ts` | Fetches new projects from Messari (with optional `MESSARI_API_KEY`) and stores unseen testnet candidates in `AiDiscovery`. |
| `app/api/insights/route.ts` | Aggregates `UserEvent`, `Testnet`, and `AiDiscovery` data into an `InsightSnapshot`. |
| `app/api/cron/ai-discovery/route.ts` | Weekly (Wed 01:00 UTC) discovery job. |
| `app/api/cron/insight-refresh/route.ts` | Daily (00:00 UTC) insight refresh. |
| `app/api/events/route.ts` | Ingests behavioural events emitted from the UI via `lib/analytics.ts`. |

## Data Model Additions

- `AiDiscovery`: stores candidate projects with category, summary, and source URL.
- `InsightSnapshot`: persisted snapshots of computed insights consumed by admin UI and `/testnets` page.
- `UserEvent`: generic analytics table capturing `join_testnet`, `read_guide`, `newsletter_signup`, etc.

Run migrations locally via:

```bash
pnpm prisma migrate dev --name add_ai_insights
pnpm prisma db seed
```

## Environment Variables

```
MESSARI_API_KEY=""          # optional, improves discovery results
OPENAI_API_KEY=""           # optional future enhancement (not required)
```

All other analytics/growth env vars remain in `env.example`.

## Manual Testing

1. **AI Discovery**
   ```bash
   curl -X POST http://localhost:4000/api/ai-discovery
   ```
   - Check `AiDiscovery` table for new rows.
   - Verify admin "AI Insights" tab lists "New Testnets Detected".

2. **Insight Refresh**
   ```bash
   curl -X POST http://localhost:4000/api/insights
   ```
   - Confirm snapshot stored via `prisma.insightSnapshot.findFirst`.
   - Admin tab and `/testnets` For You section update.

3. **Event Tracking**
   - Click "Open dashboard" on a testnet → `join_testnet` event saved.
   - Open a guide → `read_guide` event saved.
   - Submit newsletter form → `newsletter_signup` event saved.

4. **Cron Simulation**
   ```bash
   curl -X POST http://localhost:4000/api/cron/ai-discovery
   curl -X POST http://localhost:4000/api/cron/insight-refresh
   ```
   - Both respond with `{ ok: true, ... }`.

## Frontend Integrations

- `/testnets`: displays "For You", "Trending category", and "Emerging projects" sections based on the latest snapshot.
- Admin panel gains an **AI Insights** tab with cards for trending categories, new discoveries, correlations, and suggestions.
- System tab can trigger discovery and insight refresh jobs on demand.

## Troubleshooting

- **No new discoveries**: provide `MESSARI_API_KEY` or extend `fallbackProjects()` in `ai-discovery` route.
- **Empty insights**: ensure `UserEvent` table has recent `join_testnet` events (trigger by clicking dashboards).
- **Cron not running**: confirm `vercel.json` schedules and redeploy.
