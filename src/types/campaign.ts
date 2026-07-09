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
  name: string;            // Peta ke profiles.nama_lengkap
  description: string;     // Peta ke profiles.bio
  category: string;        // Peta ke profiles.niche
  imageUrl: string;        // Peta ke profiles.foto_profil_url
  estimatedSalary: string; // Peta ke profiles.harga_mulai
  followers: string;
  rating: number;
  totalReviews: number;
  isVerified?: boolean;    // Peta ke profiles.is_verified
  rateCardCount?: number;  // Peta ke DTO rate_card_count
  location?: string;       // Peta ke profiles.location
}
