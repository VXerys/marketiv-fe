import { FormSectionCard } from "../cards/FormSectionCard";
import { SelectableOptionCard } from "../cards/SelectableOptionCard";
import { TONE_OPTIONS, CTA_OPTIONS, BRIEF_SUGGESTIONS } from "../create-campaign.constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  onGenerateAi: () => void;
  isGeneratingAi?: boolean;
  aiError?: string | null;
  /** Tombol AI butuh deskripsi produk (langkah 1) minimal 30 karakter. */
  canGenerateAi?: boolean;
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
}: BriefGuidelineStepProps) {

  const handleSuggestionClick = (sug: string) => {
    if (brief.trim()) {
      onChangeBrief(brief + "\n- " + sug);
    } else {
      onChangeBrief("- " + sug);
    }
  };

  return (
    <FormSectionCard
      title="Brief & Panduan Konten"
      description="Susun arahan pembuatan video secara rinci agar kreator memproduksi video sesuai keinginan Anda."
    >
      
      {/* Brief Textarea */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="campaign-brief" className="text-sm font-medium text-text-primary">
            Brief / Panduan Utama <span className="text-primary">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGenerateAi}
              disabled={isGeneratingAi || !canGenerateAi}
              aria-busy={isGeneratingAi}
              title={
                !canGenerateAi
                  ? "Lengkapi Deskripsi Produk (langkah 1) minimal 30 karakter."
                  : undefined
              }
              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-[9px] font-extrabold text-primary flex items-center gap-1 transition-all cursor-pointer border border-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingAi ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              <span>{isGeneratingAi ? "Menyusun brief…" : "Bantu dengan AI"}</span>
            </button>
            <span className={`text-[10px] font-bold ${brief.length < 50 ? "text-text-muted" : "text-success"}`}>
              {brief.length} karakter (Min. 50)
            </span>
          </div>
        </div>
        
        {/* Banner error AI — inline, bukan toast telanjang */}
        {aiError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[11px] font-bold text-red-700">
            {aiError}
          </div>
        )}

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 mb-1">
          {BRIEF_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(sug)}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-primary-50 text-[9px] font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer border border-neutral-200/50"
            >
              + {sug.slice(0, 30)}...
            </button>
          ))}
        </div>

        <Textarea
          id="campaign-brief"
          rows={6}
          placeholder="Tuliskan arahan utama kampanye di sini. Contoh: Tolong buat video review berdurasi 15-30 detik dengan menunjukkan tekstur keripik dan ekspresi renyah saat memakannya..."
          value={brief}
          onChange={(e) => onChangeBrief(e.target.value)}
          error={validationErrors.brief}
          helperText={!validationErrors.brief ? "Jelaskan konsep video utama Anda minimal dalam 50 karakter." : undefined}
        />
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

      {/* Required Points */}
      <Textarea
        id="required-points"
        label="Poin Wajib Ditampilkan dalam Konten"
        rows={3}
        placeholder="Contoh:&#10;- Wajib menunjukkan kemasan produk di awal video&#10;- Wajib melakukan 'crunch test' (suara renyah saat digigit)&#10;- Dilarang membandingkan produk dengan kompetitor"
        value={requiredPoints}
        onChange={(e) => onChangeRequiredPoints(e.target.value)}
        helperText="Masukkan larangan atau poin wajib agar kreator tidak melakukan kesalahan fatal."
      />

      {/* Hashtag & Caption */}
      <Input
        id="caption-hashtags"
        label="Hashtag & Rekomendasi Caption (Opsional)"
        placeholder="Contoh: #KeripikTempeSunda #KulinerSunda #CamilanEnak"
        value={hashtags}
        onChange={(e) => onChangeHashtags(e.target.value)}
        helperText="Pisahkan dengan spasi jika memasukkan beberapa hashtag."
      />

    </FormSectionCard>
  );
}
