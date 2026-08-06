"use client";

import { useState } from "react";
import { FormSectionCard } from "../cards/FormSectionCard";
import { SelectableOptionCard } from "../cards/SelectableOptionCard";
import {
  TONE_OPTIONS,
  CTA_OPTIONS,
  NICHE_OPTIONS,
  QUICK_DIRECTIONS,
  getRecommendedDirections,
  CREATOR_GUIDELINES,
  getRecommendedGuidelines,
} from "../create-campaign.constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BriefGuidelineStepProps {
  brief: string;
  onChangeBrief: (val: string) => void;
  videoStyle: string;
  onChangeVideoStyle: (val: string) => void;
  requiredPoints: string;
  onChangeRequiredPoints: (val: string) => void;
  callToAction: string;
  onChangeCallToAction: (val: string) => void;
  hashtags: string;
  onChangeHashtags: (val: string) => void;
  validationErrors?: Record<string, string>;
  /** Aksi AI diangkat ke wizard — wizard yang memiliki description/title/type. */
  onGenerateAi: (directions?: string[]) => void;
  isGeneratingAi?: boolean;
  aiError?: string | null;
  /** Tombol AI butuh deskripsi produk (langkah 1) minimal 30 karakter. */
  canGenerateAi?: boolean;
  productCategory?: string;
  aiGenerated?: boolean;
}

