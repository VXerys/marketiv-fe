# 08 — AI UI Generation Rules Marketiv

> Dokumen ini berisi aturan prompt untuk Stitch, Cursor, atau AI UI generator agar output UI konsisten dengan Marketiv Light OS.

## 1. Tujuan Dokumen

Dokumen ini dipakai setiap kali membuat UI dengan bantuan AI.
Tujuannya adalah mencegah AI menghasilkan style yang keluar dari arah desain Marketiv.
AI sering membuat UI terlalu generic, terlalu dark, terlalu gradient, atau tidak sesuai role.
Dokumen ini menjadi guardrail agar output tetap light mode, clean, dan production-ready.

## 2. Global Prompt Context

Gunakan konteks berikut di awal prompt UI apa pun.

```txt
Project: Marketiv, a web-based SaaS hybrid marketplace connecting UMKM with micro creators.
Design system: Marketiv Light OS.
Visual style: warm light mode, clean SaaS dashboard, creator marketplace energy, trustworthy escrow/payment UI.
Primary color: orange #F97316.
Secondary color: deep navy #102033.
Background: warm off-white #FFFDF9.
Surface: white cards with subtle border #E8E2D8.
Typography: Plus Jakarta Sans.
Components: rounded cards, clear CTA, soft badges, mobile-first layout.
Avoid: dark mode, heavy gradients, neon colors, glassmorphism-heavy dashboard, icon-only critical actions.
```

## 3. Hard Visual Constraints

- UI harus light mode.
- Primary CTA harus orange.
- Background utama harus warm off-white.
- Card harus putih dengan border halus.
- Gunakan radius modern.
- Gunakan shadow sangat soft.
- Jangan memakai warna baru tanpa alasan.
- Jangan memakai font selain Plus Jakarta Sans atau Inter fallback.
- Jangan membuat dashboard terlalu dekoratif.
- Jangan membuat UX desktop-only.

## 4. Product Constraints

- Campaign Mode tidak boleh memiliki chat.
- Rate Card Mode boleh memiliki live chat.
- Rate Card maksimal 3 paket per kreator.
- File upload langsung maksimal 100MB.
- Video mentah besar menggunakan URL Google Drive/Dropbox.
- Kreator submit URL TikTok/Instagram sebagai bukti tayang.
- UMKM harus melihat dana escrow dengan jelas.
- Semua teks UI memakai Bahasa Indonesia sederhana.

## 5. Prompt Template — Dashboard UMKM

```txt
Create a responsive UMKM dashboard page for Marketiv using Marketiv Light OS.
Use warm off-white background, white rounded cards, orange primary CTA, deep navy headings, and subtle borders.
The page must be mobile-first and scale to desktop dashboard shell.
Include page header, metric cards, campaign summary, escrow summary, recent submissions, and primary CTA 'Buat Campaign Baru'.
Use Bahasa Indonesia UI copy.
Do not include chat components in Campaign Mode.
Make the UI clean, trustworthy, and easy for non-technical UMKM users.
```

## 6. Prompt Template — Campaign Builder Wizard

```txt
Design a multi-step Campaign Builder Wizard for Marketiv UMKM users.
Use Marketiv Light OS: orange CTA, warm off-white background, white cards, subtle borders, Plus Jakarta Sans.
Steps: Informasi Produk, Aset Mentah, Budget & Kuota, Review & Pembayaran.
Use clear labels, helper texts, validation states, and a visible stepper.
Include AI Brief Assistant button in the brief textarea area.
For asset upload, show warning that video assets must use Google Drive/Dropbox URL and direct upload max is 100MB.
Final CTA: 'Bayar Sekarang via Escrow'.
Do not create a long single-page form.
```

## 7. Prompt Template — Dashboard Kreator

```txt
Create a responsive Kreator dashboard page for Marketiv using Marketiv Light OS.
The page should feel energetic but still clean and professional.
Include metric cards for Saldo Tersedia, Pekerjaan Aktif, Submission Pending, and Campaign Tersedia.
Primary CTA: 'Lihat Job Pool'.
Secondary CTA: 'Kelola Rate Card'.
Use card-based layout, soft status badges, and clear Bahasa Indonesia copy.
Do not exaggerate earnings or promise guaranteed income.
```

## 8. Prompt Template — Job Pool

