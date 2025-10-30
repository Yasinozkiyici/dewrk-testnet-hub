'use client';

import { useState, useEffect, useRef } from 'react';
import { UtilityStrip } from './UtilityStrip';
import { MainHeader } from './MainHeader';
import { usePathname } from 'next/navigation';
import { TrendingUp, Zap, Clock } from 'lucide-react';

export function Header() {
  const [compact, setCompact] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Sticky compact behavior
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isCompact = window.scrollY > 24;
          setCompact(isCompact);
          
          // Update header's data-compact attribute
          const headerEl = document.querySelector('header[data-compact]');
          if (headerEl) {
            headerEl.setAttribute('data-compact', isCompact.toString());
            
            // Adjust height
            const headerContent = headerEl.querySelector('div');
            if (headerContent) {
              headerContent.style.height = isCompact ? '2.75rem' : '3.5rem';
            }
            
            // Adjust logo size
            const logo = headerEl.querySelector('svg');
            if (logo) {
              logo.style.transform = isCompact ? 'scale(0.9)' : 'scale(1)';
              logo.style.transition = 'transform 150ms ease-out';
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock stats - this should come from API
  const stats = [
    { icon: <Zap className="h-3 w-3" />, value: '4', label: 'Total Programs' },
    { icon: <TrendingUp className="h-3 w-3" />, value: '3', label: 'Live' },
    { icon: <Clock className="h-3 w-3" />, value: '2.7h', label: 'Avg Est. Time' }
  ];

  return (
    <>
      <UtilityStrip stats={stats} compact={compact} />
      <MainHeader />
    </>
  );
}

