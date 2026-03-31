import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllSlugs().slice(0, 50).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) return {};
  const name = String(item[c.entity.nameColumn]);
  return {
    title: `${name} - ${c.entity.labelSingular} Data & Details`,
    description: `Explore detailed data about ${name}. Compare, analyze, and discover insights.`,
    alternates: { canonical: `/${c.entity.slug}/${slug}` },
  };
}

export default async function EntityDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) notFound();

  const name = String(item[c.entity.nameColumn]);
  const category = c.entity.categoryColumn ? String(item[c.entity.categoryColumn] || '') : '';
  const related = category ? getRelated(category, slug, 6) : [];

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: c.entity.label, url: `/${c.entity.slug}/` },
    { name, url: `/${c.entity.slug}/${slug}` },
  ];

  const faqs = [
    { question: `What is ${name}?`, answer: `${name} is a ${c.entity.labelSingular.toLowerCase()} in our database with detailed data and statistics.` },
    { question: `Where does the data for ${name} come from?`, answer: `Our data is sourced from ${c.dataSource.name} (${c.dataSource.year}).` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(c => ({ label: c.name, href: c.url }))} />

      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      {category && <p className="text-sm text-slate-500 mb-4">Category: {category}</p>}

      <FreshnessTag source={c.dataSource.name} />

      <AdSlot id="top" />

      {/* ── Main Data Section ────────────────────────────── */}
      <section className="mt-6 border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Data Overview</h2>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(item).map(([key, value]) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ')}</td>
                <td className="py-2 text-right">{String(value ?? 'N/A')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Why It Matters ───────────────────────────────── */}
      <InsightBox
        title={name}
        insight={`This data helps you understand how ${name} compares to others in the same category. Use it to make informed decisions based on real, verified data from ${c.dataSource.name}.`}
      />

      {/* ── Related Items ────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Related {c.entity.label}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.map(r => (
              <a key={String(r[c.entity.slugColumn])} href={`/${c.entity.slug}/${r[c.entity.slugColumn]}/`}
                className={`block p-3 border rounded-lg hover:bg-${c.colors.primary}-50 text-sm font-medium text-${c.colors.primary}-700`}>
                {String(r[c.entity.nameColumn])}
              </a>
            ))}
          </div>
        </section>
      )}

      <AdSlot id="bottom" />
      <DataSourceBadge />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