```txt
Design a mobile-first Job Pool page for Marketiv creators.
Use card-based feed with campaign cards.
Each card includes thumbnail, campaign title, niche badge, pay per 1,000 views, quota progress, status, and CTA 'Klaim Job Ini'.
Use orange for primary CTA and warm light background.
Include search, niche filter, pay filter, and sort options.
If quota is full, CTA must be disabled with text 'Kuota Penuh'.
Do not include chat, WhatsApp, email, comment, or contact buttons in Campaign Mode.
```

## 9. Prompt Template — Rate Card Directory

```txt
Design a Rate Card creator directory page for Marketiv UMKM users.
Use clean SaaS marketplace layout with creator cards.
Each creator card includes avatar, name, niche badge, starting price, short bio or portfolio metric, and CTA 'Lihat Profil'.
Include search and filters for niche and price range.
This page belongs to Rate Card Mode, so it may lead to chat after profile detail.
Use Marketiv Light OS styling and Bahasa Indonesia copy.
```

## 10. Prompt Template — Live Chat Rate Card

```txt
Design a Rate Card negotiation chat room for Marketiv.
This chat exists only for Rate Card Mode.
Use a clean two-party chat layout with a sticky warning banner about mandatory Collab Post.
Include normal text bubbles and a special Custom Offer widget bubble.
Custom Offer shows harga final, scope pekerjaan, deadline, and action buttons for creator acceptance.
Use orange for primary action and soft warning banner.
Do not use this component anywhere in Campaign Mode.
```

## 11. Prompt Template — Finance Page

```txt
Create a finance dashboard page for Marketiv using a trust-first SaaS layout.
Use white cards, warm background, deep navy headings, and clear status badges.
Show saldo, dana escrow, transaction history, and payment status.
Use Rupiah formatting and Bahasa Indonesia labels.
Include empty, loading, and error states.
The UI must feel secure, simple, and transparent.
```

## 12. Prompt Template — Landing Page

```txt
Create a light mode landing page for Marketiv, a SaaS marketplace connecting UMKM and micro creators.
Use warm off-white background, orange CTA, deep navy headings, white rounded cards, and clean product preview visuals.
Sections: Hero, Problem, Solution Benefits, Two Modes, Escrow Trust, Product Preview, UMKM Growth, Creator Opportunity, FAQ, Final CTA.
Explain Campaign Mode and Rate Card Mode clearly.
Use Bahasa Indonesia copy that is simple and trustworthy.
Avoid dark hero, neon gradients, and overly abstract illustrations.
```

## 13. Prompt Template — Component Generation

```txt
Create reusable React + Tailwind components for Marketiv using Marketiv Light OS tokens.
Components must be accessible, mobile-first, and token-based.
Do not hardcode hex colors inside components; use Tailwind token classes.
Include variants, loading state, disabled state, and clear TypeScript props.
Prioritize production-ready code over decorative UI.
```

## 14. Negative Prompt

Gunakan negative prompt berikut jika AI UI generator sering keluar arah.

```txt
Do not use dark mode.
Do not use neon colors.
Do not use heavy gradients.
Do not use glassmorphism as the main dashboard style.
Do not create icon-only primary actions.
Do not create chat UI inside Campaign Mode.
Do not create one long campaign form.
Do not use fake testimonials or fake production data.
Do not make the layout desktop-only.
Do not use vague English UI copy; use Bahasa Indonesia.
```

## 15. Review Checklist for AI Output

- Apakah UI light mode?
- Apakah primary CTA orange?
- Apakah background warm off-white?
- Apakah card putih dengan border subtle?
- Apakah copy Bahasa Indonesia sederhana?
- Apakah halaman mobile-first?
- Apakah ada satu CTA utama yang jelas?
- Apakah Campaign Mode bebas chat?
- Apakah status dan error state terlihat?
- Apakah komponen memakai token, bukan hardcoded style?
- Apakah dashboard tidak terlalu dekoratif?
- Apakah flow sesuai role user?

## 16. Recommended Workflow

Mulai dari layout kasar terlebih dahulu.
Setelah layout benar, lanjutkan ke komponen detail.
Setelah komponen benar, baru tambahkan microcopy dan empty state.
Setelah itu cek mobile viewport 375px.
Terakhir cek konsistensi warna, spacing, radius, dan status badge.
Jangan meminta AI membuat semua halaman sekaligus jika output mulai tidak konsisten.
