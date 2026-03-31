import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: 'Terms of Service', description: `Terms of service for ${c.name}.` };

export default function TermsPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
      <p>By accessing {c.domain}, you agree to these Terms.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Use of the Website</h2>
      <p>{c.name} provides data for informational and educational purposes only.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Accuracy</h2>
      <p>We make no warranties regarding completeness or reliability of content.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Intellectual Property</h2>
      <p>Content, design, and layout are protected by copyright.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of Liability</h2>
      <p>{c.name} shall not be liable for any damages arising from use of the website.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Questions? Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>contact page</a>.</p>
    </article>
  );
}
