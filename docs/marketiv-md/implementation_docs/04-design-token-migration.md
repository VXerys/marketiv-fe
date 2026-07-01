# 04 — Design Token Migration Marketiv
> Dokumen ini memandu migrasi design tokens Marketiv dari visual lama ke visual baru.
> Fokus utama: light mode, primary orange, secondary navy, warm background, dan dashboard-ready component system.
---
## 1. Tujuan Dokumen
Design token migration memastikan seluruh UI Marketiv memiliki bahasa visual yang konsisten.
Tanpa migrasi token, komponen lama dan komponen baru akan menghasilkan style yang bercampur.
Dokumen ini menjadi acuan sebelum melakukan slicing dashboard final.
Dokumen ini harus dibaca sebelum mengubah `src/app/globals.css`.
Dokumen ini juga harus dibaca sebelum membuat Button, Card, Badge, MetricCard, dan DashboardShell.
Dokumen ini tidak menggantikan dokumen UI/UX utama.
Dokumen ini menerjemahkan keputusan UI/UX menjadi implementasi token Tailwind CSS v4.
Dokumen ini harus menjaga kompatibilitas dengan aturan project: Tailwind v4 menggunakan `@theme`.
Dokumen ini harus membantu AI coding assistant untuk tidak memakai hardcoded color.
---
## 2. Current Token Problem
Token existing masih membawa arah visual lama.
Beberapa komponen existing juga memakai hardcoded hex color langsung di JSX.
Hal ini menyebabkan UI sulit dikontrol secara global.
Slicing baru akan gagal konsisten jika token tidak distandardisasi.
Warna primary lama tidak sesuai keputusan final yang memakai orange.
Warna surface dan background lama terlalu generic dan belum warm.
Badge status belum memiliki token semantic yang rapi.
Shadow lama terlalu berat pada beberapa card.
Radius belum distandardisasi secara eksplisit.
Typography utility sudah ada tetapi perlu disesuaikan dengan dashboard scale.
---
## 3. Migration Principles
1. Token harus menjadi sumber utama warna.
2. Hindari semua hardcoded hex di JSX baru.
3. Hindari token yang terlalu spesifik pada satu komponen.
4. Gunakan semantic naming untuk status dan feedback.
5. Gunakan brand naming untuk identitas visual.
6. Gunakan surface naming untuk layout dan card.
7. Gunakan text naming untuk hierarki teks.
8. Gunakan border naming untuk garis dan divider.
9. Gunakan shadow naming untuk elevation.
10. Gunakan radius naming untuk konsistensi bentuk.
11. Pertahankan Tailwind CSS v4 `@theme` syntax.
12. Jangan membuat `tailwind.config.js` jika project memakai Tailwind v4 `@theme`.
13. Jangan mengganti seluruh komponen lama sekaligus jika tidak perlu.
14. Migrasi token dulu, lalu komponen foundation, lalu page slicing.
15. Jika token lama masih dipakai oleh komponen lama, buat alias sementara.
---
## 4. Target Brand Direction
Visual direction final:
- Light mode.
- Primary orange.
- Secondary deep navy.
- Warm off-white background.
- White cards.
- Soft borders.
- Subtle shadows.
- Rounded modern components.
- Dashboard-first structure.
- Trustworthy financial feel.
- Energetic creator marketplace accent.
Target emotional tone:
- Clean.
- Warm.
- Professional.
- Safe.
- Modern.
- Creator-friendly.
- UMKM-friendly.
---
## 5. Recommended Color Tokens
### 5.1 Primary Orange
Use for:
- Primary CTA.
- Active navigation.
- Focus ring.
- Important highlight.
- Progress accent.
- Escrow/payment emphasis.
Recommended tokens:
```css
--color-primary-50: #fff7ed;
--color-primary-100: #ffedd5;
--color-primary-200: #fed7aa;
--color-primary-500: #f97316;
--color-primary-600: #ea580c;
--color-primary-700: #c2410c;
```
Optional shorthand:
```css
--color-primary: #f97316;
--color-primary-hover: #ea580c;
--color-primary-active: #c2410c;
```
---
### 5.2 Secondary Navy
Use for:
- Sidebar active dark text.
- Header text accent.
- Premium/trust sections.
- Finance panels.
- Secondary CTA.
Recommended tokens:
```css
--color-secondary-600: #315677;
--color-secondary-700: #24425f;
--color-secondary-800: #18324a;
--color-secondary-900: #102033;
```
Optional shorthand:
```css
--color-secondary: #102033;
--color-secondary-soft: #18324a;
```
---
### 5.3 Background and Surface
Use for:
- App background.
- Dashboard background.
- Card surface.
- Muted panel.
- Sidebar.
Recommended tokens:
```css
--color-background: #fffdf9;
--color-background-soft: #f8f5ef;
--color-surface: #ffffff;
--color-surface-muted: #fafaf7;
--color-surface-warm: #fff8f0;
```
Rules:
- Dashboard root should use `bg-background` or `bg-background-soft`.
- Cards should use `bg-surface`.
- Highlight panels can use `bg-surface-warm`.
---
### 5.4 Border and Divider
Recommended tokens:
```css
--color-border: #e8e2d8;
--color-border-soft: #f0ebe3;
--color-border-strong: #d8cfc2;
```
Rules:
- Use border instead of heavy shadows for dashboard cards.
- Use soft divider for table rows.
- Use strong border only for selected or warning components.
---
### 5.5 Text Colors
Recommended tokens:
```css
--color-text-main: #171717;
--color-text-secondary: #525252;
--color-text-muted: #737373;
--color-text-inverse: #ffffff;
--color-text-brand: #102033;
```
Rules:
- Primary headings use `text-text-main`.
- Secondary copy uses `text-text-secondary`.
- Metadata uses `text-text-muted`.
- Text on orange/navy uses `text-text-inverse`.
---
### 5.6 Semantic Colors
Recommended tokens:
```css
--color-success: #16a34a;
--color-success-soft: #dcfce7;
--color-warning: #d97706;
--color-warning-soft: #fef3c7;
--color-danger: #dc2626;
--color-danger-soft: #fee2e2;
--color-info: #2563eb;
--color-info-soft: #dbeafe;
```
Use cases:
- Success: completed, verified, paid.
- Warning: pending, escrow, attention.
- Danger: rejected, fraud, failed, dispute high risk.
- Info: informational, draft, neutral progress.
---
## 6. Compatibility Alias Strategy
If existing components still use old token names, create temporary aliases.
This prevents large breakage during incremental migration.
Example:
```css
--color-brand-coral: var(--color-primary-500);
--color-brand-navy: var(--color-secondary-900);
--color-brand-dark: #0d1b2a;
```
Rules:
- Alias is temporary.
- New components must use final token names.
- Old components can be migrated gradually.
- Do not introduce new old-style brand names.
---
## 7. Typography Tokens
Current project uses Poppins.
UI direction may prefer Plus Jakarta Sans.
Final font decision should be made before broad UI polish.
For speed, the project may keep Poppins during MVP slicing.
If switching font, update root layout, agent rules, and docs consistently.
Recommended typography utilities:
```css
.text-display
.text-heading-1
.text-heading-2
.text-heading-3
.text-body-lg
.text-body-base
.text-body-sm
.text-caption
.text-label
```
Scale suggestion:
- Display: 40-56px desktop, 32-40px mobile.
- Heading 1: 32-40px desktop, 26-32px mobile.
- Heading 2: 24-30px.
- Heading 3: 20-24px.
- Body base: 14-16px.
- Input text: minimum 16px on mobile.
- Caption: 12-13px.
Rules:
- Do not overuse large typography in dashboard cards.
- Dashboard should prioritize scannability.
- Metric value can be larger but must not break mobile layout.
---
## 8. Radius Tokens
Recommended tokens:
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-2xl: 24px;
--radius-full: 9999px;
```
Usage:
- Button: md to lg.
- Card: xl to 2xl.
- Badge: full.
- Input: md.
- Modal: 2xl.
Rules:
- Do not create random radius values for each component.
- Avoid excessive rounded styles on dense tables.
---
## 9. Shadow Tokens
Recommended tokens:
```css
--shadow-card: 0 8px 24px rgba(16, 32, 51, 0.06);
--shadow-card-hover: 0 12px 32px rgba(16, 32, 51, 0.10);
--shadow-popover: 0 16px 40px rgba(16, 32, 51, 0.14);
```
Rules:
- Use subtle shadows.
- Avoid old heavy shadow like `0_8px_4px_rgba(0,0,0,0.25)` for dashboard cards.
- Prefer border + soft shadow.
- Hover elevation should be minimal.
---
## 10. Spacing Guidance
Use Tailwind spacing scale.
Recommended dashboard spacing:
- Page padding mobile: 16px.
- Page padding desktop: 24px to 32px.
- Card padding mobile: 16px.
- Card padding desktop: 20px to 24px.
- Section gap: 24px to 32px.
- Grid gap mobile: 12px to 16px.
- Grid gap desktop: 20px to 24px.
Rules:
- Avoid cramped mobile cards.
- Avoid large empty whitespace in data-heavy dashboard.
- Keep CTA reachable near relevant content.
---
## 11. Component Migration Order
### 11.1 Step 1 — Update Tokens
Update `src/app/globals.css` first.
Add final token names.
Add aliases for old tokens if needed.
Keep existing typography utilities initially.
Run app and check no visual crash.
### 11.2 Step 2 — Create Foundation Components
Create or update:
- Button.
- Card.
- Badge.
- StatusBadge.
- MetricCard.
- Input.
- EmptyState.
- Skeleton.
### 11.3 Step 3 — Migrate Existing CampaignCard
Replace hardcoded hex values.
Use token classes.
Simplify heavy shadow.
Align badge style with StatusBadge if possible.
Keep behavior unchanged unless requested.
### 11.4 Step 4 — Build Dashboard Shell
Use new background and surface tokens.
Use nav active token.
Use responsive layout.
### 11.5 Step 5 — Slice New Dashboard Pages
UMKM Dashboard first.
Kreator Dashboard second.
Admin later.
---
## 12. Status Badge Token Mapping
Campaign status:
- Draft: neutral/info soft.
- MenungguPembayaran: warning soft.
- Aktif: success soft.
- Penuh: info soft.
- Selesai: success soft.
- Dibatalkan: neutral soft.
- Dispute: danger soft.
Submission status:
- NotSubmitted: neutral.
- Pending: warning.
- Valid: success.
- Rejected: danger.
- Fraud: danger.
- Dispute: danger.
- Paid: success.
Order status:
- Negosiasi: info.
- MenungguPembayaran: warning.
- Escrow: warning.
- DalamPengerjaan: info.
- Revisi: warning.
- MenungguVerifikasi: warning.
- Selesai: success.
- Dibatalkan: neutral.
- Dispute: danger.
Transaction status:
- Pending: warning.
- Success: success.
- Failed: danger.
- Expired: neutral.
- Escrow: warning.
- Refunded: info.
- Cancelled: neutral.
---
## 13. Hardcoded Color Replacement Examples
Bad:
```tsx
className="bg-[#f77878] text-white"
```
Good:
```tsx
className="bg-primary-500 text-text-inverse hover:bg-primary-600"
```
Bad:
```tsx
className="text-[#f75050]"
```
Good:
```tsx
className="text-primary-500"
```
Bad:
```tsx
className="bg-[#FCE1E1]"
```
Good:
```tsx
className="bg-primary-50"
```
Bad:
```tsx
style={{ background: "linear-gradient(...)" }}
```
Acceptable only if:
- gradient is unique to a hero section.
- gradient is defined intentionally.
- it does not replace global design tokens.
---
## 14. Acceptance Criteria
Token migration is accepted if:
- `globals.css` contains final orange/navy/warm tokens.
- Old token aliases exist only if needed.
- New components do not use hardcoded hex colors.
- Dashboard background uses warm light mode.
- Button primary uses orange.
- Secondary action uses navy or neutral outline.
- Card uses white surface and soft border.
- Status badge colors are consistent.
- Mobile text remains readable.
- `npm run lint` passes.
- No Tailwind v3 config is introduced.
---
## 15. AI Coding Assistant Rules
Read this document before editing `globals.css`.
Do not replace Tailwind v4 syntax with Tailwind v3 syntax.
Do not create `tailwind.config.js` unless user explicitly requests architecture change.
Do not invent color tokens that are not documented here.
Do not use hardcoded hex values in new JSX.
Do not remove old aliases until all components are migrated.
Do not change font unless prompt explicitly asks.
Do not redesign existing components outside the active slicing scope.
When migrating one component, keep its behavior unchanged unless requested.
When adding token classes, prefer semantic token usage over arbitrary values.
