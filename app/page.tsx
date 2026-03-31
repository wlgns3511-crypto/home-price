import { siteConfig } from '@/site.config';
import { getTopItems, getCategories, getCount } from '@/lib/db';

const c = siteConfig;

export default function HomePage() {
  const items = getTopItems(50);
  const categories = getCategories();
  const total = getCount();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{c.name}</h1>
      <p className="text-lg text-slate-600 mb-8">{c.description}</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          <div className="text-sm text-slate-500">{c.entity.label}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{categories.length}</div>
          <div className="text-sm text-slate-500">Categories</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{c.dataSource.year}</div>
          <div className="text-sm text-slate-500">Data Year</div>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <a key={cat.category} href={`/search?q=${encodeURIComponent(cat.category)}`}
                className={`px-3 py-1 rounded-full text-sm border border-slate-200 hover:bg-${c.colors.primary}-50`}>
                {cat.category} ({cat.count})
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-3">Popular {c.entity.label}</h2>
        <div className="border rounded-lg overflow-hidden">
          {items.map((item, i) => (
            <a key={String(item[c.entity.slugColumn])} href={`/${c.entity.slug}/${item[c.entity.slugColumn]}/`}
              className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
              <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(item[c.entity.nameColumn])}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
