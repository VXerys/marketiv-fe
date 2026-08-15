import Link from "next/link";
import { fetchDashboardMetrics } from "@/features/admin/dashboard/fixtures/dashboard.fixtures";
import { getCampaignSubmissions } from "@/features/admin/submissions/services/submission.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
  Eye,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";
import { formatRupiah, formatDateTime } from "@/lib/admin/formatters";

export default async function AdminDashboardOverviewPage() {
  const metrics = await fetchDashboardMetrics();
  const pendingSubmissions = await getCampaignSubmissions("pending");

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Hero Banner with Dynamic Gradient Mesh */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c172b] via-[#111e38] to-[#182747] p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        {/* Ambient Decorative Lighting */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 px-3.5 py-1 text-xs font-extrabold text-[#f97316] border border-orange-500/30 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span>Marketiv Control Plane • Live Operational Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Pusat Kendali Operasional Admin
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Kelola dan validasi postingan campaign Pay-Per-View secara manual. Pastikan verified views dan estimasi reward akurat sebelum pencairan saldo kreator.
            </p>

            {/* Live Stats Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{metrics.pendingSubmissionsCount} Antrean Menunggu</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{metrics.verifiedTodayCount} Diverifikasi Hari Ini</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md border border-white/10">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <span>SLA Validasi &lt; 2 Jam</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button Hero CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link href="/submissions">
              <Button className="w-full h-12 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:from-[#ea580c] hover:to-[#c2410c] gap-2.5 text-xs font-extrabold px-6 rounded-2xl shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-[1.02] cursor-pointer">
                <Sparkles className="h-4 w-4 text-amber-200" />
                <span>Periksa Antrean Submission ({metrics.pendingSubmissionsCount})</span>
                <ArrowRight className="h-4 w-4 text-amber-200" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sistem Enkripsi & Permission Admin Safe</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Pending Submission */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-[#fffdf8] to-[#fff7ed]/50 border-orange-200/90 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-orange-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-amber-900/70">
              Pending Submissions
            </CardTitle>
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5 text-white shadow-md shadow-orange-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-[#0c172b] font-mono tracking-tight">
                {metrics.pendingSubmissionsCount}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200">
                <AlertCircle className="h-3 w-3 text-orange-600" />
                Butuh Review
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
              Jumlah postingan kreator yang menunggu validasi views manual.
            </p>
            {/* Progress indicator bar */}
            <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full w-[65%] animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Diverifikasi Hari Ini */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-[#fffdf8] to-[#f0fdf4]/50 border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-emerald-900/70">
              Diverifikasi Hari Ini
            </CardTitle>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 text-white shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-[#0c172b] font-mono tracking-tight">
                {metrics.verifiedTodayCount}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                +12% vs Kemarin
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
              Total submission yang disetujui atau ditolak dalam 24 jam terakhir.
            </p>
            <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full w-[85%]" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Campaign Aktif */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-[#fffdf8] to-[#eff6ff]/50 border-blue-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-blue-900/70">
              Campaign Aktif
            </CardTitle>
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20">
              <Megaphone className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-[#0c172b] font-mono tracking-tight">
                {metrics.activeCampaignsCount}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
                <Layers className="h-3 w-3 text-blue-600" />
                Active PPV
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
              Campaign Pay-Per-View yang sedang berjalan dan menerima submission.
            </p>
            <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full w-[50%]" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: SLA & Operational Rate */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-[#fffdf8] to-[#faf5ff]/50 border-purple-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-purple-900/70">
              Akurasi Validasi
            </CardTitle>
            <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 text-white shadow-md shadow-purple-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-black text-[#0c172b] font-mono tracking-tight">
                99.8%
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                Excellent
              </span>
            </div>
            <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
              Tingkat akurasi audit manual views & keabsahan tautan TikTok.
            </p>
            <div className="w-full bg-stone-200/70 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full w-[98%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Live Submissions Preview + Operational Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Pending Submissions Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-1 rounded-full bg-[#f97316]" />
              <h2 className="text-base font-extrabold text-[#0c172b] tracking-tight">
                Antrean Validasi Teratas (Pending Queue)
              </h2>
            </div>
            <Link
              href="/submissions"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-600 hover:text-orange-700 hover:underline"
            >
              <span>Lihat Semua ({metrics.pendingSubmissionsCount})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingSubmissions.length === 0 ? (
              <Card className="p-6 text-center text-stone-500 bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-xs">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-stone-700">Semua Antrean Submission Telah Diverifikasi</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Tidak ada postingan baru yang menunggu validasi manual Admin.</p>
              </Card>
            ) : (
              pendingSubmissions.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  className="p-4 bg-[#fffdf8] hover:bg-white border-stone-200/90 shadow-2xs hover:shadow-md transition-all rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0c172b] font-black text-white text-sm shadow-md shadow-[#0c172b]/10 group-hover:scale-105 transition-transform">
                      {item.creator.name.charAt(0)}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-stone-900 text-sm truncate">
                          {item.creator.name}
                        </span>
                        <span className="font-mono text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                          {item.creator.username}
                        </span>
                        <span className="text-[10px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full uppercase">
                          {item.platform}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-stone-700 line-clamp-1">
                        {item.campaign.title}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        <span>UMKM: <strong className="text-stone-800">{item.umkm.name}</strong></span>
                        <span>•</span>
                        <span className="text-orange-700 font-bold">
                          {formatRupiah(item.campaign.rewardPer1000Views)} / 1k views
                        </span>
                        <span>•</span>
                        <span className="font-mono">{formatDateTime(item.submittedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <a
                      href={item.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                      title="Buka Link TikTok"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <Link href={`/submissions?id=${item.id}`}>
                      <Button className="h-10 bg-[#f97316] text-white hover:bg-[#ea580c] text-xs font-extrabold px-4 rounded-xl shadow-xs gap-1.5 cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Periksa</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Operational Guidelines & Shortcuts */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-1 rounded-full bg-blue-600" />
            <h2 className="text-base font-extrabold text-[#0c172b] tracking-tight">
              Panduan Validasi Admin
            </h2>
          </div>

          <Card className="p-5 bg-gradient-to-br from-[#fffdf8] to-[#f8fafc] border-stone-200/90 shadow-sm space-y-4 rounded-2xl">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/80 border border-orange-200/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-500 font-extrabold text-white text-xs">
                  1
                </span>
                <div className="space-y-0.5">
                  <p className="font-bold text-orange-950">Buka Postingan TikTok</p>
                  <p className="text-stone-600 leading-snug">
                    Klik ikon external link untuk memastikan video dapat diakses publik.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-extrabold text-white text-xs">
                  2
                </span>
                <div className="space-y-0.5">
                  <p className="font-bold text-blue-950">Cek Jumlah Views Live</p>
                  <p className="text-stone-600 leading-snug">
                    Catat angka views yang tertera pada video TikTok kreator.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 font-extrabold text-white text-xs">
                  3
                </span>
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-950">Input Views & Approve</p>
                  <p className="text-stone-600 leading-snug">
                    Inputkan angka views ke modal review untuk mengunci estimasi reward.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span>Marketiv Audit Rules v1.0</span>
              <span className="text-emerald-700 font-extrabold">Appwrite Verified</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
