import { UmkmDashboardData } from "@/types/umkmDashboard";

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
  ]
};
