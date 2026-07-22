/**
 * LEGACY — jalur data bypass Overview UMKM.
 *
 * Tipe view-model di bawah ini SENGAJA dikolokasi di sini (bukan di
 * src/types/) karena file ini satu-satunya konsumennya, dan keduanya akan
 * dihapus bersamaan pada task `s1-delete-data` setelah Overview di-wire ke
 * getDashboardSummary()/getCampaigns() (`s1-overview`).
 *
 * Label Bahasa Indonesia di sini adalah teks tampilan, bukan nilai status
 * kanon. Nilai status kanon ada di src/types/domain.ts.
 */

export interface CampaignSummary {
  title: string;
  status: "Aktif" | "Draft" | "Penuh" | "Selesai" | "Dibatalkan";
  description: string;
  totalViews: number;
  viewsTrend: string;
  budgetUsed: number;
  budgetTotal: number;
  activeCreatorsCount: number;
  targetCreatorsCount: number;
  progressPercent: number;
  imageUrl: string;
}

export interface EscrowBalance {
  totalAmount: number;
  infoText: string;
}

export interface SubmissionPending {
  id: string;
  creatorName: string;
  campaignTitle: string;
  platform: "tiktok" | "instagram";
  status: "Pending" | "Valid" | "Invalid";
  timeAgo: string;
}

export interface ChartBarData {
  day: string;
  value: string;
  percent: number;
  active: boolean;
}

export interface UmkmDashboardData {
  businessName: string;
  greeting: string;
  subtitle: string;
  campaign: CampaignSummary;
  escrow: EscrowBalance;
  submissions: SubmissionPending[];
  chartData: ChartBarData[];
  kpis?: {
    campaignActive: number;
    totalSpend: number;
    escrowBalance: number;
    creatorJoined: number;
    viewsValid: number;
    pendingSubmissions: number;
  };
  insights?: {
    id: string;
    text: string;
    type: "success" | "warning" | "info" | "purple";
  }[];
  activities?: {
    id: string;
    title: string;
    description: string;
    type: "submission" | "campaign" | "payment" | "progress";
    time: string;
  }[];
}

export const UMKM_DASHBOARD_MOCK_DATA: UmkmDashboardData = {
  businessName: "Dapur Sehat Sukabumi",
  greeting: "Selamat pagi, Dapur Sehat",
  subtitle: "Berikut ringkasan performa campaign Anda hari ini.",
  campaign: {
    title: "Sambal Matah Dapur Sehat",
    status: "Aktif",
    description: "Campaign prioritas bulan ini",
    totalViews: 184200,
    viewsTrend: "+12% mg lalu",
    budgetUsed: 1500000, // Rp 1.5 Jt
    budgetTotal: 3300000, // Rp 3.3 Jt
    activeCreatorsCount: 8,
    targetCreatorsCount: 12,
    progressPercent: 45,
    imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=200&auto=format&fit=crop" // fallback free high quality image or similar
  },
  escrow: {
    totalAmount: 3250000, // Rp 3.250.000
    infoText: "Dana sedang ditahan aman. Akan dilepas setelah bukti tayang diverifikasi."
  },
  submissions: [
    {
      id: "sub-1",
      creatorName: "Nadia Foodie",
      campaignTitle: "Sambal Matah Dapur Sehat",
      platform: "tiktok",
      status: "Pending",
      timeAgo: "2 jam lalu"
    },
    {
      id: "sub-2",
      creatorName: "Chef Budi",
      campaignTitle: "Paket Nasi Sehat",
      platform: "instagram",
      status: "Pending",
      timeAgo: "5 jam lalu"
    }
  ],
  chartData: [
    { day: "Sen", value: "12k", percent: 30, active: false },
    { day: "Sel", value: "15k", percent: 40, active: false },
    { day: "Rab", value: "22k", percent: 60, active: false },
    { day: "Kam", value: "45k", percent: 90, active: false },
    { day: "Jum", value: "38k", percent: 75, active: false },
    { day: "Sab", value: "52k", percent: 100, active: true },
    { day: "Min", value: "28k", percent: 55, active: false }
  ],
  kpis: {
    campaignActive: 1,
    totalSpend: 4800000,
    escrowBalance: 3250000,
    creatorJoined: 8,
    viewsValid: 184200,
    pendingSubmissions: 2
  },
  insights: [
    {
      id: "ins-1",
      text: "Campaign Kuliner/Food memiliki performa views 28% lebih tinggi minggu ini.",
      type: "purple"
    },
    {
      id: "ins-2",
      text: "Tambahkan kreator ke campaign aktif Anda untuk meningkatkan estimasi views mingguan.",
      type: "info"
    },
    {
      id: "ins-3",
      text: "Dana escrow sebesar Rp 3.250.000 aman terjamin di dalam escrow pool Marketiv.",
      type: "success"
    }
  ],
  activities: [
    {
      id: "act-1",
      title: "Submission baru dari Nadia Foodie",
      description: "Mengirimkan link posting TikTok untuk campaign 'Sambal Matah'",
      type: "submission",
      time: "2 jam lalu"
    },
    {
      id: "act-2",
      title: "Submission baru dari Chef Budi",
      description: "Mengirimkan link posting Instagram untuk campaign 'Paket Nasi Sehat'",
      type: "submission",
      time: "5 jam lalu"
    },
    {
      id: "act-3",
      title: "Pembayaran Escrow Berhasil",
      description: "Dana Rp 3.300.000 sukses diamankan ke sistem Escrow",
      type: "payment",
      time: "1 hari lalu"
    },
    {
      id: "act-4",
      title: "Campaign Baru Aktif",
      description: "Campaign 'Sambal Matah' resmi aktif dengan kuota 12 kreator",
      type: "campaign",
      time: "2 hari lalu"
    }
  ]
};
