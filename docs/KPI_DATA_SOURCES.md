# KPI Data Sources Inventory

Bu dokümantasyon homepage hero ve project card'lar için veri kaynaklarının envanterini içerir.

## Veri Kaynakları Envanteri

### Homepage Hero Components

#### 1. HeroSection (`components/hero/HeroSection.tsx`)
**Veri Kaynakları:**
- `/api/hero/summary` - Toplam ödül ve özet metrikler
- `/api/hero/trending` - Trending projeler (top 3)
- `/api/hero/gainers` - Top gainers (top 3)
- `/api/testnets` (fallback) - Ana testnet listesi

**Kullandığı Metrikler:**
- `totalTestnets` - Toplam testnet sayısı
- `totalReward` - Toplam ödül (USD)
- `avgCompletionTime` - Ortalama tamamlanma süresi (dakika)
- `kycRate` - KYC yüzdesi
- `featuredEcosystems` - Öne çıkan ekosistemler (top 3)

**Component'ler:**
- `HeroStatCard` - Total Reward gösterimi
- `HeroTrendingCard` - Trending testnets listesi
- `HeroTopGainersCard` - Top gainers listesi

---

### Project Cards

#### 1. TestnetRow (`components/testnets/TestnetRow.tsx`)
**Veri Kaynağı:**
- `/api/testnets` - Ana testnet listesi

**Kullandığı Metrikler:**
- `name`, `network`, `logoUrl` - Proje bilgileri
- `status` - Proje durumu (LIVE, PAUSED, ENDED, UPCOMING)
- `difficulty` - Zorluk seviyesi (EASY, MEDIUM, HARD)
- `estTimeMinutes` - Tahmini süre (dakika)
- `rewardType`, `rewardNote` - Ödül bilgileri
- `tasksCount` - Task sayısı
- `updatedAt` - Son güncelleme zamanı
- `totalRaisedUSD` - Toplanan fon (USD)
- `hasDashboard`, `dashboardUrl` - Dashboard bilgisi
- `tags` - Proje tag'leri

---

## API Endpoints

### Hero Endpoints

#### `/api/hero/summary` (`app/api/hero/summary/route.ts`)
**Response:**
```typescript
{
  totalRewardsUSD: number;
  last30dSeries: Array<{ date: string; value: number }>;
}
```

**Şu An:**
- Prisma'dan aggregate data
- Mock time-series data

**Gelecek:**
- Supabase + cron job
- Gerçek time-series data

---

#### `/api/hero/trending` (`app/api/hero/trending/route.ts`)
**Response:**
```typescript
{
  trending: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    network: string;
    metric7d: number;
    reward: string;
  }>;
}
```

**Şu An:**
- `updatedAt` bazlı sıralama (top 3)

**Gelecek:**
- Gerçek trend hesaplama (view count, engagement, etc.)

---

#### `/api/hero/gainers` (`app/api/hero/gainers/route.ts`)
**Response:**
```typescript
{
  gainers: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    network: string;
    deltaPct: number;
    rewardIncrease: string;
    avgTime: number | null;
  }>;
}
```

**Şu An:**
- `totalRaisedUSD` bazlı sıralama (top 3)
- Mock deltaPct

**Gelecek:**
- Zamana bağlı artış hesaplama

---

### Testnets Endpoints

#### `/api/testnets` (`app/api/testnets/route.ts`)
**Response:**
```typescript
{
  items: TestnetListRow[];
}
```

**Veri Kaynağı:**
- Supabase view: `dewrk_v_testnets_list`

**Tip:**
- `TestnetListRow` (`components/testnets/types.ts`)

---

#### `/api/testnets/[slug]` (`app/api/testnets/[slug]/route.ts`)
**Response:**
```typescript
TestnetDetailRecord
```

**Veri Kaynağı:**
- Supabase view veya direct query

**Tip:**
- `TestnetDetailRecord` (`components/testnets/types.ts`)

---

## Type Definitions

### Mevcut Tipler

#### TestnetListRow (`components/testnets/types.ts`)
```typescript
export interface TestnetListRow {
  id: string;
  name: string;
  slug: string;
  network?: string | null;
  status?: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  tags?: string[] | null;
  tasksCount?: number | null;
  updatedAt?: string | null;
  hasDashboard?: boolean | null;
  totalRaisedUSD?: number | string | null;
  dashboardUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
}
```

#### TestnetDetailRecord (`components/testnets/types.ts`)
```typescript
export interface TestnetDetailRecord {
  id?: string;
  slug: string;
  name: string;
  network?: string | null;
  status?: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  shortDescription?: string | null;
  description?: string | null;
  tags?: string[] | null;
  categories?: string[] | null;
  highlights?: string[] | null;
  prerequisites?: string[] | null;
  estTimeMinutes?: number | string | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  totalRaisedUSD?: number | string | null;
  hasDashboard?: boolean | null;
  dashboardUrl?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  tasksCount?: number | null;
  updatedAt?: string | null;
  socials: {
    website?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  gettingStarted: GettingStartedItem[];
  discordRoles: DiscordRoleItem[];
  tasks: DetailTask[];
}
```

---

## Yeni KPI Tipleri

### KPI Interface'leri (`types/kpi.ts`)

1. **`FundingKPI`** - Finansman metrikleri
2. **`StatusKPI`** - Durum metrikleri
3. **`LeadKPI`** - Liderlik/ecosystem metrikleri
4. **`TechStackKPI`** - Teknoloji stack metrikleri
5. **`DeadlineKPI`** - Deadline/zaman metrikleri
6. **`HomepageKPIs`** - Tüm KPI'ları içeren kapsamlı set
7. **`ProjectCardKPI`** - Tek bir proje için KPI
8. **`HeroSummaryResponse`** - Hero section response
9. **`TrendingTestnet`** - Trending projeler tipi
10. **`TopGainer`** - Top gainers tipi

---

## Mock Data Provider

### Mock KPI Data Provider (`lib/mock-kpi-data.ts`)

**Fonksiyonlar:**
- `getMockKPIs()` - Mock Homepage KPIs
- `getMockProjectCardKPIs(count)` - Mock Project Card KPIs
- `getMockHeroSummaryResponse()` - Mock Hero Summary
- `getMockTrendingTestnets(count)` - Mock Trending Testnets
- `getMockTopGainers(count)` - Mock Top Gainers

**Kullanım:**
```typescript
import { getMockKPIs, getMockProjectCardKPIs } from '@/lib/mock-kpi-data';

// Development/Testing için
const kpis = getMockKPIs();
const projectKPIs = getMockProjectCardKPIs(10);
```

---

## API Field Mapping

Detaylı field mapping bilgisi için: [`docs/API_FIELD_MAPPING.md`](./API_FIELD_MAPPING.md)

**Özet:**
- Mevcut field'lar → KPI interface'lerine mapping
- Hesaplanacak field'lar (aggregate queries)
- Eksik field'lar (gelecekte eklenecek)
- SQL query örnekleri

---

## Next Steps

1. ✅ KPI interface'leri oluşturuldu
2. ✅ Mock data provider oluşturuldu
3. ✅ API field mapping dokümantasyonu oluşturuldu
4. ⏳ Gerçek KPI calculation endpoint'leri implement edilecek
5. ⏳ Time-series data tracking eklenecek
6. ⏳ Status change tracking eklenecek
7. ⏳ Deadline tracking eklenecek
8. ⏳ Cron job'ları kurulacak

