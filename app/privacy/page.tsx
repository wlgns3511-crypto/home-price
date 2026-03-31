import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: 'Privacy Policy', description: `Privacy policy for ${c.name}.` };

export default function PrivacyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last updated: March 2026</p>
      <p>{c.name} operates {c.domain}. This page informs you of our policies regarding personal information.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Information We Collect</h2>
      <p>We do not require accounts. We may collect IP address, browser type, and pages viewed through analytics.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>
      <p>Our website uses cookies for experience improvement and traffic analysis.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Google AdSense</h2>
      <p>We use Google AdSense for advertisements. Opt out at <a href="https://www.google.com/settings/ads" className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>
      <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
      <p>Questions? Visit our <a href="/contact" className={`text-${c.colors.primary}-600 hover:underline`}>Contact page</a>.</p>
      <p className="mt-8">{c.name} is part of the <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">DataPeek Facts</a> network.</p>
    </article>
  );
}
