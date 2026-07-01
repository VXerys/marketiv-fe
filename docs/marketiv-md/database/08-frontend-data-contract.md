# 08 — Frontend Data Contract
> Dokumen ini adalah kontrak data untuk tim Frontend Marketiv.
> Gunakan dokumen ini saat membuat UI Next.js, hooks, service layer, mapper, dan prompt AI di VS Code.
---
## 1. Prinsip Frontend Contract
1. Frontend hanya mengirim intent, bukan memutuskan status bisnis sensitif.
2. Backend/Appwrite Function memutuskan validasi, saldo, escrow, payout, dan payment status.
3. Frontend tidak boleh invent field baru di luar dokumen ini.
4. Frontend tidak boleh hardcode enum selain yang tercatat di dokumen ini.
5. Frontend harus punya loading, empty, error, dan success state.
6. Frontend harus mobile-first.
7. Frontend harus memakai Bahasa Indonesia sederhana.
8. Campaign Mode tidak boleh punya chat.
9. Rate Card Mode adalah satu-satunya mode dengan chat.
10. Semua response gabungan kompleks sebaiknya berasal dari Function DTO.
---
## 2. Base API Response
```ts
export type ApiSuccessDTO<T> = {
  success: true;
  data: T;
  message?: string;
};
export type ApiErrorDTO = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
};
export type ApiResponseDTO<T> = ApiSuccessDTO<T> | ApiErrorDTO;
```
Frontend harus menampilkan `message` dari backend jika tersedia.
Jika backend mengembalikan `code`, frontend boleh mapping ke pesan UI yang lebih spesifik.
Jangan tampilkan stack trace, raw webhook payload, atau error teknis ke user.
---
## 3. Shared Primitive Types
```ts
export type MarketivRole = 'UMKM' | 'KREATOR' | 'ADMIN';
export type MarketivNiche = 'Kuliner' | 'Fesyen' | 'Pariwisata' | 'Edukasi' | 'Kecantikan' | 'Teknologi' | 'Lainnya';
export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';
export type OnboardingStatus = 'Incomplete' | 'Complete';
export type PaymentStatus = 'Unpaid' | 'Pending' | 'Paid' | 'Failed' | 'Expired' | 'Refunded';
export type MoneyInRupiah = number;
export type ISODateString = string;
```
Money selalu integer Rupiah.
Tanggal selalu ISO string dari database/backend.
UI menampilkan tanggal memakai zona Asia/Jakarta.
---
## 4. Auth Session Contract
```ts
export type AuthSessionDTO = {
  userId: string;
  email: string;
  profile: ProfileDTO;
};
```
Flow setelah login:
1. Ambil Appwrite Auth session.
2. Ambil `profiles` berdasarkan `user_id`.
3. Jika profile belum ada, panggil bootstrap profile Function.
4. Jika role `UMKM`, redirect ke `/dashboard/umkm`.
5. Jika role `KREATOR`, redirect ke `/dashboard/kreator`.
6. Jika role `ADMIN`, redirect ke `/admin`.
7. Jika `verification_status = Suspended`, blokir dashboard dan tampilkan pesan akun ditangguhkan.
---
## 5. Profile DTO
```ts
export type ProfileDTO = {
  user_id: string;
  role: MarketivRole;
  nama_lengkap: string;
  email: string;
  nomor_whatsapp?: string | null;
  foto_profil_url?: string | null;
  bio?: string | null;
  niche?: MarketivNiche | null;
  dompet_saldo?: MoneyInRupiah;
  is_verified: boolean;
  verification_status: VerificationStatus;
  onboarding_status: OnboardingStatus;
  created_at?: ISODateString;
  updated_at?: ISODateString;
};
```
Frontend boleh update field berikut:
1. `nama_lengkap`.
2. `nomor_whatsapp`.
3. `foto_profil_url`.
4. `bio`.
5. `niche`.
Frontend tidak boleh update field berikut:
1. `role`.
2. `dompet_saldo`.
3. `is_verified`.
4. `verification_status`.
5. `email` tanpa sinkronisasi Auth.
---
## 6. UMKM Dashboard Summary DTO
Recommended Function:
```txt
get-umkm-dashboard-summary
```
DTO:
```ts
export type UmkmDashboardSummaryDTO = {
  total_campaign: number;
  campaign_aktif: number;
  campaign_draft: number;
  total_budget_escrow: MoneyInRupiah;
  submission_pending: number;
  submission_valid: number;
  estimasi_total_views: number;
  campaign_terbaru: CampaignPreviewDTO[];
  transaksi_terbaru: TransactionPreviewDTO[];
};
```
UI usage:
1. Metric cards.
2. Campaign preview.
3. Transaction preview.
4. CTA `Buat Campaign Baru`.
Frontend tidak menghitung summary dengan load semua campaign.
---
## 7. Kreator Dashboard Summary DTO
Recommended Function:
```txt
get-kreator-dashboard-summary
```
DTO:
```ts
export type KreatorDashboardSummaryDTO = {
  saldo_tersedia: MoneyInRupiah;
  pekerjaan_aktif: number;
  submission_pending: number;
  submission_valid: number;
  campaign_tersedia: number;
  order_negosiasi: number;
  withdrawal_pending: number;
  pekerjaan_terbaru: CampaignClaimDTO[];
  transaksi_terbaru: TransactionPreviewDTO[];
};
```
UI usage:
1. Saldo card.
2. Active job card.
3. CTA `Lihat Job Pool`.
4. CTA `Tarik Dana` jika saldo cukup.
---
## 8. Campaign Status Types
```ts
export type CampaignStatus = 'Draft' | 'MenungguPembayaran' | 'Aktif' | 'Penuh' | 'Selesai' | 'Dibatalkan' | 'Dispute';
export type CampaignAssetType = 'ExternalUrl' | 'AppwriteStorage' | 'Mixed';
```
Status label:
1. `Draft` → Draft.
2. `MenungguPembayaran` → Menunggu Pembayaran.
3. `Aktif` → Aktif.
4. `Penuh` → Kuota Penuh.
5. `Selesai` → Selesai.
6. `Dibatalkan` → Dibatalkan.
7. `Dispute` → Sengketa.
---
## 9. Campaign Preview DTO
```ts
export type CampaignPreviewDTO = {
  $id: string;
  judul_campaign: string;
  niche: MarketivNiche;
  thumbnail_url?: string | null;
  harga_per_1000_views: MoneyInRupiah;
  kuota_kreator: number;
  kuota_terpakai: number;
  total_budget_escrow: MoneyInRupiah;
  status: CampaignStatus;
  payment_status: PaymentStatus;
  created_at: ISODateString;
  published_at?: ISODateString | null;
};
```
Allowed frontend derived values:
```ts
const sisaKuota = campaign.kuota_kreator - campaign.kuota_terpakai;
const progressKuota = campaign.kuota_terpakai / campaign.kuota_kreator;
```
Derived kuota boleh dihitung frontend.
Derived payout sensitif tidak boleh dihitung frontend untuk final payment.
---
## 10. Campaign Detail DTO
```ts
export type CampaignDetailDTO = CampaignPreviewDTO & {
  umkm_user_id: string;
  deskripsi_brief: string;
  asset_type: CampaignAssetType;
  asset_file_ids: string[];
  asset_external_url?: string | null;
  estimasi_views_target?: number;
  platform_fee_amount: MoneyInRupiah;
  total_payment_amount: MoneyInRupiah;
  ended_at?: ISODateString | null;
  cancelled_at?: ISODateString | null;
};
```
UMKM owner boleh melihat detail penuh.
Kreator hanya melihat detail campaign yang aktif dan aman untuk Job Pool.
Jangan tampilkan data payment internal ke kreator jika tidak relevan.
---
## 11. Campaign Create Payload
```ts
export type CreateCampaignPayload = {
  judul_campaign: string;
  deskripsi_brief: string;
  niche: MarketivNiche;
  asset_external_url?: string | null;
  asset_file_ids?: string[];
  harga_per_1000_views: MoneyInRupiah;
  kuota_kreator: number;
  total_budget_escrow: MoneyInRupiah;
};
```
Frontend validation:
1. Judul wajib.
2. Brief minimal 50 karakter.
3. Niche wajib.
4. URL harus HTTPS jika diisi.
5. File upload maksimal 100MB jika dipakai.
6. Harga per 1000 views Rp 2.000 sampai Rp 10.000.
7. Kuota minimal 1.
8. Budget lebih dari 0.
Submit target:
```txt
save-campaign-draft
create-campaign-payment
```
---
## 12. Job Pool DTO
Recommended Function:
```txt
get-job-pool-feed
```
DTO:
```ts
export type JobPoolItemDTO = {
  $id: string;
  judul_campaign: string;
  niche: MarketivNiche;
  thumbnail_url?: string | null;
  harga_per_1000_views: MoneyInRupiah;
  kuota_kreator: number;
  kuota_terpakai: number;
  published_at: ISODateString;
  has_claimed: boolean;
  can_claim: boolean;
  disabled_reason?: 'ALREADY_CLAIMED' | 'QUOTA_FULL' | 'NOT_VERIFIED' | null;
};
```
Button mapping:
1. `can_claim = true` → `Klaim Job Ini`.
2. `ALREADY_CLAIMED` → `Sudah Diklaim`.
3. `QUOTA_FULL` → `Kuota Penuh`.
4. `NOT_VERIFIED` → `Verifikasi Dulu`.
Mutation target:
```txt
claim-campaign
```
---
## 13. Campaign Claim DTO
```ts
export type CampaignClaimStatus = 'Aktif' | 'Dibatalkan' | 'Selesai' | 'Dispute';
export type CampaignClaimDTO = {
  $id: string;
  campaign_id: string;
  umkm_user_id: string;
  kreator_user_id: string;
  status: CampaignClaimStatus;
  claimed_at: ISODateString;
  cancelled_at?: ISODateString | null;
  completed_at?: ISODateString | null;
  campaign?: CampaignPreviewDTO;
  submission?: CampaignSubmissionDTO | null;
};
```
Used by:
1. Kreator active jobs.
2. Submit proof page.
3. Job history.
4. Dashboard preview.
---
## 14. Campaign Submission DTO
```ts
export type CampaignSubmissionStatus = 'Pending' | 'Valid' | 'Fraud' | 'Dispute' | 'Rejected';
export type CampaignPlatform = 'TikTok' | 'Instagram';
export type CampaignSubmissionDTO = {
  $id: string;
  campaign_id: string;
  claim_id: string;
  kreator_user_id: string;
  url_bukti_tayang: string;
  platform: CampaignPlatform;
  jumlah_views_target?: number;
  jumlah_views_aktual: number;
  status_validasi: CampaignSubmissionStatus;
  fraud_notes?: string | null;
  dana_dicairkan: MoneyInRupiah;
  submitted_at: ISODateString;
  validated_at?: ISODateString | null;
};
```
Frontend may create/update through:
```txt
submit-campaign-proof
```
Frontend must not update:
1. `jumlah_views_aktual`.
2. `status_validasi`.
3. `dana_dicairkan`.
4. `fraud_notes`.
---
## 15. Creator Directory DTO
Recommended Function:
```txt
get-creator-directory
```
DTO:
```ts
export type CreatorDirectoryItemDTO = {
  user_id: string;
  nama_lengkap: string;
  foto_profil_url?: string | null;
  bio?: string | null;
  niche?: MarketivNiche | null;
  is_verified: boolean;
  harga_mulai?: MoneyInRupiah | null;
  rate_card_count: number;
};
```
Do not expose by default:
1. Full WhatsApp number.
2. Saldo kreator.
3. Data bank.
4. Internal verification notes.
---
## 16. Creator Rate Card DTO
```ts
export type CreatorRateCardDTO = {
  $id: string;
  kreator_user_id: string;
  nama_paket: string;
  deskripsi_paket?: string | null;
  harga_paket: MoneyInRupiah;
  deliverable: string;
  estimasi_hari?: number | null;
  revision_limit: number;
  is_active: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
};
```
Frontend rule:
1. Disable add button if active cards already 3.
2. Backend still validates max 3.
3. Use Function for create/update/toggle.
4. Do not hard delete from UI; use nonaktifkan.
---
## 17. Rate Card Order DTO
```ts
export type RateCardOrderStatus = 'Negosiasi' | 'MenungguPembayaran' | 'Escrow' | 'Revisi' | 'MenungguVerifikasi' | 'Selesai' | 'Dibatalkan' | 'Dispute';
export type RateCardOrderDTO = {
  $id: string;
  umkm_user_id: string;
  kreator_user_id: string;
  rate_card_id?: string | null;
  judul_proyek?: string | null;
  scope_pekerjaan?: string | null;
  harga_final: MoneyInRupiah;
  platform_fee_amount: MoneyInRupiah;
  total_payment_amount: MoneyInRupiah;
  deadline?: ISODateString | null;
  url_collab_post?: string | null;
  status: RateCardOrderStatus;
  payment_status: PaymentStatus;
  created_at: ISODateString;
  updated_at: ISODateString;
  accepted_at?: ISODateString | null;
  paid_at?: ISODateString | null;
  completed_at?: ISODateString | null;
};
```
UI rule:
1. Show chat only for Rate Card order.
2. Show payment CTA only for UMKM when `MenungguPembayaran`.
3. Show Collab Post submit for Kreator when order allows it.
4. Show warning banner Collab Post at top of chat.
---
## 18. Message DTO
```ts
export type MessageType = 'Text' | 'CustomOffer' | 'System';
export type CustomOfferDataDTO = {
  harga_final: MoneyInRupiah;
  scope_pekerjaan: string;
  deadline?: ISODateString | null;
  revision_limit?: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
};
export type MessageDTO = {
  $id: string;
  order_id: string;
  sender_user_id: string;
  receiver_user_id: string;
  tipe_pesan: MessageType;
  konten: string;
  offer_data?: CustomOfferDataDTO | null;
  is_read: boolean;
  created_at: ISODateString;
};
```
Render rule:
1. `Text` → normal chat bubble.
2. `System` → centered system notice.
3. `CustomOffer` → structured offer card.
4. Never render message component inside Campaign Mode.
---
## 19. Transaction Preview DTO
```ts
export type TransactionPreviewDTO = {
  $id: string;
  reference_id?: string | null;
  reference_type: 'Campaign' | 'RateCardOrder' | 'Withdrawal' | 'Refund' | 'ManualAdjustment';
  nominal: MoneyInRupiah;
  tipe: 'Deposit' | 'Fee' | 'Escrow' | 'Pencairan' | 'Refund' | 'Withdrawal' | 'Adjustment';
  status: 'Pending' | 'Escrow' | 'Success' | 'Failed' | 'Expired' | 'Refunded' | 'Cancelled';
  provider?: 'Midtrans' | 'Manual' | 'Xendit' | 'Internal' | null;
  created_at: ISODateString;
  keterangan?: string | null;
};
```
Do not expose to normal frontend:
1. Raw provider payload.
2. Provider secret.
3. Internal signature data.
4. Full audit object.
---
## 20. Withdrawal DTO
```ts
export type WithdrawalDTO = {
  $id: string;
  kreator_user_id: string;
  nominal: MoneyInRupiah;
  bank_name: string;
  bank_account_number_masked: string;
  bank_account_holder: string;
  status: 'Pending' | 'Processing' | 'Success' | 'Failed' | 'Rejected' | 'Cancelled';
  requested_at: ISODateString;
  processed_at?: ISODateString | null;
  completed_at?: ISODateString | null;
  rejection_reason?: string | null;
};
```
Frontend form payload:
1. `nominal`.
2. `bank_name`.
3. `bank_account_number`.
4. `bank_account_holder`.
Submit target:
```txt
request-withdrawal
```
---
## 21. Notification DTO
```ts
export type NotificationType = 'CampaignActivated' | 'ClaimCreated' | 'SubmissionValidated' | 'PaymentSuccess' | 'CustomOfferReceived' | 'OrderCompleted' | 'WithdrawalSuccess' | 'DisputeUpdated' | 'System';
export type NotificationDTO = {
  $id: string;
  title: string;
  body: string;
  type: NotificationType;
  reference_id?: string | null;
  reference_type?: string | null;
  is_read: boolean;
  created_at: ISODateString;
  read_at?: ISODateString | null;
};
```
Frontend may update:
1. `is_read`.
2. `read_at`.
Frontend may not create notification directly.
---
## 22. Page Contract: Campaign Create
Required sections:
1. Informasi Produk.
2. Aset Mentah.
3. Budget dan Kuota.
4. Review dan Pembayaran.
Required states:
1. Draft saved.
2. Validation error.
3. Payment loading.
4. Payment success redirect.
5. Payment failed/expired message.
Primary CTA:
```txt
Bayar Sekarang via Escrow
```
---
## 23. Page Contract: Job Pool
Required data:
1. `JobPoolItemDTO[]`.
2. Pagination cursor.
3. Filter niche.
4. Sort terbaru/bayaran tertinggi.
Required states:
1. Loading skeleton.
2. Empty campaign.
3. Error load.
4. Claim loading per card.
5. Claim success.
6. Claim rejected with clear reason.
---
## 24. Page Contract: Rate Card Chat
Required data:
1. `RateCardOrderDTO`.
2. Participant profile subset.
3. `MessageDTO[]`.
4. Realtime subscription.
Required UI:
1. Sticky Collab Post warning.
2. Message list.
3. Custom Offer card.
4. Payment CTA for UMKM.
5. Accept/Reject Offer CTA for Kreator.
6. Submit Collab Post CTA for Kreator.
Forbidden:
```txt
Reusing this chat for Campaign Mode.
```
---
## 25. Formatting Contract
Money:
```ts
formatRupiah(350000) // "Rp 350.000"
```
Date:
```ts
formatDateJakarta(isoString)
```
Status badge guidance:
1. Success/Valid/Selesai → green.
2. Pending/Menunggu/Escrow → orange/amber.
3. Failed/Fraud/Rejected/Dispute → red.
4. Draft/Inactive → neutral.
5. Active/Aktif → green or orange depending context.
---
## 26. Mutation Boundary
Must use Function:
1. Create campaign payment.
2. Claim campaign.
3. Submit campaign proof.
4. Validate submission.
5. Create rate card.
6. Create rate card order.
7. Send custom offer.
8. Accept custom offer.
9. Create payment.
10. Request withdrawal.
11. Open dispute.
12. Resolve dispute.
May direct write if permission allows:
1. Safe profile update.
2. Message read state.
3. Notification read state.
---
## 27. AI Coding Assistant Rules
1. Import DTO types from a single frontend contract file.
2. Do not invent collection field names.
3. Do not invent enum status names.
4. Do not create Supabase client code.
5. Use Appwrite client or backend Function service.
6. Do not mutate financial fields from UI.
7. Do not mutate validation status from UI.
8. Do not render chat for Campaign Mode.
9. Always add loading state.
10. Always add empty state.
11. Always add actionable error state.
12. Keep Bahasa Indonesia labels simple.
13. Keep mobile-first layout.
14. Use orange primary CTA.
15. Use DTO mapper for Appwrite documents.
---
## 28. Final Rule
Frontend harus predictable, typed, dan aman.
Jika data gabungan sulit didapat dengan query sederhana, gunakan Function DTO.
Jika field tidak ada di kontrak ini, jangan dipakai sebelum dokumentasi diupdate.
