"use client";

import { useState } from "react";
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

type TabType = "rules" | "faq" | "terms";

const CREATOR_GRADIENT = "linear-gradient(135deg, #2563eb, #7c3aed)";
const CREATOR_GRADIENT_SOFT =
  "linear-gradient(135deg, rgba(37,99,235,.10) 0%, rgba(124,58,237,.08) 100%)";

const RULES_DATA = [
  {
    id: 1,
    title: "Konten Wajib Orisinal & Mengikuti Brief",
    desc: "Setiap video harus karya orisinal milikmu dan sesuai dengan panduan (Brief) kampanye. Dilarang menjiplak atau mengklaim karya Kreator lain.",
    Icon: FileText,
    color: "#2563eb",
    bg: "#eff6ff",
    border: "rgba(37, 99, 235, 0.12)",
  },
  {
    id: 2,
    title: "Kirim Video Maksimum 24 Jam Setelah Posting",
    desc: "Video harus diajukan ke Platform lewat tombol Klaim dalam 24 jam sejak waktu posting. Lewat dari itu, video tidak terdeteksi sistem.",
    Icon: Clock,
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "rgba(22, 163, 74, 0.12)",
  },
  {
    id: 3,
    title: "Wajib Pakai Seluruh Hashtag Kampanye",
    desc: "Caption video harus mengandung seluruh hashtag wajib pada saat pengajuan. Tanpa hashtag wajib, video tidak akan terdeteksi.",
    Icon: Hash,
    color: "#d97706",
    bg: "#fef3c7",
    border: "rgba(217, 119, 6, 0.12)",
  },
  {
    id: 4,
    title: "Tidak Boleh Hapus Video Selama 180 Hari",
    desc: "Video harus tetap publik selama 180 hari sejak penghasilan terakhir diperoleh. Penghapusan, mengatur ke privat, atau menghapus hashtag wajib mengakibatkan clawback penghasilan dan akun otomatis dibekukan.",
    Icon: AlertTriangle,
    color: "#dc2626",
    bg: "#fee2e2",
    border: "rgba(220, 38, 38, 0.12)",
  },
  {
    id: 5,
    title: "Konten Dilarang yang Mengandung Pelanggaran",
    desc: "SARA, hate speech, pornografi, kekerasan, hoaks, atau promosi produk ilegal (narkoba, judi online ilegal) dilarang.",
    Icon: Ban,
    color: "#db2777",
    bg: "#fdf2f8",
    border: "rgba(219, 39, 119, 0.12)",
  },
  {
    id: 6,
    title: "Tidak Ada Manipulasi Views, Interaksi, atau Boosting",
    desc: "Dilarang menggunakan bot, view farm, beli views, story boosting, ads boosting (Promote/Spark Ads/Meta Ads), atau memanipulasi likes, komentar, dan shares untuk menaikkan performa video. Video yang views/engagement-nya berasal dari sumber tidak organik akan dianggap pelanggaran berat.",
    Icon: ShieldAlert,
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "rgba(124, 58, 237, 0.12)",
  },
  {
    id: 7,
    title: "Collab Post Hanya Boleh Diajukan Pengunggah Asli",
    desc: "Untuk video Collab Post di mana satu video terhubung dengan dua atau lebih akun, hanya akun yang melakukan unggahan asli yang berhak mengajukan video. Akun yang hanya ditandai sebagai kolaborator tidak berhak mengajukan.",
    Icon: Share2,
    color: "#0891b2",
    bg: "#ecfeff",
    border: "rgba(8, 145, 178, 0.12)",
  },
];

const FAQ_DATA = [
  {
    question: "Apakah ada biaya yang dipotong dari penghasilan?",
    answer:
      "Ya, terdapat biaya platform sebesar 20% dari total penghasilan kotor kamu (berlaku mulai 1 Juli 2026). Selain itu, terdapat biaya pencairan sebesar Rp 10.000 per transaksi pencairan.",
  },
  {
    question: "Kapan bisa pencairan?",
    answer:
      "Pencairan dana dapat diajukan kapan saja setelah saldo masuk ke wallet kamu, dengan waktu proses kliring bank berkisar antara 1-3 hari kerja.",
  },
  {
    question: "Apakah pencairan otomatis setelah video disetujui?",
    answer:
      "Tidak, pencairan tidak otomatis. Kamu harus ajukan penarikan dana secara manual melalui menu Keuangan di dashboard Kreator kamu.",
  },
  {
    question: "Kenapa pencairan belum cair?",
    answer:
      "Pastikan kamu sudah isi data rekening bank dengan benar. Keterlambatan pencairan biasanya disebabkan oleh proses verifikasi bank penerima, kliring antar-bank pada hari libur, atau kendala sistem pembayaran pihak ketiga.",
  },
  {
    question: "Apakah masih bisa pencairan setelah kampanye berakhir?",
    answer:
      "Ya, saldo yang udah masuk ke wallet kamu tetap aman dan bisa dicairkan kapan saja, bahkan setelah kampanye yang bersangkutan berakhir.",
  },
  {
    question: "Apa itu batas maksimum pembayaran per video?",
    answer:
      "Batas maksimum pembayaran per video disesuaikan dengan kuota budget kampanye dan batas rate card yang disepakati saat inisiasi penawaran kolaborasi.",
  },
];

