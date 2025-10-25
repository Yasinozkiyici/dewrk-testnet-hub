'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Share2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FilterState {
  q: string;
  network: string;
  difficulty: string;
  tags: string[];
  kyc: string;
  status: string;
  sort: string;
}

const NETWORKS = ['Arbitrum', 'Polygon', 'ZkSync', 'Celestia', 'Aurora', 'Base', 'Optimism'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const STATUSES = ['LIVE', 'PAUSED', 'UPCOMING', 'ENDED'];
const POPULAR_TAGS = ['defi', 'nft', 'quests', 'ecosystem', 'zk-evm', 'scaling', 'education', 'content', 'research', 'rollups', 'evm', 'grants'];
const SORT_OPTIONS = [
  { value: 'updatedAt:desc', label: 'Recently Updated' },
  { value: 'updatedAt:asc', label: 'Oldest Updated' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' }
];

export function TestnetFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    network: 'all',
    difficulty: 'all',
    tags: [],
    kyc: 'all',
    status: 'all',
    sort: 'updatedAt:desc'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('testnet-filters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(parsed);
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Sync with URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const urlFilters = {
      q: params.get('q') || '',
      network: params.get('network') || 'all',
      difficulty: params.get('difficulty') || 'all',
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      kyc: params.get('kyc') || 'all',
      status: params.get('status') || 'all',
      sort: params.get('sort') || 'updatedAt:desc'
    };
    setFilters(urlFilters);
    
    // Save to localStorage
    localStorage.setItem('testnet-filters', JSON.stringify(urlFilters));
  }, [searchParams]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      }
    });
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      network: 'all',
      difficulty: 'all',
      tags: [],
      kyc: 'all',
      status: 'all',
      sort: 'updatedAt:desc'
    });
    router.push('/', { scroll: false });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'q') return value !== '';
    if (key === 'tags') return Array.isArray(value) && value.length > 0;
    return value !== 'all';
  });

  const copyShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Testnets</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="text-gray-600"
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-1" />
                    Share Filters
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search testnets..."
            value={filters.q}
            onChange={(e) => updateFilters({ q: e.target.value })}
            className="pl-10 h-10"
            aria-label="Search testnets"
          />
        </div>

        <Select value={filters.network} onValueChange={(value) => updateFilters({ network: value })}>
          <SelectTrigger aria-label="Filter by network">
            <SelectValue placeholder="All Networks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Networks</SelectItem>
            {NETWORKS.map(network => (
              <SelectItem key={network} value={network}>{network}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.difficulty} onValueChange={(value) => updateFilters({ difficulty: value })}>
          <SelectTrigger aria-label="Filter by difficulty">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {DIFFICULTIES.map(difficulty => (
              <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <Select value={filters.sort} onValueChange={(value) => updateFilters({ sort: value })}>
          <SelectTrigger id="sort-select" className="w-48" aria-label="Sort order">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      <div 
        className={`
          border-t overflow-hidden transition-all duration-300 ease-in-out
          motion-reduce:transition-none
          ${showAdvanced ? 'max-h-96 opacity-100 pt-4' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KYC Required
          </label>
          <Select value={filters.kyc} onValueChange={(value) => updateFilters({ kyc: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="true">Required</SelectItem>
              <SelectItem value="false">Not Required</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popular Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {filters.q && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {filters.q}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ q: '' })}
                />
              </Badge>
            )}
            {filters.network && filters.network !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Network: {filters.network}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ network: 'all' })}
                />
              </Badge>
            )}
            {filters.difficulty && filters.difficulty !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Difficulty: {filters.difficulty}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ difficulty: 'all' })}
                />
              </Badge>
            )}
            {filters.status && filters.status !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ status: 'all' })}
                />
              </Badge>
            )}
            {filters.kyc && filters.kyc !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                KYC: {filters.kyc === 'true' ? 'Required' : 'Not Required'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ kyc: 'all' })}
                />
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
