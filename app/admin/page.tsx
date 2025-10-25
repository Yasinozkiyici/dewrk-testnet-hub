import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/db';
import { Editor } from './Editor';

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
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-14">
      <aside className="sticky top-24 h-fit w-64 shrink-0 rounded-3xl border border-white/40 bg-white/70 p-4 text-sm text-[var(--ink-2)] shadow-glass">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
          Admin
        </div>
        <Link
          href="/admin"
          className="mb-2 block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          Create new testnet
        </Link>
        <div className="mt-4 space-y-1" data-testid="testnet-list">
          {testnets.map((item) => (
            <Link
              key={item.id}
              href={`/admin?slug=${item.slug}`}
              className="block rounded-xl px-3 py-2 text-xs text-[var(--ink-2)] transition hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </aside>
      <main className="flex-1">
        <Editor initialTestnet={selected} />
      </main>
    </div>
  );
}
