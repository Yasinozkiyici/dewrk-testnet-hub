'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { buildLogoCandidates, monogramFor } from '@/lib/logo';
import { cn } from '@/lib/utils';

interface ProjectLogoProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  className?: string;
  size?: number;
  roundedClassName?: string;
}

export function ProjectLogo({
  name,
  slug,
  logoUrl,
  websiteUrl,
  githubUrl,
  className,
  size = 40,
  roundedClassName = 'rounded-xl'
}: ProjectLogoProps) {
  const candidates = useMemo(
    () =>
      buildLogoCandidates({
        primary: logoUrl ?? undefined,
        websiteUrl: websiteUrl ?? undefined,
        githubUrl: githubUrl ?? undefined
      }),
    [logoUrl, websiteUrl, githubUrl]
  );

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIndex(0);
    setLoaded(false);
  }, [candidates.join('|')]);

  const currentSrc = candidates[index];
  const { label, gradient } = useMemo(() => monogramFor(name, slug), [name, slug]);

  if (!currentSrc) {
    return (
      <span
        className={cn(
          'flex items-center justify-center text-xs font-semibold uppercase text-white shadow-sm',
          roundedClassName,
          className
        )}
        style={{
          backgroundImage: gradient,
          width: size,
          height: size
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden border border-white/60 bg-white/70 shadow-sm',
        roundedClassName,
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase text-white transition-opacity',
          loaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundImage: gradient }}
        aria-hidden="true"
      >
        {label}
      </span>
      <Image
        src={currentSrc}
        alt={`${name} logo`}
        fill
        sizes={`${size}px`}
        className={cn('object-contain transition-opacity', loaded ? 'opacity-100' : 'opacity-0')}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (index < candidates.length - 1) {
            setIndex((prev) => prev + 1);
            setLoaded(false);
          } else {
            setLoaded(false);
          }
        }}
      />
    </div>
  );
}
