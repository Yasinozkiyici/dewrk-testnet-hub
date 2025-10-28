'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  isLoading?: boolean;
  className?: string;
}

export function LoadingBar({ isLoading = false, className }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }

    setProgress(30);
    const timer = setTimeout(() => setProgress(70), 300);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (progress === 0) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-50 h-0.5 bg-gradient-to-r from-[var(--aqua)] via-[var(--mint)] to-[var(--lilac)]',
        className
      )}
      style={{
        width: `${progress}%`,
        transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.5s ease-in-out'
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading progress"
    />
  );
}

