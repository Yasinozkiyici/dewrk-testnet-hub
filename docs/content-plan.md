# Content Plan - Dewrk.com

Bu dokümantasyon Dewrk.com için gerçek veri akışını ve içerik yönetim stratejisini açıklar.

## Veri Akışı Genel Bakış

```
┌─────────────────┐
│   Content       │
│   Sources       │
└────────┬────────┘
         │
         ├──> Supabase Database (Primary)
         ├──> External APIs (Real-time)
         └──> Admin Panel (Manual)
              │
              ▼
┌─────────────────┐
│  API Routes     │
│  (Next.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Components    │
│   (React)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UI Render     │
│   (User View)   │
└─────────────────┘
```

---

## 1. Leaderboards (Liderlik Tabloları)

### Veri Kaynağı

**Primary Source:** Supabase `Leaderboard` ve `LeaderboardEntry` tabloları

**Data Flow:**
```
Supabase Database
  ├── Leaderboard (metadata, configuration)
  └── LeaderboardEntry (rankings, metrics)
      │
      ├──> Aggregated from User activity (future)
      ├──> Aggregated from Testnet data (future)
      ├──> Manual admin input (current)
      └──> Real-time updates via cron jobs (future)
```

### Gerçek Veri Akışı (Future Implementation)

1. **Contributor Leaderboards:**
   - **Source**: User activity tracking (tasks completed, testnets joined)
   - **Calculation**: Aggregate from `User` progress data
   - **Update Frequency**: Daily cron job
   - **Fields Mapped:**
     - `entityId`: User wallet address
     - `entityName`: User display name or ENS
     - `metricValue`: Total tasks completed
     - `change`: Percent change from previous period

2. **Project Leaderboards:**
   - **Source**: Testnet data (funding, tasks, contributors)
   - **Calculation**: Aggregate from `Testnet` table
   - **Update Frequency**: Daily cron job
   - **Fields Mapped:**
     - `entityId`: Testnet slug
     - `entityName`: Testnet name
     - `metricValue`: Total funding or testnet metrics
     - `change`: Funding growth rate

3. **Ecosystem Leaderboards:**
   - **Source**: Ecosystem aggregates (total testnets, funding)
   - **Calculation**: Aggregate from `Ecosystem` table + `Testnet` joins
   - **Update Frequency**: Daily cron job
   - **Fields Mapped:**
     - `entityId`: Ecosystem slug
     - `entityName`: Ecosystem name
     - `metricValue`: Total testnets or funding
     - `change`: Growth metrics

### API Endpoints

- `GET /api/leaderboards` - List all active leaderboards with top entries
- `GET /api/leaderboards/[slug]` - Get specific leaderboard with full rankings (future)

### Component Usage

```typescript
// components/leaderboards/LeaderboardSection.tsx
// Fetches from /api/leaderboards
// Renders card-based leaderboard previews
```

### Cron Jobs (Future)

```sql
-- Daily leaderboard calculation (example)
-- Run via Supabase Edge Function or external cron

-- Top Contributors Monthly
INSERT INTO "LeaderboardEntry" (leaderboardId, rank, entityId, entityName, metricValue)
SELECT 
  'leaderboard-id',
  ROW_NUMBER() OVER (ORDER BY COUNT(t.id) DESC) as rank,
  u.walletAddress as entityId,
  COALESCE(u.displayName, u.walletAddress) as entityName,
  COUNT(t.id)::float as metricValue
FROM "User" u
JOIN "UserProgress" up ON u.id = up.userId
JOIN "Task" t ON up.taskId = t.id
WHERE t.completedAt >= NOW() - INTERVAL '30 days'
GROUP BY u.id
ORDER BY metricValue DESC
LIMIT 100;
```

---

## 2. Ecosystems (Ekosistemler)

### Veri Kaynağı

**Primary Source:** Supabase `Ecosystem` table

