"use client";

export function FreshnessTag({ source }: { source: string }) {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" });
  const day = now.getDate();
  const year = now.getFullYear();

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 mb-4">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Live Data
      </span>
      <span>Last updated: <time dateTime={now.toISOString().split("T")[0]}>{month} {day}, {year}</time></span>
      <span className="text-slate-300">·</span>
      <span>Source: {source}</span>
    </div>
  );
}
