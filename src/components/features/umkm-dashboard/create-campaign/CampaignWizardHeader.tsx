import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface CampaignWizardHeaderProps {
  onSaveDraft: () => void;
  onCancel: () => void;
}

export function CampaignWizardHeader({ onSaveDraft, onCancel }: CampaignWizardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-soft/60 pb-6 mb-6">
      
      {/* Title & Breadcrumbs Info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
          <Link href="/dashboard/umkm" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/umkm/campaign" className="hover:text-primary transition-colors">
            Campaign Saya
          </Link>
          <span>/</span>
          <span className="text-text-secondary font-extrabold">Buat Campaign</span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
          Buat Campaign Baru
        </h2>
        <p className="text-xs text-text-muted max-w-xl leading-relaxed">
          Buat campaign berbasis views, atur brief, aset, budget, dan kuota kreator dalam satu alur.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
        <Button
          variant="outline"
          onClick={onCancel}
          className="h-9 px-4 text-xs text-text-primary border border-border-soft hover:bg-neutral-50 bg-white"
        >
          Kembali
        </Button>
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="h-9 px-4 text-xs font-extrabold text-primary border border-primary-200/50 hover:bg-primary-50/50 bg-white"
        >
          Simpan Draft
        </Button>
      </div>

    </div>
  );
}