**Data Flow:**
```
Supabase Database
  └── Ecosystem (static metadata)
      │
      ├──> Manual admin input (current)
      ├──> Auto-aggregated from Testnet data (future)
      └──> External API sync (future)
```

### Gerçek Veri Akışı (Future Implementation)

1. **Static Metadata:**
   - **Source**: Manual admin input
   - **Fields**: Name, description, network type, social links
   - **Update Frequency**: Manual/admin updates

2. **Dynamic Metrics:**
   - **Source**: Auto-calculated from `Testnet` table
   - **Calculation**: 
     ```sql
     UPDATE "Ecosystem" 
     SET 
       totalTestnets = (SELECT COUNT(*) FROM "Testnet" WHERE network = "Ecosystem".name),
       activeTestnets = (SELECT COUNT(*) FROM "Testnet" WHERE network = "Ecosystem".name AND status = 'LIVE'),
       totalFunding = (SELECT SUM(totalRaisedUSD) FROM "Testnet" WHERE network = "Ecosystem".name)
     WHERE id = ecosystem_id;
     ```
   - **Update Frequency**: Daily cron job or trigger on Testnet changes

3. **External Data Sync (Future):**
   - **Source**: Ecosystem APIs (Twitter, GitHub stats)
   - **Update Frequency**: Weekly cron job
   - **Fields**: Social follower counts, GitHub stars, etc.

### API Endpoints

- `GET /api/ecosystems` - List all ecosystems
- `GET /api/ecosystems/[slug]` - Get specific ecosystem details (future)
- `GET /api/ecosystems/[slug]/testnets` - Get testnets for ecosystem (future)

### Component Usage

```typescript
// components/ecosystems/EcosystemSection.tsx
// Fetches from /api/ecosystems
// Renders ecosystem cards with metrics
```

### Database Triggers (Future)

```sql
-- Auto-update ecosystem metrics when testnet changes
CREATE OR REPLACE FUNCTION update_ecosystem_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Ecosystem"
  SET 
    totalTestnets = (
      SELECT COUNT(*) FROM "Testnet" 
      WHERE network = (SELECT name FROM "Ecosystem" WHERE slug = NEW.network)
    ),
    activeTestnets = (
      SELECT COUNT(*) FROM "Testnet" 
      WHERE network = (SELECT name FROM "Ecosystem" WHERE slug = NEW.network) 
      AND status = 'LIVE'
    ),
    totalFunding = (
      SELECT COALESCE(SUM(totalRaisedUSD), 0) FROM "Testnet" 
      WHERE network = (SELECT name FROM "Ecosystem" WHERE slug = NEW.network)
    ),
    updatedAt = NOW()
  WHERE slug = NEW.network;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER testnet_ecosystem_update
AFTER INSERT OR UPDATE ON "Testnet"
FOR EACH ROW
EXECUTE FUNCTION update_ecosystem_metrics();
```

---

## 3. Guides (Kılavuzlar)

### Veri Kaynağı

**Primary Source:** Supabase `Guide` table

**Data Flow:**
```
Supabase Database
  └── Guide (markdown content)
      │
      ├──> Manual admin input (current)
      ├──> Markdown file imports (future)
      └──> External documentation sync (future)
```

### Gerçek Veri Akışı (Future Implementation)

1. **Content Management:**
   - **Source**: Admin panel rich text editor
   - **Format**: Markdown stored as string
   - **Update Frequency**: Manual/admin updates
   - **Versioning**: Future feature (draft/published states)

2. **SEO & Metadata:**
   - **Fields**: `seoTitle`, `seoDescription`, `tags`
   - **Auto-generation**: Future AI-assisted SEO
   - **Update Frequency**: On publish

3. **Analytics:**
   - **Source**: View tracking (via API middleware)
   - **Update Frequency**: Real-time
   - **Fields**: `views` counter, reading time estimation

