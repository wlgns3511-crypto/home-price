import { siteConfig } from '@/site.config';

const c = siteConfig;

export function AuthorBox() {
  return (
    <div className={`mt-10 flex gap-4 p-5 bg-${c.colors.primary}-50 border-${c.colors.primary}-200 border rounded-xl`}>
      <div className={`flex-shrink-0 w-12 h-12 bg-${c.colors.primary}-100 rounded-full flex items-center justify-center text-2xl`}>
        <span>📊</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">{c.name} Research Team</span>
          <span className={`text-xs px-2 py-0.5 bg-${c.colors.primary}-100 text-${c.colors.primary}-800 rounded-full font-medium`}>Data Specialists</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our team analyzes data from {c.dataSource.name} to deliver accurate, up-to-date information.
          All data is verified and cross-referenced with official sources.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs bg-${c.colors.primary}-100 text-${c.colors.primary}-800 px-2 py-0.5 rounded`}>✓ {c.dataSource.name}</span>
          <span className={`text-xs bg-${c.colors.primary}-100 text-${c.colors.primary}-800 px-2 py-0.5 rounded`}>✓ Updated {c.dataSource.year}</span>
        </div>
      </div>
    </div>
  );
}
