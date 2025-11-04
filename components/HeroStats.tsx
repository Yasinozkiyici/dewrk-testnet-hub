'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeroStatsData {
  activeCount: number;
  totalFundingUSD: number;
  ecosystemCount: number;
  newThisMonth: number;
}

export default function HeroStats() {
  const [stats, setStats] = useState<HeroStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/testnets');
        if (!res.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await res.json();

        // Support both { items: [] } and direct array
        const all = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : data?.data || [];
        
        const now = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);

        const active = all.filter((t: any) => t.status === 'LIVE');
        const totalFunding = active.reduce(
          (sum: number, t: any) => sum + (Number(t.totalRaisedUSD) || 0),
          0
        );
        
        // Get unique ecosystems/networks
        const ecosystems = new Set(
          active
            .map((t: any) => t.network || t.ecosystem)
            .filter((n: any) => n && n !== 'Unknown')
        );
        
        // Count new testnets this month
        const newThisMonth = all.filter((t: any) => {
          if (!t.createdAt) return false;
          const createdAt = new Date(t.createdAt);
          return createdAt > monthAgo;
        });

        setStats({
          activeCount: active.length,
          totalFundingUSD: totalFunding,
          ecosystemCount: ecosystems.size,
          newThisMonth: newThisMonth.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to zeros
        setStats({
          activeCount: 0,
          totalFundingUSD: 0,
          ecosystemCount: 0,
          newThisMonth: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[92px] rounded-2xl border border-border/30 bg-white/30 backdrop-blur-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Format funding value
  const formatFunding = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`;
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const metrics = [
    { label: 'Active Testnets', value: stats.activeCount.toString() },
    {
      label: 'Total Funding (USD)',
      value: formatFunding(stats.totalFundingUSD),
    },
    { label: 'Tracked Ecosystems', value: stats.ecosystemCount.toString() },
    { label: 'New This Month', value: stats.newThisMonth.toString() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' }}
          whileHover={{ scale: 1.02 }}
          className="h-[92px] rounded-2xl border border-border/30 bg-white/50 backdrop-blur-md p-4 flex flex-col justify-center shadow-sm hover:shadow-md transition-all"
        >
          <span className="text-2xl font-semibold">{m.value}</span>
          <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

