import { useEffect, useState, useRef } from 'react';

export function useStickyHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const scrolled = scrollY > 4;
        const compact = scrollY > 24;

        setIsScrolled(scrolled);
        setIsCompact(compact);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { isScrolled, isCompact };
}

