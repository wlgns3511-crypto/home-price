import type { StateData } from './states-data';

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function generateStateInsights(state: StateData, allStates: StateData[]): string[] {
  const insights: string[] = [];
  const total = allStates.length;

  // 1. Price rank
  const sortedByPrice = [...allStates].sort((a, b) => b.medianHomePrice - a.medianHomePrice);
  const rank = sortedByPrice.findIndex(s => s.slug === state.slug) + 1;
  const avgPrice = Math.round(allStates.reduce((s, st) => s + st.medianHomePrice, 0) / total);
  const diffPct = ((state.medianHomePrice - avgPrice) / avgPrice) * 100;

  if (rank <= 5) {
    insights.push(`${state.name} ranks #${rank} out of ${total} states by median home price at ${fmtCurrency(state.medianHomePrice)}, making it one of the most expensive housing markets in the nation — ${Math.abs(diffPct).toFixed(0)}% above the national average of ${fmtCurrency(avgPrice)}.`);
  } else if (rank > total - 5) {
    insights.push(`With a median home price of ${fmtCurrency(state.medianHomePrice)}, ${state.name} ranks #${rank} out of ${total} states — one of the most affordable markets at ${Math.abs(diffPct).toFixed(0)}% below the national average of ${fmtCurrency(avgPrice)}.`);
  } else {
    insights.push(`${state.name}'s median home price of ${fmtCurrency(state.medianHomePrice)} ranks #${rank} out of ${total} states, sitting ${Math.abs(diffPct).toFixed(0)}% ${diffPct > 0 ? 'above' : 'below'} the national average of ${fmtCurrency(avgPrice)}.`);
  }

  // 2. Year-over-year trend
  const avgYoy = allStates.reduce((s, st) => s + st.yoyChange, 0) / total;
  if (state.yoyChange > avgYoy + 2) {
    insights.push(`Home prices in ${state.name} grew ${state.yoyChange >= 0 ? '+' : ''}${state.yoyChange.toFixed(1)}% year-over-year, significantly outpacing the national average of +${avgYoy.toFixed(1)}% — a sign of strong demand or limited inventory.`);
  } else if (state.yoyChange < avgYoy - 2) {
    insights.push(`Year-over-year price growth of ${state.yoyChange >= 0 ? '+' : ''}${state.yoyChange.toFixed(1)}% in ${state.name} lags behind the national average of +${avgYoy.toFixed(1)}%, potentially indicating a cooling market or increased supply.`);
  } else {
    insights.push(`Home prices in ${state.name} changed by ${state.yoyChange >= 0 ? '+' : ''}${state.yoyChange.toFixed(1)}% year-over-year, roughly in line with the national average of +${avgYoy.toFixed(1)}%.`);
  }

  // 3. Affordability context
  const affordLabel = state.affordabilityIndex >= 60 ? 'affordable' : state.affordabilityIndex >= 40 ? 'moderately affordable' : 'expensive';
  const avgAfford = Math.round(allStates.reduce((s, st) => s + st.affordabilityIndex, 0) / total);
  insights.push(`${state.name}'s affordability index of ${state.affordabilityIndex}/100 rates the state as "${affordLabel}" for homebuyers, compared to the national average index of ${avgAfford}/100.`);

  // 4. Dollar comparison for typical buyer
  const downPayment20 = Math.round(state.medianHomePrice * 0.2);
  const monthlyEst = Math.round((state.medianHomePrice * 0.8) * (0.065 / 12) / (1 - Math.pow(1 + 0.065 / 12, -360)));
  insights.push(`A 20% down payment on the median ${state.name} home requires ${fmtCurrency(downPayment20)}, with an estimated monthly mortgage payment of roughly ${fmtCurrency(monthlyEst)} at current rates (P&I only, before taxes and insurance).`);

  // 5. Peer states by price
  const currentIdx = sortedByPrice.findIndex(s => s.slug === state.slug);
  const peers = sortedByPrice
    .filter((_, i) => i !== currentIdx && Math.abs(i - currentIdx) <= 2)
    .slice(0, 3);
  if (peers.length >= 2) {
    insights.push(`States with similar median home prices include ${peers.map(p => `${p.name} (${fmtCurrency(p.medianHomePrice)})`).join(' and ')}, making these relevant benchmarks for cross-state housing comparisons.`);
  }

  // 6. Top cities context
  if (state.topCities.length >= 3) {
    insights.push(`The most active housing markets in ${state.name} include ${state.topCities.slice(0, 3).join(', ')}, and ${state.topCities[3] || state.topCities[2]} — where prices, inventory, and demand can vary significantly from the statewide median.`);
  }

  return insights;
}
