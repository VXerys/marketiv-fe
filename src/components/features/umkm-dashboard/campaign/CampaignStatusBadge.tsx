import { Badge } from "@/components/ui/badge";
import { CampaignStatus } from "@/types/umkm-dashboard.types";
import { getCampaignStatusLabel, getCampaignStatusVariant } from "@/lib/umkm-status";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  return (
    <Badge variant={getCampaignStatusVariant(status)}>
      {getCampaignStatusLabel(status)}
    </Badge>
  );
}
