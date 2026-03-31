export function formatNumber(num: number | null): string {
  if (num == null) return 'N/A';
  return num.toLocaleString('en-US');
}

export function formatCurrency(amount: number | null): string {
  if (amount == null) return 'N/A';
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatCurrencyCompact(amount: number | null): string {
  if (amount == null) return 'N/A';
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString('en-US')}`;
}

export function formatPercent(value: number | null, decimals = 1): string {
  if (value == null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

export function formatDecimal(value: number | null, decimals = 2): string {
  if (value == null) return 'N/A';
  return value.toFixed(decimals);
}

export function getDataYear(): number {
  return new Date().getFullYear();
}
