# API Field Mapping Outline

Bu dokümantasyon homepage hero ve project card'lar için mevcut API field'larının KPI interface'lerine nasıl map edileceğini açıklar.

## Veri Kaynakları Inventory

### Homepage Hero

1. **`/api/hero/summary`** - Özet metrikler
   - Kaynak: `app/api/hero/summary/route.ts`
   - Şu an: Mock/aggregated data (Prisma)
   - Gelecek: Supabase + cron job

2. **`/api/hero/trending`** - Trending projeler
   - Kaynak: `app/api/hero/trending/route.ts`
   - Şu an: `updatedAt` bazlı sıralama (top 3)
   - Gelecek: Gerçek trend hesaplama

3. **`/api/hero/gainers`** - Top gainers
   - Kaynak: `app/api/hero/gainers/route.ts`
   - Şu an: `totalRaisedUSD` bazlı sıralama (top 3)
   - Gelecek: Zamana bağlı artış hesaplama

4. **`/api/testnets`** (fallback)
   - Kaynak: `app/api/testnets/route.ts`
   - Şu an: Supabase view `dewrk_v_testnets_list`
   - Gelecek: Aynı (ana veri kaynağı)

### Project Cards

1. **`/api/testnets`** - Ana liste
   - Kaynak: `app/api/testnets/route.ts`
   - Tip: `TestnetListRow` (`components/testnets/types.ts`)
   - Veri: Supabase view

2. **`/api/testnets/[slug]`** - Detay sayfası
   - Kaynak: `app/api/testnets/[slug]/route.ts`
   - Tip: `TestnetDetailRecord` (`components/testnets/types.ts`)
   - Veri: Supabase view

---

## KPI Field Mapping

### 1. Funding KPI Mapping

**Mevcut API Field'ları:**
```typescript
// /api/testnets ve /api/testnets/[slug]
totalRaisedUSD?: number | string | null
```

**KPI Interface'ine Mapping:**
```typescript
// Mevcut field'dan
funding: {
  totalRaisedUSD: Number(testnet.totalRaisedUSD) || 0
}

// Hesaplanacak field'lar (zamana bağlı)
// NOT: Bu field'lar şu an API'de yok, gelecekte eklenecek:
funding: {
  change24h: calculate24hChange(testnet.id, testnet.totalRaisedUSD),
  change7d: calculate7dChange(testnet.id, testnet.totalRaisedUSD),
  change30d: calculate30dChange(testnet.id, testnet.totalRaisedUSD),
  changePercent24h: (change24h / totalRaisedUSD) * 100
}

// Aggregate hesaplama (tüm testnets üzerinden)
funding: {
  averageFunding: sum(totalRaisedUSD) / count(testnets),
  medianFunding: median(totalRaisedUSD)
}
```

**Gerçek API Mapping (Gelecek):**
- `totalRaisedUSD` → Direkt mapping ✅
- `change24h`, `change7d`, `change30d` → Yeni column: `funding_history` table veya time-series data
- `changePercent24h` → Hesaplanacak field
- `averageFunding`, `medianFunding` → Aggregate query

---

### 2. Status KPI Mapping

**Mevcut API Field'ları:**
```typescript
// /api/testnets ve /api/testnets/[slug]
status?: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING'
```

**KPI Interface'ine Mapping:**
```typescript
// Aggregate hesaplama
status: {
  activeCount: count(testnets.filter(t => t.status === 'LIVE')),
  upcomingCount: count(testnets.filter(t => t.status === 'UPCOMING')),
  pausedCount: count(testnets.filter(t => t.status === 'PAUSED')),
  endedCount: count(testnets.filter(t => t.status === 'ENDED')),
  activePercent: (activeCount / totalCount) * 100,
  statusDistribution: [
    { status: 'LIVE', count: ..., percent: ... },
    { status: 'UPCOMING', count: ..., percent: ... },
    { status: 'PAUSED', count: ..., percent: ... },
    { status: 'ENDED', count: ..., percent: ... }
  ]
}
```

**Gerçek API Mapping (Gelecek):**
- `status` → Direkt mapping ✅
- `activeCount`, `upcomingCount`, etc. → SQL GROUP BY query
- `statusDistribution` → Aggregate query ile hesaplanacak

---

### 3. Lead/Ecosystem KPI Mapping

**Mevcut API Field'ları:**
```typescript
// /api/testnets ve /api/testnets/[slug]
network?: string | null
```

