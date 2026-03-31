'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Something went wrong</h1>
      <p className="text-slate-500 mb-8">An error occurred while loading this page.</p>
      <button onClick={reset} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
        Try again
      </button>
    </div>
  );
}
