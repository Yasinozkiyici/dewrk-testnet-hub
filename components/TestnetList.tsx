'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TestnetLite } from '@/types/api';

type Testnet = TestnetLite;

interface TestnetListResponse {
  data: Testnet[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const statusColors = {
  LIVE: 'bg-green-100 text-green-800 border-green-200',
  PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ENDED: 'bg-red-100 text-red-800 border-red-200',
  UPCOMING: 'bg-blue-100 text-blue-800 border-blue-200'
};

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800'
};

const formatCurrency = (amount?: string | number) => {
  if (!amount) return 'N/A';
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return 'N/A';
  if (numeric >= 1000000) {
    return `$${(numeric / 1000000).toFixed(1)}M`;
  }
  if (numeric >= 1000) {
    return `$${(numeric / 1000).toFixed(1)}K`;
  }
  return `$${numeric.toLocaleString()}`;
};

export function TestnetList() {
  const [testnets, setTestnets] = useState<Testnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestnets() {
      try {
        const response = await fetch('/api/testnets');
        if (!response.ok) {
          throw new Error('Failed to fetch testnets');
        }
        const data: TestnetListResponse = await response.json();
        setTestnets(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTestnets();
  }, []);

  if (loading) {
    return (
      <div className="glass-table overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                  <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading testnets: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (testnets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No testnets found.</p>
        <Link 
          href="/admin" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Testnets
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-table overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testnets.map((testnet, index) => (
              <tr key={testnet.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {testnet.logoUrl ? (
                        <img 
                          className="h-8 w-8 rounded-full object-cover" 
                          src={testnet.logoUrl} 
                          alt={`${testnet.network} logo`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {testnet.network.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{testnet.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {testnet.shortDescription}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{testnet.network}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`${statusColors[testnet.status]} border`}>
                    {testnet.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={difficultyColors[testnet.difficulty]}>
                    {testnet.difficulty}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                    {testnet.rewardType || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <TrendingUp className="h-4 w-4 mr-1 text-gray-400" />
                    {formatCurrency(testnet.totalRaisedUSD)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" />
                    {testnet.tasksCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link 
                      href={`/testnets/${testnet.slug}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    {testnet.dashboardUrl && (
                      <a
                        href={testnet.dashboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Stats */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {testnets.length} of {testnets.length} testnets
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded-full mr-2"></div>
              Live: {testnets.filter(t => t.status === 'LIVE').length}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-full mr-2"></div>
              Upcoming: {testnets.filter(t => t.status === 'UPCOMING').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
