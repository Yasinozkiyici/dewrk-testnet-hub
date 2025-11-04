/**
 * Mock KPI Data Provider
 * 
 * Bu dosya homepage hero ve project card'lar için mock KPI verisi sağlar.
 * Gerçek API entegrasyonunda bu mock data yerine gerçek veri kullanılacak.
 * 
 * Usage:
 *   import { getMockKPIs, getMockProjectCardKPIs } from '@/lib/mock-kpi-data';
 *   const kpis = getMockKPIs();
 */

import type {
  HomepageKPIs,
  ProjectCardKPI,
  FundingKPI,
  StatusKPI,
  LeadKPI,
  TechStackKPI,
  DeadlineKPI,
  HeroSummaryResponse,
  TrendingTestnet,
  TopGainer
} from '@/types/kpi';

/**
 * Mock Funding KPI verisi üretir
 */
function generateMockFundingKPI(): FundingKPI {
  const totalRaisedUSD = 15000000 + Math.random() * 5000000; // $15M - $20M
  const change24h = -500000 + Math.random() * 1000000; // -$500K - $500K
  const change7d = -2000000 + Math.random() * 4000000; // -$2M - $2M
  const change30d = -5000000 + Math.random() * 10000000; // -$5M - $5M

  return {
    totalRaisedUSD: Math.round(totalRaisedUSD),
    change24h: Math.round(change24h),
    change7d: Math.round(change7d),
    change30d: Math.round(change30d),
    changePercent24h: Math.round((change24h / totalRaisedUSD) * 100 * 100) / 100,
    averageFunding: Math.round(totalRaisedUSD / 50), // Ortalama 50 proje varsayımı
    medianFunding: Math.round(totalRaisedUSD / 60)
  };
}

/**
 * Mock Status KPI verisi üretir
 */
function generateMockStatusKPI(): StatusKPI {
  const activeCount = 35 + Math.floor(Math.random() * 10);
  const upcomingCount = 8 + Math.floor(Math.random() * 5);
  const pausedCount = 3 + Math.floor(Math.random() * 3);
  const endedCount = 4 + Math.floor(Math.random() * 3);
  const total = activeCount + upcomingCount + pausedCount + endedCount;
  const activePercent = Math.round((activeCount / total) * 100);

  return {
    activeCount,
    upcomingCount,
    pausedCount,
    endedCount,
    activePercent,
    statusDistribution: [
      { status: 'LIVE', count: activeCount, percent: Math.round((activeCount / total) * 100) },
      { status: 'UPCOMING', count: upcomingCount, percent: Math.round((upcomingCount / total) * 100) },
      { status: 'PAUSED', count: pausedCount, percent: Math.round((pausedCount / total) * 100) },
      { status: 'ENDED', count: endedCount, percent: Math.round((endedCount / total) * 100) }
    ]
  };
}

/**
 * Mock Lead KPI verisi üretir
 */
function generateMockLeadKPI(): LeadKPI {
  const networks = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon', 'Scroll', 'zkSync'];
  const networkDistribution = networks.map((network, index) => {
    const count = 5 + Math.floor(Math.random() * 10);
    const totalFunding = (count * (100000 + Math.random() * 500000));
    return {
      network,
      count,
      percent: 0, // Calculate after
      totalFunding: Math.round(totalFunding)
    };
  });

  const totalCount = networkDistribution.reduce((sum, n) => sum + n.count, 0);
  networkDistribution.forEach((n) => {
    n.percent = Math.round((n.count / totalCount) * 100);
  });

  networkDistribution.sort((a, b) => b.count - a.count);
  const topNetwork = networkDistribution[0]?.network || null;
  const topNetworkCount = networkDistribution[0]?.count || 0;

  const topEcosystems = networkDistribution.slice(0, 5).map((n) => ({
    network: n.network,
    count: n.count,
    totalFunding: n.totalFunding
  }));

  return {
    topNetwork,
    topNetworkCount,
    fastestGrowingNetwork: networks[Math.floor(Math.random() * networks.length)],
    networkDistribution,
    topEcosystems
  };
}

/**
 * Mock Tech Stack KPI verisi üretir
 */
function generateMockTechStackKPI(): TechStackKPI {
  const allTags = ['DeFi', 'NFT', 'Layer 2', 'Oracle', 'Gaming', 'DAO', 'Bridge', 'Wallet', 'DEX', 'Staking'];
  const popularTags = allTags.map((tag) => {
    const count = 5 + Math.floor(Math.random() * 20);
    return {
      tag,
      count,
      percent: 0 // Calculate after
    };
  });

  const totalTagUsage = popularTags.reduce((sum, t) => sum + t.count, 0);
  popularTags.forEach((t) => {
    t.percent = Math.round((t.count / totalTagUsage) * 100);
  });

  popularTags.sort((a, b) => b.count - a.count);

  const allCategories = ['Infrastructure', 'DeFi', 'NFT', 'Gaming', 'Social'];
  const popularCategories = allCategories.map((category) => {
    const count = 8 + Math.floor(Math.random() * 15);
    return {
      category,
      count,
      percent: 0
    };
  });

  const totalCategoryUsage = popularCategories.reduce((sum, c) => sum + c.count, 0);
  popularCategories.forEach((c) => {
    c.percent = Math.round((c.count / totalCategoryUsage) * 100);
  });

  popularCategories.sort((a, b) => b.count - a.count);

  const topCombinations = [
    { tags: ['DeFi', 'Layer 2'], count: 12 },
    { tags: ['NFT', 'Gaming'], count: 8 },
    { tags: ['DAO', 'Governance'], count: 6 },
    { tags: ['Bridge', 'Cross-chain'], count: 10 }
  ];

  return {
    popularTags: popularTags.slice(0, 10),
    popularCategories: popularCategories.slice(0, 5),
    diversityScore: 65 + Math.floor(Math.random() * 20), // 65-85 arası
    topCombinations
  };
}

