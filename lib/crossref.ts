import { siteConfig } from '@/site.config';

const NETWORK_SITES = siteConfig.sameAs;

export function getCrossSiteLinks(currentDomain: string, limit = 5) {
  return NETWORK_SITES
    .filter(url => !url.includes(currentDomain))
    .slice(0, limit)
    .map(url => {
      const domain = new URL(url).hostname;
      const name = domain.replace('.com', '').replace(/-/g, ' ');
      return { name, url, domain };
    });
}
