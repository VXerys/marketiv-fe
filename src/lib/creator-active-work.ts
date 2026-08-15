import type { CreatorActiveWork } from "@/types/creator-dashboard";

/**
 * Claim boleh dilepas hanya sebelum submission apa pun tercatat. `submissionId`
 * adalah penanda kanonik DTO; field lain menutup data parsial agar UI gagal
 * tertutup bila detail belum lengkap.
 */
export function canUnclaimCreatorActiveWork(
  work: Pick<
    CreatorActiveWork,
    "status" | "submissionId" | "submissionStatus" | "contentUrl" | "submittedAt"
  >,
): boolean {
  return (
    work.status === "claimed" &&
    !work.submissionId &&
    !work.submissionStatus &&
    !work.contentUrl &&
    !work.submittedAt
  );
}