/**
 * Mock Deadline KPI verisi üretir
 */
function generateMockDeadlineKPI(): DeadlineKPI {
  const avgEstimatedTime = 120 + Math.floor(Math.random() * 180); // 120-300 dakika
  const medianEstimatedTime = avgEstimatedTime + Math.floor(Math.random() * 40 - 20);
  const minEstimatedTime = 30 + Math.floor(Math.random() * 60);
  const maxEstimatedTime = 480 + Math.floor(Math.random() * 240);

  return {
    avgEstimatedTime,
    medianEstimatedTime,
    minEstimatedTime,
    maxEstimatedTime,
    avgTimeSinceUpdate: 2 + Math.floor(Math.random() * 10), // 2-12 gün
    upcomingDeadlines: 3 + Math.floor(Math.random() * 5),
    overdueDeadlines: 1 + Math.floor(Math.random() * 3),
    avgTimeToMarket: 14 + Math.floor(Math.random() * 14) // 14-28 gün
  };
}

/**
 * Mock Homepage KPIs üretir
 */
export function getMockKPIs(): HomepageKPIs {
  return {
    funding: generateMockFundingKPI(),
    status: generateMockStatusKPI(),
    lead: generateMockLeadKPI(),
    techStack: generateMockTechStackKPI(),
    deadline: generateMockDeadlineKPI(),
    calculatedAt: new Date().toISOString(),
    dataSource: 'mock'
  };
}

/**
 * Mock Project Card KPI verisi üretir
 */
export function getMockProjectCardKPIs(count: number = 10): ProjectCardKPI[] {
  const networks = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon', 'Scroll', 'zkSync'];
  const statuses: Array<'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING'> = ['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'];
  const tags = ['DeFi', 'NFT', 'Layer 2', 'Oracle', 'Gaming', 'DAO', 'Bridge'];
  const categories = ['Infrastructure', 'DeFi', 'NFT', 'Gaming', 'Social'];

  return Array.from({ length: count }, (_, index) => {
    const network = networks[Math.floor(Math.random() * networks.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const projectTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 3));
    const projectCategories = categories
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 2));

    const totalRaisedUSD = 50000 + Math.random() * 500000;
    const estimatedTimeMinutes = 60 + Math.floor(Math.random() * 240);
    const daysSinceUpdate = Math.floor(Math.random() * 30);

    return {
      id: `mock-${index + 1}`,
      slug: `mock-project-${index + 1}`,
      name: `Mock Project ${index + 1}`,
      funding: {
        totalRaisedUSD: Math.round(totalRaisedUSD),
        rank: index + 1,
        percentile: Math.round(((count - index) / count) * 100)
      },
      status: {
        current: status,
        daysSinceStatusChange: Math.floor(Math.random() * 60)
      },
      lead: {
        network,
        networkRank: Math.floor(Math.random() * 10) + 1
      },
      techStack: {
        tags: projectTags,
        categories: projectCategories,
        stackScore: 50 + Math.floor(Math.random() * 50)
      },
      deadline: {
        estimatedTimeMinutes,
        daysSinceUpdate,
        isUpcoming: daysSinceUpdate <= 7 && Math.random() > 0.5,
        isOverdue: daysSinceUpdate > 30 && Math.random() > 0.3
      }
    };
  });
}

/**
 * Mock Hero Summary Response üretir
 */
export function getMockHeroSummaryResponse(): HeroSummaryResponse {
  const kpis = getMockKPIs();
  const totalTestnets = kpis.status.activeCount + kpis.status.upcomingCount + 
                        kpis.status.pausedCount + kpis.status.endedCount;

  return {
    totalTestnets,
    totalReward: kpis.funding.totalRaisedUSD,
    avgCompletionTime: kpis.deadline.avgEstimatedTime,
    kycRate: 65 + Math.floor(Math.random() * 20), // 65-85%
    featuredEcosystems: kpis.lead.topEcosystems.slice(0, 3).map((e) => e.network),
    kpis
  };
}

/**
 * Mock Trending Testnets üretir
 */
export function getMockTrendingTestnets(count: number = 3): TrendingTestnet[] {
  const networks = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon'];
  
  return Array.from({ length: count }, (_, index) => {
    const network = networks[Math.floor(Math.random() * networks.length)];
    const totalRaisedUSD = 100000 + Math.random() * 500000;
    
    return {
      id: `trending-${index + 1}`,
      name: `Trending Project ${index + 1}`,
      network,
      reward: `$${Math.round(totalRaisedUSD / 1000)}K`,
      slug: `trending-project-${index + 1}`,
      trendScore: 70 + Math.floor(Math.random() * 30),
      change7d: Math.round(totalRaisedUSD * 0.1 + Math.random() * totalRaisedUSD * 0.2)
    };
  });
}

/**
 * Mock Top Gainers üretir
 */
export function getMockTopGainers(count: number = 3): TopGainer[] {
  const networks = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon'];
  
  return Array.from({ length: count }, (_, index) => {
    const network = networks[Math.floor(Math.random() * networks.length)];
    const baseAmount = 200000 + Math.random() * 300000;
    const deltaPct = 20 + Math.floor(Math.random() * 40); // 20-60%
    const deltaAmount = Math.round((baseAmount * deltaPct) / 100);
    
    return {
      id: `gainer-${index + 1}`,
      name: `Top Gainer ${index + 1}`,
      network,
      rewardIncrease: `$${Math.round((baseAmount + deltaAmount) / 1000)}K`,
      slug: `gainer-project-${index + 1}`,
      deltaPct,
      deltaAmount
    };
  });
}

