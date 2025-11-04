import { Suspense, ReactNode } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';

/**
 * Admin Panel Layout
 * 
 * Wraps all admin routes with consistent sidebar navigation and breadcrumbs.
 * Handles authentication at the layout level.
 */
function AdminLayoutContent({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

