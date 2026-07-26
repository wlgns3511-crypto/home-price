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

// 2026-07-26 — 'city' | 'country' 레이어 삭제. 호출부 grep 0건이고(그 페이지들은 같은 날
// 전량 410), 타입이 계속 지원하면 다음 세션이 도시 서피스를 되살려도 타입체커가 안 막는다.
type Layer = 'site' | 'state' | 'methodology' | 'about' | 'blog' | 'legal';

const LAYER_VINTAGE: Record<Layer, string> = {
  site: SITE_REBUILT,
  state: ENTITY_VINTAGE,
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
        {/* 2026-07-26 — "and named national statistics offices on each surface" 삭제. 어떤
            컬럼에도 NSO 데이터가 배선돼 있지 않다(sources.json 15필드 0건). AuthorBox 는 전
            페이지에 렌더되므로 314개 URL 이 같은 거짓을 달고 있었다. 대체는 실배선된 FRED. */}
        and the FRED MORTGAGE30US rate series. Where a value is derived (price-to-
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
