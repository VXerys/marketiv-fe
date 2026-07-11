# Requirements — Negosiasi Rate Card Kreator

## Introduction

Negosiasi Rate Card Mode adalah model kolaborasi premium harga tetap (*fixed price*) antara UMKM dan Content Creator. Pada mode ini, komunikasi dua arah secara langsung antara kedua belah pihak diizinkan dan diwadahi melalui Chat Negosiasi dengan dukungan sistem Escrow untuk menjamin keamanan dana transaksi. Kreator dapat mempublikasikan konten hasil kesepakatan dengan fitur "Collab Post" (di Instagram Reels atau TikTok) agar performa dan tautan postingan dapat diaudit secara valid oleh sistem.

Dokumen persyaratan (*requirements*) ini mendefinisikan seluruh fungsionalitas, alur interaksi, aturan bisnis, dan visualisasi UI/UX pada halaman dashboard daftar negosiasi serta detail Room Negosiasi (chat & workspace) untuk sisi Content Creator.

---

## Requirements

### 1. Dashboard Ringkasan & Metrik Negosiasi
**User Story:** As a Content Creator, I want to view a visual summary and numerical metrics of my negotiations, so that I can quickly monitor outstanding contracts and deal states.

#### Acceptance Criteria
1. WHERE user is on the Negotiations page `/dashboard/kreator/negosiasi`, THE SYSTEM SHALL display four distinct overview cards:
   - **Negosiasi Aktif:** Count of orders in "Negosiasi" status (color tone: default neutral).
   - **Menunggu Pembayaran:** Count of orders in "MenungguPembayaran" status (color tone: blue/indigo, strictly no orange).
   - **Escrow Aktif:** Count of orders in "Escrow", "Revisi", or "MenungguVerifikasi" status (color tone: green).
   - **Order Selesai:** Count of orders in "Selesai" status (color tone: default neutral).
2. WHEN the user opens the page, THE SYSTEM SHALL query the database for the active negotiations metrics count and load the values inside their respective metric cards.
3. IF the database query fails, THEN the system SHALL display error fallback states for all metrics card and show a notification toast.
4. WHERE the viewport width is less than 768px (mobile size), THE SYSTEM SHALL automatically stack the metric cards in a responsive 2x2 grid layout.

---

### 2. Pencarian & Pemfilteran Daftar Chat Negosiasi
**User Story:** As a Content Creator, I want to search and filter my negotiations list, so that I can easily find a specific chat or project.

#### Acceptance Criteria
1. WHERE user is on the Negotiations page, THE SYSTEM SHALL provide a search input text field and a status filter dropdown.
2. WHEN the user types in the search field, THE SYSTEM SHALL dynamically filter the visible negotiations list by matching the query against:
   - UMKM Business Name (`umkmName`)
   - Project/Package Title (`projectTitle`)
   - Last message text content (`lastMessage`)
3. WHEN the user selects a status from the filter dropdown, THE SYSTEM SHALL filter the negotiation items to match the selected state:
   - **Semua Status:** Displays all items.
   - **Negosiasi:** Displays items where contract status is "Negosiasi".
   - **Menunggu Pembayaran:** Displays items where contract status is "MenungguPembayaran".
   - **Escrow Aktif:** Displays items where contract status is "Escrow", "Revisi", or "MenungguVerifikasi".
   - **Selesai:** Displays items where contract status is "Selesai".
4. IF there are no matching items after applying search or status filter, THEN the system SHALL show the `CreatorEmptyState` component with a "Reset Filter" action button.
5. WHEN the user clicks "Reset Filter", THE SYSTEM SHALL clear all filters and restore the full list of negotiations.

---

### 3. Tampilan Item Chat Negosiasi (List Card)
**User Story:** As a Content Creator, I want to see clear negotiation list cards with last message previews and unread counts, so that I know which discussions require immediate attention.

