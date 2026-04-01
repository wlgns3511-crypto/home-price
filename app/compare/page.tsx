import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getTopItems } from '@/lib/db';

const c = siteConfig;
export const metadata: Metadata = { title: `Compare ${c.entity.label}`, description: `Side-by-side comparison of ${c.entity.label.toLowerCase()}.`, alternates: { canonical: '/compare/' },
  openGraph: { url: "/compare/" },
};

export default function ComparePage() {
  const items = getTopItems(20);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Compare {c.entity.label}</h1>
      <p className="text-slate-600 mb-6">Select two {c.entity.label.toLowerCase()} to compare side by side.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {items.map(item => (
          <div key={String(item[c.entity.slugColumn])} className="border rounded-lg p-3 text-sm text-center hover:bg-slate-50">
            {String(item[c.entity.nameColumn])}
          </div>
        ))}
      </div>
    </div>
  );
}
