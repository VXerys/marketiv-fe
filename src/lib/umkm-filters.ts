import { Campaign, CreatorProfile, NegotiationOrder, Transaction } from "@/types/umkm-dashboard.types";

export function filterCampaigns(
  campaigns: Campaign[],
  filters: { search?: string; status?: string; niche?: string; sortBy?: string }
): Campaign[] {
  let result = [...campaigns];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(searchLower) ||
        c.brief.toLowerCase().includes(searchLower)
    );
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.niche && filters.niche !== "all") {
    result = result.filter((c) => c.niche === filters.niche);
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "budget_desc":
        result.sort((a, b) => b.totalBudgetEscrow - a.totalBudgetEscrow);
        break;
      case "views_desc":
        result.sort((a, b) => b.totalViews - a.totalViews);
        break;
      case "price_desc":
        result.sort((a, b) => b.pricePerThousandViews - a.pricePerThousandViews);
        break;
    }
  }

  return result;
}

export function filterCreators(
  creators: CreatorProfile[],
  filters: { search?: string; niche?: string; sortBy?: string }
): CreatorProfile[] {
  let result = [...creators];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.username.toLowerCase().includes(searchLower) ||
        c.bio.toLowerCase().includes(searchLower)
    );
  }

  if (filters.niche && filters.niche !== "all") {
    result = result.filter((c) => c.niche === filters.niche);
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "rating_desc":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "price_asc":
        result.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price_desc":
        result.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      case "jobs_desc":
        result.sort((a, b) => b.completedJobs - a.completedJobs);
        break;
      case "engagement_desc":
        result.sort((a, b) => b.engagementRate - a.engagementRate);
        break;
    }
  }

  return result;
}

export function filterNegotiations(
  negotiations: NegotiationOrder[],
  filters: { search?: string; status?: string; sortBy?: string }
): NegotiationOrder[] {
  let result = [...negotiations];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (n) =>
        n.projectTitle.toLowerCase().includes(searchLower) ||
        n.creatorName.toLowerCase().includes(searchLower) ||
        n.scope.toLowerCase().includes(searchLower)
    );
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((n) => n.status === filters.status);
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        break;
      case "price_desc":
        result.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case "deadline_asc":
        result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }
  }

  return result;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: { type?: string; status?: string; search?: string }
): Transaction[] {
  let result = [...transactions];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower) ||
        (t.midtransOrderId && t.midtransOrderId.toLowerCase().includes(searchLower))
    );
  }

  if (filters.type && filters.type !== "all") {
    result = result.filter((t) => t.type === filters.type);
  }

  if (filters.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }

  // Always sorted by date descending by default
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return result;
}