4. **External Sync (Future):**
   - **Source**: GitHub wiki, external docs
   - **Update Frequency**: Weekly cron job
   - **Process**: Convert markdown → Guide records

### API Endpoints

- `GET /api/guides` - List published guides
- `GET /api/guides/[slug]` - Get specific guide content (future)
- `POST /api/guides/[slug]/view` - Track view (future)

### Component Usage

```typescript
// components/guides/GuideSection.tsx
// Fetches from /api/guides
// Renders guide cards with previews
```

### View Tracking (Future)

```typescript
// app/api/guides/[slug]/view/route.ts
export async function POST(request: Request, { params }: { params: { slug: string } }) {
  await prisma.guide.update({
    where: { slug: params.slug },
    data: { views: { increment: 1 } }
  });
  return NextResponse.json({ success: true });
}
```

### Reading Time Calculation

```typescript
// lib/utils.ts
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
```

---

## 4. API Documentation (API Dokümantasyonu)

### Veri Kaynağı

**Primary Source:** Supabase `ApiEndpoint` table

**Data Flow:**
```
Supabase Database
  └── ApiEndpoint (documentation metadata)
      │
      ├──> Manual admin input (current)
      ├──> Auto-generated from route handlers (future)
      └──> OpenAPI schema sync (future)
```

### Gerçek Veri Akışı (Future Implementation)

1. **Auto-Generation:**
   - **Source**: Next.js route handlers
   - **Process**: Parse route files → Generate documentation
   - **Tools**: Custom script or OpenAPI generator
   - **Update Frequency**: On deploy/build

2. **OpenAPI Schema:**
   - **Source**: TypeScript route definitions
   - **Process**: Extract types → Generate OpenAPI spec
   - **Output**: `/api/openapi.json`
   - **Update Frequency**: On build

3. **Rate Limit Tracking:**
   - **Source**: API middleware logging
   - **Process**: Track usage → Update `rateLimit` recommendations
   - **Update Frequency**: Weekly analysis

### API Endpoints

- `GET /api/api-endpoints` - List all documented endpoints
- `GET /api/openapi.json` - OpenAPI specification (future)

### Component Usage

```typescript
// components/api/ApiSection.tsx
// Fetches from /api/api-endpoints
// Renders API documentation cards
```

### Auto-Generation Script (Future)

```typescript
// scripts/generate-api-docs.ts
import { readdirSync, readFileSync } from 'fs';
import { parse } from '@babel/parser';

async function generateApiDocs() {
  const routesDir = 'app/api';
  const routes = readdirSync(routesDir, { recursive: true });
  
  for (const route of routes) {
    const file = readFileSync(`${routesDir}/${route}`, 'utf-8');
    const ast = parse(file, { sourceType: 'module' });
    // Extract route metadata, types, examples
    // Generate ApiEndpoint records
  }
}
```

---

## İçerik Yönetimi Stratejisi

### 1. Manual Content (Admin Panel)

**Access:** Admin users via `/admin`

**Manageable Content:**
- Leaderboards (metadata only)
- Ecosystems (full CRUD)
- Guides (markdown editor)
- API Endpoints (documentation)

**Workflow:**
1. Admin logs in
2. Navigate to content section
3. Create/Edit/Delete records
4. Preview before publish
5. Publish changes
6. Auto-invalidate cache

### 2. Automated Content (Cron Jobs)

**Frequency:** Daily/Weekly cron jobs

**Tasks:**
- Calculate leaderboard rankings
- Update ecosystem metrics
- Sync external data
- Generate API documentation
- Calculate reading times

**Implementation:**
- Supabase Edge Functions
- Vercel Cron Jobs
- GitHub Actions scheduled workflows

### 3. Real-time Updates

**Triggers:**
- User activity (task completion)
- Testnet changes (status, funding)
- Admin actions (publish, update)

**Implementation:**
- Database triggers
- Webhooks
- Real-time subscriptions (Supabase Realtime)

