"use client";
import { useEffect, useRef } from "react";
import { siteConfig } from '@/site.config';

export function AdSlot({ id, className = "" }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      if (ref.current) ref.current.style.display = "none";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`ad-slot my-6 ${className}`}
      data-ad-slot={id}
      style={{ minHeight: "250px", contain: "layout" }}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client={siteConfig.adsenseId}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
