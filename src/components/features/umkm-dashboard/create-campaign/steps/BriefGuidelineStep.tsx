import { FormSectionCard } from "../cards/FormSectionCard";
import { SelectableOptionCard } from "../cards/SelectableOptionCard";
import { TONE_OPTIONS, CTA_OPTIONS, BRIEF_SUGGESTIONS } from "../create-campaign.constants";

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
}: BriefGuidelineStepProps) {

  const handleSuggestionClick = (sug: string) => {
    if (brief.trim()) {
      onChangeBrief(brief + "\n- " + sug);
    } else {
      onChangeBrief("- " + sug);
    }
  };

  const handleAiAutoFill = () => {
    const aiBrief = 
      "Konsep Video:\nDaily Vlog santai menikmati cemilan sore hari.\n\n" +
      "Panduan Produksi:\n- Menunjukkan kemasan Keripik Tempe Sunda di awal video secara jelas.\n" +
      "- Mengambil close-up detail tekstur keripik yang tipis dan taburan bumbu rempah.\n" +
      "- Mengambil audio 'crunch test' saat keripik digigit untuk menonjolkan kerenyahan.\n" +
      "- Menutup video dengan ajakan mengunjungi link marketplace di bio profil.";
    
    onChangeBrief(aiBrief);
    onChangeVideoStyle("natural");
    onChangeCallToAction("kunjungi_toko");
    onChangeRequiredPoints(
      "- Wajib menunjukkan kemasan di awal video\n- Wajib melakukan crunch test (suara renyah saat digigit)\n- Dilarang membandingkan produk dengan kompetitor"
    );
    onChangeHashtags("#KeripikTempeSunda #KulinerSunda #CrunchySnacks");
  };

  return (
    <FormSectionCard
      title="Brief & Panduan Konten"
      description="Susun arahan pembuatan video secara rinci agar kreator memproduksi video sesuai keinginan Anda."
    >
      
      {/* Brief Textarea */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="campaign-brief" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Brief / Panduan Utama <span className="text-primary">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAiAutoFill}
              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-[9px] font-extrabold text-primary flex items-center gap-1 transition-all cursor-pointer border border-primary/20"
            >
              <svg className="w-3 h-3 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Bantu dengan AI (Simulasi)</span>
            </button>
            <span className={`text-[10px] font-bold ${brief.length < 50 ? "text-text-muted" : "text-success"}`}>
              {brief.length} karakter (Min. 50)
            </span>
          </div>
        </div>
        
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

        <textarea
          id="campaign-brief"
          rows={6}
          placeholder="Tuliskan arahan utama kampanye di sini. Contoh: Tolong buat video review berdurasi 15-30 detik dengan menunjukkan tekstur keripik dan ekspresi renyah saat memakannya..."
          value={brief}
          onChange={(e) => onChangeBrief(e.target.value)}
          className={`w-full px-4 py-3 bg-neutral-50 text-xs text-text-primary border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none ${
            validationErrors.brief ? "border-danger focus:ring-danger" : "border-border-strong"
          }`}
        />
        {validationErrors.brief ? (
          <p className="text-[10px] text-danger font-bold">{validationErrors.brief}</p>
        ) : (
          <p className="text-[10px] text-text-muted">Jelaskan konsep video utama Anda minimal dalam 50 karakter.</p>
        )}
      </div>

      {/* Video Style/Tone Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
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
          <p className="text-[10px] text-danger font-bold">{validationErrors.videoStyle}</p>
        )}
      </div>

      {/* Call To Action options */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
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
          <p className="text-[10px] text-danger font-bold">{validationErrors.callToAction}</p>
        )}
      </div>

      {/* Required Points */}
      <div className="space-y-2">
        <label htmlFor="required-points" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Poin Wajib Ditampilkan dalam Konten
        </label>
        <textarea
          id="required-points"
          rows={3}
          placeholder="Contoh:&#10;- Wajib menunjukkan kemasan produk di awal video&#10;- Wajib melakukan 'crunch test' (suara renyah saat digigit)&#10;- Dilarang membandingkan produk dengan kompetitor"
          value={requiredPoints}
          onChange={(e) => onChangeRequiredPoints(e.target.value)}
          className="w-full px-4 py-3 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
        />
        <p className="text-[10px] text-text-muted">Masukkan larangan atau poin wajib agar kreator tidak melakukan kesalahan fatal.</p>
      </div>

      {/* Hashtag & Caption */}
      <div className="space-y-2">
        <label htmlFor="caption-hashtags" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Hashtag & Rekomendasi Caption (Opsional)
        </label>
        <input
          id="caption-hashtags"
          type="text"
          placeholder="Contoh: #KeripikTempeSunda #KulinerSunda #CamilanEnak"
          value={hashtags}
          onChange={(e) => onChangeHashtags(e.target.value)}
          className="w-full px-4 py-2.5 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-[10px] text-text-muted">Pisahkan dengan spasi jika memasukkan beberapa hashtag.</p>
      </div>

    </FormSectionCard>
  );
}