#### Acceptance Criteria
1. WHERE user is on the Negotiations page, THE SYSTEM SHALL display each negotiation item as a card with a clean slate-grey border and solid white background.
2. EACH card SHALL display the following details:
   - UMKM Profile Avatar (circular image, fallback to initial letter if avatar is null).
   - UMKM Business Name (truncated if exceeding line width).
   - Project/Package Name prefixing with a box icon (📦).
   - Last message excerpt (max 2 lines, truncated) inside a soft grey background box.
   - The relative date of the last message (e.g. "11 Jun").
   - Offer price formatted in Rupiah (`formatCurrency(finalPrice)`).
   - Colored status badge showing contract state.
3. IF the negotiation item has unread messages (`unreadCount > 0`), THEN the system SHALL overlay a circular badge showing the count in the upper right corner of the last message box.
4. WHEN the user clicks the "Buka Room Negosiasi" primary button, THE SYSTEM SHALL redirect the user to the detail Chat Room route `/dashboard/kreator/negosiasi/[id_order]`.

---

### 4. Chat Feed & Workspace Room Negosiasi
**User Story:** As a Content Creator, I want to chat with the UMKM and view system events, so that we can negotiate contract details and deliverables securely.

#### Acceptance Criteria
1. WHERE user is inside the Negotiation Room `/dashboard/kreator/negosiasi/[id_order]`, THE SYSTEM SHALL show a split-pane layout:
   - **Left Pane (8 columns on desktop):** Chat Room box consisting of Header, Collab Warning Banner, Chat Messages Feed, and Chat Composer panel.
   - **Right Pane (4 columns on desktop):** Rincian Kontrak Kerja (Contract Details) and Checklist Deliverables sidebar cards.
2. THE chat header SHALL show the UMKM Avatar, Business Name, Project Title, and the current contract status badge.
3. THE system SHALL display a warning banner below the header, notifying that any final video publications must use the "Collab Post" feature on Instagram or TikTok.
4. WHEN rendering messages in the feed, THE SYSTEM SHALL format them according to the sender:
   - **UMKM Message:** Appears on the left with the UMKM avatar, white background bubble, and dark text.
   - **Creator Message:** Appears on the right with no avatar, dark slate-grey/black background bubble, and white text.
   - **System Message:** Appears centered as an badge with a soft violet background (`bg-indigo-50 border border-indigo-100`) and a gear icon (⚙️).
5. WHEN a new message is sent via the text input composer, THE SYSTEM SHALL immediately append it to the chat feed and simulate a response from the UMKM after 1.5 seconds.

---

### 5. Pembuatan & Pengiriman Custom Offer
**User Story:** As a Content Creator, I want to send custom contract offers directly to the chat feed, so that I can draft custom scopes, prices, and deliverables.

#### Acceptance Criteria
1. WHERE the contract status is "Negosiasi", THE SYSTEM SHALL display a "Buat Custom Offer" action button in the chat composer toolbar.
2. WHEN the user clicks "Buat Custom Offer", THE SYSTEM SHALL display a modal popup containing a form with fields:
   - **Harga Penawaran (Rupiah):** Number input field.
   - **Deliverables Konten:** Text input field (e.g., "1 Reels Collab Post + 1 Story Link").
   - **Durasi Pengerjaan (Hari):** Number input field.
   - **Revisi Maksimal:** Number input field.
   - **Deskripsi Ruang Lingkup (Scope):** Textarea input field.
3. WHEN the user submits the custom offer form, THE SYSTEM SHALL:
   - Calculate platform fee (3% of price) and total cost (price + platform fee).
   - Close the modal and show a success toast.
   - Append a Custom Offer message card into the chat feed containing the offer details, scope, pricing, and an action button for the UMKM to accept.
4. IF the contract status changes from "Negosiasi" to another status (e.g. "MenungguPembayaran" or "Escrow"), THEN the system SHALL disable the "Buat Custom Offer" button and show a "✓ Kesepakatan Terbuat" indicator on the offer card.

---

