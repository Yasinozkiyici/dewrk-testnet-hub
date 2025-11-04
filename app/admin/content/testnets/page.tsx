import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { serverGuard } from '@/lib/auth-guards';
import { toAdminTestnetRecord } from '@/lib/admin/testnet-record';
import { Editor } from '../../Editor';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function TestnetsAdminPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const guard = await serverGuard('admin');
  if (guard.redirect) {
    redirect(guard.redirect);
  }

  const slugParam = typeof searchParams.slug === 'string' ? searchParams.slug : undefined;

  const testnets = await prisma.testnet.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { updatedAt: 'desc' }
  });

  const selectedRaw = slugParam
    ? await prisma.testnet.findUnique({
        where: { slug: slugParam },
        include: { tasks: { orderBy: { order: 'asc' } } }
      })
    : null;

  if (slugParam && !selectedRaw) {
    notFound();
  }

  const selected = selectedRaw ? toAdminTestnetRecord(selectedRaw) : null;

  return (
    <div className="flex gap-6">
      {/* Sidebar: Testnet List */}
      <aside className="sticky top-6 h-fit w-64 shrink-0 rounded-2xl border border-white/40 bg-white/80 p-5 shadow-glass">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-1)]">Testnets</h2>
          <span className="rounded-full bg-[var(--mint)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--ink-2)]">
            {testnets.length}
          </span>
        </div>

        <Link
          href="/admin/content/testnets"
          className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--mint)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--aqua)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          + New Testnet
        </Link>

        <div className="mt-4 space-y-1 overflow-y-auto max-h-[600px]" data-testid="testnet-list">
          {testnets.map((item) => (
            <Link
              key={item.id}
              href={`/admin/content/testnets?slug=${item.slug}`}
              className={cn(
                'block rounded-lg px-3 py-2.5 text-sm transition',
                slugParam === item.slug
                  ? 'border border-[var(--mint)]/30 bg-[var(--mint)]/10 font-semibold text-[var(--ink-1)]'
                  : 'text-[var(--ink-2)] hover:bg-white/80 hover:text-[var(--ink-1)]'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {selected ? (
          <Editor initialTestnet={selected} />
        ) : (
          <div className="rounded-2xl border border-white/40 bg-white/80 p-12 text-center shadow-glass">
            <h3 className="text-lg font-semibold text-[var(--ink-1)]">Select a testnet to edit</h3>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Choose a testnet from the sidebar or create a new one.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
