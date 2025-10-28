'use client';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200/60 bg-red-50/40 p-16 text-center shadow-glass">
      <div className="rounded-full bg-red-100/80 p-6">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <p className="mt-6 text-lg font-semibold text-red-900">
        {message ?? "Couldn't load programs"}
      </p>
      <p className="mt-2 max-w-md text-sm text-red-800/80">
        Something went wrong while loading the data. Please try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-300/60 bg-white px-5 py-2.5 text-sm font-semibold text-red-900 transition hover:border-red-400/60 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Retry
        </button>
      )}
    </div>
  );
}

