const SCALES = [
  'million', 'billion', 'trillion', 'quadrillion', 'quintillion',
  'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion',
];

/**
 * Formats an amount for display: "12,345", "0.1", "1.235 million".
 */
export function formatNumber(n) {
  if (!Number.isFinite(n)) return '∞';
  if (n < 1e6) {
    if (n < 1000 && n % 1 !== 0) {
      return (Math.round(n * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 });
    }
    return Math.floor(n).toLocaleString('en-US');
  }
  const group = Math.floor(Math.log10(n) / 3); // 2 => millions
  const scale = SCALES[group - 2];
  if (!scale) return n.toExponential(3);
  return `${(n / 10 ** (group * 3)).toFixed(3)} ${scale}`;
}
