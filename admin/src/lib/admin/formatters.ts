/**
 * Formats a raw number to Indonesian Rupiah representation (e.g. 150000 -> "Rp 150.000")
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a view count with Indonesian thousand separators (e.g. 15800 -> "15.800")
 */
export function formatViews(views: number): string {
  if (isNaN(views) || views === null || views === undefined) {
    return "0";
  }
  return new Intl.NumberFormat("id-ID").format(views);
}

/**
 * Formats ISO date string into human readable Indonesian datetime
 */
export function formatDateTime(isoString: string): string {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date) + " WIB";
  } catch {
    return isoString;
  }
}

/**
 * Calculates estimated reward based on views and rate per 1,000 views or per view.
 * Default calculation: ratePer1kViews (e.g. Rp 10.000 / 1.000 views)
 */
export function calculateEstimatedReward(
  views: number,
  ratePer1kViews: number
): number {
  if (!views || views <= 0 || !ratePer1kViews || ratePer1kViews <= 0) {
    return 0;
  }
  return Math.floor((views / 1000) * ratePer1kViews);
}
