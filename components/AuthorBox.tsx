import { siteConfig } from '@/site.config';
import {
  EDITORIAL_TEAM,
  PUBLISHER,
  SOURCE_AUTHORITIES,
  ABOUT_REVIEWED,
  METHODOLOGY_REVIEWED,
  ENTITY_VINTAGE,
  LEGAL_REVIEWED,
  SITE_REBUILT,
} from '@/lib/authorship';

type Layer = 'site' | 'city' | 'state' | 'country' | 'methodology' | 'about' | 'blog' | 'legal';

const LAYER_VINTAGE: Record<Layer, string> = {
  site: SITE_REBUILT,
  city: ENTITY_VINTAGE,
  state: ENTITY_VINTAGE,
  country: ENTITY_VINTAGE,
  methodology: METHODOLOGY_REVIEWED,
  about: ABOUT_REVIEWED,
  blog: SITE_REBUILT,
  legal: LEGAL_REVIEWED,
};

interface AuthorBoxProps {
  layer?: Layer;
}

export function AuthorBox({ layer = 'site' }: AuthorBoxProps) {
  const reviewed = LAYER_VINTAGE[layer];
  const primarySources = SOURCE_AUTHORITIES.slice(0, 3);

  return (
    <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm">{EDITORIAL_TEAM.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            Part of the{' '}
            <a href={PUBLISHER.url} className="text-slate-700 hover:underline" rel="noopener">
              {PUBLISHER.name}
            </a>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        {siteConfig.name} is published by an editorial team that audits public housing-data sources
        directly: figures on this page are anchored to{' '}
        {primarySources.map((s, i) => (
          <span key={s.name}>
            <a href={s.url} className="text-slate-700 underline hover:text-slate-900" rel="noopener">
              {s.name}
            </a>
            {i < primarySources.length - 1 ? ', ' : ' '}
          </span>
        ))}
        and named national statistics offices on each surface. Where a value is derived (price-to-
        income, buy-vs-rent crossover, mortgage-rate sensitivity), the formula is documented on{' '}
        <a href="/methodology/" className="underline underline-offset-2 hover:text-slate-900">
          /methodology/
        </a>
        .
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>
          Section reviewed: <time dateTime={reviewed}>{reviewed}</time>
        </span>
        <span className="text-slate-300">·</span>
        <a
          href="https://datapeekfacts.com/editorial-policy/"
          className="underline underline-offset-2 hover:text-slate-900"
          rel="noopener"
        >
          Editorial policy
        </a>
        <span className="text-slate-300">·</span>
        <a href="/methodology/" className="underline underline-offset-2 hover:text-slate-900">
          Methodology
        </a>
        <span className="text-slate-300">·</span>
        <a href="/contact/" className="underline underline-offset-2 hover:text-slate-900">
          Send a correction
        </a>
      </div>
    </div>
  );
}
