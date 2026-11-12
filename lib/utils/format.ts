export function formatMoney(amount: number | null): string {
  if (amount === null || amount === undefined) return "No amount";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// "YYYY-MM-DD" -> "Mar 5, 2026". Built from parts so the timezone can't shift the day.
export function formatDate(date: string | null): string {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
