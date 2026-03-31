import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/site.config';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const c = siteConfig;
const SITE_URL = `https://${c.domain}`;

export const metadata: Metadata = {
  title: { default: `${c.name} - ${c.description}`, template: `%s | ${c.name}` },
  description: c.description,
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: c.name, locale: c.locale.replace('-', '_') },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={c.lang}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${c.gaId}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${c.gaId}');` }} />
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.adsenseId}`} crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebSite',
              name: c.name,
              url: SITE_URL,
              description: c.description,
              inLanguage: c.locale,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@type': 'Organization',
              name: c.name,
              url: SITE_URL,
              description: c.description,
              sameAs: c.sameAs.filter(u => u !== SITE_URL),
            },
          ],
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className={`text-xl font-bold text-${c.colors.primary}-600`}>{c.name}</a>
            <nav className="flex gap-4 text-sm">
              <a href={`/${c.entity.slug}/`} className="text-slate-600 hover:text-slate-900">{c.entity.label}</a>
              <a href="/search/" className="text-slate-600 hover:text-slate-900">Search</a>
              <a href="/blog/" className="text-slate-600 hover:text-slate-900">Blog</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>

        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p className="mb-2">
              <a href="/about" className={`hover:text-${c.colors.primary}-600`}>About</a>
              {' | '}
              <a href="/privacy" className={`hover:text-${c.colors.primary}-600`}>Privacy</a>
              {' | '}
              <a href="/terms" className={`hover:text-${c.colors.primary}-600`}>Terms</a>
              {' | '}
              <a href="/disclaimer" className={`hover:text-${c.colors.primary}-600`}>Disclaimer</a>
              {' | '}
              <a href="/methodology" className={`hover:text-${c.colors.primary}-600`}>Methodology</a>
              {' | '}
              <a href="/contact" className={`hover:text-${c.colors.primary}-600`}>Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Related Resources</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://datapeekfacts.com" className={`hover:text-${c.colors.primary}-600`}>DataPeek Facts</a>
              </div>
            </div>
            <p className="mt-4">&copy; {new Date().getFullYear()} {c.name}. All rights reserved.</p>
            <p className="text-xs mt-1">
              Data sourced from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
