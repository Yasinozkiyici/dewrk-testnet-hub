'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, DollarSign, Shield, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { TestnetLite } from '@/types/api';

type Testnet = TestnetLite;

interface TestnetListResponse {
  items: Testnet[];
  page: number;
  pageSize: number;
  total: number;
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
  if (!amount || amount === 0) return '—';
  const numeric = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) return '—';
  if (numeric >= 1000000) {
    return `$${(numeric / 1000000).toFixed(1)}M`;
  }
  if (numeric >= 1000) {
    return `$${(numeric / 1000).toFixed(1)}K`;
  }
  return `$${numeric.toLocaleString()}`;
};

const formatTime = (minutes?: number) => {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
  return `${Math.floor(diffInDays / 30)}mo`;
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

interface TestnetTableProps {
  onRowClick: (testnet: Testnet) => void;
}

export function TestnetTable({ onRowClick }: TestnetTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testnets, setTestnets] = useState<Testnet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20
  });
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTestnets() {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const response = await fetch(`/api/testnets?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch testnets');
        }
        const data: TestnetListResponse = await response.json();
        setTestnets(data.items);
        setPagination({
          total: data.total,
          page: data.page,
          pageSize: data.pageSize
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchTestnets();
  }, [searchParams]);

  useEffect(() => {
    const slug = searchParams.get('slug');
    setFocusedSlug(slug);
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const slug = searchParams.get('slug');
        if (slug) {
          handleCloseDrawer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchParams]);

  const handleRowClick = (testnet: Testnet) => {
    onRowClick(testnet);
  };


  const handleKeyDown = (event: React.KeyboardEvent, testnet: Testnet) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRowClick(testnet);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" role="region" aria-label="Loading testnets">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1280px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-64 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th className="w-20 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="w-32 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                <th className="w-20 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                <th className="w-40 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th className="w-16 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding</th>
                <th className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3 flex-shrink-0" />
                      <div className="min-w-0">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
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
      <div className="bg-white border border-red-200 rounded-lg p-12 text-center" role="alert" aria-live="assertive">
        <p className="text-red-600 mb-4 font-semibold">Error loading testnets</p>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (testnets.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center" role="status" aria-live="polite">
        <p className="text-gray-600 mb-2 font-medium">No testnets found</p>
        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search terms.</p>
        <Button variant="outline" onClick={() => router.push('/')}>
          Clear Filters
        </Button>
      </div>
    );
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <TooltipProvider>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1280px]" role="table" aria-label="Testnet programs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="w-64 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th scope="col" className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th scope="col" className="w-20 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="w-32 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                <th scope="col" className="w-20 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                <th scope="col" className="w-40 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                <th scope="col" className="w-16 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th scope="col" className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th scope="col" className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funding</th>
                <th scope="col" className="w-24 px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testnets.map((testnet) => {
                const isExpanded = focusedSlug === testnet.slug;
                return (
                  <tr 
                    key={testnet.slug} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-inset ${isExpanded ? 'bg-blue-50' : ''}`}
                    onClick={() => handleRowClick(testnet)}
                    onKeyDown={(e) => handleKeyDown(e, testnet)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${testnet.name}`}
                    aria-expanded={isExpanded}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-8 w-8">
                          {testnet.logoUrl ? (
                            <img 
                              className="h-8 w-8 rounded-full object-cover" 
                              src={testnet.logoUrl} 
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-500">
                                {testnet.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate" title={testnet.name}>{testnet.name}</div>
                          <div className="text-sm text-gray-500 truncate" title={testnet.network}>{testnet.network}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${statusColors[testnet.status]} border text-xs`}>
                        {testnet.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${difficultyColors[testnet.difficulty]} text-xs`}>
                        {testnet.difficulty}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{formatTime(testnet.estTimeMinutes)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="text-sm text-gray-900 truncate cursor-help">
                            {testnet.rewardType || 'N/A'}
                          </div>
                        </TooltipTrigger>
                        {testnet.rewardNote && (
                          <TooltipContent>
                            <p className="max-w-xs">{testnet.rewardNote}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Shield 
                          className={`h-4 w-4 flex-shrink-0 ${testnet.kycRequired ? 'text-red-500' : 'text-green-500'}`} 
                          aria-label={testnet.kycRequired ? 'KYC Required' : 'No KYC Required'}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-wrap gap-1 max-w-full overflow-hidden cursor-help">
                            {testnet.tags?.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs truncate">
                                {tag}
                              </Badge>
                            ))}
                            {testnet.tags && testnet.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{testnet.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TooltipTrigger>
                        {testnet.tags && testnet.tags.length > 2 && (
                          <TooltipContent>
                            <p className="max-w-xs">{testnet.tags.join(', ')}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {testnet.tasksCount}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-sm text-gray-900 cursor-help">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
                            <span>{formatRelativeDate(testnet.updatedAt)}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatFullDate(testnet.updatedAt)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900 font-medium">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0" aria-hidden="true" />
                        <span>{formatCurrency(testnet.totalRaisedUSD)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {testnet.hasDashboard ? (
                        <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600 text-xs">
                          AVAILABLE
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-400 border-gray-300 text-xs cursor-not-allowed">
                          N/A
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav 
            className="bg-gray-50 px-6 py-3 border-t border-gray-200" 
            role="navigation" 
            aria-label="Pagination"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(pagination.page - 1));
                    router.push(`/?${params.toString()}`, { scroll: false });
                  }}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600" aria-current="page">
                  Page {pagination.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === totalPages}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(pagination.page + 1));
                    router.push(`/?${params.toString()}`, { scroll: false });
                  }}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </TooltipProvider>
  );
}
