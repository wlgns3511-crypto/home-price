import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/site.config';
import { buildLocaleAlternates, getMethodologyUrl } from '@/lib/seo';
import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const c = siteConfig;
const SITE_URL = `https://${c.domain}`;

export const metadata: Metadata = {
  title: { default: `${c.name} - ${c.description}`, template: `%s | ${c.name}` },
  description: c.description,
  metadataBase: new URL(SITE_URL),
  alternates: buildLocaleAlternates('/'),
  openGraph: { type: 'website', siteName: c.name, locale: c.locale.replace('-', '_') },
  twitter: { card: 'summary_large_image' },
  other: { 'google-adsense-account': 'ca-pub-5724806562146685' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const searchAction = {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  };
  const schemaGraph = [
    {
      '@type': 'WebSite',
      name: c.name,
      url: SITE_URL,
      description: c.description,
      inLanguage: c.locale,
      potentialAction: searchAction,
    },
    {
      '@type': 'Organization',
      name: c.name,
      url: SITE_URL,
      description: c.description,
              "parentOrganization": {
                "@type": "Organization",
                "name": "DataPeek Research Network",
                "url": "https://datapeekfacts.com"
              }
            },
  ];
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${c.gaId}`} />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${c.gaId}');` }} />
        <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${c.adsenseId}`} crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': schemaGraph.filter(Boolean),
        }) }} />
      </head>
      <body className={`${inter.className} antialiased bg-white text-slate-900 min-h-screen flex flex-col`}>
        <UpgradeAnalytics />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:border focus:rounded">Skip to content</a>
        <header className="border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className={`text-xl font-bold text-${c.colors.primary}-600`}>{c.name}</a>
            <nav className="flex gap-4 text-sm">
              <a href={`/${c.entity.slug}/`} className="text-slate-600 hover:text-slate-900">{c.entity.label}</a>
              <a href="/state/" className="text-slate-600 hover:text-slate-900">By State</a>
              {/* 2026-04-28 — 'Compare' nav 제거 (AdSense scaled-content remediation).
                  /compare/* 트리는 4/18 doorway-thin 판단으로 noindex 처리됨.
                  Sitewide layout 링크는 모든 indexable 페이지에 박히므로 AdSense
                  리뷰어가 noindex 트리로 직행. 직접 URL 입력 시엔 페이지 그대로 작동. */}
              <a href="/search/" className="text-slate-600 hover:text-slate-900">Search</a>
              <a href="/guide/" className="text-slate-600 hover:text-slate-900">Guides</a>
              <a href="/blog/" className="text-slate-600 hover:text-slate-900">Articles</a>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">{children}</main>

        <footer className="border-t border-slate-200 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
            <p className="mb-2">
              <a href="/about/" className={`hover:text-${c.colors.primary}-600`}>About</a>
              {' | '}
              <a href="/privacy/" className={`hover:text-${c.colors.primary}-600`}>Privacy</a>
              {' | '}
              <a href="/terms/" className={`hover:text-${c.colors.primary}-600`}>Terms</a>
              {' | '}
              <a href="/disclaimer/" className={`hover:text-${c.colors.primary}-600`}>Disclaimer</a>
              {' | '}
              <a href={getMethodologyUrl()} className={`hover:text-${c.colors.primary}-600`}>Methodology</a>
              {' | '}
              <a href="/editorial-policy/" className={`hover:text-${c.colors.primary}-600`}>Editorial Policy</a>
              {' | '}
              <a href="/corrections-policy/" className={`hover:text-${c.colors.primary}-600`}>Corrections</a>
              {' | '}
              <a href="/contact/" className={`hover:text-${c.colors.primary}-600`}>Contact</a>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Other Free Tools</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <a href="https://homeloanpeek.com" className={`hover:text-${c.colors.primary}-600`} rel="nofollow noopener">Home Loans</a>
                <a href="https://fairrentwize.com" className={`hover:text-${c.colors.primary}-600`} rel="nofollow noopener">Fair Rents</a>
                <a href="https://propertytaxpeek.com" className={`hover:text-${c.colors.primary}-600`} rel="nofollow noopener">Property Tax</a>
                <a href="https://costbycity.com" className={`hover:text-${c.colors.primary}-600`} rel="nofollow noopener">Cost of Living</a>
                <a href="https://farmlandwize.com" className={`hover:text-${c.colors.primary}-600`} rel="nofollow noopener">Farmland Values</a>
              </div>
            </div>
            <p className="mt-3 text-xs italic text-slate-400">Real estate data made accessible for homebuyers and researchers.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} {c.name} &mdash; Free public data tool.</p>
            <p className="text-xs mt-1">
              Powered by data from <a href={c.dataSource.url} className={`text-${c.colors.primary}-600 hover:underline`} target="_blank" rel="noopener noreferrer">{c.dataSource.name}</a>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