### 6. Pengiriman Tautan Bukti Collab Post
**User Story:** As a Content Creator, I want to submit my published video Collab Post URL link, so that the admin can audit my views and release the escrow funds.

#### Acceptance Criteria
1. WHERE the contract status is "Escrow" or "Revisi", THE SYSTEM SHALL display a "Submit Link Collab Post" button in the chat composer toolbar.
2. WHEN the user clicks the button, THE SYSTEM SHALL open a modal popup prompting for the Link Video Instagram Reels or TikTok URL.
3. WHEN the user submits the URL, THE SYSTEM SHALL perform frontend format validation:
   - Trim the input URL.
   - IF the URL does not start with `http://` or `https://`, THEN the system SHALL show a validation error message.
   - IF the URL does not contain `tiktok.com` or `instagram.com`, THEN the system SHALL show a validation error message.
4. WHEN the validation succeeds, THE SYSTEM SHALL:
   - Set the contract status to "MenungguVerifikasi".
   - Store the URL under `submittedCollabUrl`.
   - Append a system message to the chat feed containing the submitted link.
   - Close the modal and show a success toast.
5. WHERE the contract status is "Revisi" and the creator completes the requested changes, THE SYSTEM SHALL provide a "Tandai Revisi Selesai" button that reverts the status to "MenungguVerifikasi".

---

### 7. Rincian Kontrak Kerja & Checklist Side Pane
**User Story:** As a Content Creator, I want to view my active contract terms and checklist, so that I can stay aligned on deliverables and milestones.

#### Acceptance Criteria
1. WHERE the user is inside the Negotiation Room, THE SYSTEM SHALL display a sidebar card titled "Rincian Kontrak Kerja" showing:
   - Package Name, Scope Description, Deliverables.
   - Deadline Date, Maximum Revisions count.
   - Pricing breakdown: Rate Card price, Platform fee (3%), and Total billing amount.
   - Escrow Security Status badge showing:
     - `Pending` (Escrow not paid yet, tone: amber).
     - `Escrowed` (Funds locked in escrow, tone: green).
     - `Released` (Funds released to creator wallet, tone: blue).
2. THE system SHALL display a second sidebar card titled "Checklist Deliverables" with checkboxes tracking order milestones:
   - **Inisiasi Negosiasi & Deal:** Checked when contract is created.
   - **Pembayaran Escrow UMKM:** Checked when status moves past "MenungguPembayaran".
   - **Submit Collab Post URL:** Checked when `submittedCollabUrl` is present.
   - **Pelepasan Dana Escrow:** Checked when status is "Selesai".
3. ALL checkboxes inside the checklist card SHALL be read-only indicators representing current database states, styled with a violet/indigo checkmark accent.

---

## Success Metrics

- **Zero Orange Leakage:** 100% of UI elements (buttons, focus states, tags, cards) on the creator negotiation list and chat room utilize the slate/grey cold neutral palette and violet/indigo primary accents.
- **Form Validation Latency:** Frontend URL format validation for Collab Post submissions takes less than 200ms.
- **Mobile Responsive Compatibility:** No horizontal scrollbars or component text overlaps on viewport widths from 375px to 1024px.
- **Accurate Escrow Calculation:** The platform fee (3%) and total amount are calculated and displayed correctly with zero rounding errors.

## Constraints

- The interface must be fully mobile responsive starting from 375px.
- The UI language must be standard Indonesian.
- All colors must map to the established `@theme` variables inside `globals.css` (e.g. `bg-primary`, `text-primary`). No hardcoded hex color codes are allowed.
- Strictly no direct write/mutation of creator wallet balances or transaction states inside the client components.

## Out of Scope

- Escrow dispute resolution and refund management interfaces (handled by the Admin portal or UMKM dispute panel).
- Auto-syncing of social media views API fetching (processed asynchronously via backend cron queues).
- Direct credit/debit card details entry forms (handled by Midtrans redirection/modal widgets).