---

## Veri Senaryoları

### Senaryo 1: Leaderboard Güncelleme

```
User completes task
  ↓
Task completion logged
  ↓
Daily cron job aggregates stats
  ↓
LeaderboardEntry records updated
  ↓
Cache invalidated
  ↓
UI refreshes with new rankings
```

### Senaryo 2: Ecosystem Metrics Update

```
Testnet created/updated
  ↓
Database trigger fires
  ↓
Ecosystem metrics recalculated
  ↓
Ecosystem table updated
  ↓
Cache invalidated
  ↓
UI shows updated stats
```

### Senaryo 3: Guide Publishing

```
Admin writes guide in editor
  ↓
Preview markdown rendering
  ↓
Calculate reading time
  ↓
Generate SEO metadata
  ↓
Save as draft
  ↓
Admin publishes
  ↓
Set publishedAt timestamp
  ↓
Invalidate cache
  ↓
Guide appears in listing
```

### Senaryo 4: API Documentation Sync

```
Route handler updated
  ↓
Build process runs
  ↓
Auto-generation script extracts metadata
  ↓
ApiEndpoint records updated
  ↓
OpenAPI spec generated
  ↓
Documentation updated
```

---

## Veri Validasyonu

### 1. Schema Validation

```typescript
// lib/zod.ts
export const leaderboardSchema = z.object({
  title: z.string().min(1).max(100),
  category: z.enum(['contributors', 'projects', 'ecosystems']),
  metricType: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
  // ...
});

export const ecosystemSchema = z.object({
  name: z.string().min(1).max(100),
  networkType: z.enum(['L1', 'L2', 'Rollup', 'Sidechain']),
  totalTestnets: z.number().int().min(0),
  // ...
});
```

### 2. Content Validation

- Markdown syntax validation for guides
- URL validation for external links
- Image URL validation
- SEO metadata length checks

### 3. Data Integrity

- Foreign key constraints
- Unique constraints (slugs)
- Cascading deletes
- Audit logging

---

## Cache Strategy

### 1. Static Content

- **Guides**: ISR with 24h revalidation
- **Ecosystems**: ISR with 6h revalidation
- **API Endpoints**: ISR with 12h revalidation

### 2. Dynamic Content

- **Leaderboards**: Revalidate on cron job completion
- **Metrics**: SWR with 5min stale-while-revalidate

### 3. Cache Invalidation

```typescript
// lib/cache.ts
import { revalidateTag } from 'next/cache';

export async function invalidateContentCache(type: 'leaderboard' | 'ecosystem' | 'guide' | 'api') {
  revalidateTag(type);
  revalidateTag('all');
}
```

---

## Monitoring & Analytics

### 1. Content Performance

- Guide view counts
- API endpoint usage
- Leaderboard engagement
- Ecosystem page views

### 2. Data Quality

- Missing data alerts
- Stale data warnings
- Broken link detection
- SEO score monitoring

### 3. User Engagement

- Most viewed guides
- Popular ecosystems
- Active leaderboards
- API endpoint popularity

---

## Gelecek İyileştirmeler

1. **Automated Content Generation:**
   - AI-assisted guide writing
   - Auto-generated summaries
   - SEO optimization suggestions

2. **Real-time Features:**
   - Live leaderboard updates
   - Real-time ecosystem metrics
   - WebSocket subscriptions

3. **Content Versioning:**
   - Draft/published states
   - Change history
   - Rollback capability

4. **External Integrations:**
   - GitHub repo sync
   - Twitter API integration
   - Discord bot updates
   - Medium/Substack cross-posting

5. **Advanced Analytics:**
   - Content performance dashboards
   - User engagement metrics
   - A/B testing capabilities
   - Personalized recommendations

---

## İletişim & Destek

Content plan soruları için:
- GitHub Issues: [Repository link]
- Discord: [Community link]
- Email: [Support email]

