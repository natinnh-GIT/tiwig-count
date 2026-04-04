export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}