"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { dummyCreators } from "@/data/creators";
import { CreatorProfileHero } from "./CreatorProfileHero";
import { CreatorStatsCards } from "./CreatorStatsCards";
import { RateCardPackagesSection } from "./RateCardPackagesSection";
import { CreatorPortfolioSection } from "./CreatorPortfolioSection";
import { CreatorSocialLinksCard } from "./CreatorSocialLinksCard";
import { CreatorDetailSkeleton } from "./CreatorDetailSkeleton";
import { CreatorNotFoundState } from "./CreatorNotFoundState";
import { StartNegotiationModal } from "../modals/StartNegotiationModal";
import type { RateCardPackage } from "./RateCardPackageCard";

interface CreatorDetailPageProps {
  creatorId: string;
}

export function CreatorDetailPage({ creatorId }: CreatorDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<RateCardPackage | null>(null);

  // Simulate loading delay for skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const creator = dummyCreators.find((c) => c.id === creatorId);

  if (loading) {
    return <CreatorDetailSkeleton />;
  }

  if (!creator) {
    return <CreatorNotFoundState />;
  }

  const handleSelectPackage = (pkg: RateCardPackage) => {
    setSelectedPackage(pkg);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/umkm/kreator"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors select-none"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali ke Direktori</span>
        </Link>
      </div>

      {/* Profile Identity */}
      <CreatorProfileHero creator={creator} />

      {/* Stats Quick Cards */}
      <CreatorStatsCards creatorId={creatorId} />

      {/* Split details column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rate card packages section */}
          <RateCardPackagesSection
            creatorId={creator.id}
            creatorCategory={creator.category}
            onSelectPackage={handleSelectPackage}
          />

          <hr className="border-border-soft" />

          {/* Portfolio list */}
          <CreatorPortfolioSection creatorId={creator.id} />
        </div>

        {/* Right side social links card */}
        <div className="space-y-6">
          <CreatorSocialLinksCard
            creatorName={creator.name}
            creatorCategory={creator.category}
          />
        </div>
      </div>

      {/* Negotiation Modal */}
      {selectedPackage && (
        <StartNegotiationModal
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          creatorName={creator.name}
          packageName={selectedPackage.name}
          packagePrice={selectedPackage.price}
        />
      )}
    </div>
  );
}
