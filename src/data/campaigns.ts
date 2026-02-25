import type { Campaign } from "@/types/campaign";

export const CAMPAIGN_CATEGORIES = [
  "Kuliner",
  "Fashion",
  "Handmade",
  "Kosmetik",
] as const;

export const dummyCampaigns: Campaign[] = [
  {
    id: "1",
    brandName: "Dapur Sehat",
    category: "Kuliner",
    imageUrl:
      "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop",
    rate: "Rp. 5.000/1K View",
    minView: "5.000",
    budgetUsedPercent: 50,
    totalBudget: "Rp. 10.000.000",
  },
  {
    id: "2",
    brandName: "Sama Rungink",
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=300&fit=crop",
    rate: "Rp. 3.000/1K View",
    minView: "10.000",
    budgetUsedPercent: 30,
    totalBudget: "Rp. 8.000.000",
  },
  {
    id: "3",
    brandName: "Batik Cantik",
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop",
    rate: "Rp. 7.000/1K View",
    minView: "3.000",
    budgetUsedPercent: 70,
    totalBudget: "Rp. 15.000.000",
  },
  {
    id: "4",
    brandName: "Kopi Mantap",
    category: "Kuliner",
    imageUrl:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
    rate: "Rp. 4.000/1K View",
    minView: "8.000",
    budgetUsedPercent: 45,
    totalBudget: "Rp. 12.000.000",
  },
  {
    id: "5",
    brandName: "Skincare Glow",
    category: "Kosmetik",
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
    rate: "Rp. 6.000/1K View",
    minView: "7.000",
    budgetUsedPercent: 60,
    totalBudget: "Rp. 20.000.000",
  },
  {
    id: "6",
    brandName: "Tas Handmade",
    category: "Handmade",
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop",
    rate: "Rp. 2.500/1K View",
    minView: "4.000",
    budgetUsedPercent: 25,
    totalBudget: "Rp. 5.000.000",
  },
  {
    id: "7",
    brandName: "Sambal Pedas",
    category: "Kuliner",
    imageUrl:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop",
    rate: "Rp. 3.500/1K View",
    minView: "6.000",
    budgetUsedPercent: 80,
    totalBudget: "Rp. 9.000.000",
  },
  {
    id: "8",
    brandName: "Hijab Modern",
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=300&fit=crop",
    rate: "Rp. 5.500/1K View",
    minView: "12.000",
    budgetUsedPercent: 40,
    totalBudget: "Rp. 18.000.000",
  },
];
