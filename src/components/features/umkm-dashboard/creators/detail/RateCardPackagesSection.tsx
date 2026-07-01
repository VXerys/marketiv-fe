"use client";

import { RateCardPackageCard, RateCardPackage } from "./RateCardPackageCard";

interface RateCardPackagesSectionProps {
  creatorId: string;
  creatorCategory: string;
  onSelectPackage: (pkg: RateCardPackage) => void;
}

export function RateCardPackagesSection({
  creatorId,
  creatorCategory,
  onSelectPackage,
}: RateCardPackagesSectionProps) {
  // Vary pricing values based on creator category/tier
  const getPackages = (cat: string): RateCardPackage[] => {
    const c = cat.toLowerCase();
    if (c === "fashion" || c === "fesyen") {
      return [
        {
          id: "pkg1",
          name: "Video Review Instan",
          price: "Rp 1.200.000",
          description: "1x Video review/unboxing OOTD berdurasi 15-30 detik.",
          deliveryDays: 4,
          revisionLimit: 1,
          deliverables: ["1x Posting TikTok Feed / Reels", "Link Collab Post", "3 Bulan Hak Cipta Aset"],
        },
        {
          id: "pkg2",
          name: "Complete Lookbook Promosi",
          price: "Rp 2.000.000",
          description: "1x Video review kreatif + 3x foto profesional promosi.",
          deliveryDays: 6,
          revisionLimit: 2,
          deliverables: ["1x Posting TikTok Feed / Reels", "3x Foto feed Instagram (Carousels)", "Link Collab Post", "6 Bulan Hak Cipta Aset", "Format raw video terkirim"],
          recommended: true,
        },
        {
          id: "pkg3",
          name: "Premium Fashion Showcase",
          price: "Rp 3.500.000",
          description: "2x Video review estetik (transisi) + live modeling session.",
          deliveryDays: 10,
          revisionLimit: 3,
          deliverables: ["2x Posting TikTok / Reels", "Link Collab Post utama", "Penyebutan brand eksklusif", "Hak Cipta Selamanya", "Format raw video terkirim"],
        },
      ];
    }
    
    if (c === "kosmetik" || c === "kecantikan") {
      return [
        {
          id: "pkg1",
          name: "Video Skincare Routine",
          price: "Rp 1.500.000",
          description: "1x Video tutorial skincare/makeup routine minimal 30 detik.",
          deliveryDays: 5,
          revisionLimit: 1,
          deliverables: ["1x Video Reels / TikTok", "Link Collab Post", "3 Bulan Hak Cipta Aset"],
        },
        {
          id: "pkg2",
          name: "Beauty Review & Demo",
          price: "Rp 3.000.000",
          description: "1x Video review mendalam kelebihan & demo uji ketahanan produk.",
          deliveryDays: 7,
          revisionLimit: 2,
          deliverables: ["1x Video Reels / TikTok", "Link Collab Post", "6 Bulan Hak Cipta Aset", "Format raw video terkirim"],
          recommended: true,
        },
        {
          id: "pkg3",
          name: "Glam Bundle Makeover",
          price: "Rp 5.000.000",
          description: "2x Video review + IG Stories banner promo harian.",
          deliveryDays: 12,
          revisionLimit: 3,
          deliverables: ["2x Video Reels / TikTok", "2x Instagram Stories dengan CTA Link", "Link Collab Post", "Hak Cipta Selamanya", "Format raw video terkirim"],
        },
      ];
    }

    // Default: Kuliner / General
    return [
      {
        id: "pkg1",
        name: "Mukbang Review Kilat",
        price: "Rp 850.000",
        description: "1x Video mukbang / mencicipi makanan durasi 15-30 detik.",
        deliveryDays: 3,
        revisionLimit: 1,
        deliverables: ["1x Posting TikTok Feed / Reels", "Link Collab Post", "3 Bulan Hak Cipta Aset"],
      },
      {
        id: "pkg2",
        name: "Video Review Rasa Utama",
        price: "Rp 1.500.000",
        description: "1x Video review proses pembuatan, rasa, & close-up renyah.",
        deliveryDays: 5,
        revisionLimit: 2,
        deliverables: ["1x Posting TikTok / Reels", "Audio crunch test disertakan", "Link Collab Post", "6 Bulan Hak Cipta Aset", "Format raw video terkirim"],
        recommended: true,
      },
      {
        id: "pkg3",
        name: "Bundling Kuliner Premium",
        price: "Rp 2.800.000",
        description: "2x Video review kuliner kreatif + visual menu closeup.",
        deliveryDays: 8,
        revisionLimit: 3,
        deliverables: ["2x Posting TikTok / Reels", "Link Collab Post utama", "Audio crunch test disertakan", "Hak Cipta Selamanya", "Format raw video terkirim"],
      },
    ];
  };

  const packages = getPackages(creatorCategory);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
          Pilihan Paket Rate Card
        </h3>
        <p className="text-[10px] text-text-muted font-semibold">
          Pilih salah satu paket di bawah untuk langsung inisiasi negosiasi penawaran khusus.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <RateCardPackageCard
            key={pkg.id}
            pkg={pkg}
            onSelectPackage={onSelectPackage}
          />
        ))}
      </div>
    </div>
  );
}
