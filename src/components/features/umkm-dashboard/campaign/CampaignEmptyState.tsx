import { DashboardButton } from "../shared";

interface CampaignEmptyStateProps {
  onCreateClick: () => void;
}

export function CampaignEmptyState({ onCreateClick }: CampaignEmptyStateProps) {
  return (
    <div className="state-card py-16 px-6 sm:px-12 flex flex-col items-center text-center max-w-4xl mx-auto my-6">
      <div className="state-icon mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
      <h3 className="text-2xl font-display font-extrabold text-neutral-950 mb-3 tracking-tight">
        Belum ada campaign
      </h3>
      <p className="text-neutral-500 max-w-lg text-sm leading-relaxed mb-8 font-medium">
        Mulai buat campaign pertama Anda untuk menjangkau kreator mikro dan memantau performanya dari dashboard ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
        <DashboardButton variant="primary" size="md" onClick={onCreateClick}>
          Buat Campaign Baru
        </DashboardButton>
      </div>
    </div>
  );
}
