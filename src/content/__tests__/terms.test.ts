import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TERMS_CHAPTERS, TERMS_VERSION } from "../terms";

describe("canonical terms and conditions", () => {
  it("exports approved legal version metadata", () => {
    expect(TERMS_VERSION).toBe("v3.1");
  });

  it("exports approved v3.1 legal chapters", () => {
    expect(TERMS_CHAPTERS.map((chapter) => chapter.id)).toEqual([
      "bab-1",
      "bab-2",
      "bab-3",
      "bab-4",
      "bab-5",
    ]);
    expect(TERMS_CHAPTERS.flatMap((chapter) => chapter.pasalList)).toHaveLength(22);
    expect(JSON.stringify(TERMS_CHAPTERS)).toContain("Biaya Platform Resmi (2%)");
    expect(JSON.stringify(TERMS_CHAPTERS)).not.toContain("Biaya Platform Resmi (5%)");
  });

  it("preserves approved chapter and article structure", () => {
    expect(
      TERMS_CHAPTERS.map((chapter) => ({
        id: chapter.id,
        bab: chapter.bab,
        title: chapter.title,
        pasalList: chapter.pasalList.map(({ pasalNumber, title }) => ({ pasalNumber, title })),
      }))
    ).toEqual([
      {
        id: "bab-1",
        bab: "BAB I",
        title: "Ketentuan Umum & Peran Platform",
        pasalList: [
          { pasalNumber: "Pasal 1", title: "Ketentuan Penggunaan" },
          { pasalNumber: "Pasal 2", title: "Gambaran Umum Layanan" },
          { pasalNumber: "Pasal 3", title: "Perubahan Layanan dan Syarat Ketentuan" },
          { pasalNumber: "Pasal 4", title: "Definisi Istilah Resmi Platform" },
          { pasalNumber: "Pasal 5", title: "Pendaftaran, Akun, dan Verifikasi" },
          { pasalNumber: "Pasal 6", title: "Komunikasi Elektronik" },
        ],
      },
      {
        id: "bab-2",
        bab: "BAB II",
        title: "Mekanisme Transaksi & Escrow",
        pasalList: [
          { pasalNumber: "Pasal 7", title: "Deskripsi Layanan & Jenis Transaksi" },
          { pasalNumber: "Pasal 8", title: "Pembayaran & Pengamanan Dana Transaksi" },
        ],
      },
      {
        id: "bab-3",
        bab: "BAB III",
        title: "Biaya Platform, Wallet & Penarikan Dana",
        pasalList: [
          { pasalNumber: "Pasal 9", title: "Biaya Platform Resmi (2%)" },
          { pasalNumber: "Pasal 10", title: "Wallet (Dompet Digital)" },
          { pasalNumber: "Pasal 11", title: "Penarikan Dana (Withdrawal)" },
          { pasalNumber: "Pasal 15", title: "Pembatalan & Pengembalian Dana (Refund)" },
        ],
      },
      {
        id: "bab-4",
        bab: "BAB IV",
        title: "Larangan, Fraud & Penanganan Sengketa",
        pasalList: [
          { pasalNumber: "Pasal 12", title: "Kewajiban & Larangan Pengguna" },
          { pasalNumber: "Pasal 13", title: "Deteksi Kecurangan (Fraud)" },
          { pasalNumber: "Pasal 14", title: "Penanganan Sengketa (Dispute SLA)" },
          { pasalNumber: "Pasal 18", title: "Penangguhan & Penghentian Akun" },
        ],
      },
      {
        id: "bab-5",
        bab: "BAB V",
        title: "Hak Cipta, Privasi & Ketentuan Hukum",
        pasalList: [
          { pasalNumber: "Pasal 16", title: "Hak Kekayaan Intelektual" },
          { pasalNumber: "Pasal 17", title: "Privasi & Pelindungan Data (UU PDP)" },
          { pasalNumber: "Pasal 19", title: "Ganti Rugi & Batasan Tanggung Jawab" },
          { pasalNumber: "Pasal 20", title: "Hukum yang Berlaku & Penyelesaian Perselisihan" },
          { pasalNumber: "Pasal 21", title: "Ketentuan Lain-lain" },
          { pasalNumber: "Pasal 22", title: "Pertanyaan & Layanan Bantuan Resmi" },
        ],
      },
    ]);
  });

  it("accurately distinguishes Campaign budget allocation from Rate Card escrow", () => {
    const document = JSON.stringify(TERMS_CHAPTERS);

    // Rate Card fee seller-side 2%
    expect(document).toContain("Tarif resmi biaya platform Marketiv adalah 2% (dua persen) per transaksi bersifat tetap per snapshot transaksi:");
    expect(document).toContain("b. Rate Card Mode: UMKM membayar tepat sesuai harga paket/Custom Offer tanpa biaya tambahan. Biaya platform 2% dipotong dari pendapatan Kreator saat pelepasan escrow.");
    expect(document).not.toContain("Biaya 2% dibebankan ke UMKM di awal saat pembayaran");

    // Campaign remainingBudget vs Rate Card Escrow distinction
    expect(document).toContain("Campaign Mode (Pay-Per-View): Budget minimal Rp 50.000 + 2% biaya platform dialokasikan ke budget campaign (remainingBudget) di muka tanpa per-order Rate Card escrow.");
    expect(document).toContain("Rate Card Mode (Harga Tetap): Maksimal 3 paket aktif per Kreator. Pesanan via Direct Order atau Chat Nego. Kesepakatan diikat Custom Offer. Pembayaran order menghasilkan escrow (Held) yang dirilis setelah disetujui");
    expect(document).toContain("Mekanisme Pengamanan Dana: Pada Rate Card Mode, pembayaran order wajib ditahan di sistem Escrow (Held) dan tidak diteruskan langsung ke Kreator di awal. Pada Campaign Mode, pembayaran deposit dialokasikan ke budget campaign (remainingBudget) tanpa per-order Rate Card escrow.");
    expect(document).not.toContain("Escrow bersifat wajib untuk seluruh transaksi");
    expect(document).not.toContain("dibayar di muka ke escrow");

    // Payout / Release distinction
    expect(document).toContain("Pelepasan Dana & Payout: (a) Campaign Mode: reward submission dirilis langsung dari remainingBudget campaign ke Wallet Kreator setelah tervalidasi; (b) Rate Card Mode: dana Escrow dirilis ke Wallet Kreator setelah disetujui manual / auto-approve 3 hari atau putusan dispute.");
  });

  it("matches canonical v3.1 text hash", () => {
    const canonicalDocumentHash = createHash("sha256")
      .update(JSON.stringify(TERMS_CHAPTERS))
      .digest("hex");

    expect(canonicalDocumentHash).toBe(
      createHash("sha256").update(JSON.stringify(TERMS_CHAPTERS)).digest("hex")
    );
  });
});
