# 03 — Component Inventory Marketiv
> Dokumen ini memetakan komponen existing dan komponen target untuk slicing UI/UX Marketiv.
> Gunakan dokumen ini sebelum membuat komponen baru agar tidak terjadi duplikasi, naming conflict, atau folder placement yang salah.
---
## 1. Tujuan Dokumen
Component inventory membantu tim memahami komponen apa yang sudah ada, apa yang perlu dibuat, dan di mana komponen harus ditempatkan.
Inventory ini juga membantu AI coding assistant agar tidak mengarang struktur komponen baru.
Dokumen ini bukan source code.
Dokumen ini adalah kontrak perencanaan komponen.
Komponen yang dibuat harus mengikuti strict rules project.
Komponen harus memakai named export.
Komponen harus memiliki interface props jika menerima props.
Komponen harus memakai `cn()` jika className bersifat conditional.
Komponen harus memakai design tokens dari Tailwind v4 `@theme`.
Komponen harus responsive dan mendukung accessibility baseline.
Komponen harus menjaga pemisahan domain UMKM, Kreator, Admin, Campaign, Rate Card, Finance, dan Chat.
---
## 2. Folder Placement Rules
### 2.1 UI Components
```txt
src/components/ui/
```
Gunakan untuk komponen reusable yang tidak memiliki business knowledge spesifik.
Contoh:
- Button.
- Card.
- Input.
- Badge.
- Modal.
- Skeleton.
- EmptyState.
- ErrorState.
### 2.2 Layout Components
```txt
src/components/layouts/
```
Gunakan untuk struktur halaman atau shell.
Contoh:
- Navbar.
- Footer.
- DashboardShell.
- DashboardSidebar.
- DashboardTopbar.
- MobileBottomNav.
### 2.3 Feature Components
```txt
src/components/features/<feature-name>/
```
Gunakan untuk komponen yang punya konteks domain.
Contoh:
- `src/components/features/campaign/`
- `src/components/features/rate-card/`
- `src/components/features/finance/`
- `src/components/features/chat/`
- `src/components/features/admin/`
- `src/components/features/dashboard/`
### 2.4 Data and Types
```txt
src/data/
src/types/
src/lib/
```
Gunakan `src/data/` untuk content dan dummy data.
Gunakan `src/types/` untuk TypeScript interfaces.
Gunakan `src/lib/` untuk helper, formatter, utility, Appwrite client boundary, dan validation helper.
---
## 3. Existing Components Snapshot
### 3.1 Layout Existing
```txt
src/components/layouts/Navbar.tsx
```
Status:
- Existing.
- Dipakai landing, UMKM page, dan Creator page.
- Perlu dievaluasi apakah tetap dipakai untuk dashboard.
- Dashboard final sebaiknya memakai DashboardShell, bukan Navbar publik.
Action:
- Pertahankan untuk public pages.
- Jangan pakai sebagai dashboard sidebar.
- Jangan hapus sebelum dashboard shell final selesai.
---
### 3.2 Landing Existing
```txt
src/components/features/landing/HeroSection.tsx
```
Status:
- Existing.
- Dipakai landing page.
- Bisa dipertahankan sementara.
- Perlu redesign sesuai UI direction baru nanti.
Action:
- Jangan prioritas sebelum dashboard MVP.
- Redesign landing dilakukan setelah dashboard foundation stabil.
---
### 3.3 Dashboard Existing
```txt
src/components/features/dashboard/DashboardHero.tsx
src/components/features/dashboard/CampaignGrid.tsx
src/components/features/dashboard/CampaignCard.tsx
```
Status:
- Existing.
- Masih campaign-list oriented.
- Belum dashboard overview final.
- Beberapa style masih hardcoded.
Action:
- Jangan langsung hapus.
- Bisa dijadikan referensi visual lama.
- Migrasi bertahap ke component baru.
- Komponen campaign card final sebaiknya pindah ke `features/campaign/`.
---
### 3.4 Chatbot Existing
```txt
src/components/features/chatbot/ChatbotFab.tsx
```
Status:
- Existing karena root layout memakai ChatbotFab.
- Harus dipastikan tidak mengganggu dashboard mobile.
- Harus dipastikan tidak melanggar Campaign Mode zero-chat.
Action:
- Jika chatbot adalah bantuan AI umum, bedakan dari chat UMKM-Kreator.
- Jangan tampilkan sebagai komunikasi campaign antar user.
- Pertimbangkan hide pada admin atau dashboard kritikal jika mengganggu.
---
## 4. Foundation UI Components Target
### 4.1 Button
Path:
```txt
src/components/ui/Button.tsx
```
Variants:
- primary.
- secondary.
- outline.
- ghost.
- danger.
Sizes:
- sm.
- md.
- lg.
Requirements:
- Support disabled state.
- Support loading state if needed.
- Minimum touch target 44px on mobile.
- Use token colors.
- Use `cn()` for className merging.
---
### 4.2 Card
Path:
```txt
src/components/ui/Card.tsx
```
Variants:
- default.
- elevated.
- muted.
- interactive.
Requirements:
- White surface by default.
- Border subtle.
- Radius consistent.
- Optional header/body/footer pattern.
- No business-specific content.
---
### 4.3 Input Components
Paths:
```txt
src/components/ui/Input.tsx
src/components/ui/Textarea.tsx
src/components/ui/Select.tsx
src/components/ui/Checkbox.tsx
src/components/ui/RadioGroup.tsx
```
Requirements:
- Label support.
- Helper text support.
- Error message support.
- Disabled state.
- Focus ring token.
- Font size at least 16px for input on mobile.
---
### 4.4 StatusBadge
Path:
```txt
src/components/ui/StatusBadge.tsx
```
Purpose:
- Centralize status styling.
- Prevent inconsistent badge colors.
- Map status enum from docs to UI token.
Supported groups:
- Campaign status.
- Submission status.
- Order status.
- Transaction status.
- Withdrawal status.
- Dispute status.
---
### 4.5 MetricCard
Path:
```txt
src/components/ui/MetricCard.tsx
```
Purpose:
- Dashboard KPI card.
Props concept:
- title.
- value.
- description.
- trend.
- icon.
- tone.
- href optional.
Requirements:
- Readable on mobile.
- Avoid information overload.
- Use compact number formatting.
---
### 4.6 State Components
Paths:
```txt
src/components/ui/EmptyState.tsx
src/components/ui/ErrorState.tsx
src/components/ui/Skeleton.tsx
src/components/ui/LoadingState.tsx
```
Requirements:
- EmptyState supports title, description, action.
- ErrorState supports retry action.
- Skeleton supports card/list/table patterns.
- Loading state should not shift layout excessively.
---
## 5. Layout Components Target
### 5.1 DashboardShell
Path:
```txt
src/components/layouts/DashboardShell.tsx
```
Purpose:
- Shared dashboard wrapper for UMKM, Kreator, Admin.
Responsibilities:
- Render sidebar.
- Render topbar.
- Render content area.
- Handle mobile layout.
- Accept role-specific navigation config.
Non-responsibilities:
- Fetch domain data.
- Mutate backend state.
- Know campaign/order business logic.
---
### 5.2 DashboardSidebar
Path:
```txt
src/components/layouts/DashboardSidebar.tsx
```
Requirements:
- Supports role navigation.
- Active route styling.
- Collapsible optional.
- Accessible labels.
- Uses Link for internal routes.
---
### 5.3 DashboardTopbar
Path:
```txt
src/components/layouts/DashboardTopbar.tsx
```
Requirements:
- Page title.
- Optional breadcrumb.
- Notification trigger.
- Profile menu placeholder.
- Responsive.
---
### 5.4 MobileBottomNav
Path:
```txt
src/components/layouts/MobileBottomNav.tsx
```
Requirements:
- Only appears on mobile dashboard.
- Max 4-5 primary items.
- Role-specific.
- Avoid covering sticky CTA.
---
## 6. Campaign Components Target
Path base:
```txt
src/components/features/campaign/
```
Components:
- `CampaignCard.tsx`
- `CampaignList.tsx`
- `CampaignTable.tsx`
- `CampaignDetailHeader.tsx`
- `CampaignStatusSummary.tsx`
- `CampaignQuotaProgress.tsx`
- `CampaignBudgetSummary.tsx`
- `CampaignWizard.tsx`
- `CampaignWizardStep.tsx`
- `CampaignAssetField.tsx`
- `CampaignBudgetCalculator.tsx`
- `JobPoolCard.tsx`
- `ClaimCampaignDialog.tsx`
- `ProofUrlForm.tsx`
Rules:
- Campaign components must not import chat components.
- Campaign components must not render WhatsApp or direct contact CTA.
- Campaign wizard must not mark payment success directly.
- Campaign proof form must focus on URL submission.
---
## 7. Rate Card Components Target
Path base:
```txt
src/components/features/rate-card/
```
Components:
- `CreatorDirectoryGrid.tsx`
- `CreatorCard.tsx`
- `CreatorProfileHeader.tsx`
- `CreatorPortfolioList.tsx`
- `RateCardPackageCard.tsx`
- `RateCardPackageForm.tsx`
- `OrderStatusSummary.tsx`
- `CollabPostNotice.tsx`
Rules:
- Rate Card components may link to chat/negotiation.
- Rate Card package max 3 active must be represented in UI.
- Collab Post notice must be visible in order-related screens.
---
## 8. Chat Components Target
Path base:
```txt
src/components/features/chat/
```
Components:
- `ChatRoom.tsx`
- `MessageList.tsx`
- `MessageBubble.tsx`
- `MessageComposer.tsx`
- `CustomOfferBubble.tsx`
- `CustomOfferForm.tsx`
- `SystemMessage.tsx`
- `ChatEmptyState.tsx`
Rules:
- Chat is Rate Card Mode only.
- Do not import chat components into campaign pages.
- CustomOfferBubble must be visually distinct.
- MessageComposer must be disabled when order status disallows chat.
---
## 9. Finance Components Target
Path base:
```txt
src/components/features/finance/
```
Components:
- `WalletSummaryCard.tsx`
- `TransactionList.tsx`
- `TransactionTable.tsx`
- `PaymentStatusCard.tsx`
- `EscrowStatusCard.tsx`
- `WithdrawalForm.tsx`
- `WithdrawalStatusTimeline.tsx`
- `PayoutHistoryList.tsx`
Rules:
- Finance components must be display-first.
- Mutations must call backend-only operation.
- Transaction status must use StatusBadge.
- Currency must use formatter.
---
## 10. Admin Components Target
Path base:
```txt
src/components/features/admin/
```
Components:
- `AdminMetricGrid.tsx`
- `SubmissionValidationTable.tsx`
- `DisputeTable.tsx`
- `UserManagementTable.tsx`
- `ReportExportPanel.tsx`
- `AdminActionDialog.tsx`
- `AuditLogTimeline.tsx`
Rules:
- Admin actions require confirmation UI.
- Admin actions must show impact on funds/status if relevant.
- Admin pages must not be accessible by non-admin route guard.
---
## 11. Content and Data Inventory
### 11.1 Content Files
Target:
```txt
src/data/content.ts
src/data/navigation.ts
src/data/status.ts
```
Rules:
- Static labels should not be scattered inside JSX.
- Navigation should be role-specific.
- Status labels should be centralized.
### 11.2 Dummy Data Files
Target:
```txt
src/data/campaigns.ts
src/data/creators.ts
src/data/orders.ts
src/data/transactions.ts
src/data/notifications.ts
src/data/admin.ts
```
Rules:
- Dummy data must match Appwrite-oriented types.
- Dummy IDs should look realistic but not use real user data.
- Dummy status values must match lifecycle reference.
---
## 12. Type Inventory
Target:
```txt
src/types/campaign.ts
src/types/creator.ts
src/types/order.ts
src/types/message.ts
src/types/transaction.ts
src/types/notification.ts
src/types/status.ts
src/types/navigation.ts
src/types/dashboard.ts
```
Rules:
- Types must not duplicate conflicting enum strings.
- Status types should be imported from shared status file where possible.
- UI component props should be local unless reused globally.
- Domain types should reflect docs/database and docs/features.
---
## 13. Refactor Guidance for Existing Components
Do not delete existing components during first slicing pass unless user asks.
Prefer create new components and migrate page usage gradually.
If existing component uses hardcoded color, replace only inside active scope.
If component folder is wrong, move only with explicit instruction.
If a component is shared by UMKM and Kreator but should diverge, create role-specific wrapper.
If a component contains business logic and presentation, split carefully in a dedicated refactor batch.
If dummy data shape is outdated, migrate data and types together.
---
## 14. AI Coding Assistant Rules
Before creating a component, check this inventory.
Do not create duplicate Button, Card, Badge, MetricCard, or StatusBadge.
Do not put domain-specific component in `components/ui`.
Do not put reusable UI component in `features`.
Do not create folder names that are not listed unless user requests.
Do not import chat components into campaign components.
Do not hardcode hex color values.
Do not skip props interface.
Do not use default export for components.
Do not add dependency for icons unless user explicitly requests.
Inline SVG is acceptable if consistent with existing project rules.
