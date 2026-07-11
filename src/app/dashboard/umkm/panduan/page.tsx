"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  FileText,
  Clock,
  Hash,
  AlertTriangle,
  Ban,
  ShieldAlert,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "@/components/features/umkm-dashboard/shared/UmkmPageWrapper";
import { UMKM_DASHBOARD_MOCK_DATA } from "@/data/umkmDashboard";

type TabType = "rules" | "faq" | "terms";

export default function FAQRulesDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("rules");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const businessName = UMKM_DASHBOARD_MOCK_DATA.businessName;

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const RULES_DATA = [
    {
      id: 1,
      title: "Konten Wajib Orisinal & Mengikuti Brief",
      desc: "Setiap video harus karya orisinal milikmu dan sesuai dengan panduan (Brief) kampanye. Dilarang menjiplak atau mengklaim karya Kreator lain.",
      Icon: FileText,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "rgba(37, 99, 235, 0.08)",
    },
    {
      id: 2,
      title: "Submit Video Maksimum 24 Jam Setelah Posting",
      desc: "Video harus diajukan ke Platform lewat tombol Klaim dalam 24 jam sejak waktu posting. Lewat dari itu, video tidak terdeteksi sistem.",
      Icon: Clock,
      color: "#16a34a",
      bg: "#f0fdf4",
      border: "rgba(22, 163, 74, 0.08)",
    },
    {
      id: 3,
      title: "Wajib Pakai Seluruh Hashtag Kampanye",
      desc: "Caption video harus mengandung seluruh hashtag wajib pada saat pengajuan. Tanpa hashtag wajib, video tidak akan terdeteksi.",
      Icon: Hash,
      color: "#d97706",
      bg: "#fef3c7",
      border: "rgba(217, 119, 6, 0.08)",
    },
    {
      id: 4,
      title: "Tidak Boleh Hapus Video Selama 180 Hari",
      desc: "Video harus tetap publik selama 180 hari sejak penghasilan terakhir diperoleh. Penghapusan, mengatur ke privat, atau menghapus hashtag wajib mengakibatkan clawback penghasilan dan akun otomatis dibekukan.",
      Icon: AlertTriangle,
      color: "#dc2626",
      bg: "#fee2e2",
      border: "rgba(220, 38, 38, 0.08)",
    },
    {
      id: 5,
      title: "Konten Dilarang yang Mengandung Pelanggaran",
      desc: "SARA, hate speech, pornografi, kekerasan, hoaks, atau promosi produk ilegal (narkoba, judi online ilegal) dilarang.",
      Icon: Ban,
      color: "#db2777",
      bg: "#fdf2f8",
      border: "rgba(219, 39, 119, 0.08)",
    },
    {
      id: 6,
      title: "Tidak Ada Manipulasi Views, Interaksi, atau Boosting",
      desc: "Dilarang menggunakan bot, view farm, beli views, story boosting, ads boosting (Promote/Spark Ads/Meta Ads), atau memanipulasi likes, komentar, dan shares untuk menaikkan performa video. Video yang views/engagement-nya berasal dari sumber tidak organik akan dianggap pelanggaran berat. Penghasilan dari video tersebut dan saldo di akun kamu tidak bisa dicairkan, dan akun langsung di-suspend atau banned permanen tergantung tingkat pelanggaran.",
      Icon: ShieldAlert,
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "rgba(124, 58, 237, 0.08)",
    },
    {
      id: 7,
      title: "Collab Post Hanya Boleh Diajukan Pengunggah Asli",
      desc: "Untuk video Collab Post di mana satu video terhubung dengan dua atau lebih akun, hanya akun yang melakukan unggahan asli yang berhak mengajukan video. Akun yang hanya ditandai sebagai kolaborator tidak berhak submit.",
      Icon: Share2,
      color: "#0891b2",
      bg: "#ecfeff",
      border: "rgba(8, 145, 178, 0.08)",
    },
  ];

  const FAQ_DATA = [
    {
      question: "Apakah ada biaya yang dipotong dari penghasilan?",
      answer: "Ya, terdapat biaya platform sebesar 20% dari total penghasilan kotor Anda (berlaku mulai 1 Juli 2026). Selain itu, terdapat biaya pencairan (withdrawal fee) sebesar Rp 10.000 per transaksi pencairan.",
    },
    {
      question: "Kapan bisa pencairan?",
      answer: "Pencairan dana dapat diajukan kapan saja setelah saldo masuk ke wallet Anda, dengan waktu proses kliring bank berkisar antara 1-3 hari kerja.",
    },
    {
      question: "Apakah pencairan otomatis setelah video disetujui?",
      answer: "Tidak, pencairan tidak otomatis. Anda harus mengajukan penarikan dana secara manual melalui menu Keuangan di dashboard Kreator Anda.",
    },
    {
      question: "Kenapa pencairan belum cair?",
      answer: "Pastikan Anda telah mengisi data rekening bank dengan benar. Keterlambatan pencairan biasanya disebabkan oleh proses verifikasi bank penerima, kliring antar-bank pada hari libur, atau kendala sistem pembayaran pihak ketiga.",
    },
    {
      question: "Apakah masih bisa pencairan setelah kampanye berakhir?",
      answer: "Ya, saldo yang telah masuk ke wallet Anda tetap aman dan dapat dicairkan kapan saja, bahkan setelah kampanye yang bersangkutan telah berakhir.",
    },
    {
      question: "Apa itu batas maksimum pembayaran per video?",
      answer: "Batas maksimum pembayaran per video disesuaikan dengan kuota budget kampanye dan batas rate card yang disepakati saat inisiasi penawaran kolaborasi.",
    },
  ];

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <UmkmPageWrapper>
        {/* Header Section */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.68rem] font-[800] text-orange-600 uppercase tracking-widest">
            Panduan & Kebijakan
          </span>
          <h1 className="text-[1.8rem] font-[850] text-ink-900 leading-tight tracking-[-0.03em] font-display">
            FAQ & Rules
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/60 max-w-md shadow-3xs">
          {[
            { id: "rules", label: "Rules" },
            { id: "faq", label: "FAQ" },
            { id: "terms", label: "Terms & Conditions" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/10"
                    : "text-ink-600 hover:text-ink-900 hover:bg-white/60"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panel Content */}
        <div className="space-y-6">
          {/* Rules Panel */}
          {activeTab === "rules" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <h2 className="text-[1.05rem] font-[800] text-ink-900 font-display">
                  Aturan Kreator Konten.com
                </h2>
                <span className="text-[0.74rem] font-bold text-ink-400">
                  Versi: 13 Mei 2026
                </span>
              </div>

              <div className="grid gap-4">
                {RULES_DATA.map((rule) => {
                  const RuleIcon = rule.Icon;
                  return (
                    <div
                      key={rule.id}
                      className="flex gap-4 p-5 rounded-2xl bg-white border border-neutral-200/60 shadow-3xs hover:border-neutral-300 transition-all duration-200"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          background: rule.bg,
                          borderColor: rule.border,
                        }}
                      >
                        <RuleIcon size={18} color={rule.color} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[0.92rem] font-bold text-ink-900">
                          {rule.id}. {rule.title}
                        </h3>
                        <p className="text-[0.84rem] text-ink-600 leading-relaxed font-semibold">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FAQ Panel */}
          {activeTab === "faq" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <h2 className="text-[1.05rem] font-[800] text-ink-900 font-display">
                  FAQ Kreator Konten.com
                </h2>
                <span className="text-[0.74rem] font-bold text-ink-400">
                  Versi: 13 Mei 2026
                </span>
              </div>

              <div className="space-y-4">
                <span className="block text-[0.66rem] font-[800] text-ink-400 uppercase tracking-widest mb-2.5">
                  Penghasilan & Pencairan
                </span>

                <div className="grid gap-3.5">
                  {FAQ_DATA.map((faq, idx) => {
                    const isOpen = openFAQIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-neutral-200/60 bg-white overflow-hidden shadow-3xs hover:border-neutral-300 transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFAQ(idx)}
                          className="w-full flex items-center justify-between p-5 text-left font-bold text-[0.9rem] text-ink-900 hover:bg-neutral-50/50 transition-all cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            size={16}
                            className={cn(
                              "text-ink-400 transition-transform duration-200 shrink-0 ml-4",
                              isOpen && "rotate-180 text-orange-500"
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-[0.84rem] text-ink-600 leading-relaxed font-semibold border-t border-neutral-100 bg-neutral-50/20 animate-in fade-in slide-in-from-top-1 duration-200">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Panel */}
          {activeTab === "terms" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <h2 className="text-[1.05rem] font-[800] text-ink-900 font-display">
                  Syarat & Ketentuan Kreator
                </h2>
                <span className="text-[0.74rem] font-bold text-ink-400">
                  Versi: 25 Juni 2026
                </span>
              </div>

              <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-3xs space-y-6 text-[0.86rem] leading-relaxed text-ink-700 font-semibold">
                <div className="space-y-1 border-b border-neutral-100 pb-4">
                  <h3 className="text-[0.98rem] font-bold text-ink-900">
                    Konten.com: Syarat & Ketentuan untuk Kreator
                  </h3>
                  <span className="block text-[0.72rem] text-ink-400 font-bold">
                    Berlaku Efektif: 25 Juni 2026
                  </span>
                </div>

                {/* Orange Callout Box */}
                <div className="p-5 rounded-xl border border-orange-200 bg-orange-50/50 text-[0.82rem] leading-relaxed text-orange-850 relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-orange-500" />
                  <span className="block font-bold mb-1.5 text-orange-700 uppercase tracking-wider text-[0.72rem]">
                    Perubahan Biaya (Berlaku Efektif 1 Juli 2026 Pukul 00:00 WIB)
                  </span>
                  (a) Biaya platform naik dari 0% (masa promo) menjadi 20% dari penghasilan kotor (gross) Anda. <br />
                  (b) Biaya pencairan menjadi Rp 10.000 per pencairan untuk seluruh metode pembayaran. Apabila Anda tidak menyetujui perubahan biaya ini, Anda dapat berhenti menggunakan Platform dan mencairkan saldo Berhasil Diproses sebelum tanggal efektif sesuai Pasal 10.
                </div>

                <div className="space-y-3.5">
                  <h4 className="text-[0.92rem] font-bold text-ink-900 border-b border-neutral-100 pb-2">
                    1. Pendahuluan
                  </h4>
                  <p>
                    Syarat dan Ketentuan ini (&quot;S&K&quot;) mengatur penggunaan platform Konten.com (&quot;Platform&quot;) yang dioperasikan oleh PT Konten Kreasi Media (&quot;Perusahaan&quot;, &quot;kami&quot;) oleh Anda sebagai Kreator (&quot;Anda&quot; atau &quot;Kreator&quot;). Dengan mendaftar akun dan menggunakan Platform, Anda menyetujui seluruh isi S&K ini.
                  </p>
                  <p>
                    Konten.com adalah platform marketplace yang menghubungkan Brand (pengiklan) dengan pembuat konten (&quot;Kreator&quot;) yang mendistribusikan konten video pendek di TikTok, Instagram Reels, dan YouTube Shorts. Kreator memperoleh penghasilan berdasarkan jumlah views terverifikasi yang dihasilkan oleh klip mereka pada kampanye yang aktif.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <h4 className="text-[0.92rem] font-bold text-ink-900 border-b border-neutral-100 pb-2">
                    2. Kelayakan Akun
                  </h4>
                  <p>
                    Kreator harus berusia minimal 18 tahun atau memiliki persetujuan orang tua/wali hukum yang sah. Akun media sosial yang didaftarkan harus merupakan akun milik pribadi, aktif, dan tidak dimanipulasi performanya.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
