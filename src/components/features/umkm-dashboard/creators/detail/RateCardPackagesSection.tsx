"use client";

import { RateCardPackageCard, RateCardPackage } from "./RateCardPackageCard";

interface RateCardPackagesSectionProps {
  /** Paket dari getCreatorRateCards() — bukan lagi fabrikasi per kategori. */
  packages: RateCardPackage[];
  onSelectPackage: (pkg: RateCardPackage) => void;
}

export function RateCardPackagesSection({
  packages,
  onSelectPackage,
}: RateCardPackagesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider">
          Pilihan Paket Harga Kreator
        </h3>
        <p className="text-[10px] text-text-muted font-semibold">
          Pilih salah satu paket di bawah untuk langsung mengajak kreator ini berkolaborasi.
        </p>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-2xl border border-border-soft bg-white p-8 text-center">
          <p className="text-xs font-semibold text-text-secondary">
            Kreator ini belum mempublikasikan paket harga.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <RateCardPackageCard
              key={pkg.id}
              pkg={pkg}
              onSelectPackage={onSelectPackage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