**KPI Interface'ine Mapping:**
```typescript
// Aggregate hesaplama
lead: {
  topNetwork: mostFrequentNetwork(testnets),
  topNetworkCount: count(testnets.filter(t => t.network === topNetwork)),
  fastestGrowingNetwork: calculateFastestGrowing(testnets, network),
  networkDistribution: groupBy(testnets, 'network').map(n => ({
    network: n.name,
    count: n.count,
    percent: (n.count / totalCount) * 100,
    totalFunding: sum(n.testnets.map(t => t.totalRaisedUSD))
  })),
  topEcosystems: networkDistribution.sort((a, b) => b.totalFunding - a.totalFunding).slice(0, 5)
}
```

**Gerçek API Mapping (Gelecek):**
- `network` → Direkt mapping ✅
- `topNetwork` → SQL: `SELECT network, COUNT(*) FROM testnets GROUP BY network ORDER BY COUNT(*) DESC LIMIT 1`
- `fastestGrowingNetwork` → Time-series data + network bazında artış hesaplama
- `networkDistribution` → SQL GROUP BY query
- `topEcosystems` → SQL aggregate query

---

### 4. Tech Stack KPI Mapping

**Mevcut API Field'ları:**
```typescript
// /api/testnets ve /api/testnets/[slug]
tags?: string[] | null
categories?: string[] | null  // Sadece detail'de
```

**KPI Interface'ine Mapping:**
```typescript
// Aggregate hesaplama
techStack: {
  popularTags: countByTag(testnets).map(tag => ({
    tag: tag.name,
    count: tag.count,
    percent: (tag.count / totalTagUsage) * 100
  })),
  popularCategories: countByCategory(testnets).map(cat => ({
    category: cat.name,
    count: cat.count,
    percent: (cat.count / totalCategoryUsage) * 100
  })),
  diversityScore: calculateDiversityScore(testnets), // Shannon diversity index
  topCombinations: findTopTagCombinations(testnets)
}
```

**Gerçek API Mapping (Gelecek):**
- `tags` → Direkt mapping ✅ (JSON array)
- `categories` → Direkt mapping ✅ (JSON array, detail'de)
- `popularTags` → JSON array'leri unnest edip GROUP BY query
- `popularCategories` → Aynı şekilde
- `diversityScore` → Hesaplanacak metric (Shannon diversity index)
- `topCombinations` → Tag combination'ları bulup aggregate et

---

### 5. Deadline/Time KPI Mapping

**Mevcut API Field'ları:**
```typescript
// /api/testnets ve /api/testnets/[slug]
estTimeMinutes?: number | null
updatedAt?: string | null
```

**KPI Interface'ine Mapping:**
```typescript
// Aggregate hesaplama
deadline: {
  avgEstimatedTime: average(testnets.map(t => t.estTimeMinutes)),
  medianEstimatedTime: median(testnets.map(t => t.estTimeMinutes)),
  minEstimatedTime: min(testnets.map(t => t.estTimeMinutes)),
  maxEstimatedTime: max(testnets.map(t => t.estTimeMinutes)),
  avgTimeSinceUpdate: average(testnets.map(t => daysSince(t.updatedAt))),
  upcomingDeadlines: count(testnets.filter(t => isUpcomingDeadline(t))),
  overdueDeadlines: count(testnets.filter(t => isOverdueDeadline(t))),
  avgTimeToMarket: average(testnets.map(t => daysBetween(t.createdAt, t.launchDate)))
}
```

**Gerçek API Mapping (Gelecek):**
- `estTimeMinutes` → Direkt mapping ✅
- `updatedAt` → Direkt mapping ✅
- `avgEstimatedTime`, `medianEstimatedTime`, etc. → SQL aggregate functions (AVG, MEDIAN, MIN, MAX)
- `avgTimeSinceUpdate` → SQL: `AVG(EXTRACT(EPOCH FROM (NOW() - updatedAt)) / 86400)` (gün cinsinden)
- `upcomingDeadlines` → SQL: `WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
- `overdueDeadlines` → SQL: `WHERE deadline < NOW()`
- `avgTimeToMarket` → Yeni field gerekli: `createdAt`, `launchDate` veya `launchedAt`

---

## Project Card KPI Mapping

### Tek Bir Proje İçin KPI

```typescript
// Mevcut field'lardan
ProjectCardKPI: {
  id: testnet.id,
  slug: testnet.slug,
  name: testnet.name,
  
  funding: {
    totalRaisedUSD: Number(testnet.totalRaisedUSD) || 0,
    rank: calculateRank(testnet.totalRaisedUSD, allTestnets), // Hesaplanacak
    percentile: calculatePercentile(testnet.totalRaisedUSD, allTestnets) // Hesaplanacak
  },
  
  status: {
    current: testnet.status || 'UPCOMING',
    daysSinceStatusChange: daysSince(testnet.statusChangedAt) // Yeni field gerekli
  },
  
  lead: {
    network: testnet.network || null,
    networkRank: calculateNetworkRank(testnet.network, allTestnets) // Hesaplanacak
  },
  
  techStack: {
    tags: testnet.tags || [],
    categories: testnet.categories || [], // Detail'de
    stackScore: calculateStackScore(testnet.tags, testnet.categories) // Hesaplanacak
  },
  
  deadline: {
    estimatedTimeMinutes: testnet.estTimeMinutes || null,
    daysSinceUpdate: daysSince(testnet.updatedAt),
    isUpcoming: daysSince(testnet.updatedAt) <= 7 && hasUpcomingDeadline(testnet),
    isOverdue: daysSince(testnet.updatedAt) > 30 && hasOverdueDeadline(testnet)
  }
}
```

---

## Eksik Field'lar (Gelecekte Eklenecek)

### Veritabanına Eklenecek Column'lar:

1. **Funding History Tracking:**
   - `funding_history` table veya JSON column
   - Time-series data için

2. **Status Change Tracking:**
   - `statusChangedAt: DateTime` → Status değişim zamanı

3. **Deadline Tracking:**
   - `deadline: DateTime` → Proje deadline'ı
   - `launchedAt: DateTime` → Launch tarihi (time-to-market için)

4. **Trend Metrics:**
   - `trendScore: Float` → Trend skoru (0-100)
   - `change7d: Decimal` → 7 günlük değişim

5. **Network Ranking:**
   - View veya materialized view ile hesaplanabilir

---

## Gerçek API Implementation Örnekleri

### SQL Query Örnekleri:

```sql
-- Funding KPI Aggregate
SELECT 
  SUM(totalRaisedUSD) as totalRaisedUSD,
  AVG(totalRaisedUSD) as averageFunding,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY totalRaisedUSD) as medianFunding
