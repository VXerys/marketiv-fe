"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { getCreators } from "@/services/umkm/umkm-dashboard.service";
import type { CreatorProfile } from "@/types/umkm-dashboard.types";
import { toCreatorView } from "./creator.adapter";
import { UmkmPageWrapper } from "../shared/UmkmPageWrapper";
import { CreatorDirectoryHeader } from "./CreatorDirectoryHeader";
import { CreatorSummaryCards } from "./CreatorSummaryCards";
import { CreatorToolbar } from "./CreatorToolbar";
import { CreatorCard } from "./CreatorCard";
import { CreatorGridSkeleton } from "./CreatorGridSkeleton";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";

export function CreatorDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Fetch nyata lewat facade service (s1-creators) — bukan lagi src/data/creators.ts.
  const loadCreators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCreators();
      if (res.success && res.data) {
        setCreators(res.data);
      } else {
        setError(res.error || "Gagal memuat data kreator.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("rating");
  };

  // Filter & sort memakai field kanon (bukan parsing string followers/harga).
  const filteredCreators = creators
    .filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) || c.bio.toLowerCase().includes(q);
      const matchCategory = selectedCategory === "all" || c.niche === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price_asc") return a.startingPrice - b.startingPrice;
      if (sortBy === "jobs") return b.completedJobs - a.completedJobs;
      if (sortBy === "engagement") return b.engagementRate - a.engagementRate;
      return 0;
    });

  return (
    <UmkmPageWrapper>
      {/* Header */}
      <CreatorDirectoryHeader />

      {/* Stats Cards */}
      <CreatorSummaryCards totalCreators={creators.length} />

      {/* Sticky toolbar — direct grid child so sticky has full grid-container height to work with */}
      <CreatorToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => startTransition(() => setSearchQuery(q))}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => startTransition(() => setSelectedCategory(cat))}
          sortBy={sortBy}
          onSortByChange={(s) => startTransition(() => setSortBy(s))}
        />

      {/* Creators Grid / Loading / Error / Empty State */}
      {loading ? (
        <CreatorGridSkeleton />
      ) : error ? (
        <CreatorErrorState message={error} onRetry={loadCreators} />
      ) : filteredCreators.length > 0 ? (
        <div className="responsive-card-grid-2">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={toCreatorView(creator)} />
          ))}
        </div>
      ) : (
        <CreatorEmptyState onReset={handleResetFilters} />
      )}
    </UmkmPageWrapper>
  );
}
