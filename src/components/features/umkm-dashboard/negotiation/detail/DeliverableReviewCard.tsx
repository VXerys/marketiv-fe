"use client";

import type { Deliverable } from "@/types/umkm-dashboard.types";

/**
 * Hasil kerja kreator + aksi review UMKM.
 *
 * Hanya versi TERBARU yang bisa direview — versi lama tetap ditampilkan sebagai
 * riwayat supaya terlihat apa yang sudah pernah ditolak, tapi tidak punya
 * tombol. Menyetujui versi lama akan mencairkan dana atas pekerjaan yang sudah
 * digantikan.
 */
interface DeliverableReviewCardProps {
  deliverables: Deliverable[];
  /** Nonaktifkan aksi selama order belum berjalan atau sudah selesai. */
  canReview: boolean;
  validationStatus?: "pending" | "valid" | "invalid";
  validationNotes?: string;
  busy: boolean;
  onApprove: () => void;
  onRequestRevision: () => void;
}

const STATUS_LABEL: Record<Deliverable["status"], { text: string; className: string }> = {
  submitted: { text: "Menunggu Peninjauan Anda", className: "text-amber-700 bg-amber-50 border-amber-200/60" },
  revision_requested: { text: "Sedang Direvisi", className: "text-orange-700 bg-orange-50 border-orange-200/60" },
  approved: { text: "Disetujui", className: "text-emerald-700 bg-emerald-50 border-emerald-200/60" },
};

export function DeliverableReviewCard({
  deliverables,
  canReview,
  validationStatus = "pending",
  validationNotes,
  busy,
  onApprove,
  onRequestRevision,
}: DeliverableReviewCardProps) {
  if (deliverables.length === 0) return null;

  const latest = deliverables[deliverables.length - 1];
  const history = deliverables.slice(0, -1).reverse();
  const isActionable = canReview && latest.status === "submitted";

  return (
    <div
      className="rounded-[22px] p-4 bg-white"
      style={{
        border: "1px solid rgba(17,24,39,.08)",
        boxShadow: "0 8px 28px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.9)",
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="text-[10px] font-extrabold text-[#182033] uppercase tracking-wider">
          Hasil Kerja
        </h4>
        <span
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${STATUS_LABEL[latest.status].className}`}
        >
          {STATUS_LABEL[latest.status].text}
        </span>
      </div>

      <div className="rounded-[14px] bg-neutral-50 border border-neutral-200/50 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">
            Versi {latest.version}
          </span>
          <span className="text-[9px] font-bold text-neutral-400">
            {new Date(latest.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <a
          href={latest.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[11px] font-bold text-[#f97316] hover:underline break-all leading-snug"
        >
          {latest.fileUrl}
        </a>

        {latest.notes && (
          <p className="text-[10px] text-neutral-600 font-semibold leading-relaxed border-l-2 border-neutral-200 pl-2.5">
            {latest.notes}
          </p>
        )}
      </div>

      <div className={`mt-3 rounded-[12px] border px-3 py-2 text-[10px] font-bold ${validationStatus === "valid" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : validationStatus === "invalid" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
        {validationStatus === "valid" ? "Bukti Lolos Validasi Marketiv" : validationStatus === "invalid" ? "Bukti Belum Lolos Validasi" : "Menunggu Validasi Marketiv"}
        {validationStatus === "invalid" && validationNotes ? <span className="block mt-1 font-semibold">{validationNotes}</span> : null}
      </div>

      {isActionable && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="flex-1 py-2.5 rounded-[12px] text-[10px] font-extrabold text-white transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(180deg,#22c55e,#16a34a)",
              boxShadow: "0 3px 8px rgba(34,197,94,.22)",
            }}
          >
            Setujui
          </button>
          <button
            type="button"
            onClick={onRequestRevision}
            disabled={busy}
            className="px-3.5 py-2.5 rounded-[12px] text-[10px] font-extrabold text-neutral-700 bg-neutral-100 border border-neutral-200/60 hover:bg-neutral-200/60 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Minta Revisi
          </button>
        </div>
      )}

      {!isActionable && latest.status === "submitted" && validationStatus !== "valid" && (
        <div className="flex gap-2 mt-3">
          <button type="button" onClick={onRequestRevision} disabled={busy} className="w-full px-3.5 py-2.5 rounded-[12px] text-[10px] font-extrabold text-neutral-700 bg-neutral-100 border border-neutral-200/60 hover:bg-neutral-200/60 transition-all cursor-pointer disabled:opacity-60">
            Minta Revisi
          </button>
        </div>
      )}

      {latest.status === "revision_requested" && (
        <p className="text-[10px] font-bold text-neutral-500 mt-3 leading-relaxed">
          Menunggu kreator mengirim versi perbaikan.
        </p>
      )}

      {history.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-1.5">
          <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wider">
            Versi sebelumnya
          </span>
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-neutral-500 hover:text-[#f97316] hover:underline truncate"
              >
                Versi {item.version}
              </a>
              <span className="text-[9px] font-bold text-neutral-400 shrink-0">
                {STATUS_LABEL[item.status].text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
