import type { AppNotification } from "@/types/notification.types";

/**
 * Mock notifikasi kedua role.
 *
 * Direlokasi dari NotificationView.tsx (s5-notifikasi-wire), tempat ia dulu
 * hidup sebagai array hardcode yang dipakai apa adanya tanpa cabang mock —
 * jadi tampil juga saat mock OFF. Konsumsi HANYA lewat facade
 * getNotifications() di src/services/shared/notification.service.ts.
 */

export const mockKreatorNotifications: AppNotification[] = [
  { id: "k1", type: "campaign", title: "Campaign Baru Tersedia", message: "Dapur Sehat Sukabumi membuka campaign 'Rasa Nusantara Food Review' dengan budget Rp 500.000 per kreator.", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Campaign", actionHref: "/dashboard/kreator/job-pool" },
  { id: "k2", type: "keuangan", title: "Pembayaran Diterima", message: "Dana Rp 350.000 dari campaign 'Kopi Nusantara Reels' berhasil masuk ke dompet Anda.", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Dompet", actionHref: "/dashboard/kreator/keuangan" },
  { id: "k3", type: "campaign", title: "Proof of Work Disetujui", message: "UMKM 'Sambal Bu Rudi' menyetujui konten Anda untuk campaign 'Glow & Beauty Care'. Saldo segera dicairkan.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false },
  { id: "k4", type: "negosiasi", title: "Penawaran Rate Card Baru", message: "UMKM 'Batik Tulis Nusantara' mengirim penawaran untuk paket Standard Instagram Anda senilai Rp 800.000.", timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), isRead: false, actionLabel: "Lihat Negosiasi", actionHref: "/dashboard/kreator/negosiasi" },
  { id: "k5", type: "rate_card", title: "Paket Rate Card Dilihat", message: "5 UMKM melihat paket Rate Card 'Premium TikTok Review' Anda hari ini. Pastikan deskripsi sudah menarik.", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), isRead: true },
  { id: "k6", type: "keuangan", title: "Penarikan Saldo Berhasil", message: "Penarikan Rp 250.000 ke rekening BCA ****4521 telah berhasil diproses.", timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { id: "k7", type: "sistem", title: "Verifikasi Akun Berhasil", message: "Akun kreator Anda telah terverifikasi. Kini Anda dapat menerima campaign berbayar.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), isRead: true },
  { id: "k8", type: "campaign", title: "Campaign Hampir Berakhir", message: "Campaign 'Warung Digital Pak Budi' berakhir dalam 3 hari. Segera upload proof of work Anda.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), isRead: true, actionLabel: "Upload Sekarang", actionHref: "/dashboard/kreator/pekerjaan-aktif" },
  { id: "k9", type: "sistem", title: "Kebijakan Platform Diperbarui", message: "Marketiv memperbarui ketentuan penggunaan. Mohon baca dan setujui perubahan ini.", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), isRead: true, actionLabel: "Baca Perubahan", actionHref: "/dashboard/kreator/panduan" },
  { id: "k10", type: "negosiasi", title: "Counter Offer Diterima", message: "UMKM 'Madu Asli Flores' menerima counter offer Anda untuk paket YouTube Review. Negosiasi selesai!", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), isRead: true },
];

export const mockUmkmNotifications: AppNotification[] = [
  { id: "u1", type: "campaign", title: "3 Kreator Baru Mendaftar", message: "3 kreator baru mendaftar ke campaign 'Rasa Nusantara Food Review'. Review dan setujui segera.", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), isRead: false, actionLabel: "Review Kreator", actionHref: "/dashboard/umkm/campaign" },
  { id: "u2", type: "keuangan", title: "Escrow Berhasil Dikunci", message: "Dana escrow Rp 1.500.000 untuk campaign 'Glow & Beauty Care' berhasil dikunci. Campaign siap dimulai.", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), isRead: false, actionLabel: "Lihat Keuangan", actionHref: "/dashboard/umkm/keuangan" },
  { id: "u3", type: "campaign", title: "Konten Kreator Perlu Direview", message: "Sulianto Indria Putra mengunggah proof of work untuk campaign 'Kopi Nusantara'. Segera review.", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), isRead: false, actionLabel: "Review Konten", actionHref: "/dashboard/umkm/campaign" },
  { id: "u4", type: "negosiasi", title: "Counter Offer dari Kreator", message: "Kreator 'Rina Dewi' mengajukan counter offer Rp 750.000 untuk paket Rate Card Instagram.", timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), isRead: false, actionLabel: "Lihat Negosiasi", actionHref: "/dashboard/umkm/negosiasi" },
  { id: "u5", type: "sistem", title: "Campaign Disetujui Admin", message: "Campaign 'Warung Digital Pak Budi' telah diverifikasi dan mulai tampil di marketplace kreator.", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), isRead: true },
  { id: "u6", type: "keuangan", title: "Pembayaran Kreator Berhasil", message: "Pembayaran Rp 350.000 ke kreator 'Andi Wijaya' untuk campaign 'Sambal Nusantara' berhasil diproses.", timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
  { id: "u7", type: "campaign", title: "Campaign Mendekati Kuota", message: "Campaign 'Glow & Beauty Care' mencapai 85% kuota kreator. Pertimbangkan untuk menambah budget.", timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), isRead: true, actionLabel: "Kelola Campaign", actionHref: "/dashboard/umkm/campaign" },
  { id: "u8", type: "negosiasi", title: "Negosiasi Rate Card Selesai", message: "Negosiasi dengan kreator 'Budi Santoso' untuk paket TikTok Review berhasil mencapai kesepakatan.", timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), isRead: true },
  { id: "u9", type: "sistem", title: "Laporan Bulanan Tersedia", message: "Laporan performa campaign bulan Desember 2024 siap diunduh. Total views: 125.430.", timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), isRead: true, actionLabel: "Lihat Laporan", actionHref: "/dashboard/umkm/analitik" },
  { id: "u10", type: "sistem", title: "Verifikasi Bisnis Berhasil", message: "Profil bisnis Anda telah terverifikasi. Badge 'UMKM Terverifikasi' kini tampil di profil.", timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), isRead: true },
];
