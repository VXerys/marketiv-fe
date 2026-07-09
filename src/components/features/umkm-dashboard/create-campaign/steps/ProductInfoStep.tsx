import { FormSectionCard } from "../cards/FormSectionCard";
import { SelectableOptionCard } from "../cards/SelectableOptionCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NICHE_OPTIONS } from "../create-campaign.constants";

interface ProductInfoStepProps {
  title: string;
  onChangeTitle: (val: string) => void;
  category: string;
  onChangeCategory: (val: string) => void;
  description: string;
  onChangeDescription: (val: string) => void;
  location: string;
  onChangeLocation: (val: string) => void;
  validationErrors?: Record<string, string>;
}

export function ProductInfoStep({
  title,
  onChangeTitle,
  category,
  onChangeCategory,
  description,
  onChangeDescription,
  location,
  onChangeLocation,
  validationErrors = {},
}: ProductInfoStepProps) {
  return (
    <FormSectionCard
      title="Informasi Produk"
      description="Lengkapi identitas produk dan kategori segmentasi agar kreator memahami produk Anda."
    >
      {/* Title Input */}
      <Input
        id="campaign-title"
        label="Judul Campaign / Nama Produk"
        placeholder="Contoh: Review Keripik Tempe Renyah Sunda"
        value={title}
        onChange={(e) => onChangeTitle(e.target.value)}
        error={validationErrors.title}
        helperText={!validationErrors.title ? "Masukkan nama produk yang dipasarkan secara singkat & spesifik." : undefined}
      />

      {/* Category selector grid */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-text-primary">
          Kategori Niche Kreator <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {NICHE_OPTIONS.map((cat) => (
            <SelectableOptionCard
              key={cat.id}
              selected={category === cat.id}
              onClick={() => onChangeCategory(cat.id)}
              title={cat.label}
              description={cat.desc}
            />
          ))}
        </div>
        {validationErrors.category && (
          <p className="text-xs text-destructive">{validationErrors.category}</p>
        )}
      </div>

      {/* Location (optional) */}
      <Input
        id="target-location"
        label="Lokasi Target Kreator (Opsional)"
        placeholder="Contoh: Jabodetabek, Jawa Barat, atau Nasional"
        value={location}
        onChange={(e) => onChangeLocation(e.target.value)}
        helperText="Tentukan domisili kreator jika bisnis Anda hanya mencakup daerah tertentu."
      />

      {/* Product Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="product-desc" className="text-sm font-medium text-text-primary">
            Deskripsi Singkat Produk <span className="text-primary">*</span>
          </label>
          <span className={`text-[10px] font-bold ${description.length < 30 ? "text-text-muted" : "text-success"}`}>
            {description.length} karakter (Min. 30)
          </span>
        </div>
        <Textarea
          id="product-desc"
          rows={4}
          placeholder="Tuliskan tentang kelebihan produk Anda, bahan, rasa, kegunaan, atau penawaran spesial yang membuat produk ini menarik..."
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          error={validationErrors.description}
          helperText={!validationErrors.description ? "Gambarkan keunggulan produk Anda dalam minimal 30 karakter untuk mempermudah kreator." : undefined}
        />
      </div>

    </FormSectionCard>
  );
}
