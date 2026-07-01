import { FormSectionCard } from "../cards/FormSectionCard";
import { SelectableOptionCard } from "../cards/SelectableOptionCard";

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
  const categories = [
    { id: "kuliner", label: "Kuliner", desc: "Makanan & Minuman" },
    { id: "fesyen", label: "Fesyen", desc: "Pakaian & Aksesoris" },
    { id: "pariwisata", label: "Pariwisata", desc: "Travel & Liburan" },
    { id: "edukasi", label: "Edukasi", desc: "Kursus & Pengetahuan" },
    { id: "kecantikan", label: "Kecantikan", desc: "Kosmetik & Skin Care" },
    { id: "lainnya", label: "Lainnya", desc: "Umum & Jasa" },
  ];

  return (
    <FormSectionCard
      title="Informasi Produk"
      description="Lengkapi identitas produk dan kategori segmentasi agar kreator memahami produk Anda."
    >
      {/* Title Input */}
      <div className="space-y-2">
        <label htmlFor="campaign-title" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Judul Campaign / Nama Produk <span className="text-primary">*</span>
        </label>
        <input
          id="campaign-title"
          type="text"
          placeholder="Contoh: Review Keripik Tempe Renyah Sunda"
          value={title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className={`w-full px-4 py-2.5 bg-neutral-50 text-xs text-text-primary border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary ${
            validationErrors.title ? "border-danger" : "border-border-strong"
          }`}
        />
        {validationErrors.title ? (
          <p className="text-[10px] text-danger font-bold">{validationErrors.title}</p>
        ) : (
          <p className="text-[10px] text-text-muted">Masukkan nama produk yang dipasarkan secara singkat & spesifik.</p>
        )}
      </div>

      {/* Category selector grid */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Kategori Niche Kreator <span className="text-primary">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
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
          <p className="text-[10px] text-danger font-bold">{validationErrors.category}</p>
        )}
      </div>

      {/* Location (optional) */}
      <div className="space-y-2">
        <label htmlFor="target-location" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
          Lokasi Target Kreator (Opsional)
        </label>
        <input
          id="target-location"
          type="text"
          placeholder="Contoh: Jabodetabek, Jawa Barat, atau Nasional"
          value={location}
          onChange={(e) => onChangeLocation(e.target.value)}
          className="w-full px-4 py-2.5 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p className="text-[10px] text-text-muted">Tentukan domisili kreator jika bisnis Anda hanya mencakup daerah tertentu.</p>
      </div>

      {/* Product Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="product-desc" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Deskripsi Singkat Produk <span className="text-primary">*</span>
          </label>
          <span className={`text-[10px] font-bold ${description.length < 30 ? "text-text-muted" : "text-success"}`}>
            {description.length} karakter (Min. 30)
          </span>
        </div>
        <textarea
          id="product-desc"
          rows={4}
          placeholder="Tuliskan tentang kelebihan produk Anda, bahan, rasa, kegunaan, atau penawaran spesial yang membuat produk ini menarik..."
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className={`w-full px-4 py-3 bg-neutral-50 text-xs text-text-primary border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none ${
            validationErrors.description ? "border-danger" : "border-border-strong"
          }`}
        />
        {validationErrors.description ? (
          <p className="text-[10px] text-danger font-bold">{validationErrors.description}</p>
        ) : (
          <p className="text-[10px] text-text-muted">Gambarkan keunggulan produk Anda dalam minimal 30 karakter untuk mempermudah kreator.</p>
        )}
      </div>

    </FormSectionCard>
  );
}
