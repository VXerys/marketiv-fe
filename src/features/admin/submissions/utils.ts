import { SubmissionStatus, StatusUIConfig } from "./types";

/**
 * Pure utility function to calculate estimated campaign PPV reward.
 * Formula: floor(views / 1000) * rewardPer1000Views
 * Rule: views < 1000 => reward = 0
 */
export function calculateEstimatedCampaignReward(
  views: number,
  rewardPer1000Views: number
): number {
  if (
    isNaN(views) ||
    views < 1000 ||
    isNaN(rewardPer1000Views) ||
    rewardPer1000Views <= 0
  ) {
    return 0;
  }
  const fullThousands = Math.floor(views / 1000);
  return fullThousands * rewardPer1000Views;
}

/**
 * Centralized UI status mapper for SubmissionStatus.
 * Never exposes raw backend status enums directly to UI.
 */
export function getSubmissionStatusConfig(status: SubmissionStatus): StatusUIConfig {
  switch (status) {
    case "pending":
      return {
        label: "Menunggu Validasi",
        badgeVariant: "pending",
        badgeBgClass: "bg-[#fff7ed]",
        badgeTextClass: "text-[#c2410c]",
        badgeBorderClass: "border-[#ffedd5]",
        dotColorClass: "bg-[#f97316]",
        description: "Postingan membutuhkan verifikasi jumlah views manual oleh Admin Marketiv.",
      };
    case "approved":
      return {
        label: "Disetujui",
        badgeVariant: "approved",
        badgeBgClass: "bg-[#f0fdf4]",
        badgeTextClass: "text-[#15803d]",
        badgeBorderClass: "border-[#dcfce7]",
        dotColorClass: "bg-[#16a34a]",
        description: "Submission telah diverifikasi. Views dikunci dan reward dikreditkan.",
      };
    case "rejected":
      return {
        label: "Ditolak",
        badgeVariant: "rejected",
        badgeBgClass: "bg-[#fef2f2]",
        badgeTextClass: "text-[#b91c1c]",
        badgeBorderClass: "border-[#fee2e2]",
        dotColorClass: "bg-[#dc2626]",
        description: "Submission ditolak oleh Admin Marketiv karena tidak memenuhi kriteria.",
      };
  }
}

/**
 * Validates integer views input.
 */
export function validateViewsInput(inputVal: string): {
  isValid: boolean;
  numericValue: number;
  errorMessage?: string;
} {
  const cleaned = inputVal.replace(/\./g, "").replace(/,/g, "").trim();
  
  if (!cleaned) {
    return { isValid: false, numericValue: 0, errorMessage: "Jumlah views wajib diisi." };
  }

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      numericValue: 0,
      errorMessage: "Jumlah views harus berupa angka bulat positif (tanpa desimal/karakter khusus).",
    };
  }

  const num = parseInt(cleaned, 10);
  if (isNaN(num) || num < 0) {
    return {
      isValid: false,
      numericValue: 0,
      errorMessage: "Jumlah views tidak boleh bernilai negatif.",
    };
  }

  return { isValid: true, numericValue: num };
}
