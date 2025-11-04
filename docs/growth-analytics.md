# Analytics & Growth Pack

This document tracks the new analytics integrations, required environment variables, and QA steps for referrals, newsletter, and admin growth dashboards.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ADMIN_PASS` | Client-side passphrase gate for the admin control center |
| `NEXT_PUBLIC_ADMIN_ROLE` | Controls button availability (`admin`, `editor`, `viewer`) |
| `MAILCHIMP_API_KEY`, `MAILCHIMP_LIST_ID`, `MAILCHIMP_SERVER_PREFIX` | Mailchimp subscriber API |
| `SUBSTACK_API_KEY` | Fallback subscription provider |
| `GA_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_EMAIL`, `GA_PRIVATE_KEY` | GA4 Data API credentials |
| `GA_DAILY_ACTIVE_USERS`, `GA_WEEKLY_ACTIVE_USERS`, `GA_PREV_WEEK_ACTIVE_USERS` | Optional fallbacks when GA API is unavailable |
| `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `ADMIN_EMAIL` | Outbound weekly growth report |

## Data Flow

1. **Referrals**
   - Query parameter `?ref=` stored to `localStorage` via `ReferralTracker`.
   - `/api/referrals` logs the code + metadata in Prisma `Referral` table.
   - Discord referrals aggregated in `/api/growth/metrics` and weekly report.

2. **Newsletter**
   - `NewsletterForm` posts to `/api/newsletter`.
   - Attempts Mailchimp first; on failure, falls back to Substack.
   - Subscriptions hashed (SHA-256) into Prisma `NewsletterSubscription` for growth metrics.

3. **Analytics Dashboard & AI Insights**
   - `/api/growth/metrics` combines GA4 daily active users, subscriber totals, referrals, conversion rate.
   - Admin panel `Growth` tab auto-refreshes every 60s and can be refreshed manually.
   - AI discovery + insight generation live in `docs/ai-insights.md`; the admin **AI Insights** tab and `/testnets` "For You" section consume these snapshots.

4. **Weekly Report**
   - `/api/growth-report` aggregates 7-day metrics, computes week-over-week deltas, and emails `ADMIN_EMAIL` via SendGrid.
   - Cron scheduled at Sunday 03:00 UTC (`vercel.json`).

## QA Checklist

| Scenario | Steps |
| --- | --- |
| Referral logging | Append `?ref=discord` to any URL, check localStorage keys `dewrk_ref` & `dewrk_ref_synced`, verify new row in `Referral` table |
| Newsletter opt-in | Submit newsletter form with a test email; confirm 200 response, Mailchimp/Substack API logs, and row in `NewsletterSubscription` |
| Growth tab metrics | Load `/admin` (after passphrase), switch to **Growth** tab, ensure cards show values and timestamp updates every 60s |
| Weekly report | Manually POST to `/api/growth-report`; expect JSON response with summary and SendGrid delivery flag |

## Deployment Notes

- Run `pnpm install` to pull `google-auth-library` dependency.
- Apply Prisma schema changes: `pnpm prisma generate && pnpm prisma migrate dev --name add_growth_models`.
- Populate env vars locally (`env.local`) and on hosting provider.
- Cron entries in `vercel.json` trigger:
  - `/api/cron/update-data` (Sunday 02:00 UTC)
  - `/api/growth-report` (Monday 03:00 UTC)
  - `/api/cron/ai-discovery` (Wednesday 01:00 UTC)
  - `/api/cron/insight-refresh` (Daily 00:00 UTC)