FROM testnets;

-- Status KPI
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percent
FROM testnets
GROUP BY status;

-- Lead KPI (Network Distribution)
SELECT 
  network,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percent,
  SUM(totalRaisedUSD) as totalFunding
FROM testnets
WHERE network IS NOT NULL
GROUP BY network
ORDER BY count DESC;

-- Tech Stack KPI (Popular Tags)
SELECT 
  tag,
  COUNT(*) as count
FROM testnets,
LATERAL jsonb_array_elements_text(tags::jsonb) as tag
GROUP BY tag
ORDER BY count DESC
LIMIT 10;

-- Deadline KPI
SELECT 
  AVG(estTimeMinutes) as avgEstimatedTime,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY estTimeMinutes) as medianEstimatedTime,
  MIN(estTimeMinutes) as minEstimatedTime,
  MAX(estTimeMinutes) as maxEstimatedTime
FROM testnets
WHERE estTimeMinutes IS NOT NULL;
```

---

## Mock Data Provider Kullanımı

```typescript
// Development/Testing için
import { getMockKPIs, getMockProjectCardKPIs } from '@/lib/mock-kpi-data';

// Mock KPI'ları kullan
const kpis = getMockKPIs();

// Mock project card KPI'ları
const projectKPIs = getMockProjectCardKPIs(10);

// Production'da gerçek API'den
const response = await fetch('/api/hero/summary');
const realKPIs = await response.json();
```

---

## Implementation Checklist

- [ ] Funding KPI calculation endpoint oluştur
- [ ] Status KPI aggregate query yaz
- [ ] Lead/Ecosystem KPI query'leri yaz
- [ ] Tech Stack KPI calculation (tag/category aggregation)
- [ ] Deadline KPI time-based calculations
- [ ] Project Card KPI individual calculations
- [ ] Time-series data tracking (funding history)
- [ ] Status change tracking (`statusChangedAt` column)
- [ ] Deadline tracking (`deadline`, `launchedAt` columns)
- [ ] Cron job'ları kur (günlük KPI hesaplamaları için)
- [ ] Materialized views oluştur (performans için)

