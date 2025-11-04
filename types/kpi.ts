/**
 * KPI Types for Homepage Hero and Project Cards
 * 
 * Bu dosya homepage hero ve project card'lar için anlamlı KPI'ları tanımlar:
 * - Funding metrics
 * - Status tracking
 * - Lead/ecosystem metrics
 * - Tech stack indicators
 * - Deadline/time metrics
 */

/**
 * Funding KPI - Proje finansman metrikleri
 */
export interface FundingKPI {
  /** Toplam toplanan fon (USD) */
  totalRaisedUSD: number;
  /** Son 24 saatte toplanan fon değişimi (USD) */
  change24h?: number;
  /** Son 7 günde toplanan fon değişimi (USD) */
  change7d?: number;
  /** Son 30 günde toplanan fon değişimi (USD) */
  change30d?: number;
  /** Fon değişim yüzdesi (24h) */
  changePercent24h?: number;
  /** Ortalama fon miktarı (USD) */
  averageFunding?: number;
  /** Medyan fon miktarı (USD) */
  medianFunding?: number;
}

/**
 * Status KPI - Proje durum metrikleri
 */
export interface StatusKPI {
  /** Aktif (LIVE) projelerin sayısı */
  activeCount: number;
  /** Yaklaşan (UPCOMING) projelerin sayısı */
  upcomingCount: number;
  /** Duraklatılmış (PAUSED) projelerin sayısı */
  pausedCount: number;
  /** Sonlandırılmış (ENDED) projelerin sayısı */
  endedCount: number;
  /** Aktif proje yüzdesi */
  activePercent: number;
  /** Durum dağılımı histogram verisi */
  statusDistribution: Array<{
    status: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';
    count: number;
    percent: number;
  }>;
}

/**
 * Lead/Ecosystem KPI - Liderlik ve ekosistem metrikleri
 */
export interface LeadKPI {
  /** En popüler network/ecosystem */
  topNetwork: string | null;
  /** Top network'ün proje sayısı */
  topNetworkCount: number;
  /** En hızlı büyüyen network */
  fastestGrowingNetwork?: string | null;
  /** Network bazında proje sayıları */
  networkDistribution: Array<{
    network: string;
    count: number;
    percent: number;
    totalFunding: number;
  }>;
  /** Ecosystem liderleri (top 5) */
  topEcosystems: Array<{
    network: string;
    count: number;
    totalFunding: number;
  }>;
}

/**
 * Tech Stack KPI - Teknoloji stack metrikleri
 */
export interface TechStackKPI {
  /** En yaygın teknoloji tag'leri */
  popularTags: Array<{
    tag: string;
    count: number;
    percent: number;
  }>;
  /** En yaygın kategoriler */
  popularCategories: Array<{
    category: string;
    count: number;
    percent: number;
  }>;
  /** Teknoloji çeşitliliği skoru (0-100) */
  diversityScore: number;
  /** En çok kullanılan teknoloji kombinasyonları */
  topCombinations: Array<{
    tags: string[];
    count: number;
  }>;
}

/**
 * Deadline/Time KPI - Zaman ve deadline metrikleri
 */
export interface DeadlineKPI {
  /** Ortalama tahmini tamamlanma süresi (dakika) */
  avgEstimatedTime: number;
  /** Medyan tahmini tamamlanma süresi (dakika) */
  medianEstimatedTime: number;
  /** En kısa tahmini süre (dakika) */
  minEstimatedTime: number;
  /** En uzun tahmini süre (dakika) */
  maxEstimatedTime: number;
  /** Son güncelleme zamanından itibaren ortalama geçen süre (dakika) */
  avgTimeSinceUpdate: number;
  /** Yaklaşan deadline'ları olan projeler (son 7 gün) */
  upcomingDeadlines: number;
  /** Deadline geçmiş projeler */
  overdueDeadlines: number;
  /** Time-to-market ortalama (gün) */
  avgTimeToMarket?: number;
}

/**
 * Comprehensive KPI Set - Tüm KPI'ları içeren kapsamlı set
 */
export interface HomepageKPIs {
  /** Funding metrikleri */
  funding: FundingKPI;
  /** Status metrikleri */
  status: StatusKPI;
  /** Lead/ecosystem metrikleri */
  lead: LeadKPI;
  /** Tech stack metrikleri */
  techStack: TechStackKPI;
  /** Deadline/time metrikleri */
  deadline: DeadlineKPI;
  /** Metrik hesaplama zamanı */
  calculatedAt: string;
  /** Veri kaynağı bilgisi */
  dataSource: 'real' | 'mock' | 'hybrid';
}

/**
 * Project Card KPI - Tek bir proje için KPI
 */
export interface ProjectCardKPI {
  /** Proje ID */
  id: string;
  /** Proje slug */
  slug: string;
  /** Proje adı */
  name: string;
  /** Funding metrikleri (tek proje için) */
  funding: {
    totalRaisedUSD: number;
    rank?: number; // Toplam funding'de sıralama
    percentile?: number; // Yüzdelik dilim (0-100)
  };
  /** Status bilgisi */
  status: {
    current: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';
    daysSinceStatusChange?: number;
  };
  /** Lead/ecosystem bilgisi */
  lead: {
    network: string | null;
    networkRank?: number; // Network içinde sıralama
  };
  /** Tech stack bilgisi */
  techStack: {
    tags: string[];
    categories: string[];
    stackScore?: number; // Tech stack popülaritesi skoru
  };
  /** Deadline/time bilgisi */
  deadline: {
    estimatedTimeMinutes: number | null;
    daysSinceUpdate: number;
    isUpcoming?: boolean; // Yakında deadline var mı?
    isOverdue?: boolean; // Deadline geçmiş mi?
  };
}

/**
 * Hero Summary Response - Hero section için özet KPI response
 */
export interface HeroSummaryResponse {
  /** Toplam testnet sayısı */
  totalTestnets: number;
  /** Toplam ödül (USD) */
  totalReward: number;
  /** Ortalama tamamlanma süresi (dakika) */
  avgCompletionTime: number;
  /** KYC yüzdesi */
  kycRate: number;
  /** Öne çıkan ekosistemler */
  featuredEcosystems: string[];
  /** Detaylı KPI'lar */
  kpis?: HomepageKPIs;
}

/**
 * Trending Testnet - Trending projeler için tip
 */
export interface TrendingTestnet {
  id: string;
  name: string;
  network: string;
  reward: string;
  slug: string;
  /** Trend skoru (0-100) */
  trendScore?: number;
  /** Son 7 gündeki değişim */
  change7d?: number;
}

/**
 * Top Gainer - En çok kazanan projeler için tip
 */
export interface TopGainer {
  id: string;
  name: string;
  network: string;
  rewardIncrease: string;
  slug: string;
  /** Artış yüzdesi */
  deltaPct?: number;
  /** Artış miktarı (USD) */
  deltaAmount?: number;
}

