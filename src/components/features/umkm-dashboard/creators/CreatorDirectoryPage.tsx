"use client";

import { useState, useEffect, useTransition } from "react";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { dummyCreators } from "@/data/creators";
import { UmkmPageWrapper } from "../shared/UmkmPageWrapper";
import { CreatorDirectoryHeader } from "./CreatorDirectoryHeader";
import { CreatorSummaryCards } from "./CreatorSummaryCards";
import { CreatorToolbar } from "./CreatorToolbar";
import { CreatorCard } from "./CreatorCard";
import { CreatorGridSkeleton } from "./CreatorGridSkeleton";
import { CreatorEmptyState } from "./CreatorEmptyState";

export function CreatorDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const { toolbarRef, isSticky: isToolbarSticky } = useStickyToolbar();

  // Simulate loading delay on mount to showcase premium skeletons
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("rating");
  };

  const parseFollowers = (val: string) => {
    const numericStr = val.toUpperCase().replace("K", "").replace("M", "");
    const base = parseFloat(numericStr) || 0;
    if (val.toUpperCase().includes("M")) return base * 1_000_000;
    if (val.toUpperCase().includes("K")) return base * 1_000;
    return base;
  };

  const parsePrice = (val: string) => {
    const cleaned = val.replace(/[^0-9,.]/g, "").replace(",", ".");
    const base = parseFloat(cleaned) || 0;
    if (val.toUpperCase().includes("JT") || val.toUpperCase().includes("JUTA")) return base * 1_000_000;
    return base;
  };

  const filteredCreators = dummyCreators
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "rating")    return b.rating - a.rating;
      if (sortBy === "followers") return parseFollowers(b.followers) - parseFollowers(a.followers);
      if (sortBy === "price_asc") return parsePrice(a.estimatedSalary) - parsePrice(b.estimatedSalary);
      if (sortBy === "reviews")   return b.totalReviews - a.totalReviews;
      return 0;
    });

  return (
    <UmkmPageWrapper>
      {/* Header */}
      <CreatorDirectoryHeader />

      {/* Stats Cards */}
      <CreatorSummaryCards />

      {/* Sticky toolbar — direct grid child so sticky has full grid-container height to work with */}
      <div ref={toolbarRef} style={{ position: "sticky", top: 0, zIndex: 30 }}>
        <CreatorToolbar
          searchQuery={searchQuery}
          onSearchChange={(q) => startTransition(() => setSearchQuery(q))}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => startTransition(() => setSelectedCategory(cat))}
          sortBy={sortBy}
          onSortByChange={(s) => startTransition(() => setSortBy(s))}
          isSticky={isToolbarSticky}
        />
      </div>

      {/* Creators Grid / Empty State */}
      {loading ? (
        <CreatorGridSkeleton />
      ) : filteredCreators.length > 0 ? (
        <div className="responsive-card-grid-2">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <CreatorEmptyState onReset={handleResetFilters} />
      )}
    </UmkmPageWrapper>
  );
}
