'use client';

import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TestnetGrid } from '@/components/testnets/TestnetGrid';
import { ExportButton } from '@/components/testnets/ExportButton';
import type { TestnetListRow } from '@/components/testnets/types';

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface TestnetsTableProps {
  testnets: TestnetListRow[];
  pagination?: PaginationMeta | null;
}

function TestnetsTableContent({ testnets, pagination }: TestnetsTableProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get('slug');
  const router = useRouter();
  const pathname = usePathname();

  const total = pagination?.total ?? testnets.length;
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(nextPage));
    }
    params.delete('slug');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  // Sayfa numaralarını hesapla (maksimum 7 sayfa göster)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Tüm sayfaları göster
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // İlk sayfa
      pages.push(1);
      
      if (currentPage <= 4) {
        // Başta
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Sonda
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Ortada
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between text-xs">
        <p className="text-[var(--ink-3)]">
          <span className="font-semibold text-[var(--ink-1)]">{total}</span>{' '}
          {total === 1 ? 'testnet' : 'testnets'}
          {pagination && totalPages > 1 && (
            <span className="ml-2 text-[var(--ink-3)]">
              (Sayfa {currentPage} / {totalPages})
            </span>
          )}
        </p>
        <ExportButton data={testnets} />
      </div>
      <TestnetGrid rows={testnets} />
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              changePage(currentPage - 1);
            }}
            disabled={!canGoBack}
            className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/70 hover:bg-white hover:text-[var(--ink-1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-2 text-xs text-[var(--ink-3)]">
                    ...
                  </span>
                );
              }
              
              const pageNum = page as number;
              const isActive = pageNum === currentPage;
              
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    changePage(pageNum);
                  }}
                  className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'border-white/70 bg-white text-[var(--ink-1)]'
                      : 'border-white/50 bg-white/70 text-[var(--ink-2)] hover:border-white/70 hover:bg-white hover:text-[var(--ink-1)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              changePage(currentPage + 1);
            }}
            disabled={!canGoForward}
            className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/70 hover:bg-white hover:text-[var(--ink-1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export function TestnetsTable({ testnets, pagination }: TestnetsTableProps) {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-white/30 bg-white/70 p-8 text-center text-sm text-[var(--ink-3)]">Loading...</div>}>
      <TestnetsTableContent testnets={testnets} pagination={pagination} />
    </Suspense>
  );
}

export type { TestnetListRow };
