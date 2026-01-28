'use client';

import { useEffect } from 'react';

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Storefront error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-500 mb-6">
          There was an error loading this store. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#0054A6] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
