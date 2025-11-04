import { ReactNode } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';

/**
 * Admin Panel Layout
 * 
 * Wraps all admin routes with consistent sidebar navigation and breadcrumbs.
 * Handles authentication at the layout level.
 */
export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

