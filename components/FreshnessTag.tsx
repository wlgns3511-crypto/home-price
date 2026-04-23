"use client";

import { siteConfig } from "@/site.config";
import { getDataVintageLabel, getReviewedAt, getReviewedBy } from "@/lib/seo";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function FreshnessTag({
  source,
  reviewedAt,
  reviewedBy,
  dataVintage,
}: {
  source: string;
  reviewedAt?: string;
  reviewedBy?: string;
  dataVintage?: string;
}) {
  const effectiveReviewedAt = reviewedAt ?? getReviewedAt();
  const effectiveReviewedBy = reviewedBy ?? getReviewedBy();
  const effectiveDataVintage = dataVintage ?? getDataVintageLabel();
  const methodologyUrl = siteConfig.methodologyUrl ?? "/methodology/";

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 mb-4 flex-wrap">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verified data</span>
      {effectiveReviewedAt && (
        <span>Data verified: <time dateTime={effectiveReviewedAt}>{formatDate(effectiveReviewedAt)}</time>
        </span>
      )}
      <span className="text-slate-300">·</span>
      <span>Data verified by: {effectiveReviewedBy}</span>
      <span className="text-slate-300">·</span>
      <span>Data vintage: {effectiveDataVintage}</span>
      <span className="text-slate-300">·</span>
      <span>Source: {source}</span>
      <span className="text-slate-300">·</span>
      <a href={methodologyUrl} className="underline underline-offset-2 hover:text-slate-700">
        Methodology
      </a>
    </div>
  );
}
