export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    const formatted = (value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `Rp ${formatted} M`;
  }
  if (value >= 1_000_000) {
    const formatted = (value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `Rp ${formatted} jt`;
  }
  if (value >= 1_000) {
    const formatted = (value / 1_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    });
    return `Rp ${formatted} rb`;
  }
  return `Rp ${value}`;
}
