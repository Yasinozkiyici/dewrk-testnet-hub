'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ExternalLink, Globe, Github, Twitter, MessageCircle, Shield, Clock, DollarSign, Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { TestnetFull } from '@/types/api';

interface TestnetDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  testnetSlug: string | null;
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

const formatCurrency = (amount?: number) => {
  if (!amount || amount === 0) return '—';
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

const formatTime = (minutes?: number) => {
  if (!minutes) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

// Cache for stale-while-revalidate
const cache = new Map<string, { data: TestnetFull; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function TestnetDetailDrawer({ isOpen, onClose, testnetSlug }: TestnetDetailDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testnet, setTestnet] = useState<TestnetFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // URL slug senkronizasyonu
  useEffect(() => {
    const urlSlug = searchParams.get('slug');
    if (urlSlug && urlSlug !== testnetSlug) {
      // URL'deki slug değişti, drawer'ı aç
      onClose(); // Önce mevcut drawer'ı kapat
      setTimeout(() => {
        // Yeni slug ile drawer'ı aç
        const params = new URLSearchParams(searchParams);
        params.set('slug', urlSlug);
        router.push(`/?${params.toString()}`, { scroll: false });
      }, 100);
    }
  }, [searchParams, testnetSlug, onClose, router]);

  // Focus trap ve scroll lock
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = drawerRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        if (firstFocusable) {
          firstFocusableRef.current = firstFocusable;
          firstFocusable.focus();
        }
      }, 100);
    } else {
      // Restore scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Focus trap within drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = drawerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    // Remove slug from URL
    const params = new URLSearchParams(searchParams);
    params.delete('slug');
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl as any, { scroll: false });
    onClose();
  }, [searchParams, router, onClose]);

  // Lazy fetch with stale-while-revalidate
  const fetchTestnetDetails = useCallback(async () => {
    if (!testnetSlug) return;
    
    // Check cache first
    const cached = cache.get(testnetSlug);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTestnet(cached.data);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/testnets/${testnetSlug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch testnet details');
      }
      
      const data: TestnetFull = await response.json();
      
      // Update cache
      cache.set(testnetSlug, { data, timestamp: Date.now() });
      
      setTestnet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [testnetSlug]);

  // Fetch when slug changes
  useEffect(() => {
    if (isOpen && testnetSlug) {
      fetchTestnetDetails();
    }
  }, [isOpen, testnetSlug, fetchTestnetDetails]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform" data-testid="testnet-drawer">
        <div 
          ref={drawerRef}
          className="h-full flex flex-col overflow-hidden"
          tabIndex={-1}
          aria-labelledby="drawer-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 id="drawer-title" className="text-xl font-semibold text-gray-900">
              {testnet ? testnet.name : 'Testnet Details'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12" role="alert" aria-live="assertive">
                <p className="text-red-600 mb-4 font-semibold">Error loading testnet details</p>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchTestnetDetails} variant="outline">
                  Retry
                </Button>
              </div>
            )}

            {testnet && !loading && (
              <div className="space-y-6">
                {/* Overview Section */}
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {testnet.logoUrl ? (
                        <img 
                          className="h-16 w-16 rounded-full object-cover" 
                          src={testnet.logoUrl} 
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-lg font-medium text-gray-500">
                            {testnet.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{testnet.name}</h3>
                      <p className="text-gray-600">{testnet.network || 'Unknown Network'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${statusColors[testnet.status]} border`}>
                      {testnet.status}
                    </Badge>
                    <Badge className={difficultyColors[testnet.difficulty]}>
                      {testnet.difficulty}
                    </Badge>
                    {testnet.tags?.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {testnet.shortDescription && (
                    <p className="text-gray-700 mb-4">{testnet.shortDescription}</p>
                  )}

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" aria-hidden="true" />
                      Est. Time: {formatTime(testnet.estTimeMinutes)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" aria-hidden="true" />
                      Reward: {testnet.rewardType || 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className={`h-4 w-4 mr-2 ${testnet.kycRequired ? 'text-red-500' : 'text-green-500'}`} aria-hidden="true" />
                      KYC: {testnet.kycRequired ? 'Required' : 'Not Required'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                      Tasks: {testnet.tasksCount}
                    </div>
                  </div>
                </div>

                {/* Funding Section */}
                {testnet.totalRaisedUSD && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Funding</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Total Funding</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(testnet.totalRaisedUSD)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Links Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Links</h4>
                  <div className="space-y-3">
                    {testnet.websiteUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(testnet.websiteUrl, '_blank')}
                      >
                        <Globe className="h-4 w-4 mr-2" aria-hidden="true" />
                        Website
                        <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
                      </Button>
                    )}
                    {testnet.githubUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(testnet.githubUrl, '_blank')}
                      >
                        <Github className="h-4 w-4 mr-2" aria-hidden="true" />
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
                      </Button>
                    )}
                    {testnet.twitterUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(testnet.twitterUrl, '_blank')}
                      >
                        <Twitter className="h-4 w-4 mr-2" aria-hidden="true" />
                        Twitter
                        <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
                      </Button>
                    )}
                    {testnet.discordUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(testnet.discordUrl, '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                        Discord
                        <ExternalLink className="h-3 w-3 ml-auto" aria-hidden="true" />
                      </Button>
                    )}
                  </div>

                  {/* Dashboard CTA - only if dashboardUrl exists */}
                  {testnet.hasDashboard && testnet.dashboardUrl && (
                    <div className="mt-4">
                      <Button 
                        className="w-full"
                        onClick={() => window.open(testnet.dashboardUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                        Open Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Discord Roles Section - only if roles exist */}
                {testnet.discordRoles && Array.isArray(testnet.discordRoles) && testnet.discordRoles.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Discord Roles</h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {testnet.discordRoles.map((role: any, index: number) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {role.role || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {role.requirement || '—'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {role.perks || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Getting Started Section - only if steps exist */}
                {testnet.gettingStarted && Array.isArray(testnet.gettingStarted) && testnet.gettingStarted.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h4>
                    <div className="space-y-3">
                      {testnet.gettingStarted.map((step: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="text-sm text-gray-700">
                            {typeof step === 'string' ? step : JSON.stringify(step)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks Section - only if tasks exist */}
                {testnet.tasks && Array.isArray(testnet.tasks) && testnet.tasks.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h4>
                    <div className="space-y-3">
                      {testnet.tasks.map((task: any) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4">
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              {task.reward && (
                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                  <DollarSign className="h-3 w-3" aria-hidden="true" /> {task.reward}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" aria-hidden="true" /> Step {typeof task.order === 'number' ? task.order + 1 : '—'}
                              </span>
                              {task.url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(task.url, '_blank')}
                                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                                >
                                  View task <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}