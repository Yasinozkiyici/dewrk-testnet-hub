---
title: "How to Contribute to Dewrk"
slug: "how-to-contribute-to-dewrk"
description: "Everything you need to ship content, data, and product improvements to the Dewrk platform."
author: "Dewrk Core Team"
publishedAt: "2025-11-03"
readingTime: 8
tags:
  - community
  - contribution
  - governance
category: community
excerpt: "Step-by-step instructions for joining the Dewrk contributor program, from environment setup to PR reviews."
featured: true
sources:
  - https://github.com/dewrk-labs
  - https://docs.github.com/en/pull-requests
  - https://segment.com/docs/connections/spec/track/
---

Dewrk thrives on accurate data, actionable guides, and a resilient admin experience. This document outlines how to plug in as a contributor, whether you want to seed new ecosystems, polish the front end, or curate operations dashboards. Treat it as our living “contributor README” and propose edits via pull request whenever processes evolve.

## 1. Join the conversation

Start in the Dewrk Discord (`#contributors` channel). Introduce yourself, link relevant credentials (GitHub, Farcaster, Zealy profiles), and tell us what you would like to work on. Maintainers tag issues by skill—`data`, `frontend`, `growth`, `ops`. Pick an issue with the `good-first` or `help-wanted` label, or suggest your own initiative. Weekly office hours happen every Wednesday at 16:00 UTC; bring questions or demos.

## 2. Set up your environment

Clone the repository from GitHub and install dependencies with `pnpm install`. Copy `env.example` to `.env.local` and follow `README.kurulum.md` for Supabase credentials. Run `pnpm prisma migrate deploy && pnpm prisma db seed` to hydrate your Supabase Postgres database (or use `DATABASE_URL="file:./prisma/dev.db"` locally if you prefer SQLite). The seed scripts ship with realistic data for 15+ testnets, 5 ecosystems, and leaderboards, so you can explore the product without hitting external APIs.

## 3. Understand the content pipeline

All long-form content lives under `content/guides`. Create Markdown files with YAML frontmatter, cite verified URLs, and target 500–700 words. If you add new sections, update the navigation metadata in `lib/content-guides.ts` (or submit an issue if you need help). For structured data—testnets, ecosystems, leaderboards—extend the Prisma schema thoughtfully and document changes in `docs/content-plan.md`. The admin panel reflects whatever the database contains, so focus on clarity and consistency.

## 4. Ship product improvements safely

When touching the Next.js app, follow our branch naming convention (`feature/<short-summary>`). Make your changes, run `pnpm lint`, `pnpm test`, and `pnpm test:e2e` (Playwright) locally. If you modify API routes or the Prisma schema, generate migration notes in `QA-CHECKLIST.md` so reviewers know which smoke tests to run. We use shadcn/ui extensively—reuse existing components before adding new primitives.

## 5. Instrument and document

Every new feature should emit analytics events. Use the `lib/analytics.ts` helper and reference the Segment spec (track calls include `event`, `userId`, `properties`). Update `docs/admin-handbook.md` with UI changes, required environment variables, and troubleshooting steps. If you touch cron jobs or automation scripts, append a runbook entry under `docs/runbooks/` describing failure modes and escalation paths.

## 6. Submit your work

Push your branch and open a pull request. Our template asks for context, screenshots (or Loom), test results, and database migration notes. Tag at least one domain reviewer (data, frontend, or ops). Expect feedback within 48 hours. If the change impacts live data, ping an admin in Discord so they can coordinate a staging deploy. Once merged, the release pipeline automatically builds preview images, triggers caching revalidation, and posts a summary in the `#changelog` channel.

## 7. Earn recognition

Contributions feed into the Dewrk leaderboard. Completing vetted issues, writing high-impact guides, or closing production incidents earns points visible across the platform. We snapshot these metrics at the end of every quarter for grants, paid engagements, and retroactive rewards. Keep a personal changelog (Notion or GitHub Discussions) to showcase your ongoing work.

We believe transparency and shared ownership keep the Dewrk platform healthy. Jump in, pair with fellow builders, suggest improvements to this very guide, and help us deliver real-time intelligence for every testnet ecosystem.
