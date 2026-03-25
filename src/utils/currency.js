/**
 * Central currency formatting utility for BudgetIQ (INR — Indian Rupee)
 */

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const INR_FORMATTER_NO_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Format a number as Indian Rupee currency string.
 * e.g. 27000 → "₹27,000.00"
 */
export function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return INR_FORMATTER.format(val);
}

/**
 * Format without decimal places — useful for charts.
 * e.g. 27000 → "₹27,000"
 */
export function fmtCompact(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return INR_FORMATTER_NO_DECIMAL.format(val);
}
