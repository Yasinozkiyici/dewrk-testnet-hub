'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TestnetDetailDrawer } from '@/components/testnets/TestnetDetailDrawer';

export function TestnetDrawerPortal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('slug');
    const basePath = pathname ?? '/testnets';
    const query = params.toString();
    router.replace(query ? `${basePath}?${query}` as any : basePath, { scroll: false });
  };

  return <TestnetDetailDrawer slug={slug} open={Boolean(slug)} onClose={handleClose} />;
}
