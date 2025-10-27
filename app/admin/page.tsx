import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/db';
import { Editor } from './Editor';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Admin guard middleware
function checkAdminAuth() {
  // Development modunda admin erişimini otomatik olarak ver
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const headersList = headers();
  const adminKey = headersList.get('x-admin-key');
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return false;
  }
  return true;
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  // Check admin authentication
  if (!checkAdminAuth()) {
    return (
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-14">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }
  const slugParam = typeof searchParams.slug === 'string' ? searchParams.slug : undefined;

  const testnets = await prisma.testnet.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { updatedAt: 'desc' }
  });

  const selected = slugParam
    ? await prisma.testnet.findUnique({
        where: { slug: slugParam },
        include: { tasks: { orderBy: { order: 'asc' } } }
      })
    : null;

  if (slugParam && !selected) {
    notFound();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-8">
      {/* Sidebar */}
      <aside className="sticky top-20 h-fit w-64 shrink-0 rounded-2xl border border-white/40 bg-white/80 p-5 shadow-glass">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-1)]">Testnets</h2>
          <span className="rounded-full bg-[var(--mint)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--ink-2)]">
            {testnets.length}
          </span>
        </div>
        
        <Link
          href="/admin"
          className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--mint)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--aqua)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          + New Testnet
        </Link>
        
        <div className="mt-4 space-y-1 overflow-y-auto max-h-[600px]" data-testid="testnet-list">
          {testnets.map((item) => (
            <Link
              key={item.id}
              href={`/admin?slug=${item.slug}`}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm transition",
                slugParam === item.slug
                  ? "bg-[var(--mint)]/10 font-semibold text-[var(--ink-1)] border border-[var(--mint)]/30"
                  : "text-[var(--ink-2)] hover:bg-white/80 hover:text-[var(--ink-1)]"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <Editor initialTestnet={selected} />
      </main>
    </div>
  );
}
