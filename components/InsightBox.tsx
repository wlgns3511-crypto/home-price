import { siteConfig } from '@/site.config';

const c = siteConfig;

export function InsightBox({ title, insight }: { title: string; insight: string }) {
  return (
    <div className={`my-6 p-4 bg-${c.colors.accent}-50 border-l-4 border-${c.colors.accent}-500 rounded-r-lg`}>
      <h3 className={`text-sm font-bold text-${c.colors.accent}-800 mb-1`}>
        💡 Why it matters: {title}
      </h3>
      <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
    </div>
  );
}