export function BriefGuidelineStep({
  brief,
  onChangeBrief,
  videoStyle,
  onChangeVideoStyle,
  requiredPoints,
  onChangeRequiredPoints,
  callToAction,
  onChangeCallToAction,
  hashtags,
  onChangeHashtags,
  validationErrors = {},
  onGenerateAi,
  isGeneratingAi = false,
  aiError = null,
  canGenerateAi = true,
  productCategory = "",
  aiGenerated = false,
}: BriefGuidelineStepProps) {
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [isExpandedCatalog, setIsExpandedCatalog] = useState(false);

  // Guidelines shortcut states
  const [selectedReqGuidelines, setSelectedReqGuidelines] = useState<string[]>([]);
  const [selectedRestGuidelines, setSelectedRestGuidelines] = useState<string[]>([]);
  const [customRequiredPoints, setCustomRequiredPoints] = useState<string>("");
  const [isExpandedGuidelines, setIsExpandedGuidelines] = useState(false);

  const recommendedChips = getRecommendedDirections(productCategory);
  const guidelineRecommendations = getRecommendedGuidelines(productCategory);
  const nicheLabel = NICHE_OPTIONS.find((n) => n.id === productCategory?.toLowerCase())?.label;

  const handleToggleChip = (label: string) => {
    if (selectedDirections.includes(label)) {
      setSelectedDirections(selectedDirections.filter((l) => l !== label));
    } else {
      if (selectedDirections.length >= 3) {
        setSelectedDirections([...selectedDirections.slice(1), label]);
      } else {
        setSelectedDirections([...selectedDirections, label]);
      }
    }
  };

  const syncCombinedRequiredPoints = (
    reqs: string[],
    rests: string[],
    customText: string
  ) => {
    const lines: string[] = [];
    reqs.forEach((r) => lines.push(`- Wajib: ${r}`));
    rests.forEach((r) => lines.push(`- Hindari: ${r}`));
    if (customText.trim()) {
      lines.push(customText.trim());
    }
    onChangeRequiredPoints(lines.join("\n"));
  };

  const handleToggleReqGuideline = (label: string) => {
    const updated = selectedReqGuidelines.includes(label)
      ? selectedReqGuidelines.filter((l) => l !== label)
      : [...selectedReqGuidelines, label];
    setSelectedReqGuidelines(updated);
    syncCombinedRequiredPoints(updated, selectedRestGuidelines, customRequiredPoints);
  };

  const handleToggleRestGuideline = (label: string) => {
    const updated = selectedRestGuidelines.includes(label)
      ? selectedRestGuidelines.filter((l) => l !== label)
      : [...selectedRestGuidelines, label];
    setSelectedRestGuidelines(updated);
    syncCombinedRequiredPoints(selectedReqGuidelines, updated, customRequiredPoints);
  };

  const handleCustomPointsChange = (text: string) => {
    setCustomRequiredPoints(text);
    syncCombinedRequiredPoints(selectedReqGuidelines, selectedRestGuidelines, text);
  };

  const catalogCategories = [
    { category: "product", categoryLabel: "Produk", items: QUICK_DIRECTIONS.filter((d) => d.category === "product") },
    { category: "experience", categoryLabel: "Pengalaman", items: QUICK_DIRECTIONS.filter((d) => d.category === "experience") },
    { category: "value", categoryLabel: "Nilai & Keunggulan", items: QUICK_DIRECTIONS.filter((d) => d.category === "value") },
    { category: "behind_the_product", categoryLabel: "Proses & Cerita", items: QUICK_DIRECTIONS.filter((d) => d.category === "behind_the_product") },
  ];

  return (
    <FormSectionCard
      title="Arahan & Gaya Konten"
      description="Susun arahan pembuatan video secara rinci agar kreator memproduksi video sesuai keinginan Anda."
    >
      {/* ── Section 1: Arahan Konten (Opsional) ──────────────── */}
      <div className="space-y-4 rounded-2xl bg-neutral-50/50 border border-neutral-200/60 p-4.5 sm:p-5">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200/50 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">
              Arahan Konten
            </h3>
            <span className="text-[10px] font-semibold text-text-muted bg-white px-2 py-0.5 rounded-full border border-neutral-200/80">
              Opsional
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-text-muted leading-relaxed">
          Belum punya arahan? Pilih beberapa rekomendasi di bawah atau langsung lewati bagian ini.
        </p>

        {/* Banner error AI */}
        {aiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">
            {aiError}
          </div>
        )}

        {/* ── Sub-block: Arahan Cepat (Intent Chips) ───────── */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-text-primary uppercase tracking-wide">
              Arahan Cepat
            </span>
            <span className="text-[10.5px] font-bold tabular-nums text-text-muted bg-white px-2 py-0.5 rounded-full border border-neutral-200/60">
              {selectedDirections.length}/3 dipilih
            </span>
          </div>

          <p className="text-[11px] text-text-muted">
            Pilih hingga 3 hal yang ingin ditekankan pada konten video Anda.
          </p>

          {nicheLabel && (
            <div className="text-[11px] font-extrabold text-orange-600 flex items-center gap-1">
              <span>✨ Rekomendasi untuk {nicheLabel}</span>
            </div>
          )}

          {/* Quick chips list */}
          <div className="flex flex-wrap gap-2">
            {recommendedChips.map((chip) => {
              const isSelected = selectedDirections.includes(chip.label);
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleToggleChip(chip.label)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border select-none",
                    isSelected
                      ? "bg-orange-50 text-orange-800 border-orange-300 shadow-2xs font-bold"
                      : "bg-white text-text-secondary border-neutral-200/90 hover:bg-orange-50/40 hover:border-orange-200 hover:text-orange-700"
                  )}
                >
                  {isSelected ? (
                    <svg className="w-3.5 h-3.5 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-text-muted text-xs font-bold">+</span>
                  )}
                  <span>{chip.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsExpandedCatalog(!isExpandedCatalog)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors cursor-pointer flex items-center gap-1"
            >
              {isExpandedCatalog ? "− Sembunyikan catalog" : "+ Lihat arahan lainnya"}
            </button>
          </div>

          {/* Expanded Catalog view */}
          {isExpandedCatalog && (
            <div className="rounded-xl bg-white border border-neutral-200/80 p-3.5 space-y-3 mt-2">
              <span className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider block border-b border-neutral-100 pb-1.5">
                Katalog Arahan Lengkap
              </span>
              {catalogCategories.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    {cat.categoryLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => {
                      const isSel = selectedDirections.includes(item.label);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleToggleChip(item.label)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border select-none",
                            isSel
                              ? "bg-orange-50 text-orange-800 border-orange-300 font-bold"
                              : "bg-neutral-50 text-text-secondary border-neutral-200/80 hover:bg-orange-50/40"
                          )}
                        >
                          {isSel ? "✓ " : "+ "}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Trigger button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onGenerateAi(selectedDirections)}
              disabled={isGeneratingAi || !canGenerateAi}
              title={!canGenerateAi ? "Lengkapi Deskripsi Produk (langkah 1) minimal 30 karakter." : undefined}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAi ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menyusun arahan dengan AI…</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>⚡ Susun Arahan dengan AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        <hr className="border-neutral-200/60 my-3" />

        {/* ── Sub-block: Textarea Hasil Arahan Anda ─────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="campaign-brief" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Arahan Anda
              </label>
              {aiGenerated && (
                <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ✨ Dibantu AI
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-text-muted">
              {brief.length} karakter
            </span>
          </div>

          <Textarea
            id="campaign-brief"
            rows={5}
            placeholder="Hasil susunan AI atau tulisan arahan Anda akan berada di sini. Contoh: Tampilkan proses pembuatan produk, tunjukkan tekstur renyah saat dicicipi..."
            value={brief}
            onChange={(e) => onChangeBrief(e.target.value)}
            error={validationErrors.brief}
            helperText={!validationErrors.brief ? "Anda tetap dapat mengubah atau menyesuaikan teks hasil susunan AI ini." : undefined}
          />
        </div>
      </div>

      {/* Video Style/Tone Cards */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Gaya / Tone Video Konten <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TONE_OPTIONS.map((tone) => (
            <SelectableOptionCard
              key={tone.id}
              selected={videoStyle === tone.id}
              onClick={() => onChangeVideoStyle(tone.id)}
              title={tone.label}
              description={tone.desc}
            />
          ))}
        </div>
        {validationErrors.videoStyle && (
          <p className="text-xs text-destructive">{validationErrors.videoStyle}</p>
        )}
      </div>

      {/* Call To Action options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Call to Action (CTA) yang Diinginkan <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {CTA_OPTIONS.map((cta) => (
            <SelectableOptionCard
              key={cta.id}
              selected={callToAction === cta.id}
              onClick={() => onChangeCallToAction(cta.id)}
              title={cta.label}
              description={cta.desc}
            />
          ))}
        </div>
        {validationErrors.callToAction && (
          <p className="text-xs text-destructive">{validationErrors.callToAction}</p>
        )}
      </div>

      {/* ── Section 4: Panduan untuk Kreator (Content Constraints) ── */}
      <div className="space-y-4 rounded-2xl bg-neutral-50/50 border border-neutral-200/60 p-4.5 sm:p-5">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200/50 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary">
              Panduan untuk Kreator
            </h3>
            <span className="text-[10px] font-semibold text-text-muted bg-white px-2 py-0.5 rounded-full border border-neutral-200/80">
              Opsional
            </span>
          </div>
        </div>

        <p className="text-[11.5px] text-text-muted leading-relaxed">
          Pilih hal yang wajib ditampilkan atau perlu dihindari oleh kreator. Anda juga dapat menambah aturan sendiri.
        </p>

        {/* ── Sub-block: Wajib Ditampilkan ── */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1">
            <span>✓ Wajib Ditampilkan</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {guidelineRecommendations.required.map((item) => {
              const isSelected = selectedReqGuidelines.includes(item.label);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleReqGuideline(item.label)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 select-none",
                    isSelected
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold shadow-2xs"
                      : "bg-white text-text-secondary border-neutral-200/90 hover:bg-emerald-50/30 hover:border-emerald-200"
                  )}
                >
                  {isSelected ? "✓ " : "+ "}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sub-block: Perlu Dihindari ── */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
            <span>⚠️ Perlu Dihindari</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {guidelineRecommendations.restrictions.map((item) => {
              const isSelected = selectedRestGuidelines.includes(item.label);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleRestGuideline(item.label)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 select-none",
                    isSelected
                      ? "bg-amber-50 text-amber-900 border-amber-300 font-bold shadow-2xs"
                      : "bg-white text-text-secondary border-neutral-200/90 hover:bg-amber-50/30 hover:border-amber-200"
                  )}
                >
                  {isSelected ? "✓ " : "+ "}
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsExpandedGuidelines(!isExpandedGuidelines)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-text-secondary bg-neutral-100 hover:bg-neutral-200/70 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              {isExpandedGuidelines ? "− Sembunyikan panduan" : "+ Lihat panduan lainnya"}
            </button>
          </div>
        </div>

        {/* Expanded Guidelines Catalog */}
        {isExpandedGuidelines && (
          <div className="rounded-xl bg-white border border-neutral-200/80 p-3.5 space-y-3 mt-2">
            <span className="text-[10.5px] font-bold text-text-secondary uppercase tracking-wider block border-b border-neutral-100 pb-1.5">
              Katalog Panduan Lengkap
            </span>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Semua Wajib Ditampilkan
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CREATOR_GUIDELINES.filter((g) => g.type === "required").map((item) => {
                  const isSel = selectedReqGuidelines.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleReqGuideline(item.label)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border select-none",
                        isSel ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold" : "bg-neutral-50 text-text-secondary border-neutral-200/80"
                      )}
                    >
                      {isSel ? "✓ " : "+ "}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Semua Perlu Dihindari
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CREATOR_GUIDELINES.filter((g) => g.type === "restriction").map((item) => {
                  const isSel = selectedRestGuidelines.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToggleRestGuideline(item.label)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border select-none",
                        isSel ? "bg-amber-50 text-amber-900 border-amber-300 font-bold" : "bg-neutral-50 text-text-secondary border-neutral-200/80"
                      )}
                    >
                      {isSel ? "✓ " : "+ "}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <hr className="border-neutral-200/60 my-3" />

        {/* Custom Rules Textarea */}
        <div className="space-y-2">
          <label htmlFor="custom-rules" className="text-xs font-bold text-text-primary uppercase tracking-wide block">
            Aturan Tambahan (Opsional)
          </label>
          <Textarea
            id="custom-rules"
            rows={3}
            placeholder="Contoh: Jangan menampilkan bagian dapur produksi, atau wajib menyebutkan varian rasa baru."
            value={customRequiredPoints}
            onChange={(e) => handleCustomPointsChange(e.target.value)}
            helperText="Tuliskan aturan khusus yang belum ada di pilihan atas."
          />
        </div>
      </div>

      {/* Tagar & Rekomendasi Teks Postingan */}
      <Input
        id="caption-hashtags"
        label="Tagar & Rekomendasi Teks Postingan (Opsional)"
        placeholder="Contoh: #KeripikTempeSunda #KulinerSunda #CamilanEnak"
        value={hashtags}
        onChange={(e) => onChangeHashtags(e.target.value)}
        helperText="Pisahkan dengan spasi jika memasukkan beberapa tagar (#)."
      />
    </FormSectionCard>
  );
}
