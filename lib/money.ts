export function formatPrice(amount: number): string {
  const n = Math.round(Number.isFinite(amount) ? amount : 0);
  return `${n.toLocaleString("en-US")} MMK`;
}
