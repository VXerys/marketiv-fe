import { DashboardButton } from "../shared";

interface CampaignsHeaderProps {
  onCreateCampaignClick: () => void;
  onExportReportClick: () => void;
}

export function CampaignsHeader({
  onCreateCampaignClick,
  onExportReportClick,
}: CampaignsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
      {/* Context breadcrumb & titles */}
      <div>
        <nav className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5 select-none">
          <span className="hover:text-text-secondary transition-colors cursor-pointer">Dashboard</span>
          <span className="text-text-muted/60">/</span>
          <span className="text-primary">Campaign Saya</span>
        </nav>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight leading-none mb-2">
          Campaign Saya
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary font-medium">
          Kelola semua campaign yang Anda buat, pantau performa, dan review bukti tayang kreator.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <DashboardButton
          variant="outline"
          size="md"
          onClick={onExportReportClick}
          className="text-text-secondary rounded-full text-xs"
        >
          <svg className="w-4 h-4 mr-1.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Laporan
        </DashboardButton>
        <DashboardButton
          variant="primary"
          size="md"
          onClick={onCreateCampaignClick}
          className="rounded-full text-xs"
        >
          <svg className="w-4 h-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Buat Campaign Baru
        </DashboardButton>
      </div>
    </div>
  );
}
