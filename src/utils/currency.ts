const pkrFormatter = new Intl.NumberFormat('en-PK', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatPkrAmount(amount: number) {
  return `PKR ${pkrFormatter.format(amount)}`;
}
