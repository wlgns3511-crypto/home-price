import { getRankByField, getNationalMedianPrice } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';

interface Props {
  price: number;
  change: number;
  medianIncome: number;
  cityName: string;
}

export function InsightCards({ price, change, medianIncome, cityName }: Props) {
  const priceRank = getRankByField('avg_home_price_usd', price, 'desc');
  const nationalMedian = getNationalMedianPrice();

  // Affordability ratio: price / income
  const affordRatio = medianIncome > 0 ? price / medianIncome : null;
  const affordLabel = affordRatio
    ? affordRatio > 15 ? 'Severely Unaffordable'
      : affordRatio > 10 ? 'Seriously Unaffordable'
      : affordRatio > 5 ? 'Moderately Unaffordable'
      : 'Affordable'
    : null;

  // Price trend
  const trendLabel = change > 10 ? 'Rapidly Rising' : change > 3 ? 'Growing' : change > 0 ? 'Stable Growth' : change > -3 ? 'Cooling' : 'Declining';

  // vs national
  const vsNational = nationalMedian && nationalMedian > 0
    ? ((price - nationalMedian) / nationalMedian) * 100
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {/* Price Rank */}
      <div className="rounded-xl border p-4 border-blue-200 bg-blue-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price Rank</div>
        <div className="text-2xl font-bold text-blue-700 mb-1">#{priceRank.rank} <span className="text-base font-normal text-slate-400">of {priceRank.total}</span></div>
        <p className="text-sm text-slate-600 leading-snug">{cityName} ranks #{priceRank.rank} most expensive out of {priceRank.total} cities worldwide.</p>
      </div>

      {/* Affordability Ratio */}
      {affordRatio != null && (
        <div className="rounded-xl border p-4 border-blue-200 bg-blue-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Affordability</div>
          <div className={`text-2xl font-bold mb-1 ${affordRatio > 10 ? 'text-red-600' : 'text-blue-700'}`}>{affordRatio.toFixed(1)}x</div>
          <p className="text-sm text-slate-600 leading-snug">{affordLabel} — home price is {affordRatio.toFixed(1)}x the median income ({formatCurrency(medianIncome)}).</p>
        </div>
      )}

      {/* Price Trend */}
      <div className="rounded-xl border p-4 border-blue-200 bg-blue-50">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price Trend</div>
        <div className={`text-2xl font-bold mb-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </div>
        <p className="text-sm text-slate-600 leading-snug">{trendLabel} — prices changed {formatPercent(Math.abs(change))} over the past year.</p>
      </div>

      {/* vs National Median */}
      {vsNational != null && (
        <div className="rounded-xl border p-4 border-blue-200 bg-blue-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">vs Global Median</div>
          <div className={`text-2xl font-bold mb-1 ${vsNational > 0 ? 'text-red-600' : 'text-blue-700'}`}>
            {vsNational > 0 ? '+' : ''}{vsNational.toFixed(0)}%
          </div>
          <p className="text-sm text-slate-600 leading-snug">Home prices are {Math.abs(vsNational).toFixed(0)}% {vsNational > 0 ? 'above' : 'below'} the global median of {formatCurrency(Math.round(nationalMedian!))}.</p>
        </div>
      )}
    </div>
  );
}
