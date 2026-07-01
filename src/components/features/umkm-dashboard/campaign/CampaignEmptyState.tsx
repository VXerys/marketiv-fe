import { DashboardButton } from "../shared";
import { EmptyState } from "@/components/ui/empty-state";

interface CampaignEmptyStateProps {
  onCreateClick: () => void;
}

export function CampaignEmptyState({ onCreateClick }: CampaignEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      }
      title="Belum ada campaign"
      description="Mulai buat campaign pertama Anda untuk menjangkau kreator mikro dan memantau performanya dari dashboard ini."
      action={
        <DashboardButton variant="primary" size="md" onClick={onCreateClick}>
          Buat Campaign Baru
        </DashboardButton>
      }
      className="border border-border-soft rounded-2xl bg-white p-8"
    />
  );
}
