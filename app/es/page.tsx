import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getTopItems, getCategories, getCount } from '@/lib/db';
import { getDictionarySync } from '@/lib/i18n';
import { datasetSchema } from '@/lib/schema';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;
const t = getDictionarySync('es');

export const metadata: Metadata = {
  title: `${c.name} — ${t.home_prices} en 500+ Ciudades del Mundo`,
  description: `Compara precios de vivienda, alquiler y accesibilidad en 500+ ciudades del mundo. Precio por m², comprar vs alquilar, y calculadoras hipotecarias.`,
  alternates: {
    canonical: '/es/',
    languages: { en: '/', es: '/es/' },
  },
  openGraph: { title: `${c.name} — ${t.home_prices}`, description: `Compara precios de vivienda, alquiler y accesibilidad en 500+ ciudades.`, url: '/es/' },
};

export default function EsHomePage() {
  const items = getTopItems(50);
  const categories = getCategories();
  const total = getCount();

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(c.name, `Compara precios de vivienda, alquiler y accesibilidad en 500+ ciudades del mundo con datos actualizados`, '/es/')) }} />
      <h1 className="text-3xl font-bold mb-2">{t.home_prices}</h1>
      <p className="text-lg text-slate-600 mb-8">Compara precios de vivienda, alquiler y accesibilidad en 500+ ciudades del mundo.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          <div className="text-sm text-slate-500">{t.city}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{categories.length}</div>
          <div className="text-sm text-slate-500">{t.country}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{c.dataSource.year}</div>
          <div className="text-sm text-slate-500">{t.data_source}</div>
        </div>
      </div>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Explorar por {t.country}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <a key={cat.category} href={`/es/country/${encodeURIComponent(cat.category.toLowerCase().replace(/\s+/g, '-'))}/`}
                className={`px-3 py-1 rounded-full text-sm border border-slate-200 hover:bg-${c.colors.primary}-50`}>
                {cat.category} ({cat.count})
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-3">{t.city} Populares</h2>
        <div className="border rounded-lg overflow-hidden">
          {items.map((item, i) => (
            <a key={String(item[c.entity.slugColumn])} href={`/es/${item[c.entity.slugColumn]}/`}
              className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
              <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(item[c.entity.nameColumn])}</span>
            </a>
          ))}
        </div>
      </section>
      <CrossSiteLinks current={c.name} />
    </div>
  );
}
