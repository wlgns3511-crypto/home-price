import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

const c = siteConfig;
export const metadata: Metadata = { title: 'Contact Us', description: `Get in touch with ${c.name}.`, alternates: { canonical: '/contact/' },
  openGraph: { url: "/contact/" },
};

export default function ContactPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className={`text-3xl font-bold text-${c.colors.primary}-700 mb-6`}>Contact Us</h1>
      <p>We would love to hear from you.</p>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Get in Touch</h2>
        <p><strong>Email:</strong> <a href={`mailto:contact@${c.domain}`} className={`text-${c.colors.primary}-600 hover:underline`}>contact@{c.domain}</a></p>
        <p className="text-sm text-slate-500 mt-4">We typically respond within 1-2 business days.</p>
      </div>
      <p className="mt-8">{c.name} is part of the <a href="https://datapeekfacts.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">DataPeek Facts</a> network.</p>
    </article>
  );
}