export default function KreatorPanduanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("rules");
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div
        className="w-full"
        style={{
          display: "grid",
          gap: 26,
          alignContent: "start",
          maxWidth: 860,
        }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <span
            className="text-[0.68rem] font-[800] uppercase tracking-widest"
            style={{ color: "#2563eb" }}
          >
            Panduan & Kebijakan
          </span>
          <h1 className="text-[1.8rem] font-[850] text-ink-900 leading-tight tracking-[-0.03em] font-display">
            FAQ & Peraturan
          </h1>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-100 border border-neutral-200/60 max-w-md shadow-3xs">
          {[
            { id: "rules", label: "Aturan" },
            { id: "faq", label: "FAQ" },
            { id: "terms", label: "Syarat & Ketentuan" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center whitespace-nowrap",
                  isActive
                    ? "text-white shadow-md"
                    : "text-ink-600 hover:text-ink-900 hover:bg-white/60"
                )}
                style={
                  isActive
                    ? {
                        background: CREATOR_GRADIENT,
                        boxShadow: "0 4px 14px rgba(37,99,235,.22)",
                      }
                    : {}
                }
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
                  Aturan Kreator Marketiv
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
                      className="flex gap-4 p-5 rounded-[26px] bg-white border border-neutral-200/60 shadow-[0_4px_16px_rgba(15,23,42,.05)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
                      style={{}}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-105"
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
                  FAQ Kreator Marketiv
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
                        className="rounded-[26px] border bg-white overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,.05)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                        style={{
                          borderColor: isOpen
                            ? "rgba(37,99,235,.20)"
                            : "rgba(229,229,229,.6)",
                        }}
                      >
                        <button
                          onClick={() => toggleFAQ(idx)}
                          className="w-full flex items-center justify-between p-5 text-left font-bold text-[0.9rem] text-ink-900 hover:bg-neutral-50/50 transition-all cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <ChevronDown
                            size={16}
                            className={cn(
                              "transition-transform duration-200 shrink-0 ml-4",
                              isOpen ? "rotate-180" : "text-ink-400"
                            )}
                            style={isOpen ? { color: "#2563eb" } : {}}
                          />
                        </button>
                        {isOpen && (
                          <div
                            className="px-5 pb-5 pt-1 text-[0.84rem] text-ink-600 leading-relaxed font-semibold border-t animate-in fade-in slide-in-from-top-1 duration-200"
                            style={{
                              borderColor: "rgba(37,99,235,.08)",
                              background: CREATOR_GRADIENT_SOFT,
                            }}
                          >
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

              <div className="rounded-[26px] border border-neutral-200/60 bg-white p-6 shadow-[0_4px_16px_rgba(15,23,42,.05)] space-y-6 text-[0.86rem] leading-relaxed text-ink-700 font-semibold">
                <div className="space-y-1 border-b border-neutral-100 pb-4">
                  <h3 className="text-[0.98rem] font-bold text-ink-900">
                    Marketiv: Syarat & Ketentuan untuk Kreator
                  </h3>
                  <span className="block text-[0.72rem] text-ink-400 font-bold">
                    Berlaku Efektif: 25 Juni 2026
                  </span>
                </div>

                {/* Blue Callout Box */}
                <div
                  className="p-5 rounded-xl border text-[0.82rem] leading-relaxed relative overflow-hidden"
                  style={{
                    borderColor: "rgba(37,99,235,.18)",
                    background: "rgba(37,99,235,.05)",
                    color: "#1e40af",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1 rounded-r-sm"
                    style={{ background: CREATOR_GRADIENT }}
                  />
                  <span
                    className="block font-bold mb-1.5 uppercase tracking-wider text-[0.72rem]"
                    style={{ color: "#1d4ed8" }}
                  >
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
                    Syarat dan Ketentuan ini (&quot;S&K&quot;) mengatur penggunaan platform Marketiv (&quot;Platform&quot;) yang dioperasikan oleh PT Marketiv Kreasi Media (&quot;Perusahaan&quot;, &quot;kami&quot;) oleh Anda sebagai Kreator (&quot;Anda&quot; atau &quot;Kreator&quot;). Dengan mendaftar akun dan menggunakan Platform, Anda menyetujui seluruh isi S&K ini.
                  </p>
                  <p>
                    Marketiv adalah platform marketplace yang menghubungkan Brand (pengiklan) dengan pembuat konten (&quot;Kreator&quot;) yang mendistribusikan konten video pendek di TikTok, Instagram Reels, dan YouTube Shorts. Kreator memperoleh penghasilan berdasarkan jumlah views terverifikasi yang dihasilkan oleh klip mereka pada kampanye yang aktif.
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
      </div>
    </div>
  );
}
