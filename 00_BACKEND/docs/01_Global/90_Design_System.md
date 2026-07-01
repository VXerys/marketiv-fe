# 90_Design_System

**Pemilik tunggal design token Marketiv.** Token ada di `src/design-system/` (lihat [`40_Folder_Structure.md`](40_Folder_Structure.md)). Target UI: simple, mobile-first, hemat warna, fokus CTA.

## Prinsip

- **Simplicity First** — UMKM paham dashboard < 5 menit; hindari terlalu banyak menu/grafik/tombol.
- **Action Driven** — tiap halaman punya satu CTA utama (mis. Buat Campaign, Kirim Offer, Review Draft).
- **Mobile First** — prioritas Mobile → Tablet → Desktop.

## Warna (`colors.js`)

- Primary: `Primary-50 #EEF7FF`, `100 #D9ECFF`, `500 #2563EB`, `600 #1D4ED8`, `700 #1E40AF` → button primary, link, active state.
- Success `#16A34A` → payment success / approved / completed.
- Warning `#F59E0B` → pending / waiting review / escrow.
- Danger `#DC2626` → rejected / fraud / cancelled.
- Neutral: `Gray-50 #F9FAFB`, `100 #F3F4F6`, `200 #E5E7EB`, `500 #6B7280`, `700 #374151`, `900 #111827`.

## Tipografi (`typography.js`)

- Font: **Inter** atau **Plus Jakarta Sans**.
- Heading: H1 36px, H2 30px, H3 24px, H4 20px.
- Body: Large 18px, Base 16px, Small 14px, Caption 12px.

## Spacing (`spacing.js`) — skala 4

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64` px.

## Border Radius (`radius.js`)

`sm 8px`, `md 12px`, `lg 16px`, `xl 24px`.

## Shadow (`shadows.js`)

- Card: `0 1px 3px rgba(0,0,0,.08)`.
- Modal: `0 10px 25px rgba(0,0,0,.12)`.

## Inventaris Komponen

**Button**: Primary (`bg-primary-500 text-white` — Buat Campaign, Kirim Offer, Top Up), Secondary (`border bg-white` — Edit, Lihat Detail), Danger (`bg-red-600` — Delete, Cancel Order, Reject).

**Input**: Text, Currency (Budget/Rate Card/Escrow/Withdraw), Select (Kategori/Platform/Lokasi), Multi Select (Niche/Platform), File Upload (Logo/Video Raw/Thumbnail/Draft).

**Badge** (status):
- Campaign: Draft, Published, Active, Paused, Completed.
- Order: Waiting Payment, In Progress, Revision, Completed, Cancelled.
- Submission: Pending, Approved, Rejected, Fraud.

**Card**:
- `CreatorCard`: Avatar, Nama, Username, Followers, Engagement, Category, Starting Price, Button View Profile.
- `CampaignCard`: Thumbnail, Title, Budget, Platform, Submission Count, Button Detail.
- `OrderCard`: Order Number, Creator, Status, Escrow, Deadline.
- `SubmissionCard`: Creator, Campaign, Views, Status.

**Table**:
- `OrderTable`: Order ID, Creator, Budget, Status, Created At, Action.
- `SubmissionTable`: Creator, Campaign, Views, Status, Action.
- `WalletTable`: Date, Type, Amount, Status.

**AI Components** (MVP hanya 3):
- `AiLandingAssistant` — landing: jawab FAQ, arahkan user.
- `AiBriefGenerator` — campaign create: input (Nama Produk, Deskripsi, Target) → output (Brief, Hook, CTA, Hashtag).
- `FraudScoreBadge` — submission review: Low / Medium / High Risk.

## Layout Dashboard

- **UMKM**: Sidebar (Dashboard, Creator, Campaign, Order, Wallet) + Bottom Mobile Navigation (Home, Creator, Campaign, Wallet, Profile).
- **Creator**: Sidebar (Dashboard, Rate Card, Campaign, Submission, Wallet) + Bottom Nav (Home, Rate Card, Campaign, Wallet, Profile).
- **Admin**: Sidebar (Users, Campaigns, Orders, Fraud, Reports, Withdraws) + Admin Toolbar.

## Navigasi

- Desktop: Sidebar fixed (Logo, Menu, User Menu).
- Mobile: Bottom Navigation.
