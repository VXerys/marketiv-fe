"use client";

import { useState, useEffect, useTransition } from "react";
import { dummyCreators } from "@/data/creators";
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

  // Simulate loading delay on mount to showcase premium skeletons
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("rating");
  };

  // Parsing followers helper for numeric comparison sorting
  const parseFollowers = (val: string) => {
    const numericStr = val.toUpperCase().replace("K", "").replace("M", "");
    const base = parseFloat(numericStr) || 0;
    if (val.toUpperCase().includes("M")) return base * 1000000;
    if (val.toUpperCase().includes("K")) return base * 1000;
    return base;
  };

  // Parsing estimated starting salary
  const parsePrice = (val: string) => {
    const cleaned = val.replace(/[^0-9,.]/g, "").replace(",", ".");
    const base = parseFloat(cleaned) || 0;
    if (val.toUpperCase().includes("JT") || val.toUpperCase().includes("JUTA")) {
      return base * 1000000;
    }
    return base;
  };

  // Filter & Sort logic
  const filteredCreators = dummyCreators
    .filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory =
        selectedCategory === "all" ||
        c.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "followers") {
        return parseFollowers(b.followers) - parseFollowers(a.followers);
      }
      if (sortBy === "price_asc") {
        return parsePrice(a.estimatedSalary) - parsePrice(b.estimatedSalary);
      }
      if (sortBy === "reviews") {
        return b.totalReviews - a.totalReviews;
      }
      return 0;
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <CreatorDirectoryHeader />

      {/* Stats Cards */}
      <CreatorSummaryCards />

      {/* Search and Filters */}
      <CreatorToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => startTransition(() => setSearchQuery(q))}
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => startTransition(() => setSelectedCategory(cat))}
        sortBy={sortBy}
        onSortByChange={(s) => startTransition(() => setSortBy(s))}
      />

      {/* Creators Grid / Empty State */}
      {loading ? (
        <CreatorGridSkeleton />
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <CreatorEmptyState onReset={handleResetFilters} />
      )}
    </div>
  );
}
