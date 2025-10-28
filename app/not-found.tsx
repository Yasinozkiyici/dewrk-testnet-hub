import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-[var(--ink-1)]">404</h1>
      <p className="mt-4 text-lg text-[var(--ink-2)]">
        The page you're looking for doesn't exist.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-[var(--mint)] px-6 py-3 text-sm font-semibold text-[var(--ink-1)] shadow-glass transition hover:bg-[var(--aqua)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
      >
        Back to Home
      </Link>
    </div>
  );
}

