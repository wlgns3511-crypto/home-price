import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: 'Disclaimer', description: `Disclaimer for ${c.name}.`, alternates: { canonical: '/disclaimer/' } };

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">General</h2>
      <p>Information on {c.name} is for general informational purposes only.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Not Professional Advice</h2>
      <p>Content does not constitute professional advice. Consult a qualified professional.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Data Accuracy</h2>
      <p>Data is from {c.dataSource.name}. It may contain errors or be outdated.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Advertising</h2>
      <p>{c.name} displays ads through Google AdSense. We are not responsible for ad content.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>{c.name} shall not be liable for any damages arising from use of this website.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Concerns? Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>
    </article>
  );
}
