export interface Campaign {
  id: string;
  brandName: string;
  category: string;
  imageUrl: string;
  rate: string;
  minView: string;
  budgetUsedPercent: number;
  totalBudget: string;
}

export interface Creator {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  estimatedSalary: string;
  followers: string;
  rating: number;
  totalReviews: number;
}
