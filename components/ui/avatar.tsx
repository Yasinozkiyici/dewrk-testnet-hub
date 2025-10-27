import React, { useState } from 'react';
import Image from 'next/image';
import { generateMonogram, resolveLogo } from '@/lib/logo';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({
  name,
  slug,
  logoUrl,
  websiteUrl,
  githubUrl,
  size = 32,
  className
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveLogo({ logoUrl, websiteUrl, githubUrl, slug, name });
  const monogram = generateMonogram(name, slug);

  const showMonogram = !resolvedUrl || imageError;

  if (showMonogram) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full text-white font-semibold',
          className
        )}
        style={{
          width: size,
          height: size,
          background: monogram.gradient,
          fontSize: size * 0.4
        }}
        aria-label={name}
      >
        {monogram.letters}
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-full bg-white/80', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={resolvedUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className="object-cover"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  );
}

