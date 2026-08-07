export function formatCurrency(value) {
  if (value == null) return '$0';
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

export function formatNumber(value) {
  if (value == null) return '0';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Number(value).toLocaleString();
}

export function formatPercent(value, decimals = 1) {
  if (value == null) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatCompact(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString();
}
