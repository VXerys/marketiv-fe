import { FormSectionCard } from "../cards/FormSectionCard";

interface AssetLinkStepProps {
  externalAssetUrl: string;
  onChangeExternalAssetUrl: (val: string) => void;
  assetNotes: string;
  onChangeAssetNotes: (val: string) => void;
  validationErrors?: Record<string, string>;
}

export function AssetLinkStep({
  externalAssetUrl,
  onChangeExternalAssetUrl,
  assetNotes,
  onChangeAssetNotes,
  validationErrors = {},
}: AssetLinkStepProps) {
  const assetsChecklist = [
    { label: "Foto Mentah Produk", desc: "Foto kemasan dan produk dari berbagai sudut" },
    { label: "Bahan Klip Video", desc: "Kumpulan klip video beresolusi tinggi (non-edit)" },
    { label: "Logo & Aset Visual Brand", desc: "Logo transparan PNG untuk disisipkan" },
    { label: "Video Referensi (Moodboard)", desc: "Contoh video kreasi dari platform lain" },
  ];

  return (
    <FormSectionCard
      title="Aset Mentah & Media Produk"
      description="Sediakan tautan media penyimpanan eksternal agar kreator dapat mengunduh bahan mentah produk Anda."
    >
      
      {/* External Storage URL */}
      <div className="space-y-4">
        <label htmlFor="external-asset-url" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Tautan Penyimpanan Aset (Google Drive / Dropbox) <span className="text-primary">*</span>
        </label>
        
        {/* Dropzone-style URL input container */}
        <div className="border-2 border-dashed border-neutral-300 hover:border-primary/50 bg-neutral-50/50 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all">
          <svg className="w-8 h-8 text-text-muted mb-2.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="block text-[11px] font-bold text-text-primary mb-3">
            Tautkan Folder Google Drive / Dropbox / OneDrive Anda
          </span>
          
          <input
            id="external-asset-url"
            type="text"
            placeholder="Contoh: https://drive.google.com/drive/folders/..."
            value={externalAssetUrl}
            onChange={(e) => onChangeExternalAssetUrl(e.target.value)}
            className={`w-full max-w-md px-4 py-2.5 bg-white text-xs text-text-primary border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary font-mono text-center ${
              validationErrors.externalAssetUrl ? "border-danger focus:ring-danger" : "border-border-strong"
            }`}
          />
          {validationErrors.externalAssetUrl && (
            <p className="text-[10px] text-danger font-bold mt-2">{validationErrors.externalAssetUrl}</p>
          )}
        </div>
      </div>

      {/* Warning Alert Banner */}
      <div className="bg-warning-soft text-warning-strong border border-warning-soft/60 rounded-xl p-4 flex gap-3 text-[11px] leading-relaxed">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="space-y-1">
          <span className="font-extrabold block">Batas Kapasitas Penyimpanan</span>
          <p>
            Untuk alasan keamanan, batasan ukuran unggah file langsung ke platform adalah <strong>100MB</strong>. Kami sangat mewajibkan UMKM untuk meletakkan video bahan mentah berukuran besar di folder cloud eksternal (Drive/Dropbox/OneDrive) lalu menempelkan tautan link di atas.
          </p>
        </div>
      </div>

      {/* Asset Checklist */}
      <div className="space-y-3 pt-2">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Rekomendasi Isi Folder Aset
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assetsChecklist.map((item, index) => (
            <div key={index} className="flex gap-2.5 p-3 rounded-xl border border-border-soft bg-neutral-50/25">
              <svg className="w-4 h-4 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-text-primary leading-tight">{item.label}</span>
                <span className="block text-[9px] text-text-muted mt-0.5 font-semibold leading-tight">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Asset Notes */}
      <div className="space-y-2">
        <label htmlFor="asset-notes" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Catatan Aset Tambahan (Opsional)
        </label>
        <textarea
          id="asset-notes"
          rows={3}
          placeholder="Contoh: Kode akses folder Drive adalah: 'produk123' atau cantumkan instruksi detail pengunduhan logo..."
          value={assetNotes}
          onChange={(e) => onChangeAssetNotes(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
        />
      </div>

    </FormSectionCard>
  );
}
