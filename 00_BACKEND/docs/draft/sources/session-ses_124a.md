# Ponytail mode coding guidelines

**Session ID:** ses_124aeb6a9ffeYnjD8xuTW0niei
**Created:** 6/18/2026, 10:19:58 PM
**Updated:** 6/18/2026, 10:28:02 PM

---

## User

Switch to ponytail  mode. If no level specified, use full. Lazy senior dev mode, before any code: does it need to exist at all (YAGNI)? Does the standard library do it? A native platform feature? Can it be one line? Build the minimum that works. No unrequested abstractions, no avoidable dependencies, no boilerplate. Mark intentional simplifications with a ponytail: comment.

---

## Assistant (Build · GPT-5.5 · 6.9s)

Ponytail mode enabled: full.

I’ll default to smallest viable changes, question whether code needs to exist, prefer stdlib/native/one-liners, avoid abstractions/dependencies/boilerplate, and mark intentional simplifications with `ponytail:` comments when editing.

---

## User

dari dokumentasi-dokumentasi projek ini saya ingin anda memahaminya terutama bagian umkm yang ingin saya validasi dan revisi apabila ada yang kurang sesuai. oleh karena itu berikan saya penjelasan mengenai sisi umkm nya baik dari data flow yang masuknya itu bagaimana saya ingin dijelaskan secara lengkap flow dari si umkm ini

---

## Assistant (Build · GPT-5.5 · 5.2s)

_Thinking:_



Saya akan baca struktur dokumentasi dulu, lalu fokus cari bagian `umkm` dan alur data terkait sebelum merangkum flow-nya.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*",
  "path": "/home/panjiangka1/Documents/dev/marketiv-web"
}
```

**Output:**
```
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/backend-data-architect/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/animation-benchmark/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/migrate-scroll-to-gsap/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/audit-gsap-safety/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/scaffold-gsap-scrolltrigger/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/validate-data-contracts/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.env.example
/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/refactor-21st-ui/SKILL.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/workflows/animation-audit.yml
/home/panjiangka1/Documents/dev/marketiv-web/.github/workflows/pre-merge-quality-gate.yml
/home/panjiangka1/Documents/dev/marketiv-web/.github/workflows/ci.yml
/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/component-slicing.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/dispute-resolution.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/appwrite-integration.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/push-to-repo.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/ui-creation.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/payment-midtrans.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/strict-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/nextjs-data-flow.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/nextjs-architecture.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/p2mw-compliance.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-domain-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-context.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/slicing-and-components.md
/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/appwrite-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/SECURITY.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/marketiv-context.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/PULL_REQUEST_TEMPLATE.md
/home/panjiangka1/Documents/dev/marketiv-web/public/globe.svg
/home/panjiangka1/Documents/dev/marketiv-web/public/vercel.svg
/home/panjiangka1/Documents/dev/marketiv-web/public/window.svg
/home/panjiangka1/Documents/dev/marketiv-web/public/file.svg
/home/panjiangka1/Documents/dev/marketiv-web/public/next.svg
/home/panjiangka1/Documents/dev/marketiv-web/dev_server.log
/home/panjiangka1/Documents/dev/marketiv-web/tsconfig.json
/home/panjiangka1/Documents/dev/marketiv-web/postcss.config.mjs
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/supabase-graphql-data-layer.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/animation-performance-audit.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/frontend-animations.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/app-router-data-fetching.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/refactor-21st.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/gsap-components.instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/copilot-instructions.md
/home/panjiangka1/Documents/dev/marketiv-web/src/data/chatbotKnowledge.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/data/umkmDashboard.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/data/creators.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/data/content.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/data/campaigns.ts
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/scaffold-gsap-section.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/generate-awwwards-section.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/audit-animation-performance.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/refactor-21st.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/router-handoff-pack.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/task-intake-router.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/.github/prompts/create-server-data-loader.prompt.md
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/negotiations.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/rate-cards.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/dashboard-summary.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/campaigns.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/creators.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/submissions.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/index.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/transactions.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/profile.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/messages.mock.ts
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/10-realtime-events-and-background-jobs.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/01-engineering-principles.md
/home/panjiangka1/Documents/dev/marketiv-web/src/constants/mock-assets.constants.ts
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/17-ai-coding-assistant-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/05-security-and-permissions.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md
/home/panjiangka1/Documents/dev/marketiv-web/src/constants/umkm-dashboard.constants.ts
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/07-ui-ux-implementation-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/15-deployment-environment-and-secrets.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/13-testing-quality-assurance.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/README.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/06-performance-and-scalability.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/02-project-architecture.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/09-data-validation-and-error-handling.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/14-observability-logging-and-audit.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/16-code-style-and-review-checklist.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/03-nextjs-frontend-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/04-appwrite-backend-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/12-ai-integration-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/08-accessibility-and-content-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkm-dashboard.types.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/api.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkmDashboard.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/README.md
/home/panjiangka1/Documents/dev/marketiv-web/src/types/campaign.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/chat.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/role.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/status.ts
/home/panjiangka1/Documents/dev/marketiv-web/src/types/images.d.ts
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/02-design-tokens.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/05-dashboard-umkm-guidelines.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/03-layout-system.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/01-visual-direction.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/08-ai-ui-generation-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/06-dashboard-kreator-guidelines.md

(Results are truncated: showing first 100 results. Consider using a more specific path or pattern.)
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "(?i)umkm|merchant|seller|penjual|usaha|produk|product|order|pesanan",
  "path": "/home/panjiangka1/Documents/dev/marketiv-web",
  "include": "*.md"
}
```

**Output:**
```
Found 100 matches (more matches available)
/home/panjiangka1/Documents/dev/marketiv-web/README.md:
  Line 6:   **Mendemokratisasi Pemasaran Digital Tanpa Risiko "Boncos" untuk UMKM Daerah.**

  Line 25: **Marketiv** adalah platform *marketplace hybrid* yang dirancang khusus untuk menjembatani **UMKM** (terutama di kota tier-2 seperti Sukabumi) dengan **Kreator Mikro** lokal. Proyek ini dikembangkan sebagai bagian dari **Program Pembinaan Mahasiswa Wirausaha (P2MW) 2025** — Universitas Nusa Putra.

  Line 29: | # | Masalah UMKM | Solusi Marketiv |

  Line 31: | 1 | **Risiko Finansial Tinggi** — Bayar mahal di muka tanpa jaminan konten viral | Model **pay-per-view** — UMKM hanya bayar berdasarkan performa aktual |

  Line 33: | 3 | **Literasi Digital Rendah** — Kesulitan menyusun *brief* pemasaran | **AI-Assisted Brief Builder** yang memandu UMKM langkah demi langkah |

  Line 41: | 🏪 **Ruang UMKM** | `/dashboard/umkm/*` | UI *super-simple*, fokus pada efisiensi dan kemudahan penggunaan |

  Line 44: > **Aturan Sistem:** Komponen dan *state* UMKM **tidak boleh bocor** atau digunakan di halaman Kreator, dan sebaliknya.

  Line 57: UMKM upload brief & raw video ➜ Kreator klaim job ➜ Kreator edit video

  Line 69: UMKM browse katalog Kreator ➜ Inisiasi Chat ➜ Negosiasi

  Line 74: - **✅ Strict Rule:** Wajib menggunakan fitur **"Collab Post" (Instagram/TikTok)** agar UMKM mendapatkan *direct traffic*

  Line 95: Pemisahan *domain logic* dilakukan di tingkat routing untuk mencegah kebocoran state antara UMKM dan Kreator.

  Line 104: │   │   │   └── umkm/           #    🏪 Domain Eksklusif UMKM

  Line 164: | `build` | `npm run build` | Membuat production build yang dioptimasi |

  Line 165: | `start` | `npm run start` | Menjalankan production server |

  Line 180: | `.agents/rules/marketiv-context.md` | Konteks bisnis & domain knowledge produk |


/home/panjiangka1/Documents/dev/marketiv-web/src/types/README.md:
  Line 4: Examples: `User`, `Campaign`, `Product`, `ApiResponse`, etc.


/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/animation-benchmark/SKILL.md:
  Line 27: - Verifikasi ScrollTrigger markers off untuk mode produksi.

  Line 49: - Markers aktif di mode produksi: warning wajib perbaikan.


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/release-notes-decision.agent.md:
  Line 29: 3. Map each issue to mitigation, role-based owner (FE, BE, QA, Product), and next action.

  Line 35: Return sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/.github/instructions/animation-performance-audit.instructions.md:
  Line 16: - `markers` harus `false` untuk mode produksi.


/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/component-slicing.md:
  Line 11: 1. **Static Text:** Check if the page copy is already in `src/data/content.ts`. If not, add your new page content objects there using `UPPER_SNAKE_CASE` (e.g. `UMKM_CONTENT`, `CREATOR_CONTENT`).

  Line 12: 2. **Dummy Lists:** Put any required tabular list datasets (e.g. mock campaigns, active orders, transaction ledger lines) into `src/data/` (e.g. `src/data/campaigns.ts`).

  Line 37:    <div className="bg-background-card rounded-lg border border-border-subtle p-6 shadow-sm">


/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/10-realtime-events-and-background-jobs.md:
  Line 17: - When this document conflicts with product feature details, escalate and update the docs before coding.

  Line 23: - Order status update for involved participants.

  Line 24: - Submission status update for related UMKM or Kreator.

  Line 32: - Subscribe to specific order or user-relevant resource scopes.

  Line 41: - Payment webhook received should update transaction and related campaign/order status.

  Line 43: - Custom Offer accepted should update order status and create notification.

  Line 61: - Payment webhook must use provider transaction ID or order ID to prevent duplicate processing.

  Line 63: - Payout release must not run twice for the same validated submission/order.

  Line 85: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/pr-risk-router.agent.md:
  Line 7: agents: [UI Slicing 21st Specialist, Marketiv Product Guard Agent, App Router Route Integrator Agent, Pre-Merge Quality Gate Agent]

  Line 16: - Marketiv Product Guard Agent

  Line 30: 3. Map each risk bucket to one specialist agent and define execution order.

  Line 36: Return sections in this order:

  Line 38: 2. Agent Routing Plan: target agent per risk and execution order.


/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/dispute-resolution.md:
  Line 3: This document provides a step-by-step Standard Operating Procedure (SOP) for implementing UI components and backend workflows when a Rate Card Mode order enters a dispute in Marketiv.

  Line 11: 1. **Dispute Button:** Provide an "Ajukan Sengketa" button on `/dashboard/umkm/negosiasi/[orderId]` and `/dashboard/kreator/negosiasi/[orderId]`.

  Line 13:    - Sets `Order.status = "disputed"`.

  Line 14:    - Freezes the escrow release state for this order.

  Line 16: 3. **Frontend Feedback:** Both users' chat rooms and order detail panels should update immediately via Appwrite Realtime, displaying a prominent red alert banner:

  Line 17:    > "Status pesanan ditangguhkan karena sengketa. Pembayaran ditahan di Escrow dan menunggu mediasi Admin."

  Line 25: 1. **Evidence Upload Form:** Slicing a form under the order details section:

  Line 29: 3. **Locking Interactions:** Disable other order actions (such as "Selesaikan Pesanan" or "Kirim Link Posting") while the dispute is in mediation.

  Line 38:    - Left side: UMKM's contract deliverables description and submitted evidence.

  Line 41:    - **Refund to UMKM:** Releases the escrow funds back to the UMKM's wallet.

  Line 53:    - Set `Orders.status = "refunded"` or `"completed"`.


/home/panjiangka1/Documents/dev/marketiv-web/.github/skills/audit-gsap-safety/SKILL.md:
  Line 32: - Cek `markers` pada ScrollTrigger; untuk mode produksi harus `false`.

  Line 58: - ScrollTrigger markers aktif pada code produksi: medium severity.


/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/01-engineering-principles.md:
  Line 17: - When this document conflicts with product feature details, escalate and update the docs before coding.

  Line 71: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/read-only-compliance-reviewer.agent.md:
  Line 3: description: "Use when performing audit-only compliance checks without modifying files, focusing on workspace rules from copilot instructions, App Router data-fetching standards, and Marketiv product docs. Keywords: read-only review, compliance audit, no edits, app router policy, marketiv rules, reviewer QA."

  Line 25: - DO NOT ignore conflicts between technical implementation and product/business rules.

  Line 29: 1. Read target scope and map it to applicable policy layers (workspace, app-router, marketiv product rules).

  Line 37: Return sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/appwrite-integration.md:
  Line 21: 1. **Implement Fetch in Server Component:** Fetch the data directly in your Server Component (e.g. `src/app/dashboard/umkm/page.tsx`):

  Line 26:    async function getUmkmCampaigns(profileId: string) {

  Line 36:    const response = await getUmkmCampaigns(userProfile.id);


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/ui-slicing-21st.agent.md:
  Line 12: Refactor existing components into production-ready Next.js App Router UI that matches workspace standards and preserves accessibility.

  Line 31: Return detailed sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/17-ai-coding-assistant-rules.md:
  Line 17: - When this document conflicts with product feature details, escalate and update the docs before coding.

  Line 19: ## 3. Required Context Loading Order

  Line 107: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/app-router-route-integrator.agent.md:
  Line 3: description: "Use when integrating sections/components into production-ready Next.js App Router routes end-to-end, ensuring metadata or generateMetadata, loading and error boundaries, server-first data fetching, explicit caching, and correct client-leaf boundaries. Keywords: app router route integration, metadata, generateMetadata, loading.tsx, error.tsx, server-first fetching, client boundary."

  Line 12: Turn route-level work into production-ready App Router implementations, not just component-level edits.

  Line 36: Return detailed sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/task-intake-router.agent.md:
  Line 7: agents: [UI Slicing 21st Specialist, Marketiv Product Guard Agent, App Router Route Integrator Agent, Pre-Merge Quality Gate Agent, PR Risk Router Agent, Read-Only Compliance Reviewer Agent, Release Notes and Decision Agent]

  Line 12: Act as the first entry point: understand user intent quickly, select the right specialist agent, and orchestrate safe delegation order so users do not need to pick agents manually.

  Line 16: - Marketiv Product Guard Agent

  Line 34: 3. If intent is mixed, split into a multi-agent plan with safe execution order.

  Line 41: Return sections in this order:

  Line 44: 3. Delegation Plan and Order.


/home/panjiangka1/Documents/dev/marketiv-web/src/app/dashboard/umkm/README.md:
  Line 1: # UMKM Routes

  Line 3: This directory contains the routing and page components specifically for UMKM (Business) users.

  Line 4: Examples: `/umkm/dashboard`, `/umkm/campaigns`, etc.


/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/05-security-and-permissions.md:
  Line 17: - When this document conflicts with product feature details, escalate and update the docs before coding.

  Line 32: - UMKM can manage only their own campaigns, orders, transactions, and profile data.

  Line 58: - Use deployment provider secret storage for production.

  Line 87: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/marketiv-product-guard.agent.md:
  Line 2: name: Marketiv Product Guard Agent

  Line 3: description: "Use when building or refactoring features that risk violating Marketiv business rules (Campaign Mode no-chat policy, RBAC constraints, escrow flow, and hard product constraints). Keywords: campaign mode, no chat, RBAC, escrow, business rules, marketiv compliance, role access, transaction state."

  Line 9: You are a business-rule compliance specialist for Marketiv product implementation.

  Line 12: Prevent product regressions where code looks technically correct but violates Marketiv domain rules.

  Line 21: - DO NOT add features that violate product constraints, especially communication in Campaign Mode.

  Line 28: 1. Identify feature scope, actor role (UMKM/KREATOR/ADMIN), and route context.

  Line 36: Return sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/.agents/workflows/ui-creation.md:
  Line 21:    - Apakah ini untuk domain **UMKM** (`/dashboard/umkm/`) atau **Kreator** (`/dashboard/kreator/`)?

  Line 50: - Domain: [UMKM / Kreator / Shared]


/home/panjiangka1/Documents/dev/marketiv-web/.github/agents/pre-merge-quality-gate.agent.md:
  Line 51: Return sections in this order:


/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md:
  Line 17: - When this document conflicts with product feature details, escalate and update the docs before coding.

  Line 31: - UMKM payment enters escrow state before creator payout.

  Line 34: - Rate Card payout depends on accepted/completed order and valid collab post requirement.

  Line 36: - Cancelled or expired payment must not activate campaign/order.

  Line 42: - Transaction records must reference campaign, order, withdrawal, or refund where applicable.

  Line 46: - Provider order ID must be stored for reconciliation.

  Line 74: - Frontend cannot mark a campaign/order as paid.

  Line 94: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.


/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/payment-midtrans.md:
  Line 17: [UMKM (Browser)] --(Click Bayar)--> [Next.js Server Action / Appwrite Function]


(Results truncated. Consider using a more specific path or pattern.)
```

---

## Assistant (Build · GPT-5.5 · 10.5s)

_Thinking:_



Saya menemukan dokumentasi domain utama ada di `README.md`, `.agents/rules/*`, dan `docs/marketiv-md/*`. Saya akan fokus ke aturan bisnis UMKM, mode campaign/rate card, pembayaran escrow, dan dashboard UMKM.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/README.md",
  "offset": 1,
  "limit": 220
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/README.md</path>
<type>file</type>
<content>
1: <div align="center">
2:   <img src="public/globe.svg" alt="Marketiv Logo" width="120" height="120" />
3: 
4:   # 🚀 Marketiv — Web Client Repository
5: 
6:   **Mendemokratisasi Pemasaran Digital Tanpa Risiko "Boncos" untuk UMKM Daerah.**
7: 
8:   [![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
9:   [![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
10:   [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
11:   [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
12:   [![P2MW 2025](https://img.shields.io/badge/P2MW-2025-FFD700?style=for-the-badge)](#-tim-pengembang-p2mw-2025--universitas-nusa-putra)
13:   [![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)](#)
14: 
15:   <br/>
16: 
17:   [Tentang](#-tentang-proyek) · [Fitur Utama](#-mode-fitur-utama) · [Tech Stack](#%EF%B8%8F-tech-stack) · [Struktur Proyek](#-struktur-direktori-proyek) · [Memulai](#-panduan-memulai-getting-started) · [Tim](#-tim-pengembang-p2mw-2025--universitas-nusa-putra)
18: 
19: </div>
20: 
21: ---
22: 
23: ## 📖 Tentang Proyek
24: 
25: **Marketiv** adalah platform *marketplace hybrid* yang dirancang khusus untuk menjembatani **UMKM** (terutama di kota tier-2 seperti Sukabumi) dengan **Kreator Mikro** lokal. Proyek ini dikembangkan sebagai bagian dari **Program Pembinaan Mahasiswa Wirausaha (P2MW) 2025** — Universitas Nusa Putra.
26: 
27: ### Masalah yang Diselesaikan
28: 
29: | # | Masalah UMKM | Solusi Marketiv |
30: |---|---|---|
31: | 1 | **Risiko Finansial Tinggi** — Bayar mahal di muka tanpa jaminan konten viral | Model **pay-per-view** — UMKM hanya bayar berdasarkan performa aktual |
32: | 2 | **Kualitas Buzzer Rendah** — Maraknya bot views dan engagement palsu | **Sistem deteksi fraud views** terintegrasi |
33: | 3 | **Literasi Digital Rendah** — Kesulitan menyusun *brief* pemasaran | **AI-Assisted Brief Builder** yang memandu UMKM langkah demi langkah |
34: 
35: ### 🌟 Arsitektur *Dual-Ecosystem*
36: 
37: Sistem ini memisahkan dua ruang pengguna secara ketat pada level **routing**, **state management**, dan **UI/UX**:
38: 
39: | Ecosystem | Route | Karakteristik |
40: |---|---|---|
41: | 🏪 **Ruang UMKM** | `/dashboard/umkm/*` | UI *super-simple*, fokus pada efisiensi dan kemudahan penggunaan |
42: | 🎨 **Ruang Kreator** | `/dashboard/kreator/*` | Dashboard interaktif untuk manajemen pekerjaan dan portofolio |
43: 
44: > **Aturan Sistem:** Komponen dan *state* UMKM **tidak boleh bocor** atau digunakan di halaman Kreator, dan sebaliknya.
45: 
46: ---
47: 
48: ## 🎯 Mode Fitur Utama
49: 
50: Sistem pemesanan Marketiv memiliki dua *flow* yang diisolasi secara ketat:
51: 
52: ### 1. 🔥 Campaign Mode — *Viral / Performance-Based*
53: 
54: Model pemasaran *pay-per-view* yang dirancang untuk efisiensi dan jangkauan massal.
55: 
56: ```
57: UMKM upload brief & raw video ➜ Kreator klaim job ➜ Kreator edit video
58: ➜ Kreator POSTING di akun sosmed MILIKNYA ➜ Pembayaran berbasis views
59: ```
60: 
61: - **Pembayaran:** Berbasis performa aktual (*cost-per-view*)
62: - **🚫 Strict Rule:** **TIDAK ADA FITUR CHAT** — mengeliminasi drama revisi dan mempercepat proses
63: 
64: ### 2. 🤝 Rate Card Mode — *Consultative / Influencer*
65: 
66: Model kolaborasi premium dengan harga tetap (*fixed price*).
67: 
68: ```
69: UMKM browse katalog Kreator ➜ Inisiasi Chat ➜ Negosiasi
70: ➜ Deal via Escrow ➜ Kreator eksekusi konten
71: ```
72: 
73: - **Pembayaran:** Harga tetap yang disepakati melalui negosiasi
74: - **✅ Strict Rule:** Wajib menggunakan fitur **"Collab Post" (Instagram/TikTok)** agar UMKM mendapatkan *direct traffic*
75: 
76: ---
77: 
78: ## 🛠️ Tech Stack
79: 
80: Proyek ini dibangun dengan fokus pada performa web (*Core Web Vitals*), SEO, dan efisiensi *Time-to-Market* (MVP P2MW).
81: 
82: | Layer | Teknologi | Keterangan |
83: |---|---|---|
84: | **Framework** | Next.js 16 | App Router, Server Components, Server Actions |
85: | **UI Library** | React 19 | Concurrent features, Suspense |
86: | **Styling** | Tailwind CSS v4 | Sintaks `@theme` modern, design tokens via CSS custom properties |
87: | **Language** | TypeScript 5 | Strict mode, type-safe codebase |
88: | **Utilities** | `clsx` + `tailwind-merge` | Via helper `cn()` untuk conditional class merging |
89: | **Backend** | Appwrite | Authentication, Database, Storage, Functions, Realtime |
90: 
91: ---
92: 
93: ## 📂 Struktur Direktori Proyek
94: 
95: Pemisahan *domain logic* dilakukan di tingkat routing untuk mencegah kebocoran state antara UMKM dan Kreator.
96: 
97: ```
98: marketiv-web/
99: ├── public/                     # Static assets (favicon, SVGs)
100: ├── src/
101: │   ├── app/                    # 📱 Next.js App Router (Pages & Layouts)
102: │   │   ├── dashboard/          #    🔒 Protected dashboard area
103: │   │   │   ├── kreator/        #    🎨 Domain Eksklusif Mikro-Kreator
104: │   │   │   └── umkm/           #    🏪 Domain Eksklusif UMKM
105: │   │   ├── layout.tsx          #    Root Layout (Font Plus Jakarta Sans, Metadata)
106: │   │   ├── globals.css         #    Tailwind v4 @theme design tokens
107: │   │   └── page.tsx            #    Landing Page
108: │   ├── assets/
109: │   │   ├── icons/              # 🎯 Raw SVG icon files
110: │   │   └── images/             # 🖼️ Raster images (PNG, JPG, WebP)
111: │   ├── components/
112: │   │   ├── ui/                 # 🧩 Komponen dasar reusable (Button, Input, dll.)
113: │   │   ├── layouts/            # 📐 Komponen tata letak (Navbar, Footer, Sidebar)
114: │   │   └── features/           # ⚡ Komponen kompleks spesifik fitur
115: │   │       ├── dashboard/      #    Komponen dashboard (Hero, CampaignCard, Grid)
116: │   │       └── landing/        #    Komponen landing page (HeroSection)
117: │   ├── data/                   # 📦 Static content constants & mock data
118: │   ├── lib/                    # 🔧 Utility functions (cn, formatter, dll.)
119: │   └── types/                  # 📝 Shared TypeScript interfaces & types
120: ├── .agents/                    # 🤖 AI Agent Rules & System Instructions
121: │   └── rules/                  #    Strict coding standards for AI Agents
122: ├── package.json
123: ├── tsconfig.json
124: └── next.config.ts
125: ```
126: 
127: ---
128: 
129: ## 🚀 Panduan Memulai (*Getting Started*)
130: 
131: ### Prasyarat
132: 
133: Pastikan Anda telah menginstal:
134: 
135: - **[Node.js](https://nodejs.org/)** — versi 20 atau lebih baru (direkomendasikan: v22 LTS)
136: - **Package Manager** — npm, yarn, pnpm, atau bun
137: 
138: ### Instalasi
139: 
140: ```bash
141: # 1. Clone repositori
142: git clone https://github.com/VXerys/marketiv-web.git
143: 
144: # 2. Masuk ke direktori proyek
145: cd marketiv-web
146: 
147: # 3. Instal semua dependensi
148: npm install
149: ```
150: 
151: ### Menjalankan Development Server
152: 
153: ```bash
154: npm run dev
155: ```
156: 
157: Buka **[http://localhost:3000](http://localhost:3000)** di browser Anda untuk melihat hasilnya.
158: 
159: ### Script yang Tersedia
160: 
161: | Script | Perintah | Keterangan |
162: |---|---|---|
163: | `dev` | `npm run dev` | Menjalankan development server dengan hot-reload |
164: | `build` | `npm run build` | Membuat production build yang dioptimasi |
165: | `start` | `npm run start` | Menjalankan production server |
166: | `lint` | `npm run lint` | Menjalankan ESLint untuk pengecekan kode |
167: 
168: ---
169: 
170: ## 🤖 Catatan untuk AI Developer Agents
171: 
172: > [!WARNING]
173: > Repositori ini dilengkapi dengan **Strict System Instructions** untuk AI Coding Agents.
174: 
175: Jika Anda menggunakan AI Agent (Cursor, Copilot, Gemini, dll.) untuk *coding* di repositori ini, AI tersebut **wajib** membaca dan mematuhi file-file berikut sebelum melakukan perubahan kode apa pun:
176: 
177: | File | Tujuan |
178: |---|---|
179: | `.agents/rules/strict-rules.md` | Aturan ketat coding standards & naming conventions |
180: | `.agents/rules/marketiv-context.md` | Konteks bisnis & domain knowledge produk |
181: 
182: Aturan ini memastikan kepatuhan terhadap standar **Next.js Server Components**, pemisahan *Dual-Ecosystem*, dan konsistensi arsitektur Marketiv.
183: 
184: ---
185: 
186: ## 👥 Tim Pengembang (P2MW 2025 — Universitas Nusa Putra)
187: 
188: <div align="center">
189: 
190: | Nama | Peran |
191: |---|---|
192: | **Panji Angkasa Putra** | Ketua / CEO |
193: | **Miftahudin** | CMO / UI-UX Designer |
194: | **M. Sechan Alfarisi** | CTO / Cloud & Web Developer |
195: | **Rendy Elang Lesmana** | CAIO / AI & Data Engineer |
196: 
197: <br/>
198: 
199: ---
200: 
201: <sub>
202: 
203: **Marketiv** — *"Ciptakan Dampak, Mulai dari Daerah."*
204: 
205: Dibuat dengan ❤️ di Sukabumi, Jawa Barat.
206: 
207: </sub>
208: 
209: </div>

(End of file - total 209 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-context.md",
  "offset": 1,
  "limit": 240
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-context.md</path>
<type>file</type>
<content>
1: ---
2: trigger: manual
3: ---
4: 
5: # 🧠 MARKETIV: CORE PRODUCT KNOWLEDGE
6: 
7: ## 1. VISION & MISSION
8: Marketiv adalah platform marketplace hybrid yang menjembatani UMKM (terutama di kota tier-2 seperti Sukabumi) dengan Kreator Mikro. Tujuannya adalah mendemokratisasi pemasaran digital yang adil tanpa risiko "boncos" (kerugian finansial di awal) bagi UMKM, dan memberikan lapangan kerja yang adil bagi kreator.
9: 
10: ## 2. THE DUAL-ECOSYSTEM (STRICT SEPARATION)
11: Marketiv memiliki dua ruang pengguna yang terisolasi secara UI dan UX:
12: - **Ruang UMKM (`/dashboard/umkm/*`):** UI dirancang super simpel karena literasi digital UMKM daerah masih rendah. Fokus pada dashboard metrik pengeluaran dan pembuatan order.
13: - **Ruang Kreator (`/dashboard/kreator/*`):** UI lebih interaktif untuk melihat daftar pekerjaan, portofolio, dan metrik penghasilan.
14: *Aturan Sistem:* Komponen/State UMKM tidak boleh bocor atau dipakai di halaman Kreator, dan sebaliknya.
15: 
16: ## 3. CORE FEATURES (THE TWO MODES)
17: 
18: ### A. Campaign Mode (Viral / Performance-Based)
19: Ini adalah layanan pemasaran pay-per-view.
20: - **Logika Bisnis:** UMKM membuat brief (dibantu AI) & upload raw asset -> Kreator klaim job -> Kreator mengedit video -> **KREATOR POSTING DI AKUN SOSMED MEREKA SENDIRI**.
21: - **RESTRICTION MUTLAK:** Dilarang keras ada fitur Chat/Komunikasi antara UMKM and Kreator di mode ini. Ini untuk memotong birokrasi dan drama revisi.
22: - **Pembayaran:** Berdasarkan jumlah views yang dicapai (Sistem mendeteksi fraud views).
23: 
24: ### B. Rate Card Mode (Consultative / Influencer)
25: Ini adalah layanan premium berbayar tetap (fixed price).
26: - **Logika Bisnis:** UMKM melihat katalog kreator -> UMKM Inisiasi Chat -> Negosiasi Harga & Deliverables -> Deal via Escrow -> Kreator eksekusi konten.
27: - **RESTRICTION MUTLAK:** Wajib ada ruang Chat Negosiasi.
28: - **Syarat Wajib Tambahan:** Saat konten diposting, sistem mewajibkan penggunaan fitur "Collab Post" (Instagram/TikTok) agar UMKM juga mendapatkan direct traffic dari audiens Kreator.
29: 
30: ## 4. TECH STACK & ARCHITECTURE ALIGNMENT
31: - **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5.
32: - **Backend (Headless):** Appwrite (Auth, Database, Storage, Functions, Realtime) terintegrasi via Server/Client SDK.
33: - **State:** Zustand (khusus untuk client-side UI state, bukan untuk data dari database).
34: 
35: ## 5. P2MW COMPLIANCE (BUSINESS GOALS)
36: Setiap fitur yang dibangun harus membantu pencapaian Laporan P2MW 2025:
37: - **Prioritas Kecepatan:** Fokus rilis MVP secepat mungkin.
38: - **Data Ekspor:** Harus selalu menyiapkan *hook* atau titik di mana admin bisa mengekstrak data seperti *User Retention Rate*, total GMV, dan Total Views untuk dimasukkan ke laporan kemajuan.

(End of file - total 38 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-domain-rules.md",
  "offset": 1,
  "limit": 260
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/marketiv-domain-rules.md</path>
<type>file</type>
<content>
1: ---
2: trigger: always_on
3: description: Strict business domain rules for Marketiv's Dual-Ecosystem isolation, shared component placement, and Campaign/Rate Card mode restrictions
4: ---
5: 
6: # 🚨 STRICT RULES — MARKETIV DOMAIN LOGIC & ECOSYSTEM ISOLATION 🚨
7: 
8: Dokumen ini mengatur **logika bisnis dan batas-batas domain** yang **WAJIB** dipatuhi oleh AI Agent saat menulis kode di proyek Marketiv. Pelanggaran terhadap aturan ini **akan merusak arsitektur inti** produk.
9: 
10: > **Konteks:** Marketiv adalah platform *marketplace hybrid* yang menjembatani **UMKM** dengan **Mikro-Kreator**. Kedua pengguna ini beroperasi di **dua ekosistem yang terisolasi secara ketat**.
11: 
12: ---
13: 
14: ## 1. DUAL-ECOSYSTEM ISOLATION — LARANGAN KERAS CROSS-IMPORT
15: 
16: Marketiv memiliki dua ruang pengguna yang **WAJIB TERISOLASI** pada level routing, komponen, state, dan logika bisnis:
17: 
18: | Ekosistem | Route | Target User | Karakteristik UI |
19: |---|---|---|---|
20: | 🏪 **UMKM** | `src/app/dashboard/umkm/*` | Pemilik usaha mikro daerah | Super simpel, minimal interaksi, fokus efisiensi |
21: | 🎨 **Kreator** | `src/app/dashboard/kreator/*` | Mikro-Kreator konten | Lebih interaktif, dashboard portofolio & penghasilan |
22: 
23: ### 🚫 LARANGAN MUTLAK: Cross-Import Antar Ekosistem
24: 
25: ```
26: src/app/dashboard/umkm/**     ←✕→     src/app/dashboard/kreator/**
27: ```
28: 
29: - Komponen, hooks, state, atau logika bisnis di `src/app/dashboard/umkm/` **DILARANG KERAS** di-import atau digunakan oleh komponen di `src/app/dashboard/kreator/`, dan **SEBALIKNYA**.
30: - Server Actions spesifik UMKM **TIDAK BOLEH** dipanggil dari halaman Kreator, dan sebaliknya.
31: - Zustand store yang dibuat untuk UI UMKM **TIDAK BOLEH** diakses dari halaman Kreator, dan sebaliknya.
32: 
33: ### ❌ Contoh Pelanggaran
34: 
35: ```tsx
36: // src/app/dashboard/kreator/page.tsx
37: // ❌ DILARANG — mengimport komponen dari domain UMKM
38: import { UmkmOrderForm } from "@/app/dashboard/umkm/components/UmkmOrderForm";
39: import { useUmkmStore } from "@/app/dashboard/umkm/stores/umkmStore";
40: 
41: export default function CreatorDashboard() {
42:   // ❌ Menggunakan state UMKM di halaman Kreator
43:   const umkmData = useUmkmStore();
44:   return <UmkmOrderForm />;
45: }
46: ```
47: 
48: ### ✅ Yang Benar
49: 
50: Jika kedua ekosistem membutuhkan fungsionalitas serupa, buat komponen **baru** yang terpisah di masing-masing domain, atau gunakan komponen bersama dari `src/components/` (lihat Bagian 2).
51: 
52: ---
53: 
54: ## 2. SHARED COMPONENTS — ATURAN PENEMPATAN
55: 
56: Komponen yang **boleh digunakan bersama** oleh kedua ekosistem **WAJIB** diletakkan di lokasi-lokasi berikut:
57: 
58: | Lokasi | Tujuan | Contoh |
59: |---|---|---|
60: | `src/components/ui/` | Komponen dasar yang **100% presentasional** dan reusable | `Button`, `Input`, `Card`, `Badge`, `Avatar` |
61: | `src/components/layouts/` | Komponen tata letak struktural | `Navbar`, `Footer`, `Sidebar` |
62: | `src/components/features/<nama>/` | Komponen fitur spesifik yang bisa di-share | `CampaignCard`, `CreatorProfileCard` |
63: | `src/lib/` | Utility functions & helpers | `cn()`, `formatCurrency()`, `formatDate()` |
64: | `src/types/` | Interface & type definitions | `Campaign`, `Creator`, `User` |
65: | `src/data/` | Konstanta konten & mock data | `NAVBAR_CONTENT`, `CARD_CONTENT` |
66: 
67: ### 🚫 Yang DILARANG
68: 
69: - **JANGAN** membuat komponen bersama langsung di dalam `src/app/dashboard/umkm/` atau `src/app/dashboard/kreator/` lalu mengimportnya dari domain lain.
70: - **JANGAN** membuat file utility di dalam route-specific folder (`src/app/dashboard/umkm/utils/`) jika utility tersebut juga dibutuhkan di sisi Kreator — pindahkan ke `src/lib/`.
71: - **JANGAN** meletakkan shared types di dalam salah satu domain — selalu taruh di `src/types/`.
72: 
73: ### ✅ Contoh Alur yang Benar
74: 
75: ```tsx
76: // src/components/ui/StatusBadge.tsx — SHARED, bisa dipakai di mana saja
77: interface StatusBadgeProps {
78:   status: "active" | "pending" | "completed";
79: }
80: 
81: export function StatusBadge({ status }: StatusBadgeProps) {
82:   // ✅ Komponen presentasional murni, aman di-share
83:   return <span className={/* ... */}>{status}</span>;
84: }
85: ```
86: 
87: ```tsx
88: // src/app/dashboard/umkm/page.tsx — ✅ Import dari shared location
89: import { StatusBadge } from "@/components/ui/StatusBadge";
90: ```
91: 
92: ```tsx
93: // src/app/dashboard/kreator/page.tsx — ✅ Import dari shared location yang SAMA
94: import { StatusBadge } from "@/components/ui/StatusBadge";
95: ```
96: 
97: ---
98: 
99: ## 3. CAMPAIGN MODE — ATURAN LOGIKA BISNIS
100: 
101: Campaign Mode adalah model pemasaran **pay-per-view** di mana Kreator mem-posting konten di akun sosial media **MEREKA SENDIRI**.
102: 
103: ### Flow Bisnis Campaign Mode
104: 
105: ```
106: UMKM buat brief & upload raw video
107:   → Kreator klaim job
108:     → Kreator edit video
109:       → KREATOR POSTING DI AKUN SOSMED KREATOR (bukan UMKM!)
110:         → Sistem hitung views → Pembayaran berbasis performa
111: ```
112: 
113: ### 🚫 RESTRICTION MUTLAK — Campaign Mode
114: 
115: | # | Larangan | Alasan |
116: |---|---|---|
117: | 1 | **DILARANG** membuat tombol "Download Video" untuk UMKM | Video **WAJIB** di-posting oleh Kreator di akun sosmed Kreator. UMKM **TIDAK** mem-posting sendiri |
118: | 2 | **DILARANG** membuat fitur Chat/Komunikasi | Mengeliminasi drama revisi dan mempercepat proses. Komunikasi **HANYA** via brief yang sudah ditentukan |
119: | 3 | **DILARANG** membuat fitur "Kirim Video ke UMKM" | Konten tidak pernah dikirim ke UMKM — Kreator langsung posting di platform sosmed-nya |
120: | 4 | **DILARANG** membuat fitur revisi/approval UMKM | Tidak ada loop revisi — Kreator klaim, edit, posting. Titik |
121: 
122: ### ❌ Contoh Fitur yang DILARANG Dibuat
123: 
124: ```tsx
125: // ❌ DILARANG — Tombol download video untuk UMKM di Campaign Mode
126: <Button onClick={downloadVideo}>Download Video Kreator</Button>
127: 
128: // ❌ DILARANG — Chat antara UMKM dan Kreator di Campaign Mode
129: <ChatRoom campaignId={id} umkmId={umkmId} creatorId={creatorId} />
130: 
131: // ❌ DILARANG — Approval/review loop
132: <Button onClick={requestRevision}>Minta Revisi</Button>
133: <Button onClick={approveContent}>Setujui Konten</Button>
134: ```
135: 
136: ### ✅ Yang BOLEH Dibuat di Campaign Mode
137: 
138: ```tsx
139: // ✅ UMKM: Form pembuatan brief + upload raw asset
140: <CampaignBriefForm onSubmit={createCampaign} />
141: 
142: // ✅ UMKM: Dashboard metrik performa campaign (views, cost)
143: <CampaignMetrics campaignId={id} />
144: 
145: // ✅ Kreator: Daftar campaign yang bisa diklaim
146: <AvailableCampaignList />
147: 
148: // ✅ Kreator: Tombol klaim job
149: <Button onClick={claimCampaign}>Klaim Campaign</Button>
150: 
151: // ✅ Kreator: Interface untuk upload bukti posting (link sosmed)
152: <SubmitPostingProof campaignId={id} />
153: ```
154: 
155: ---
156: 
157: ## 4. RATE CARD MODE — ATURAN LOGIKA BISNIS
158: 
159: Rate Card Mode adalah model kolaborasi premium **harga tetap** (*fixed price*) dengan komunikasi langsung.
160: 
161: ### Flow Bisnis Rate Card Mode
162: 
163: ```
164: UMKM browse katalog Kreator
165:   → UMKM inisiasi Chat
166:     → Negosiasi harga & deliverables
167:       → Deal via sistem Escrow
168:         → Kreator eksekusi konten
169:           → WAJIB gunakan "Collab Post" (IG/TikTok)
170: ```
171: 
172: ### ✅ REQUIREMENT WAJIB — Rate Card Mode
173: 
174: | # | Keharusan | Alasan |
175: |---|---|---|
176: | 1 | **WAJIB** ada fitur Chat Negosiasi | Komunikasi diperlukan untuk negosiasi harga dan deliverables |
177: | 2 | **WAJIB** ada sistem Escrow | Melindungi kedua belah pihak dari penipuan |
178: | 3 | **WAJIB** enforce "Collab Post" | UMKM harus mendapat *direct traffic* dari audiens Kreator |
179: 
180: ---
181: 
182: ## 5. DECISION TABLE — REFERENSI CEPAT
183: 
184: | Pertanyaan | Jawaban |
185: |---|---|
186: | Bolehkah import komponen UMKM dari halaman Kreator? | 🚫 **TIDAK — DILARANG KERAS** |
187: | Bolehkah import komponen Kreator dari halaman UMKM? | 🚫 **TIDAK — DILARANG KERAS** |
188: | Di mana meletakkan komponen yang dipakai bersama? | ✅ `src/components/ui/` atau `src/components/layouts/` |
189: | Bolehkah buat tombol Download Video di Campaign Mode? | 🚫 **TIDAK — Kreator yang posting** |
190: | Bolehkah buat fitur Chat di Campaign Mode? | 🚫 **TIDAK — Tidak ada komunikasi** |
191: | Bolehkah buat fitur Chat di Rate Card Mode? | ✅ **YA — WAJIB ada Chat Negosiasi** |
192: | Di mana meletakkan shared types? | ✅ `src/types/` |
193: | Di mana meletakkan shared utilities? | ✅ `src/lib/` |

(End of file - total 193 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/payment-midtrans.md",
  "offset": 1,
  "limit": 220
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/.agents/rules/payment-midtrans.md</path>
<type>file</type>
<content>
1: ---
2: trigger: always_on
3: description: Strict security boundaries, webhook handler protection, and status mutations rules for Midtrans payment gateway integration.
4: ---
5: 
6: # 💳 STRICT RULES — MIDTRANS PAYMENT INTEGRATION
7: 
8: Dokumen ini mengatur **standar integrasi payment gateway Midtrans** di Marketiv. Aturan ini **MUTLAK** untuk melindungi platform dari manipulasi status pembayaran.
9: 
10: ---
11: 
12: ## 1. TRANSACTION FLOW & SECURITY BOUNDARY
13: 
14: Semua inisiasi pembayaran (token Snap) dan validasi status harus diproses di lingkungan server yang aman:
15: 
16: ```
17: [UMKM (Browser)] --(Click Bayar)--> [Next.js Server Action / Appwrite Function]
18:                                                      │
19:                                             (Request token Snap)
20:                                                      │
21:                                                      ▼
22: [UMKM Snap Modal] <---(Return Token Snap)--- [Midtrans API]
23: ```
24: 
25: - **Client SDK Restriction:** Browser **TIDAK BOLEH** meminta token transaksi langsung ke Midtrans API menggunakan server key. Server key Midtrans bersifat **sangat rahasia** dan dilarang keras dibundel ke client-side JavaScript.
26: - **Client Status Restriction:** Status pembayaran di database **TIDAK BOLEH** diubah langsung oleh browser setelah modal Snap ditutup. Pembaruan status transaksi hanya valid jika dikerjakan oleh trusted webhook.
27: 
28: ---
29: 
30: ## 2. WEBHOOK HANDLING & IDEMPOTENCY
31: 
32: Tiap notifikasi status pembayaran dari Midtrans dikirimkan melalui HTTP POST webhook ke server (Appwrite Function).
33: 
34: ### Verifikasi Signature Key (Wajib):
35: Webhook handler **wajib** melakukan validasi signature key sebelum memproses payload dari Midtrans guna mencegah fraud request:
36: ```typescript
37: // Signature formula dari Midtrans:
38: // SHA512(order_id + status_code + gross_amount + ServerKey)
39: ```
40: Jika signature hash tidak cocok dengan value header/payload, request **wajib ditolak** dengan HTTP `401 Unauthorized` atau `400 Bad Request`.
41: 
42: ### Idempotency:
43: Webhook handler harus aman dari pemrosesan ganda (double-processing):
44: - Periksa status transaksi di database sebelum melakukan mutasi saldo kreator atau perilisan escrow.
45: - Jika transaksi sudah berstatus `paid` / `settlement`, abaikan webhook request berikutnya dengan return HTTP `200 OK`.
46: 
47: ---
48: 
49: ## 3. USER INTERFACE FEEDBACK (FRONTEND)
50: 
51: Saat UMKM menyelesaikan pembayaran di modal Snap:
52: 
53: - **Pending State:** Jika status adalah pending (misal: bank transfer belum dibayar), arahkan user ke detail order dengan petunjuk cara bayar dan visual `StatusBadge` kuning (`warning`).
54: - **Success State:** Jika pembayaran sukses terkonfirmasi oleh SDK event callback, tampilkan visual sukses sementara di client-side, namun sertakan banner informatif:
55:   > "Pembayaran sedang diverifikasi sistem. Halaman akan ter-refresh otomatis dalam beberapa saat."
56: - **Polling / Realtime:** Halaman detail pembayaran memanfaatkan subscription Appwrite Realtime atau interval polling ringan untuk mendeteksi perubahan status transaksi di database (yang di-update oleh webhook Midtrans) agar UI ter-refresh otomatis menjadi `Paid` (`success`).

(End of file - total 56 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/05-dashboard-umkm-guidelines.md",
  "offset": 1,
  "limit": 260
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/05-dashboard-umkm-guidelines.md</path>
<type>file</type>
<content>
1: # 05 — Dashboard UMKM Guidelines
2: 
3: > Dokumen ini mendefinisikan UI/UX dashboard untuk role UMKM.
4: 
5: ## 1. Tujuan Dashboard UMKM
6: 
7: Dashboard UMKM membantu pemilik usaha membuat campaign, mengelola budget, melihat performa, dan memantau escrow.
8: Dashboard harus terasa aman, jelas, dan tidak teknis.
9: Target user UMKM memiliki literasi digital menengah, sehingga instruksi harus sangat eksplisit.
10: Setiap halaman harus menjawab pertanyaan: apa status saya sekarang dan apa langkah berikutnya?
11: 
12: ## 2. Personality Dashboard UMKM
13: 
14: - Calm.
15: - Guided.
16: - Trust-first.
17: - Business-oriented.
18: - Low jargon.
19: - Actionable.
20: 
21: ## 3. Struktur Navigasi UMKM
22: 
23: ```txt
24: /dashboard/umkm
25: ├── Ringkasan
26: ├── Campaign
27: ├── Buat Campaign
28: ├── Kreator
29: ├── Negosiasi
30: └── Keuangan
31: ```
32: 
33: Menu Campaign dan Buat Campaign boleh digabung secara visual tetapi route tetap jelas.
34: Menu Negosiasi hanya untuk Rate Card Mode.
35: Campaign Mode tidak boleh memiliki fitur chat.
36: 
37: ## 4. Dashboard Home UMKM
38: 
39: Home dashboard harus summary-first.
40: Elemen utama adalah campaign aktif, total budget escrow, estimasi views, dan submission menunggu validasi.
41: CTA utama adalah `Buat Campaign Baru`.
42: CTA sekunder boleh berupa `Cari Kreator` untuk Rate Card Mode.
43: 
44: ### Metric Cards
45: 
46: ```txt
47: Campaign Aktif
48: Budget di Escrow
49: Submission Menunggu
50: Estimasi Total Views
51: ```
52: 
53: Metric harus memakai format angka lokal Indonesia.
54: Nominal uang harus memakai format Rupiah.
55: Views harus memakai format singkat jika besar, misalnya 12.400 views.
56: 
57: ## 5. Campaign List UMKM
58: 
59: Campaign list menampilkan semua campaign milik UMKM.
60: Gunakan tabs status: Semua, Draft, Aktif, Penuh, Selesai, Dibatalkan.
61: Desktop boleh table.
62: Mobile wajib card list.
63: 
64: ### Data Campaign List
65: 
66: - Judul campaign.
67: - Niche.
68: - Status.
69: - Budget escrow.
70: - Kuota kreator.
71: - Submission masuk.
72: - Tanggal dibuat.
73: - Aksi lihat detail.
74: 
75: ## 6. Campaign Detail UMKM
76: 
77: Campaign detail harus memperlihatkan status campaign secara jelas.
78: Bagian atas menampilkan status, budget, kuota, dan progress.
79: Bagian tengah menampilkan brief dan aset.
80: Bagian bawah menampilkan submission kreator.
81: Jangan menampilkan chat di halaman ini.
82: 
83: ## 7. Campaign Builder Wizard
84: 
85: Campaign builder harus multi-step.
86: Jangan menggunakan form panjang satu halaman.
87: Wizard memberi rasa aman karena user tahu prosesnya bertahap.
88: 
89: ### Step 1 — Informasi Produk
90: 
91: Fields wajib: nama produk atau judul campaign, deskripsi brief, niche.
92: Tombol AI Brief Assistant boleh muncul di textarea brief.
93: Helper text harus menjelaskan bahwa brief akan dibaca kreator.
94: Minimum karakter harus dijelaskan sebelum error terjadi.
95: 
96: ### Step 2 — Aset Mentah
97: 
98: UMKM dapat upload foto/logo maksimal 100MB atau memasukkan URL Google Drive/Dropbox.
99: Untuk video mentah, arahkan user menggunakan URL eksternal.
100: Warning orange soft harus selalu tampil di step ini.
101: Error upload harus spesifik dan actionable.
102: 
103: ### Step 3 — Budget dan Kuota
104: 
105: Input harga per 1.000 views harus memakai format Rupiah.
106: Tampilkan rekomendasi range Rp 2.000 sampai Rp 10.000.
107: Input kuota kreator harus jelas.
108: Total budget escrow harus memiliki helper text.
109: Ringkasan biaya wajib memperlihatkan komisi platform 15%.
110: 
111: ### Step 4 — Review dan Pembayaran
112: 
113: Tampilkan seluruh data penting sebelum user membayar.
114: CTA utama: `Bayar Sekarang via Escrow`.
115: Jelaskan bahwa dana ditahan oleh sistem sampai pekerjaan tervalidasi.
116: Jangan memakai istilah teknis payment gateway tanpa penjelasan.
117: 
118: ## 8. Keuangan UMKM
119: 
120: Halaman keuangan harus trust-first.
121: Tampilkan total deposit, dana escrow aktif, refund, dan transaksi terakhir.
122: Setiap transaksi harus punya status yang jelas.
123: Jika pembayaran gagal, tampilkan tombol ulangi pembayaran.
124: 
125: ## 9. Direktori Kreator untuk UMKM
126: 
127: Direktori kreator digunakan untuk Rate Card Mode.
128: Gunakan grid card dengan filter niche, harga, dan sort.
129: CTA pada card adalah `Lihat Profil`.
130: Jangan langsung membuat order tanpa user melihat detail paket.
131: 
132: ## 10. Profil Kreator dari Sisi UMKM
133: 
134: Profil kreator harus menampilkan bio, niche, portofolio, dan rate card maksimal 3 paket.
135: CTA utama: `Hubungi Kreator` atau `Mulai Negosiasi`.
136: CTA ini hanya berlaku untuk Rate Card Mode.
137: Jika user sedang di Campaign Mode, jangan arahkan ke chat.
138: 
139: ## 11. Negosiasi Rate Card UMKM
140: 
141: Negosiasi memakai live chat hanya pada Rate Card Mode.
142: UMKM dapat mengirim Custom Offer.
143: Custom Offer harus berbentuk bubble khusus, bukan pesan teks biasa.
144: Warning Collab Post wajib tampil di atas chat.
145: 
146: ## 12. Copywriting UMKM
147: 
148: Gunakan kata kerja jelas: Buat, Bayar, Lihat, Kirim, Batalkan.
149: Hindari jargon seperti GMV, conversion, creative asset jika tidak dijelaskan.
150: Gunakan istilah `Dana ditahan sementara` untuk menjelaskan escrow.
151: Gunakan istilah `Bukti Tayang` untuk URL hasil posting kreator.
152: 
153: ## 13. Empty States UMKM
154: 
155: Belum ada campaign: arahkan buat campaign pertama.
156: Belum ada transaksi: jelaskan transaksi akan muncul setelah pembayaran.
157: Belum ada negosiasi: arahkan cari kreator.
158: Belum ada submission: jelaskan kreator belum mengirim bukti tayang.
159: 
160: ## 14. Risk and Trust Messaging
161: 
162: Marketiv harus menonjolkan sistem escrow.
163: Jelaskan dana tidak langsung masuk ke kreator.
164: Jelaskan kreator dibayar setelah bukti tervalidasi.
165: Jelaskan refund jika campaign dibatalkan sesuai aturan.
166: Jangan membuat pesan yang menjanjikan hasil viral pasti.
167: 
168: ## 15. Implementation Priority UMKM
169: 
170: Prioritas pertama: dashboard home, campaign builder, campaign list, campaign detail, keuangan.
171: Prioritas kedua: direktori kreator, profil kreator, negosiasi Rate Card.
172: Prioritas ketiga: report lanjutan dan analytics visual.

(End of file - total 172 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md",
  "offset": 1,
  "limit": 180
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md</path>
<type>file</type>
<content>
1: # 11 — Payment, Escrow, and Financial Safety
2: 
3: > Marketiv Technical Guidelines — Appwrite-ready engineering standard.
4: 
5: ## 1. Purpose
6: 
7: - Define technical safety rules for payment, escrow, wallet, withdrawal, refund, and financial records.
8: - Prevent direct money movement outside trusted workflows.
9: - Ensure all financial operations are auditable and reversible when business rules allow.
10: 
11: ## 2. Scope
12: 
13: - Applies to Marketiv MVP and all dashboard-first implementation work.
14: - Applies to frontend, backend, Appwrite, payment, AI, QA, deployment, and AI-assisted coding.
15: - Must be read together with `docs/features/`, `docs/database/`, and `docs/ui-ux/`.
16: - When this document conflicts with generated code, this document wins.
17: - When this document conflicts with product feature details, escalate and update the docs before coding.
18: 
19: ## 3. Payment Boundary
20: 
21: - Midtrans handles payment processing.
22: - Marketiv must not store card numbers, CVV, or raw payment credentials.
23: - Frontend may initiate payment flow but cannot confirm payment success.
24: - Payment success must come from verified provider webhook or trusted provider status check.
25: - Payment token creation must happen server-side.
26: - Provider secrets must remain server-side.
27: - Payment status shown in UI must come from backend source of truth.
28: 
29: ## 4. Escrow Rules
30: 
31: - UMKM payment enters escrow state before creator payout.
32: - Funds are not released to creator until validation conditions are met.
33: - Campaign payout depends on valid submission and views/rules.
34: - Rate Card payout depends on accepted/completed order and valid collab post requirement.
35: - Dispute freezes payout release.
36: - Cancelled or expired payment must not activate campaign/order.
37: - Refund must be recorded as transaction and audit log.
38: 
39: ## 5. Ledger and Transaction Rules
40: 
41: - Every money movement must create a transaction record.
42: - Transaction records must reference campaign, order, withdrawal, or refund where applicable.
43: - Transaction status must use documented lifecycle.
44: - Wallet balance should be derived or updated only by trusted financial events.
45: - Manual adjustment requires admin reason and audit log.
46: - Provider order ID must be stored for reconciliation.
47: - Do not delete financial records; use reversal/refund/adjustment records.
48: 
49: ## 6. Webhook Rules
50: 
51: - Verify signature before processing.
52: - Validate payload schema.
53: - Map provider status to Marketiv transaction status explicitly.
54: - Make processing idempotent.
55: - Store received provider event metadata as safe log if needed.
56: - Reject unknown or malformed webhook events.
57: - Do not expose webhook endpoint behavior to users beyond safe status updates.
58: 
59: ## 7. Withdrawal Rules
60: 
61: - Only Kreator with available balance can request withdrawal.
62: - Withdrawal amount cannot exceed available balance.
63: - Withdrawal should create withdrawal record and transaction record.
64: - Pending withdrawal amount should not remain fully available for another withdrawal.
65: - Admin or trusted provider workflow processes withdrawal.
66: - Failed withdrawal must restore or keep balance consistent according to ledger design.
67: - Bank account details must be protected and not publicly exposed.
68: 
69: ## 8. Frontend Finance Rules
70: 
71: - Frontend can display wallet, transactions, payment instructions, and status.
72: - Frontend can request payment creation or withdrawal creation through backend.
73: - Frontend cannot edit transaction records.
74: - Frontend cannot mark a campaign/order as paid.
75: - Frontend cannot release escrow.
76: - Frontend cannot update wallet balance.
77: - Frontend must show pending states clearly.
78: 
79: ## 9. Admin Finance Rules
80: 
81: - Admin can inspect transactions according to role permission.
82: - Admin actions on money require reason.
83: - Admin override must create audit log.
84: - Admin refund/payout decisions must validate current dispute and transaction state.
85: - Admin UI must show irreversible action warnings.
86: - Admin must not bypass transaction ledger.
87: 
88: ## 10. Hard Rules
89: 
90: - Campaign Mode is ZERO CHAT: no chat button, no message route, no WhatsApp/email link, no contact shortcut.
91: - Frontend must not mutate wallet balance, payment status, escrow status, quota counters, validation status, or transaction records.
92: - Sensitive mutations must go through trusted backend execution: Appwrite Functions, secure Route Handlers, or server-side service layer.
93: - Appwrite API keys, payment provider secrets, AI provider keys, and webhook secrets must never be exposed to browser code.
94: - All user-facing UI copy must use clear Bahasa Indonesia and avoid technical jargon for UMKM-facing flows.
95: - Every page must implement loading, empty, error, unauthorized, and success states before being considered complete.
96: - All financial and admin-sensitive operations must create audit logs with actor, target entity, action, result, and timestamp.
97: - Database documents must use documented collection names, field names, enum values, and status lifecycles only.
98: - Large raw video files must be stored outside Marketiv using public Google Drive/Dropbox URLs; proof of work uses TikTok/Instagram URLs.
99: - Mobile-first behavior must be tested from 375px viewport before desktop refinements.
100: 
101: ## 11. AI Coding Assistant Notes
102: 
103: - Load this file before generating code in the related area.
104: - Do not invent missing architecture, collection names, permissions, or enum values.
105: - Prefer minimal, scoped changes over broad rewrites unless migration is explicitly requested.
106: - Before suggesting a new package, justify why existing Next.js, React, Tailwind, or Appwrite capabilities are insufficient.
107: - Always mention affected files and expected behavior when producing implementation prompts.
108: - Do not move business rules into presentational components.
109: - Do not remove security checks to make implementation simpler.
110: - When unsure about a sensitive operation, route it through trusted backend execution.
111: 
112: ## 12. Review Checklist
113: 
114: - [ ] Does the change respect role-based access control?
115: - [ ] Does it avoid direct frontend mutation of sensitive fields?
116: - [ ] Does it validate input on the server-side path?
117: - [ ] Does it use existing design tokens and layout standards?
118: - [ ] Does it include loading, empty, error, unauthorized, and success states?
119: - [ ] Does it avoid adding chat to Campaign Mode?
120: - [ ] Does it preserve auditability for financial/admin actions?
121: - [ ] Does it remain mobile-first and accessible?
122: - [ ] Does it keep Appwrite permissions and backend functions aligned?
123: - [ ] Does it avoid hardcoded secrets, IDs, and environment-specific values?

(End of file - total 123 lines)
</content>
```

---

## Assistant (Build · GPT-5.5 · 10.8s)

_Thinking:_

**Gathering documentation needs**

I need more information about the documentation data schema, including details on the database. It seems I'm looking for global documentation. I'm curious about the best way to find that without missing any critical details, so I’ll need to explore what’s available. Maybe I should consider what specific aspects of the schema I need to understand best—like structure, relationships, or specific data types. Let’s get that figured out!

Inti produk UMKM sudah jelas: ada dua jalur yang berbeda total, `Campaign Mode` tanpa chat dan `Rate Card Mode` dengan chat/escrow. Saya lanjut cek kontrak data/mock yang ada supaya flow-nya tidak hanya konseptual, tapi nyambung ke data yang masuk/keluar di aplikasi.

**Tool: glob**

**Input:**
```json
{
  "pattern": "docs/**/*.md",
  "path": "/home/panjiangka1/Documents/dev/marketiv-web"
}
```

**Output:**
```
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/08-accessibility-and-content-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/10-realtime-events-and-background-jobs.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/README.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/01-engineering-principles.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/17-ai-coding-assistant-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/05-security-and-permissions.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/07-ui-ux-implementation-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/15-deployment-environment-and-secrets.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/13-testing-quality-assurance.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/README.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/06-performance-and-scalability.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/02-project-architecture.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/09-data-validation-and-error-handling.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/14-observability-logging-and-audit.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/16-code-style-and-review-checklist.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/03-nextjs-frontend-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/04-appwrite-backend-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/technical-guidelines/12-ai-integration-standards.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/02-design-tokens.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/05-dashboard-umkm-guidelines.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/03-layout-system.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/01-visual-direction.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/08-ai-ui-generation-rules.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/06-dashboard-kreator-guidelines.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/04-components-guidelines.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/ui-ux/07-landing-page-guidelines.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/implementation_docs/03-component-inventory.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/implementation_docs/01-slicing-roadmap.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/implementation_docs/04-design-token-migration.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/implementation_docs/02-route-map.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/implementation_docs/05-ai-vscode-working-guide.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/04-umkm-dashboard.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/09-rate-card-discovery-and-profile.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/13-ai-features-and-automation.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/10-rate-card-order-chat-and-custom-offer.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/11-finance-escrow-wallet-and-withdrawal.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/16-settings-and-account-management.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/02-auth-onboarding-and-rbac.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/README.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/17-feature-permissions-matrix.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/01-product-scope-and-feature-map.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/08-campaign-submission-and-validation.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/07-campaign-mode-creator.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/05-creator-dashboard.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/06-campaign-mode-umkm.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/15-dispute-resolution-and-trust-safety.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/18-status-lifecycle-reference.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/14-admin-operations-and-reporting.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/19-frontend-backend-contract.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/03-profile-and-verification.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/features/12-notifications-and-activity-log.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/03-relationships-and-access-patterns.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/06-business-rules-and-validations.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/02-collections-schema.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/README.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/08-frontend-data-contract.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/05-indexing-and-query-strategy.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/07-realtime-and-events.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/01-appwrite-overview.md
/home/panjiangka1/Documents/dev/marketiv-web/docs/marketiv-md/database/04-permissions-and-roles.md
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkm-dashboard.types.ts",
  "offset": 1,
  "limit": 260
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkm-dashboard.types.ts</path>
<type>file</type>
<content>
1: export interface ServiceResult<T> {
2:   success: boolean;
3:   data: T | null;
4:   error?: string;
5: }
6: 
7: export type CampaignStatus =
8:   | "draft"
9:   | "active"
10:   | "full"
11:   | "completed"
12:   | "cancelled";
13: 
14: export type SubmissionStatus =
15:   | "pending"
16:   | "valid"
17:   | "fraud"
18:   | "dispute";
19: 
20: export type TransactionStatus =
21:   | "pending"
22:   | "escrow"
23:   | "success"
24:   | "failed"
25:   | "refunded";
26: 
27: export type TransactionType =
28:   | "deposit"
29:   | "withdrawal"
30:   | "fee"
31:   | "refund"
32:   | "payout"
33:   | "escrow"
34:   | "pencairan"
35:   | "adjustment";
36: 
37: export type CreatorNiche =
38:   | "kuliner"
39:   | "fesyen"
40:   | "pariwisata"
41:   | "edukasi"
42:   | "kecantikan"
43:   | "lainnya";
44: 
45: export interface UmkmProfile {
46:   id: string;
47:   businessName: string;
48:   ownerName: string;
49:   email: string;
50:   whatsappNumber: string;
51:   location: string;
52:   avatarUrl: string;
53:   isVerified: boolean;
54: }
55: 
56: export interface Campaign {
57:   id: string;
58:   umkmId: string;
59:   title: string;
60:   brief: string;
61:   externalAssetUrl: string;
62:   thumbnailUrl: string;
63:   niche: CreatorNiche;
64:   status: CampaignStatus;
65:   creatorQuota: number;
66:   usedQuota: number;
67:   pricePerThousandViews: number;
68:   totalBudgetEscrow: number;
69:   usedBudget: number;
70:   totalViews: number;
71:   createdAt: string;
72:   updatedAt: string;
73: }
74: 
75: export interface CampaignSubmission {
76:   id: string;
77:   campaignId: string;
78:   creatorId: string;
79:   creatorName: string;
80:   creatorAvatarUrl: string;
81:   platform: "tiktok" | "instagram";
82:   contentUrl: string;
83:   actualViews: number;
84:   targetViews: number;
85:   releasedFund: number;
86:   validationStatus: SubmissionStatus;
87:   submittedAt: string;
88:   validatedAt?: string;
89: }
90: 
91: export interface CreatorProfile {
92:   id: string;
93:   name: string;
94:   username: string;
95:   avatarUrl: string;
96:   niche: CreatorNiche;
97:   bio: string;
98:   location: string;
99:   startingPrice: number;
100:   rating: number;
101:   completedJobs: number;
102:   engagementRate: number;
103:   instagramUrl?: string;
104:   tiktokUrl?: string;
105:   isVerified: boolean;
106: }
107: 
108: export interface RateCardPackage {
109:   id: string;
110:   creatorId: string;
111:   name: string;
112:   description: string;
113:   price: number;
114:   deliverable: string;
115:   estimatedDays: number;
116:   isActive: boolean;
117: }
118: 
119: export interface NegotiationOrder {
120:   id: string;
121:   umkmId: string;
122:   creatorId: string;
123:   creatorName: string;
124:   creatorAvatarUrl: string;
125:   projectTitle: string;
126:   scope: string;
127:   finalPrice: number;
128:   deadline: string;
129:   status:
130:     | "negotiation"
131:     | "waiting_payment"
132:     | "escrow"
133:     | "revision"
134:     | "waiting_verification"
135:     | "completed"
136:     | "cancelled"
137:     | "dispute";
138:   lastMessage: string;
139:   lastMessageAt: string;
140:   unreadCount: number;
141: }
142: 
143: export interface ChatMessage {
144:   id: string;
145:   orderId: string;
146:   senderId: string;
147:   senderRole: "umkm" | "creator" | "system";
148:   type: "text" | "custom_offer" | "system";
149:   content: string;
150:   offerData?: {
151:     finalPrice: number;
152:     scope: string;
153:     deadline: string;
154:     revisionCount: number;
155:   };
156:   isRead: boolean;
157:   createdAt: string;
158: }
159: 
160: export interface Transaction {
161:   id: string;
162:   userId: string;
163:   referenceId: string;
164:   referenceType: "campaign" | "rate_card";
165:   amount: number;
166:   type: TransactionType;
167:   status: TransactionStatus;
168:   description: string;
169:   midtransOrderId?: string;
170:   createdAt: string;
171: }
172: 
173: export interface UmkmDashboardSummary {
174:   activeCampaigns: number;
175:   completedCampaigns: number;
176:   totalViews: number;
177:   totalSpent: number;
178:   escrowBalance: number;
179:   pendingSubmissions: number;
180:   activeNegotiations: number;
181:   pendingPayments: number;
182: }

(End of file - total 182 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkmDashboard.ts",
  "offset": 1,
  "limit": 260
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/src/types/umkmDashboard.ts</path>
<type>file</type>
<content>
1: export interface CampaignSummary {
2:   title: string;
3:   status: "Aktif" | "Draft" | "Penuh" | "Selesai" | "Dibatalkan";
4:   description: string;
5:   totalViews: number;
6:   viewsTrend: string;
7:   budgetUsed: number;
8:   budgetTotal: number;
9:   activeCreatorsCount: number;
10:   targetCreatorsCount: number;
11:   progressPercent: number;
12:   imageUrl: string;
13: }
14: 
15: export interface EscrowBalance {
16:   totalAmount: number;
17:   infoText: string;
18: }
19: 
20: export interface SubmissionPending {
21:   id: string;
22:   creatorName: string;
23:   campaignTitle: string;
24:   platform: "tiktok" | "instagram";
25:   status: "Pending" | "Valid" | "Invalid";
26:   timeAgo: string;
27: }
28: 
29: export interface ChartBarData {
30:   day: string;
31:   value: string;
32:   percent: number;
33:   active: boolean;
34: }
35: 
36: export interface UmkmDashboardData {
37:   businessName: string;
38:   greeting: string;
39:   subtitle: string;
40:   campaign: CampaignSummary;
41:   escrow: EscrowBalance;
42:   submissions: SubmissionPending[];
43:   chartData: ChartBarData[];
44: }

(End of file - total 44 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/src/data/umkmDashboard.ts",
  "offset": 1,
  "limit": 260
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/src/data/umkmDashboard.ts</path>
<type>file</type>
<content>
1: import { UmkmDashboardData } from "@/types/umkmDashboard";
2: 
3: export const UMKM_DASHBOARD_MOCK_DATA: UmkmDashboardData = {
4:   businessName: "Dapur Sehat Sukabumi",
5:   greeting: "Selamat pagi, Dapur Sehat",
6:   subtitle: "Berikut ringkasan performa campaign Anda hari ini.",
7:   campaign: {
8:     title: "Sambal Matah Dapur Sehat",
9:     status: "Aktif",
10:     description: "Campaign prioritas bulan ini",
11:     totalViews: 184200,
12:     viewsTrend: "+12% mg lalu",
13:     budgetUsed: 1500000, // Rp 1.5 Jt
14:     budgetTotal: 3300000, // Rp 3.3 Jt
15:     activeCreatorsCount: 8,
16:     targetCreatorsCount: 12,
17:     progressPercent: 45,
18:     imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?q=80&w=200&auto=format&fit=crop" // fallback free high quality image or similar
19:   },
20:   escrow: {
21:     totalAmount: 3250000, // Rp 3.250.000
22:     infoText: "Dana sedang ditahan aman. Akan dilepas setelah bukti tayang diverifikasi."
23:   },
24:   submissions: [
25:     {
26:       id: "sub-1",
27:       creatorName: "Nadia Foodie",
28:       campaignTitle: "Sambal Matah Dapur Sehat",
29:       platform: "tiktok",
30:       status: "Pending",
31:       timeAgo: "2 jam lalu"
32:     },
33:     {
34:       id: "sub-2",
35:       creatorName: "Chef Budi",
36:       campaignTitle: "Paket Nasi Sehat",
37:       platform: "instagram",
38:       status: "Pending",
39:       timeAgo: "5 jam lalu"
40:     }
41:   ],
42:   chartData: [
43:     { day: "Sen", value: "12k", percent: 30, active: false },
44:     { day: "Sel", value: "15k", percent: 40, active: false },
45:     { day: "Rab", value: "22k", percent: 60, active: false },
46:     { day: "Kam", value: "45k", percent: 90, active: false },
47:     { day: "Jum", value: "38k", percent: 75, active: false },
48:     { day: "Sab", value: "52k", percent: 100, active: true },
49:     { day: "Min", value: "28k", percent: 55, active: false }
50:   ]
51: };

(End of file - total 51 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/index.ts",
  "offset": 1,
  "limit": 180
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/src/mocks/umkm/index.ts</path>
<type>file</type>
<content>
1: export * from "./profile.mock";
2: export * from "./campaigns.mock";
3: export * from "./submissions.mock";
4: export * from "./creators.mock";
5: export * from "./rate-cards.mock";
6: export * from "./negotiations.mock";
7: export * from "./messages.mock";
8: export * from "./transactions.mock";
9: export * from "./dashboard-summary.mock";

(End of file - total 9 lines)
</content>
```

---

## Assistant (Build · GPT-5.5 · 7.2s)

---

## User

maksud saya yang ada di dalam folder ini ~/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources jangan ke intinya, karena itu masih belum terimplementasi dengan backendnya, saat ini yang ingin saya rancang adalah backend nya terutama ingin memnvalidasi flow dari umkm nya dengan detail

---

## Assistant (Build · GPT-5.5 · 6.8s)

_Thinking:_

**Focusing on documentation**

I need to respond to the user, and since we already searched broadly, I should focus on the current folder. It’s time to inspect the documents there. Maybe I’ll use a to-do task for documentation analysis as it seems like a multi-step process. I'll make sure to keep everything organized to help find what I need efficiently. This way, I can provide a clear and structured response!

Saya akan batasi scope ke `00_BACKEND/docs/draft/sources` saja, lalu baca dokumen backend/draft yang relevan untuk memvalidasi flow UMKM dari sisi data dan backend.

**Tool: glob**

**Input:**
```json
{
  "pattern": "**/*",
  "path": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources"
}
```

**Output:**
```
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/03_Screen_Inventory.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/05_Appwrite_Collections.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/01_MVP.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/07_Architecture.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/06_API_Contract.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/04_ERD.md
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/02_User_Flow.md
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "(?i)umkm|campaign|rate card|escrow|payment|midtrans|order|submission|brief|kreator|creator|wallet|transaction|chat|negosiasi",
  "path": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources",
  "include": "*.md"
}
```

**Output:**
```
Found 100 matches (more matches available)
/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/03_Screen_Inventory.md:
  Line 8: * Menentukan role access (Guest, UMKM, Creator, Admin)

  Line 49: /login (beserta ?role=umkm atau ?role=creator)

  Line 50: /register (beserta ?role=umkm atau ?role=creator)

  Line 54: /creator

  Line 55: Creator Discovery

  Line 57: /creator/:username

  Line 58: Creator Profile

  Line 60: /campaign

  Line 61: Campaign Marketplace

  Line 63: /campaign/:id

  Line 64: Campaign Detail

  Line 69: # UMKM AREA

  Line 78: /dashboard/wallet

  Line 85: ## RATE CARD

  Line 88: /dashboard/creators

  Line 90: /dashboard/creators/:id

  Line 96: /dashboard/orders

  Line 98: /dashboard/orders/:id

  Line 103: ## CAMPAIGN VIRAL

  Line 106: /dashboard/campaigns

  Line 108: /dashboard/campaigns/create

  Line 110: /dashboard/campaigns/:id

  Line 112: /dashboard/campaigns/:id/edit

  Line 114: /dashboard/campaigns/:id/submissions

  Line 119: ## WALLET

  Line 122: /dashboard/wallet

  Line 124: /dashboard/wallet/topup

  Line 126: /dashboard/wallet/history

  Line 131: # CREATOR AREA

  Line 134: /creator-dashboard

  Line 136: /creator-dashboard/onboarding

  Line 138: /creator-dashboard/profile

  Line 140: /creator-dashboard/verification

  Line 142: /creator-dashboard/wallet

  Line 144: /creator-dashboard/notifications

  Line 149: ## RATE CARD

  Line 152: /creator-dashboard/rate-cards

  Line 154: /creator-dashboard/rate-cards/create

  Line 156: /creator-dashboard/rate-cards/:id/edit

  Line 158: /creator-dashboard/offers

  Line 160: /creator-dashboard/orders

  Line 162: /creator-dashboard/orders/:id

  Line 167: ## CAMPAIGN VIRAL

  Line 170: /creator-dashboard/campaigns

  Line 172: /creator-dashboard/campaigns/:id

  Line 174: /creator-dashboard/submissions

  Line 176: /creator-dashboard/submissions/:id

  Line 188: /administrator/campaigns

  Line 190: /administrator/orders

  Line 218: ## Rate Card

  Line 231: Cancel Order Modal

  Line 236: ## Campaign Viral

  Line 239: Create Campaign Modal

  Line 241: AI Brief Modal

  Line 243: Claim Campaign Modal

  Line 252: ## Wallet

  Line 269: Report Campaign Modal

  Line 283: Wallet Drawer

  Line 285: Chat Drawer (Rate Card)

  Line 289: Creator Detail Drawer

  Line 299: CreatorCard

  Line 302: CampaignCard

  Line 304: OrderCard

  Line 306: SubmissionCard

  Line 316: OrderTable

  Line 318: SubmissionTable

  Line 332: AiBriefGenerator

  Line 345: UMKM Pages            : 14

  Line 346: Creator Pages         : 13


/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/06_API_Contract.md:
  Line 46: Campaign Service

  Line 47: Submission Service

  Line 51: Rate Card Service

  Line 52: Chat Service

  Line 54: Order Service

  Line 55: Wallet Service

  Line 64: ## Register UMKM

  Line 67: registerUMKM()

  Line 87: Create UMKM Profile

  Line 89: Create Wallet

  Line 94: ## Register Creator

  Line 97: registerCreator()

  Line 115: Create Creator Profile

  Line 117: Create Wallet

  Line 126: loginWithGoogle() // Khusus Creator

  Line 143:   "wallet": {}

  Line 154: Create Wallet

  Line 193: # 3. Campaign Service

  Line 199: ## Create Campaign

  Line 202: createCampaign()

  Line 220: Create Campaign

  Line 227: ## Generate AI Brief

  Line 230: generateBrief()

  Line 237:   "campaignId": "",

  Line 248: campaign_briefs

  Line 253: ## Publish Campaign

  Line 256: publishCampaign()

  Line 267: ## Explore Campaigns

  Line 270: getCampaigns()

  Line 285: ## Detail Campaign

  Line 288: getCampaignById()


(Results truncated. Consider using a more specific path or pattern.)
```

---

## Assistant (Build · GPT-5.5 · 27.9s)

---

## User

lanjut

---

## Assistant (Build · DeepSeek V4 Flash · 122.2s)

---

## User

lanjut

---

## Assistant (Build · Claude Sonnet 4.6 · 19.2s)

_Thinking:_



Baca semua 7 file sekaligus untuk dapat gambaran lengkap.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/01_MVP.md"
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/01_MVP.md</path>
<type>file</type>
<content>
1: 
2: # Marketiv MVP Documentation
3: 
4: ## 1. Gambaran Produk
5: 
6: Marketiv adalah platform yang mempertemukan UMKM dengan Content Creator untuk menjalankan kampanye promosi berbasis rate card.
7: 
8: Fokus MVP:
9: 
10: * UMKM membuat campaign
11: * Creator membuat rate card
12: * UMKM mengirim offer
13: * Creator menerima / menolak offer
14: * Escrow payment
15: * Submission konten
16: * Approval
17: * Pencairan dana
18: * AI Brief Generator
19: * AI Fraud Detection
20: 
21: Tidak ada marketplace terbuka seperti Fiverr.
22: 
23: Model bisnis lebih dekat ke:
24: 
25: UMKM → Cari Creator → Kirim Offer → Creator Kerja → Escrow → Selesai
26: 
27: ---
28: 
29: # 2. Role System
30: 
31: ## UMKM
32: 
33: Pengguna yang ingin mempromosikan produk/jasa.
34: 
35: Hak akses:
36: 
37: * Membuat campaign
38: * Mencari creator
39: * Melihat rate card creator
40: * Mengirim offer
41: * Membayar campaign
42: * Approve hasil pekerjaan
43: 
44: ---
45: 
46: ## Content Creator
47: 
48: Pengguna yang menawarkan jasa promosi.
49: 
50: Hak akses:
51: 
52: * Membuat profil creator
53: * Membuat rate card
54: * Menerima offer
55: * Mengirim submission
56: * Mencairkan saldo
57: 
58: ---
59: 
60: # 3. User Flow Global
61: 
62: ## Flow UMKM
63: 
64: Register
65: ↓
66: Lengkapi Profil
67: ↓
68: Buat Campaign
69: ↓
70: AI Generate Brief (Opsional)
71: ↓
72: Publish Campaign
73: ↓
74: Cari Creator
75: ↓
76: Lihat Rate Card
77: ↓
78: Kirim Offer
79: ↓
80: Creator Accept
81: ↓
82: Bayar Escrow
83: ↓
84: Creator Kerjakan Campaign
85: ↓
86: Review Submission
87: ↓
88: Approve
89: ↓
90: Dana Cair
91: ↓
92: Campaign Selesai
93: 
94: ---
95: 
96: ## Flow Creator
97: 
98: Register
99: ↓
100: Lengkapi Profil
101: ↓
102: Buat Rate Card
103: ↓
104: Menerima Offer
105: ↓
106: Accept Offer
107: ↓
108: Menunggu Escrow
109: ↓
110: Kerjakan Campaign
111: ↓
112: Upload Submission
113: ↓
114: Menunggu Approval
115: ↓
116: Dana Masuk Wallet
117: ↓
118: Withdraw
119: 
120: ---
121: 
122: # 4. Authentication Module
123: 
124: ## Halaman
125: 
126: ### Login
127: 
128: Data:
129: 
130: * Email
131: * Password
132: * Role Query (?role=umkm atau ?role=creator)
133: 
134: Action:
135: 
136: * Login Manual (UMKM / Creator)
137: * Google Login (Khusus Content Creator)
138: 
139: ---
140: 
141: ### Register UMKM
142: 
143: Endpoint: `/register?role=umkm`
144: 
145: Data:
146: 
147: * Nama usaha
148: * Kategori usaha
149: * Email
150: * Nomor HP
151: * Password
152: 
153: ---
154: 
155: ### Register Creator
156: 
157: Endpoint: `/register?role=creator`
158: 
159: Data:
160: 
161: * Nama lengkap
162: * Email
163: * Password
164: 
165: Atau bisa langsung menggunakan **Google OAuth Register/Login**.
166: 
167: ---
168: 
169: ### Verifikasi Email
170: 
171: Flow baru setelah register:
172: 
173: * Halaman pemberitahuan "Check Inbox"
174: * Terdapat notifikasi bahwa batas link verifikasi hanya berlaku 10 menit
175: * Terdapat teks/tombol "Kirim ulang link"
176: 
177: Data:
178: 
179: * Token
180: 
181: Action:
182: 
183: * Verify
184: * Resend Link
185: 
186: ---
187: 
188: ### Forgot Password
189: 
190: Data:
191: 
192: * Email
193: 
194: Action:
195: 
196: * Kirim Link Reset
197: 
198: ---
199: 
200: # 5. UMKM Module
201: 
202: ## Dashboard UMKM
203: 
204: Menampilkan:
205: 
206: * Total campaign
207: * Campaign aktif
208: * Campaign selesai
209: * Saldo wallet
210: * Offer aktif
211: 
212: ---
213: 
214: # 6. Profil UMKM
215: 
216: ## Halaman Profil
217: 
218: Data:
219: 
220: * Nama usaha
221: * Nama pemilik
222: * Logo
223: * Deskripsi
224: * Kategori usaha
225: * Kota
226: * Website
227: * Instagram
228: * TikTok
229: * WhatsApp
230: 
231: Status:
232: 
233: * Draft
234: * Complete
235: 
236: ---
237: 
238: # 7. Campaign Module
239: 
240: ## Daftar Campaign
241: 
242: Data:
243: 
244: * Judul
245: * Status
246: * Budget
247: * Creator terlibat
248: * Progress
249: 
250: Status:
251: 
252: * Draft
253: * Published
254: * Running
255: * Completed
256: * Cancelled
257: 
258: ---
259: 
260: ## Create Campaign
261: 
262: Data:
263: 
264: ### Informasi Dasar
265: 
266: * Nama Campaign
267: * Tujuan Campaign
268: * Produk/Jasa
269: * Kategori
270: 
271: ### Deliverable
272: 
273: * Instagram Feed
274: * Instagram Story
275: * Reels
276: * TikTok
277: * YouTube
278: * Artikel
279: 
280: ### Requirement
281: 
282: * Minimum follower
283: * Minimum engagement
284: * Lokasi creator
285: 
286: ### Budget
287: 
288: * Total budget
289: 
290: ---
291: 
292: # 8. AI Brief Generator
293: 
294: ## Halaman Generate Brief
295: 
296: Input:
297: 
298: * Nama produk
299: * Deskripsi produk
300: * Target market
301: * Tujuan campaign
302: 
303: Output:
304: 
305: * Campaign objective
306: * Content angle
307: * CTA
308: * Brief detail
309: * Do & Don't
310: 
311: UMKM dapat:
312: 
313: * Edit hasil AI
314: * Simpan sebagai brief campaign
315: 
316: ---
317: 
318: # 9. Creator Discovery
319: 
320: ## Cari Creator
321: 
322: Filter:
323: 
324: * Platform
325: * Kategori
326: * Lokasi
327: * Followers
328: * Engagement Rate
329: 
330: ---
331: 
332: ## Detail Creator
333: 
334: Menampilkan:
335: 
336: ### Profil
337: 
338: * Nama
339: * Foto
340: * Bio
341: 
342: ### Statistik
343: 
344: * Followers
345: * Engagement
346: * Campaign selesai
347: 
348: ### Rate Card
349: 
350: * Daftar layanan
351: 
352: ---
353: 
354: # 10. Creator Profile Module
355: 
356: ## Profil Creator
357: 
358: Data:
359: 
360: * Nama
361: * Username
362: * Foto
363: * Bio
364: * Lokasi
365: 
366: ---
367: 
368: ## Social Media
369: 
370: Data:
371: 
372: * Instagram
373: * TikTok
374: * YouTube
375: 
376: ---
377: 
378: ## Statistik
379: 
380: Data:
381: 
382: * Followers
383: * Average Views
384: * Engagement Rate
385: 
386: ---
387: 
388: # 11. Rate Card Module
389: 
390: ## Daftar Rate Card
391: 
392: Contoh:
393: 
394: * Instagram Story
395: * Instagram Feed
396: * Instagram Reels
397: * TikTok Video
398: * YouTube Short
399: 
400: ---
401: 
402: ## Create Rate Card
403: 
404: Data:
405: 
406: * Nama layanan
407: * Platform
408: * Deskripsi
409: * Harga
410: * Estimasi pengerjaan
411: * Revisi
412: * Status
413: 
414: Status:
415: 
416: * Active
417: * Inactive
418: 
419: ---
420: 
421: # 12. Offer Module
422: 
423: Ini adalah inti MVP.
424: 
425: ## Flow
426: 
427: UMKM
428: ↓
429: Pilih Creator
430: ↓
431: Pilih Rate Card
432: ↓
433: Kirim Offer
434: ↓
435: Creator Accept / Reject
436: 
437: ---
438: 
439: ## Create Offer
440: 
441: Data:
442: 
443: * Campaign
444: * Creator
445: * Rate Card
446: * Harga
447: * Pesan
448: 
449: Status:
450: 
451: * Pending
452: * Accepted
453: * Rejected
454: * Expired
455: 
456: ---
457: 
458: ## Detail Offer
459: 
460: Menampilkan:
461: 
462: * Campaign
463: * Creator
464: * Harga
465: * Status
466: * Timeline
467: 
468: ---
469: 
470: # 13. Order Module
471: 
472: Order tercipta ketika creator menerima offer.
473: 
474: Flow:
475: 
476: Offer Accepted
477: ↓
478: Create Order
479: 
480: ---
481: 
482: Data Order
483: 
484: * Order Number
485: * Campaign
486: * UMKM
487: * Creator
488: * Harga
489: * Deadline
490: 
491: Status:
492: 
493: * Waiting Payment
494: * Paid
495: * In Progress
496: * Submitted
497: * Revision
498: * Approved
499: * Completed
500: 
501: ---
502: 
503: # 14. Escrow Payment
504: 
505: Flow:
506: 
507: Order
508: ↓
509: UMKM Bayar
510: ↓
511: Dana Ditahan Escrow
512: ↓
513: Creator Submit
514: ↓
515: UMKM Approve
516: ↓
517: Dana Cair
518: 
519: ---
520: 
521: ## Payment Page
522: 
523: Data:
524: 
525: * Invoice Number
526: * Amount
527: * Payment Method
528: 
529: Status:
530: 
531: * Pending
532: * Paid
533: * Failed
534: 
535: ---
536: 
537: # 15. Submission Module
538: 
539: ## Create Submission
540: 
541: Data:
542: 
543: * URL Konten
544: * Catatan Creator
545: 
546: ---
547: 
548: ## AI Fraud Detection
549: 
550: Dijalankan saat submission dibuat.
551: 
552: Validasi:
553: 
554: * URL valid
555: * Konten tersedia
556: * Tidak private
557: * Tidak duplicate
558: * Sesuai platform
559: 
560: Output:
561: 
562: * Fraud Score
563: * Risk Level
564: 
565: Level:
566: 
567: * Safe
568: * Medium
569: * High
570: 
571: ---
572: 
573: # 16. Approval Module
574: 
575: ## Review Submission
576: 
577: UMKM dapat:
578: 
579: * Approve
580: * Request Revision
581: 
582: ---
583: 
584: ## Revision
585: 
586: Data:
587: 
588: * Catatan revisi
589: 
590: Status:
591: 
592: * Revision Requested
593: 
594: ---
595: 
596: ## Approve
597: 
598: Status:
599: 
600: * Approved
601: 
602: Trigger:
603: 
604: Escrow Release
605: 
606: ---
607: 
608: # 17. Wallet Module
609: 
610: ## Wallet Creator
611: 
612: Data:
613: 
614: * Available Balance
615: * Pending Balance
616: * Total Earned
617: 
618: ---
619: 
620: ## Riwayat Wallet
621: 
622: Data:
623: 
624: * Tanggal
625: * Tipe
626: * Nominal
627: * Status
628: 
629: ---
630: 
631: # 18. Withdraw Module
632: 
633: ## Request Withdraw
634: 
635: Data:
636: 
637: * Nominal
638: * Bank
639: * Nomor Rekening
640: 
641: Status:
642: 
643: * Pending
644: * Processed
645: * Rejected
646: 
647: ---
648: 
649: # 19. Notification Module
650: 
651: Trigger:
652: 
653: * Register
654: * Offer masuk
655: * Offer diterima
656: * Pembayaran berhasil
657: * Submission masuk
658: * Revision request
659: * Approval
660: * Withdraw
661: 
662: Channel:
663: 
664: * In App
665: * Email
666: 
667: ---
668: 
669: # 20. Dashboard Creator
670: 
671: Menampilkan:
672: 
673: * Total earning
674: * Pending earning
675: * Active order
676: * Completed order
677: * Offer masuk
678: 
679: ---
680: 
681: # 21. Dashboard UMKM
682: 
683: Menampilkan:
684: 
685: * Total campaign
686: * Campaign berjalan
687: * Creator aktif
688: * Pending approval
689: * Total spending
690: 
691: ---
692: 
693: # 22. MVP Navigation Structure
694: 
695: ## Public
696: 
697: * Home
698: * Explore Creator
699: * Login
700: * Register
701: 
702: ---
703: 
704: ## UMKM
705: 
706: * Dashboard
707: * Campaign
708: * Create Campaign
709: * Creator Discovery
710: * Offers
711: * Orders
712: * Payments
713: * Wallet
714: * Notifications
715: * Settings
716: 
717: ---
718: 
719: ## Creator
720: 
721: * Dashboard
722: * Profile
723: * Rate Cards
724: * Offers
725: * Orders
726: * Submissions
727: * Wallet
728: * Withdraw
729: * Notifications
730: * Settings
731: 
732: ---
733: 
734: # 23. MVP Scope Final
735: 
736: Included MVP:
737: 
738: ✅ Authentication
739: 
740: ✅ UMKM Profile
741: 
742: ✅ Creator Profile
743: 
744: ✅ Rate Card
745: 
746: ✅ Campaign
747: 
748: ✅ AI Brief
749: 
750: ✅ Offer System
751: 
752: ✅ Order System
753: 
754: ✅ Escrow
755: 
756: ✅ Submission
757: 
758: ✅ AI Fraud Detection
759: 
760: ✅ Approval Workflow
761: 
762: ✅ Wallet
763: 
764: ✅ Withdraw
765: 
766: ✅ Notification
767: 
768: ---
769: 
770: Excluded From MVP
771: 
772: ❌ Chat Real-time
773: 
774: ❌ Affiliate System
775: 
776: ❌ Referral
777: 
778: ❌ Creator Agency
779: 
780: ❌ Team Management
781: 
782: ❌ Subscription
783: 
784: ❌ AI Matching
785: 
786: ❌ Marketplace Bidding
787: 
788: ❌ Public Campaign Board
789: 
790: ❌ Analytics Advanced
791: 
792: ❌ Mobile App

(End of file - total 792 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/02_User_Flow.md"
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/02_User_Flow.md</path>
<type>file</type>
<content>
1: ---
2: 
3: # 1. AUTHENTICATION FLOW
4: 
5: ---
6: 
7: # UMKM REGISTRATION
8: 
9: ```text
10: Landing Page
11: ↓
12: Klik Daftar UMKM (/register?role=umkm)
13: ↓
14: Isi:
15: - Nama Usaha
16: - Kategori Usaha
17: - Email
18: - Nomor HP
19: - Password
20: 
21: ↓
22: Submit
23: ↓
24: Verifikasi Email (Link Valid 10 Menit)
25: ├─ Halaman Check Inbox
26: └─ Opsi Kirim Ulang Link
27: ↓
28: Account Created
29: ↓
30: Login
31: ```
32: 
33: ---
34: 
35: # CREATOR REGISTRATION
36: 
37: ```text
38: Landing Page
39: ↓
40: Klik Daftar Creator (/register?role=creator)
41: ↓
42: Isi:
43: - Nama Lengkap
44: - Email
45: - Password
46: (Atau Daftar Menggunakan Google OAuth)
47: 
48: ↓
49: Submit
50: ↓
51: Verifikasi Email (Link Valid 10 Menit)
52: ├─ Halaman Check Inbox
53: └─ Opsi Kirim Ulang Link
54: ↓
55: Account Created
56: ↓
57: Login
58: ```
59: 
60: ---
61: 
62: # LOGIN FLOW
63: 
64: ```text
65: Login (/login?role=umkm atau ?role=creator)
66: ↓
67: UMKM: Email + Password
68: Creator: Email + Password ATAU Google Login
69: ↓
70: Success
71: ↓
72: Dashboard
73: ```
74: 
75: ---
76: 
77: # FORGOT PASSWORD
78: 
79: ```text
80: Klik Lupa Password
81: ↓
82: Input Email
83: ↓
84: Kirim Link Reset
85: ↓
86: Open Email
87: ↓
88: Reset Password
89: ↓
90: Login
91: ```
92: 
93: ---
94: 
95: # 2. ONBOARDING FLOW
96: 
97: ---
98: 
99: # UMKM ONBOARDING
100: 
101: ```text
102: First Login
103: ↓
104: Wizard Onboarding
105: ```
106: 
107: Step 1
108: 
109: ```text
110: Nama UMKM (Pre-filled dari Register)
111: Kategori (Pre-filled dari Register)
112: Deskripsi
113: ```
114: 
115: ↓
116: 
117: Step 2
118: 
119: ```text
120: Logo
121: Foto Produk
122: ```
123: 
124: ↓
125: 
126: Step 3
127: 
128: ```text
129: Tujuan Marketing
130: 
131: - Branding
132: - Penjualan
133: - Awareness
134: ```
135: 
136: ↓
137: 
138: Finish
139: 
140: ↓
141: 
142: Dashboard
143: 
144: ---
145: 
146: # CREATOR ONBOARDING
147: 
148: Step 1
149: 
150: ```text
151: Nama
152: Foto Profil
153: Bio
154: ```
155: 
156: ↓
157: 
158: Step 2
159: 
160: ```text
161: Tambah Sosial Media
162: ```
163: 
164: ↓
165: 
166: Step 3
167: 
168: ```text
169: Verifikasi Akun Sosial
170: ```
171: 
172: ↓
173: 
174: Step 4
175: 
176: ```text
177: Pilih Niche
178: 
179: - Kuliner
180: - Fashion
181: - Beauty
182: - Gaming
183: - Edukasi
184: ```
185: 
186: ↓
187: 
188: Finish
189: 
190: ↓
191: 
192: Dashboard
193: 
194: ---
195: 
196: # 3. CREATOR VERIFICATION FLOW
197: 
198: ```text
199: Dashboard Creator
200: ↓
201: Menu Verification
202: ```
203: 
204: Input
205: 
206: ```text
207: Platform
208: Username
209: ```
210: 
211: ↓
212: 
213: System Generate Code
214: 
215: ```text
216: MARKETIV-XXXX
217: ```
218: 
219: ↓
220: 
221: Creator:
222: 
223: ```text
224: Pasang di Bio
225: atau
226: Posting Story
227: ```
228: 
229: ↓
230: 
231: Verify
232: 
233: ↓
234: 
235: System Check
236: 
237: ↓
238: 
239: Verified
240: 
241: ---
242: 
243: # 4. RATE CARD FLOW
244: 
245: ---
246: 
247: # CREATOR CREATE RATE CARD
248: 
249: ```text
250: Dashboard
251: ↓
252: Rate Card
253: ↓
254: Tambah Rate Card
255: ```
256: 
257: Input
258: 
259: ```text
260: Judul
261: Platform
262: Harga
263: Deskripsi
264: Revisi
265: Durasi
266: ```
267: 
268: ↓
269: 
270: Publish
271: 
272: ↓
273: 
274: Active
275: 
276: ---
277: 
278: # UMKM DISCOVER CREATOR
279: 
280: ```text
281: Dashboard
282: ↓
283: Creator Discovery
284: ↓
285: Browse Creator
286: ↓
287: Search
288: ↓
289: Filter
290: ↓
291: Open Profile
292: ↓
293: View Rate Card
294: ↓
295: Kirim Offer
296: ```
297: 
298: ---
299: 
300: # CREATE OFFER
301: 
302: ```text
303: Input:
304: 
305: Judul Campaign
306: Brief
307: Deadline
308: Rate Card
309: Catatan
310: ```
311: 
312: ↓
313: 
314: Submit
315: 
316: ↓
317: 
318: Pending
319: 
320: ---
321: 
322: # CREATOR REVIEW OFFER
323: 
324: ```text
325: Notification
326: ↓
327: Offer Detail
328: ```
329: 
330: Pilihan
331: 
332: ```text
333: Accept
334: Reject
335: ```
336: 
337: ---
338: 
339: # ORDER CREATED
340: 
341: Jika Accept
342: 
343: ```text
344: Offer Accepted
345: ↓
346: Create Order
347: ↓
348: Waiting Payment
349: ```
350: 
351: ---
352: 
353: # PAYMENT FLOW
354: 
355: ```text
356: Open Order
357: ↓
358: Bayar
359: ↓
360: Gateway Success
361: ↓
362: Escrow Locked
363: ↓
364: Order Active
365: ```
366: 
367: ---
368: 
369: # PRODUCTION FLOW
370: 
371: ```text
372: Creator Produksi
373: ↓
374: Upload Draft
375: ↓
376: Waiting Review
377: ```
378: 
379: ---
380: 
381: # REVISION FLOW
382: 
383: ```text
384: UMKM Review
385: ```
386: 
387: Pilihan
388: 
389: ```text
390: Approve
391: 
392: atau
393: 
394: Request Revision
395: ```
396: 
397: Jika Revisi
398: 
399: ```text
400: Revision Requested
401: ↓
402: Creator Reupload
403: ↓
404: Waiting Review
405: ```
406: 
407: ---
408: 
409: # PUBLISH FLOW
410: 
411: ```text
412: Draft Approved
413: ↓
414: Creator Posting
415: ↓
416: Submit URL
417: ↓
418: System Verify URL
419: ↓
420: Waiting Final Approval
421: ```
422: 
423: ---
424: 
425: # COMPLETION FLOW
426: 
427: ```text
428: Approve Final
429: ↓
430: Release Escrow
431: ↓
432: Wallet Creator +
433: ↓
434: Completed
435: ```
436: 
437: ---
438: 
439: # ORDER CANCELLATION FLOW
440: 
441: Sebelum pembayaran
442: 
443: ```text
444: Cancel
445: ↓
446: Order Closed
447: ```
448: 
449: Setelah pembayaran
450: 
451: ```text
452: Request Cancellation
453: ↓
454: Admin Review
455: ↓
456: Refund / Reject
457: ```
458: 
459: ---
460: 
461: # 5. CAMPAIGN VIRAL FLOW
462: 
463: ---
464: 
465: # CREATE CAMPAIGN
466: 
467: ```text
468: Dashboard
469: ↓
470: Campaign Viral
471: ↓
472: Create Campaign
473: ```
474: 
475: ---
476: 
477: # STEP 1 BASIC INFO
478: 
479: ```text
480: Nama Campaign
481: Kategori
482: Thumbnail
483: ```
484: 
485: ↓
486: 
487: Next
488: 
489: ---
490: 
491: # STEP 2 UPLOAD ASSET
492: 
493: ```text
494: Video Mentah
495: Logo
496: Foto Produk
497: ```
498: 
499: ↓
500: 
501: Upload
502: 
503: ↓
504: 
505: Next
506: 
507: ---
508: 
509: # STEP 3 AI BRIEF
510: 
511: ```text
512: Deskripsi Produk
513: Target Market
514: Goal Campaign
515: ```
516: 
517: ↓
518: 
519: Generate AI Brief
520: 
521: ↓
522: 
523: Output
524: 
525: ```text
526: Hook
527: CTA
528: Hashtag
529: Guideline
530: ```
531: 
532: ↓
533: 
534: Edit
535: 
536: ↓
537: 
538: Next
539: 
540: ---
541: 
542: # STEP 4 REWARD
543: 
544: ```text
545: Budget
546: CPM
547: Min Views
548: Max Views
549: Creator Limit
550: ```
551: 
552: ↓
553: 
554: Publish
555: 
556: ---
557: 
558: # CAMPAIGN STATUS
559: 
560: ```text
561: Draft
562: ↓
563: Published
564: ↓
565: Running
566: ↓
567: Paused
568: ↓
569: Completed
570: ```
571: 
572: ---
573: 
574: # CAMPAIGN PAUSE
575: 
576: ```text
577: Open Campaign
578: ↓
579: Pause
580: ↓
581: No New Claim
582: ↓
583: Tracking Tetap Berjalan
584: ```
585: 
586: ---
587: 
588: # CAMPAIGN RESUME
589: 
590: ```text
591: Resume
592: ↓
593: Published
594: ↓
595: Claim Dibuka Lagi
596: ```
597: 
598: ---
599: 
600: # CAMPAIGN STOP
601: 
602: ```text
603: Stop Campaign
604: ↓
605: No New Claim
606: ↓
607: Tracking Selesai
608: ↓
609: Completed
610: ```
611: 
612: ---
613: 
614: # CREATOR DISCOVER CAMPAIGN
615: 
616: ```text
617: Marketplace
618: ↓
619: Browse Campaign
620: ↓
621: Search
622: ↓
623: Filter
624: ↓
625: Open Detail
626: ```
627: 
628: ---
629: 
630: # CLAIM CAMPAIGN
631: 
632: ```text
633: Read Brief
634: ↓
635: Checklist Rules
636: ↓
637: Claim
638: ↓
639: Claimed
640: ```
641: 
642: ---
643: 
644: # PRODUCE CONTENT
645: 
646: ```text
647: Download Asset
648: ↓
649: Edit Video
650: ↓
651: Posting
652: ```
653: 
654: ---
655: 
656: # SUBMIT RESULT
657: 
658: ```text
659: My Campaign
660: ↓
661: Submit Result
662: ```
663: 
664: Input
665: 
666: ```text
667: Platform
668: Username
669: URL
670: Caption
671: ```
672: 
673: ↓
674: 
675: Submit
676: 
677: ---
678: 
679: # AI VALIDATION FLOW
680: 
681: ```text
682: Submission Created
683: ↓
684: AI Validation
685: ```
686: 
687: Check:
688: 
689: ```text
690: URL Valid
691: Duplicate
692: Logo
693: Asset Similarity
694: Fraud Signal
695: ```
696: 
697: ↓
698: 
699: Result
700: 
701: ```text
702: Approved
703: Warning
704: Rejected
705: ```
706: 
707: ---
708: 
709: # MANUAL REVIEW FLOW
710: 
711: Jika Warning
712: 
713: ```text
714: Fraud Queue
715: ↓
716: Admin Review
717: ```
718: 
719: ↓
720: 
721: Keputusan
722: 
723: ```text
724: Approve
725: Reject
726: Ban Creator
727: ```
728: 
729: ---
730: 
731: # TRACKING FLOW
732: 
733: Jika Approved
734: 
735: ```text
736: Tracking Start
737: ↓
738: Views Update
739: ↓
740: Reward Update
741: ↓
742: Pending Balance
743: ```
744: 
745: ---
746: 
747: # PAYOUT FLOW
748: 
749: ```text
750: Tracking End
751: ↓
752: Reward Final
753: ↓
754: Wallet Pending
755: ↓
756: Wallet Available
757: ```
758: 
759: ---
760: 
761: # 6. WALLET FLOW
762: 
763: ---
764: 
765: # WALLET CREATOR
766: 
767: ```text
768: Dashboard
769: ↓
770: Wallet
771: ```
772: 
773: Data
774: 
775: ```text
776: Available
777: Pending
778: Withdrawn
779: ```
780: 
781: ---
782: 
783: # WITHDRAW REQUEST
784: 
785: ```text
786: Wallet
787: ↓
788: Withdraw
789: ```
790: 
791: Input
792: 
793: ```text
794: Bank
795: Account Name
796: Account Number
797: Amount
798: ```
799: 
800: ↓
801: 
802: Submit
803: 
804: ↓
805: 
806: Pending
807: 
808: ↓
809: 
810: Paid
811: 
812: ---
813: 
814: # WITHDRAW REJECTED
815: 
816: ```text
817: Admin Reject
818: ↓
819: Reason
820: ↓
821: Balance Returned
822: ```
823: 
824: ---
825: 
826: # WALLET UMKM
827: 
828: ```text
829: Dashboard
830: ↓
831: Wallet
832: ```
833: 
834: Data
835: 
836: ```text
837: Available Balance
838: Locked Balance
839: ```
840: 
841: ---
842: 
843: # TOP UP
844: 
845: ```text
846: Top Up
847: ↓
848: Select Amount
849: ↓
850: Payment Gateway
851: ↓
852: Success
853: ↓
854: Balance Added
855: ```
856: 
857: ---
858: 
859: # REFUND
860: 
861: ```text
862: Refund Approved
863: ↓
864: Balance Returned
865: ↓
866: Wallet UMKM +
867: ```
868: 
869: ---
870: 
871: # 7. NOTIFICATION FLOW
872: 
873: Trigger:
874: 
875: ```text
876: Offer Received
877: Offer Accepted
878: Offer Rejected
879: 
880: Order Created
881: Payment Success
882: 
883: Draft Uploaded
884: Revision Requested
885: 
886: Campaign Claimed
887: Submission Approved
888: Submission Rejected
889: 
890: Withdraw Approved
891: Withdraw Rejected
892: 
893: Dispute Opened
894: Dispute Resolved
895: ```
896: 
897: ↓
898: 
899: Notification Center
900: 
901: ↓
902: 
903: Read
904: 
905: ↓
906: 
907: Archived
908: 
909: ---
910: 
911: # 8. DISPUTE FLOW
912: 
913: RATE CARD
914: 
915: ```text
916: Order Active
917: ↓
918: Open Dispute
919: ```
920: 
921: Alasan
922: 
923: ```text
924: Konten Tidak Sesuai
925: Tidak Posting
926: Spam
927: ```
928: 
929: ↓
930: 
931: Admin Review
932: 
933: ↓
934: 
935: Keputusan
936: 
937: ```text
938: Creator Win
939: UMKM Win
940: Partial Refund
941: ```
942: 
943: ---
944: 
945: # CAMPAIGN VIRAL DISPUTE
946: 
947: ```text
948: Submission Rejected
949: ↓
950: Creator Appeal
951: ↓
952: Admin Review
953: ↓
954: Final Decision
955: ```
956: 
957: ---
958: 
959: # 9. REPORT FLOW
960: 
961: ---
962: 
963: # REPORT CREATOR
964: 
965: ```text
966: Open Creator
967: ↓
968: Report
969: ```
970: 
971: Alasan
972: 
973: ```text
974: Spam
975: Fake Account
976: Fraud
977: Abuse
978: ```
979: 
980: ↓
981: 
982: Admin Queue
983: 
984: ---
985: 
986: # REPORT CAMPAIGN
987: 
988: ```text
989: Open Campaign
990: ↓
991: Report
992: ```
993: 
994: ↓
995: 
996: Admin Review
997: 
998: ---
999: 
1000: # 10. ADMIN MODERATION FLOW
1001: 
1002: ---
1003: 
1004: # USER MANAGEMENT
1005: 
1006: ```text
1007: View Users
1008: ↓
1009: Suspend
1010: ↓
1011: Ban
1012: ↓
1013: Restore
1014: ```
1015: 
1016: ---
1017: 
1018: # CAMPAIGN MANAGEMENT
1019: 
1020: ```text
1021: Review Campaign
1022: ↓
1023: Approve
1024: ↓
1025: Reject
1026: ↓
1027: Pause
1028: ```
1029: 
1030: ---
1031: 
1032: # FRAUD REVIEW
1033: 
1034: ```text
1035: AI Flagged
1036: ↓
1037: Fraud Queue
1038: ↓
1039: Review
1040: ↓
1041: Approve
1042: Reject
1043: Ban
1044: ```
1045: 
1046: ---
1047: 
1048: # PAYMENT REVIEW
1049: 
1050: ```text
1051: Withdraw Queue
1052: ↓
1053: Approve
1054: ↓
1055: Transfer
1056: ↓
1057: Paid
1058: ```
1059: 
1060: ---
1061: 
1062: # REFUND REVIEW
1063: 
1064: ```text
1065: Refund Request
1066: ↓
1067: Review
1068: ↓
1069: Approve
1070: Reject
1071: ```
1072: 
1073: ---
1074: 
1075: # 11. AI FLOWS (USP MARKETIV)
1076: 
1077: ---
1078: 
1079: # AI LANDING PAGE ASSISTANT
1080: 
1081: ```text
1082: Visitor
1083: ↓
1084: Ask Question
1085: ↓
1086: AI Assistant
1087: ↓
1088: Recommend:
1089: 
1090: Rate Card
1091: atau
1092: Campaign Viral
1093: ```
1094: 
1095: ---
1096: 
1097: # AI BRIEF ASSISTANT
1098: 
1099: ```text
1100: UMKM Input:
1101: 
1102: Produk
1103: Target Market
1104: Goal
1105: ```
1106: 
1107: ↓
1108: 
1109: Generate
1110: 
1111: ```text
1112: Hook
1113: CTA
1114: Hashtag
1115: Script
1116: Guideline
1117: ```
1118: 
1119: ↓
1120: 
1121: Save Brief
1122: 
1123: ---
1124: 
1125: # AI FRAUD DETECTION
1126: 
1127: ```text
1128: Submission
1129: ↓
1130: Collect Metrics
1131: ↓
1132: Analyze Pattern
1133: ↓
1134: Risk Score
1135: ```
1136: 
1137: ↓
1138: 
1139: Output
1140: 
1141: ```text
1142: Safe
1143: Warning
1144: Fraud
1145: ```
1146: 
1147: ↓
1148: 
1149: Action
1150: 
1151: ```text
1152: Auto Approve
1153: Manual Review
1154: Auto Reject
1155: ```
1156: 
1157: ---
1158: 
1159: # FLOW FINAL MARKETIV (LEVEL MVP)
1160: 
1161: Jika disederhanakan ke level domain:
1162: 
1163: ```text
1164: AUTH
1165: ├─ Register
1166: ├─ Login
1167: ├─ Onboarding
1168: └─ Verification
1169: 
1170: RATE CARD
1171: ├─ Discovery
1172: ├─ Offer
1173: ├─ Order
1174: ├─ Escrow
1175: ├─ Revision
1176: ├─ Publish
1177: └─ Completion
1178: 
1179: CAMPAIGN VIRAL
1180: ├─ Create Campaign
1181: ├─ AI Brief
1182: ├─ Claim
1183: ├─ Submit
1184: ├─ AI Validation
1185: ├─ Tracking
1186: └─ Payout
1187: 
1188: SYSTEM
1189: ├─ Wallet
1190: ├─ Top Up
1191: ├─ Withdraw
1192: ├─ Refund
1193: ├─ Notification
1194: ├─ Report
1195: ├─ Dispute
1196: ├─ Fraud Review
1197: └─ Admin Moderation
1198: ```
1199: 
1200: 

(End of file - total 1200 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/04_ERD.md"
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/04_ERD.md</path>
<type>file</type>
<content>
1: 
2: # ERD (Database Relationship Diagram)
3: 
4: Berdasarkan MVP yang sudah kita sepakati, fokus pada:
5: 
6: * Role: UMKM & Kreator
7: * Campaign (Pay Per View)
8: * Rate Card (Influencer Booking)
9: * Wallet
10: * Escrow
11: * AI Brief
12: * AI Fraud Detection
13: * Submission
14: * Negotiation / Custom Offer
15: * Notification
16: 
17: ---
18: 
19: ## 1. Users
20: 
21: ```text
22: users
23: -----
24: id (PK)
25: role (umkm|creator|admin)
26: name
27: email
28: phone (Diisi saat Register UMKM)
29: avatar
30: status
31: created_at
32: ```
33: 
34: ---
35: 
36: ## 2. Creator Profiles
37: 
38: ```text
39: creator_profiles
40: ----------------
41: id (PK)
42: user_id (FK -> users)
43: 
44: bio
45: province
46: city
47: 
48: instagram_username
49: instagram_followers
50: 
51: tiktok_username
52: tiktok_followers
53: 
54: youtube_username
55: youtube_subscribers
56: 
57: rating
58: completed_jobs
59: 
60: created_at
61: ```
62: 
63: ### Relation
64: 
65: ```text
66: users (1)
67:    |
68:    |---- (1) creator_profiles
69: ```
70: 
71: ---
72: 
73: ## 3. UMKM Profiles
74: 
75: ```text
76: umkm_profiles
77: -------------
78: id (PK)
79: user_id (FK)
80: 
81: business_name (Diisi saat Register)
82: category (Diisi saat Register)
83: description
84: logo_url
85: location
86: 
87: created_at
88: ```
89: 
90: ### Relation
91: 
92: ```text
93: users (1)
94:    |
95:    |---- (1) umkm_profiles
96: ```
97: 
98: ---
99: 
100: # FITUR CAMPAIGN (VIRAL)
101: 
102: ## 4. Campaigns
103: 
104: ```text
105: campaigns
106: ---------
107: id (PK)
108: 
109: umkm_id (FK -> users)
110: 
111: title
112: type (ugc|clipping)
113: 
114: category
115: 
116: thumbnail_url
117: 
118: budget_total
119: budget_used
120: 
121: cpm
122: 
123: min_views
124: max_views
125: 
126: status
127: (draft|active|paused|completed)
128: 
129: ai_brief_id
130: 
131: created_at
132: ```
133: 
134: ### Relation
135: 
136: ```text
137: UMKM
138:  |
139:  |---- Campaigns
140: ```
141: 
142: ---
143: 
144: ## 5. Campaign Brief
145: 
146: ```text
147: campaign_briefs
148: ---------------
149: id (PK)
150: 
151: campaign_id (FK)
152: 
153: target_audience
154: goal
155: 
156: cta
157: 
158: required_elements
159: 
160: caption_required
161: 
162: hashtags
163: 
164: allowed_content
165: 
166: forbidden_content
167: 
168: materials_json
169: 
170: generated_by_ai
171: created_at
172: ```
173: 
174: ### Relation
175: 
176: ```text
177: Campaign
178:    |
179:    |---- Campaign Brief
180: ```
181: 
182: ---
183: 
184: ## 6. Campaign Claims
185: 
186: Saat kreator mengambil misi.
187: 
188: ```text
189: campaign_claims
190: ---------------
191: id (PK)
192: 
193: campaign_id (FK)
194: creator_id (FK)
195: 
196: status
197: (claimed|submitted|approved|rejected)
198: 
199: claimed_at
200: ```
201: 
202: ### Relation
203: 
204: ```text
205: Campaign
206:    |
207:    |---- Campaign Claim
208:                 |
209:                 |---- Creator
210: ```
211: 
212: ---
213: 
214: ## 7. Submissions
215: 
216: Video yang dikirim kreator.
217: 
218: ```text
219: submissions
220: -----------
221: id (PK)
222: 
223: claim_id (FK)
224: 
225: platform
226: video_url
227: 
228: caption
229: 
230: current_views
231: 
232: analytics_file
233: 
234: status
235: (pending|approved|rejected)
236: 
237: submitted_at
238: ```
239: 
240: ---
241: 
242: ## 8. Fraud Analysis
243: 
244: Hasil AI Fraud Detection.
245: 
246: ```text
247: fraud_analyses
248: --------------
249: id (PK)
250: 
251: submission_id (FK)
252: 
253: fraud_score
254: 
255: is_suspicious
256: 
257: notes
258: 
259: processed_at
260: ```
261: 
262: ### Relation
263: 
264: ```text
265: Submission
266:     |
267:     |---- Fraud Analysis
268: ```
269: 
270: ---
271: 
272: # FITUR RATE CARD
273: 
274: ## 9. Rate Cards
275: 
276: ```text
277: rate_cards
278: ----------
279: id (PK)
280: 
281: creator_id (FK)
282: 
283: platform
284: 
285: service_name
286: 
287: price
288: 
289: description
290: 
291: delivery_days
292: 
293: revision_limit
294: 
295: is_active
296: ```
297: 
298: ### Relation
299: 
300: ```text
301: Creator
302:    |
303:    |---- Rate Cards
304: ```
305: 
306: ---
307: 
308: ## 10. Conversations
309: 
310: Chat UMKM ↔ Kreator
311: 
312: ```text
313: conversations
314: -------------
315: id (PK)
316: 
317: umkm_id
318: creator_id
319: 
320: created_at
321: ```
322: 
323: ---
324: 
325: ## 11. Messages
326: 
327: ```text
328: messages
329: --------
330: id (PK)
331: 
332: conversation_id
333: 
334: sender_id
335: 
336: message
337: 
338: attachment_url
339: 
340: created_at
341: ```
342: 
343: ---
344: 
345: ## 12. Offers (Custom Offer)
346: 
347: Kesepakatan final.
348: 
349: ```text
350: offers
351: ------
352: id (PK)
353: 
354: conversation_id
355: 
356: creator_id
357: umkm_id
358: 
359: title
360: 
361: price
362: 
363: deadline
364: 
365: revision_limit
366: 
367: status
368: (pending|accepted|rejected)
369: 
370: created_at
371: ```
372: 
373: ---
374: 
375: ## 13. Orders
376: 
377: Terbentuk setelah offer diterima.
378: 
379: ```text
380: orders
381: ------
382: id (PK)
383: 
384: offer_id
385: 
386: creator_id
387: umkm_id
388: 
389: status
390: (waiting_payment
391: |active
392: |review
393: |completed
394: |cancelled)
395: 
396: created_at
397: ```
398: 
399: ---
400: 
401: ## 14. Deliverables
402: 
403: File preview hasil kerja.
404: 
405: ```text
406: deliverables
407: ------------
408: id (PK)
409: 
410: order_id
411: 
412: file_url
413: 
414: notes
415: 
416: version
417: 
418: created_at
419: ```
420: 
421: ---
422: 
423: # PAYMENT SYSTEM
424: 
425: ## 15. Wallets
426: 
427: ```text
428: wallets
429: -------
430: id (PK)
431: 
432: user_id
433: 
434: available_balance
435: 
436: pending_balance
437: 
438: updated_at
439: ```
440: 
441: ### Relation
442: 
443: ```text
444: User
445:  |
446:  |---- Wallet
447: ```
448: 
449: ---
450: 
451: ## 16. Wallet Transactions
452: 
453: ```text
454: wallet_transactions
455: -------------------
456: id (PK)
457: 
458: wallet_id
459: 
460: type
461: (deposit
462: withdraw
463: reward
464: escrow
465: refund
466: fee)
467: 
468: amount
469: 
470: reference_type
471: reference_id
472: 
473: created_at
474: ```
475: 
476: ---
477: 
478: ## 17. Escrows
479: 
480: Khusus Rate Card.
481: 
482: ```text
483: escrows
484: -------
485: id (PK)
486: 
487: order_id
488: 
489: payer_id
490: receiver_id
491: 
492: amount
493: 
494: status
495: (held
496: released
497: refunded)
498: 
499: created_at
500: ```
501: 
502: ### Relation
503: 
504: ```text
505: Order
506:   |
507:   |---- Escrow
508: ```
509: 
510: ---
511: 
512: # AI SYSTEM
513: 
514: ## 18. AI Brief Requests
515: 
516: ```text
517: ai_brief_requests
518: -----------------
519: id (PK)
520: 
521: umkm_id
522: 
523: product_description
524: 
525: generated_brief
526: 
527: created_at
528: ```
529: 
530: ---
531: 
532: ## 19. AI Fraud Jobs
533: 
534: ```text
535: ai_fraud_jobs
536: -------------
537: id (PK)
538: 
539: submission_id
540: 
541: status
542: 
543: result_json
544: 
545: created_at
546: ```
547: 
548: ---
549: 
550: # NOTIFICATION SYSTEM
551: 
552: ## 20. Notifications
553: 
554: ```text
555: notifications
556: -------------
557: id (PK)
558: 
559: user_id
560: 
561: title
562: 
563: message
564: 
565: type
566: 
567: is_read
568: 
569: created_at
570: ```
571: 
572: ---
573: 
574: # ERD Sederhana
575: 
576: ```text
577: USERS
578:  ├── UMKM_PROFILES
579:  ├── CREATOR_PROFILES
580:  ├── WALLETS
581:  └── NOTIFICATIONS
582: 
583: UMKM
584:  ├── CAMPAIGNS
585:  │     ├── CAMPAIGN_BRIEFS
586:  │     ├── CAMPAIGN_CLAIMS
587:  │     │      └── SUBMISSIONS
588:  │     │              └── FRAUD_ANALYSES
589:  │     └── AI_BRIEF_REQUESTS
590:  │
591:  └── CONVERSATIONS
592:          └── OFFERS
593:                  └── ORDERS
594:                          ├── DELIVERABLES
595:                          └── ESCROWS
596: 
597: CREATOR
598:  ├── RATE_CARDS
599:  ├── CAMPAIGN_CLAIMS
600:  └── CONVERSATIONS
601: 
602: WALLETS
603:  └── WALLET_TRANSACTIONS
604: ```
605: 
606: ### Catatan penting sebelum lanjut ke tahap 2
607: 
608: Untuk MVP, saya menyarankan **tidak membuat semua tabel ini sekaligus**.
609: 
610: ERD di atas adalah **ERD Final Product**.
611: 
612: Sedangkan untuk **MVP v1**, kemungkinan hanya perlu sekitar **12–14 collection Appwrite**, bukan 20 collection. Setelah ERD final ini disetujui, tahap berikutnya adalah membuat **Appwrite Collection Schema Final (versi MVP)** dan menentukan tabel mana yang benar-benar dibuat sekarang serta mana yang ditunda ke fase berikutnya.

(End of file - total 612 lines)
</content>
```

---

## Assistant (Build · Claude Sonnet 4.6 · 15.3s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/05_Appwrite_Collections.md"
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/05_Appwrite_Collections.md</path>
<type>file</type>
<content>
1: 
2: Berdasarkan domain breakdown, MVP, PRD Level 1 & 2 yang sudah kita susun, saya sarankan untuk **Appwrite Collection Design** jangan mengikuti domain secara 1:1, tetapi mengikuti kebutuhan query di dashboard.
3: 
4: Target MVP kita:
5: 
6: * Campaign
7: * Rate Card
8: * Chat
9: * Escrow
10: * Wallet
11: * AI Brief
12: * AI Fraud
13: 
14: Sehingga koleksi Appwrite harus dibuat agar:
15: 
16: * mudah di-query
17: * minim join
18: * scalable untuk Phase 2
19: 
20: ---
21: 
22: # Database Structure
23: 
24: ```text
25: marketiv
26: │
27: ├── users
28: │
29: ├── umkm_profiles
30: ├── creator_profiles
31: │
32: ├── creator_social_accounts
33: ├── creator_portfolios
34: │
35: ├── campaigns
36: ├── campaign_assets
37: ├── campaign_claims
38: ├── campaign_submissions
39: │
40: ├── rate_cards
41: ├── rate_card_packages
42: │
43: ├── conversations
44: ├── messages
45: ├── offers
46: │
47: ├── orders
48: ├── revisions
49: ├── deliverables
50: │
51: ├── wallets
52: ├── transactions
53: ├── escrows
54: ├── withdrawals
55: │
56: ├── ai_requests
57: ├── fraud_checks
58: │
59: └── notifications
60: ```
61: 
62: ---
63: 
64: # 1. users
65: 
66: Identity Domain
67: 
68: Sebenarnya Appwrite Auth sudah menyimpan user.
69: 
70: Tetapi kita tetap membutuhkan profile collection.
71: 
72: ```json
73: {
74:   "$id": "userId",
75:   "role": "umkm",
76:   "status": "active",
77:   "email": "",
78:   "phone": "", // Wajib diisi saat Register untuk UMKM
79:   "createdAt": ""
80: }
81: ```
82: 
83: ---
84: 
85: # 2. umkm_profiles
86: 
87: ```json
88: {
89:   "$id": "",
90:   "userId": "",
91: 
92:   "businessName": "", // Diisi saat Register
93:   "category": "", // Diisi saat Register
94:   "description": "",
95: 
96:   "city": "",
97:   "address": "",
98: 
99:   "instagram": "",
100:   "tiktok": "",
101:   "website": "",
102: 
103:   "logoUrl": "",
104: 
105:   "isProfileCompleted": true
106: }
107: ```
108: 
109: ---
110: 
111: # 3. creator_profiles
112: 
113: ```json
114: {
115:   "$id": "",
116: 
117:   "userId": "",
118: 
119:   "displayName": "",
120:   "bio": "",
121: 
122:   "city": "",
123: 
124:   "avatarUrl": "",
125: 
126:   "totalFollowers": 0,
127: 
128:   "totalOrders": 0,
129: 
130:   "rating": 0,
131: 
132:   "isProfileCompleted": false
133: }
134: ```
135: 
136: ---
137: 
138: # 4. creator_social_accounts
139: 
140: Satu creator bisa punya banyak akun.
141: 
142: ```json
143: {
144:   "$id": "",
145: 
146:   "creatorId": "",
147: 
148:   "platform": "tiktok",
149: 
150:   "username": "",
151: 
152:   "followers": 10000,
153: 
154:   "engagementRate": 5.4,
155: 
156:   "isVerified": false
157: }
158: ```
159: 
160: ---
161: 
162: # 5. creator_portfolios
163: 
164: ```json
165: {
166:   "$id": "",
167: 
168:   "creatorId": "",
169: 
170:   "title": "",
171: 
172:   "description": "",
173: 
174:   "thumbnailUrl": "",
175: 
176:   "portfolioUrl": ""
177: }
178: ```
179: 
180: ---
181: 
182: # 6. campaigns
183: 
184: Collection terbesar MVP.
185: 
186: ```json
187: {
188:   "$id": "",
189: 
190:   "umkmId": "",
191: 
192:   "title": "",
193: 
194:   "category": "",
195: 
196:   "platforms": [
197:     "tiktok",
198:     "instagram"
199:   ],
200: 
201:   "description": "",
202: 
203:   "budget": 1000000,
204: 
205:   "rewardPer1000Views": 10000,
206: 
207:   "minViews": 10000,
208: 
209:   "maxViews": 500000,
210: 
211:   "brief": "",
212: 
213:   "status": "published",
214: 
215:   "claimLimit": 100,
216: 
217:   "totalClaims": 0,
218: 
219:   "spentAmount": 0,
220: 
221:   "remainingBudget": 1000000,
222: 
223:   "publishedAt": ""
224: }
225: ```
226: 
227: ---
228: 
229: # 7. campaign_assets
230: 
231: Karena satu campaign bisa memiliki banyak asset.
232: 
233: ```json
234: {
235:   "$id": "",
236: 
237:   "campaignId": "",
238: 
239:   "type": "video",
240: 
241:   "fileUrl": "",
242: 
243:   "fileName": ""
244: }
245: ```
246: 
247: ---
248: 
249: # 8. campaign_claims
250: 
251: Creator mengambil campaign.
252: 
253: ```json
254: {
255:   "$id": "",
256: 
257:   "campaignId": "",
258: 
259:   "creatorId": "",
260: 
261:   "claimedAt": "",
262: 
263:   "status": "claimed"
264: }
265: ```
266: 
267: Status:
268: 
269: ```text
270: claimed
271: submitted
272: approved
273: rejected
274: ```
275: 
276: ---
277: 
278: # 9. campaign_submissions
279: 
280: Ini yang nanti dipakai AI Fraud.
281: 
282: ```json
283: {
284:   "$id": "",
285: 
286:   "claimId": "",
287: 
288:   "campaignId": "",
289: 
290:   "creatorId": "",
291: 
292:   "platform": "tiktok",
293: 
294:   "postUrl": "",
295: 
296:   "caption": "",
297: 
298:   "views": 0,
299: 
300:   "engagement": 0,
301: 
302:   "fraudScore": 0,
303: 
304:   "fraudStatus": "safe",
305: 
306:   "status": "pending"
307: }
308: ```
309: 
310: Fraud Status
311: 
312: ```text
313: safe
314: review
315: rejected
316: ```
317: 
318: ---
319: 
320: # 10. rate_cards
321: 
322: ```json
323: {
324:   "$id": "",
325: 
326:   "creatorId": "",
327: 
328:   "title": "",
329: 
330:   "description": "",
331: 
332:   "status": "published"
333: }
334: ```
335: 
336: ---
337: 
338: # 11. rate_card_packages
339: 
340: Karena satu rate card memiliki:
341: 
342: ```text
343: Basic
344: Standard
345: Premium
346: ```
347: 
348: ```json
349: {
350:   "$id": "",
351: 
352:   "rateCardId": "",
353: 
354:   "name": "Basic",
355: 
356:   "price": 100000,
357: 
358:   "deliveryDays": 3,
359: 
360:   "revisionLimit": 1,
361: 
362:   "description": ""
363: }
364: ```
365: 
366: ---
367: 
368: # 12. conversations
369: 
370: Chat room.
371: 
372: ```json
373: {
374:   "$id": "",
375: 
376:   "umkmId": "",
377: 
378:   "creatorId": "",
379: 
380:   "lastMessage": "",
381: 
382:   "lastMessageAt": ""
383: }
384: ```
385: 
386: ---
387: 
388: # 13. messages
389: 
390: Realtime Appwrite akan banyak dipakai di sini.
391: 
392: ```json
393: {
394:   "$id": "",
395: 
396:   "conversationId": "",
397: 
398:   "senderId": "",
399: 
400:   "type": "text",
401: 
402:   "content": ""
403: }
404: ```
405: 
406: Type:
407: 
408: ```text
409: text
410: image
411: file
412: offer
413: system
414: ```
415: 
416: ---
417: 
418: # 14. offers
419: 
420: Custom Offer.
421: 
422: ```json
423: {
424:   "$id": "",
425: 
426:   "conversationId": "",
427: 
428:   "creatorId": "",
429: 
430:   "umkmId": "",
431: 
432:   "title": "",
433: 
434:   "description": "",
435: 
436:   "price": 200000,
437: 
438:   "deadline": "",
439: 
440:   "revisionLimit": 2,
441: 
442:   "status": "pending"
443: }
444: ```
445: 
446: ---
447: 
448: # 15. orders
449: 
450: Ini pusat Rate Card.
451: 
452: Baik direct order maupun custom offer.
453: 
454: ```json
455: {
456:   "$id": "",
457: 
458:   "umkmId": "",
459: 
460:   "creatorId": "",
461: 
462:   "offerId": "",
463: 
464:   "packageId": "",
465: 
466:   "amount": 200000,
467: 
468:   "status": "pending_payment"
469: }
470: ```
471: 
472: Status:
473: 
474: ```text
475: pending_payment
476: escrow
477: in_progress
478: revision
479: approved
480: completed
481: cancelled
482: ```
483: 
484: ---
485: 
486: # 16. revisions
487: 
488: ```json
489: {
490:   "$id": "",
491: 
492:   "orderId": "",
493: 
494:   "requestedBy": "",
495: 
496:   "message": "",
497: 
498:   "status": "open"
499: }
500: ```
501: 
502: ---
503: 
504: # 17. deliverables
505: 
506: Draft hasil kerja creator.
507: 
508: ```json
509: {
510:   "$id": "",
511: 
512:   "orderId": "",
513: 
514:   "fileUrl": "",
515: 
516:   "notes": "",
517: 
518:   "status": "submitted"
519: }
520: ```
521: 
522: ---
523: 
524: # 18. wallets
525: 
526: Satu user satu wallet.
527: 
528: ```json
529: {
530:   "$id": "",
531: 
532:   "userId": "",
533: 
534:   "balance": 0,
535: 
536:   "pendingBalance": 0
537: }
538: ```
539: 
540: ---
541: 
542: # 19. transactions
543: 
544: Jangan gabungkan dengan escrow.
545: 
546: ```json
547: {
548:   "$id": "",
549: 
550:   "userId": "",
551: 
552:   "amount": 0,
553: 
554:   "type": "",
555: 
556:   "referenceId": "",
557: 
558:   "referenceType": "",
559: 
560:   "status": ""
561: }
562: ```
563: 
564: Type
565: 
566: ```text
567: deposit
568: withdrawal
569: payment
570: refund
571: release
572: fee
573: ```
574: 
575: ---
576: 
577: # 20. escrows
578: 
579: Domain sensitif.
580: 
581: ```json
582: {
583:   "$id": "",
584: 
585:   "orderId": "",
586: 
587:   "amount": 0,
588: 
589:   "status": "held"
590: }
591: ```
592: 
593: ---
594: 
595: # 21. withdrawals
596: 
597: ```json
598: {
599:   "$id": "",
600: 
601:   "userId": "",
602: 
603:   "amount": 0,
604: 
605:   "bankName": "",
606: 
607:   "accountNumber": "",
608: 
609:   "accountName": "",
610: 
611:   "status": "pending"
612: }
613: ```
614: 
615: ---
616: 
617: # 22. ai_requests
618: 
619: Dipakai AI Landing dan AI Brief.
620: 
621: ```json
622: {
623:   "$id": "",
624: 
625:   "userId": "",
626: 
627:   "feature": "brief",
628: 
629:   "prompt": "",
630: 
631:   "response": ""
632: }
633: ```
634: 
635: ---
636: 
637: # 23. fraud_checks
638: 
639: Pisahkan dari submission agar histori fraud bisa disimpan.
640: 
641: ```json
642: {
643:   "$id": "",
644: 
645:   "submissionId": "",
646: 
647:   "score": 20,
648: 
649:   "result": "safe",
650: 
651:   "reason": ""
652: }
653: ```
654: 
655: ---
656: 
657: # 24. notifications
658: 
659: ```json
660: {
661:   "$id": "",
662: 
663:   "userId": "",
664: 
665:   "title": "",
666: 
667:   "message": "",
668: 
669:   "type": "system",
670: 
671:   "isRead": false
672: }
673: ```
674: 
675: ---
676: 
677: ## Revisi yang Saya Sarankan Sebelum Implementasi
678: 
679: Dari rancangan sebelumnya, ada 3 penyesuaian penting:
680: 
681: ### 1. Tambahkan `orders` sebagai aggregate utama Rate Card
682: 
683: Jangan biarkan Offer langsung mengelola Escrow.
684: 
685: ```text
686: Offer
687: ↓
688: Order
689: ↓
690: Escrow
691: ↓
692: Deliverable
693: ↓
694: Revision
695: ↓
696: Completed
697: ```
698: 
699: ### 2. Pisahkan `fraud_checks` dari `campaign_submissions`
700: 
701: Karena nanti Phase 2 akan ada:
702: 
703: ```text
704: AI Fraud
705: Computer Vision
706: Product Detection
707: Logo Detection
708: ```
709: 
710: Jika digabung akan sulit berkembang.
711: 
712: ### 3. Simpan denormalized data
713: 
714: Contoh pada `campaigns`:
715: 
716: ```json
717: {
718:   "totalClaims": 12,
719:   "spentAmount": 250000,
720:   "remainingBudget": 750000
721: }
722: ```
723: 
724: Walaupun bisa dihitung dari collection lain, simpan langsung agar dashboard cepat.
725: 
726: ---
727: 
728: Menurut saya ini sudah cukup matang untuk masuk ke tahap berikutnya, yaitu **Appwrite Relationship Design (attribute, relationship type, index, dan permission per collection)** sebelum mulai implementasi backend. Itu akan menjadi blueprint yang langsung bisa diterapkan di Appwrite Console.

(End of file - total 728 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/06_API_Contract.md"
}
```

**Output:**
```
<path>/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/docs/draft/sources/06_API_Contract.md</path>
<type>file</type>
<content>
1: 
2: # Tahap 4 — API Contract & Service Contract (MVP)
3: 
4: Pada tahap ini kita tidak berpikir tentang UI lagi, tetapi tentang:
5: 
6: ```text
7: Frontend
8:     ↓
9: Appwrite API
10:     ↓
11: Database
12:     ↓
13: Functions
14:     ↓
15: Events
16: ```
17: 
18: Tujuannya supaya saat coding tidak ada kebingungan endpoint dan alur data.
19: 
20: ---
21: 
22: # Arsitektur MVP
23: 
24: ```text
25: React / Next.js
26:       ↓
27: Appwrite SDK
28: 
29: ├── Auth
30: ├── Database
31: ├── Storage
32: ├── Realtime
33: └── Functions
34: ```
35: 
36: ---
37: 
38: # Service Group
39: 
40: Saya membaginya menjadi 10 service.
41: 
42: ```text
43: Auth Service
44: Profile Service
45: 
46: Campaign Service
47: Submission Service
48: 
49: AI Service
50: 
51: Rate Card Service
52: Chat Service
53: 
54: Order Service
55: Wallet Service
56: 
57: Admin Service
58: ```
59: 
60: ---
61: 
62: # 1. Auth Service
63: 
64: ## Register UMKM
65: 
66: ```typescript
67: registerUMKM()
68: ```
69: 
70: Input
71: 
72: ```json
73: {
74:   "businessName": "",
75:   "category": "",
76:   "email": "",
77:   "phone": "",
78:   "password": ""
79: }
80: ```
81: 
82: Process
83: 
84: ```text
85: Create Appwrite Auth User
86: ↓
87: Create UMKM Profile
88: ↓
89: Create Wallet
90: ```
91: 
92: ---
93: 
94: ## Register Creator
95: 
96: ```typescript
97: registerCreator()
98: ```
99: 
100: Input
101: 
102: ```json
103: {
104:   "name": "",
105:   "email": "",
106:   "password": ""
107: }
108: ```
109: 
110: Process
111: 
112: ```text
113: Create Appwrite Auth User (atau via Google OAuth)
114: ↓
115: Create Creator Profile
116: ↓
117: Create Wallet
118: ```
119: 
120: ---
121: 
122: ## Login
123: 
124: ```typescript
125: loginUser(email, password, role)
126: loginWithGoogle() // Khusus Creator
127: ```
128: 
129: ## Auth Utilities
130: 
131: ```typescript
132: verifyEmailToken(token)
133: resendVerificationLink(email)
134: forgotPassword(email)
135: ```
136: 
137: Return Data Login
138: 
139: ```json
140: {
141:   "user": {},
142:   "profile": {},
143:   "wallet": {}
144: }
145: ```
146: 
147: ---
148: 
149: # Event
150: 
151: ```text
152: User Registered
153: ↓
154: Create Wallet
155: ```
156: 
157: ---
158: 
159: # 2. Profile Service
160: 
161: ## Get Profile
162: 
163: ```typescript
164: getProfile(userId)
165: ```
166: 
167: ---
168: 
169: ## Update Profile
170: 
171: ```typescript
172: updateProfile()
173: ```
174: 
175: ---
176: 
177: ## Add Social Account
178: 
179: ```typescript
180: addSocialAccount()
181: ```
182: 
183: ---
184: 
185: ## Remove Social Account
186: 
187: ```typescript
188: removeSocialAccount()
189: ```
190: 
191: ---
192: 
193: # 3. Campaign Service
194: 
195: Core PPV.
196: 
197: ---
198: 
199: ## Create Campaign
200: 
201: ```typescript
202: createCampaign()
203: ```
204: 
205: Input
206: 
207: ```json
208: {
209:   "title": "",
210:   "type": "ugc",
211:   "category": "",
212:   "budget": 100000,
213:   "cpm": 5000
214: }
215: ```
216: 
217: Process
218: 
219: ```text
220: Create Campaign
221: ↓
222: Draft
223: ```
224: 
225: ---
226: 
227: ## Generate AI Brief
228: 
229: ```typescript
230: generateBrief()
231: ```
232: 
233: Input
234: 
235: ```json
236: {
237:   "campaignId": "",
238:   "description": "",
239:   "materials": []
240: }
241: ```
242: 
243: Process
244: 
245: ```text
246: AI Function
247: ↓
248: campaign_briefs
249: ```
250: 
251: ---
252: 
253: ## Publish Campaign
254: 
255: ```typescript
256: publishCampaign()
257: ```
258: 
259: ```text
260: draft
261: ↓
262: active
263: ```
264: 
265: ---
266: 
267: ## Explore Campaigns
268: 
269: ```typescript
270: getCampaigns()
271: ```
272: 
273: Filter
274: 
275: ```json
276: {
277:   "platform": "tiktok",
278:   "category": "food",
279:   "sort": "latest"
280: }
281: ```
282: 
283: ---
284: 
285: ## Detail Campaign
286: 
287: ```typescript
288: getCampaignById()
289: ```
290: 
291: ---
292: 
293: # 4. Claim Service
294: 
295: ---
296: 
297: ## Claim Campaign
298: 
299: ```typescript
300: claimCampaign()
301: ```
302: 
303: Input
304: 
305: ```json
306: {
307:   "campaignId": ""
308: }
309: ```
310: 
311: Validation
312: 
313: ```text
314: Already claimed?
315: Campaign active?
316: Profile complete?
317: ```
318: 
319: ---
320: 
321: Process
322: 
323: ```text
324: Create Claim
325: ```
326: 
327: ---
328: 
329: # Event
330: 
331: ```text
332: Campaign Claimed
333: ↓
334: Notify UMKM
335: ```
336: 
337: ---
338: 
339: # 5. Submission Service
340: 
341: ---
342: 
343: ## Create Submission
344: 
345: ```typescript
346: createSubmission()
347: ```
348: 
349: Input
350: 
351: ```json
352: {
353:   "claimId": "",
354:   "videoUrl": "",
355:   "views": 12000
356: }
357: ```
358: 
359: ---
360: 
361: Process
362: 
363: ```text
364: Create Submission
365: ↓
366: Fraud Queue
367: ```
368: 
369: ---
370: 
371: # Event
372: 
373: ```text
374: Submission Created
375: ↓
376: AI Fraud Detection
377: ```
378: 
379: ---
380: 
381: ## Get My Submissions
382: 
383: ```typescript
384: getMySubmissions()
385: ```
386: 
387: ---
388: 
389: ## Approve Submission
390: 
391: ```typescript
392: approveSubmission()
393: ```
394: 
395: UMKM only.
396: 
397: ---
398: 
399: Process
400: 
401: ```text
402: Calculate Reward
403: ↓
404: Pending Wallet
405: ```
406: 
407: ---
408: 
409: ## Reject Submission
410: 
411: ```typescript
412: rejectSubmission()
413: ```
414: 
415: ---
416: 
417: # 6. AI Service
418: 
419: Semua AI dijalankan melalui Appwrite Function.
420: 
421: ---
422: 
423: ## AI Brief Function
424: 
425: ```typescript
426: POST /functions/ai-brief
427: ```
428: 
429: Input
430: 
431: ```json
432: {
433:   "campaignId": ""
434: }
435: ```
436: 
437: Return
438: 
439: ```json
440: {
441:   "brief": {}
442: }
443: ```
444: 
445: ---
446: 
447: ## AI Fraud Function
448: 
449: ```typescript
450: POST /functions/fraud-detection
451: ```
452: 
453: Input
454: 
455: ```json
456: {
457:   "submissionId": ""
458: }
459: ```
460: 
461: Return
462: 
463: ```json
464: {
465:   "score": 0.82,
466:   "status": "safe"
467: }
468: ```
469: 
470: ---
471: 
472: # Event Architecture
473: 
474: ```text
475: Submission Created
476: ↓
477: Fraud Function
478: ↓
479: Update Submission
480: ```
481: 
482: ---
483: 
484: # 7. Rate Card Service
485: 
486: ---
487: 
488: ## Create Rate Card
489: 
490: ```typescript
491: createRateCard()
492: ```
493: 
494: ---
495: 
496: ## Update Rate Card
497: 
498: ```typescript
499: updateRateCard()
500: ```
501: 
502: ---
503: 
504: ## Get Creator Rate Cards
505: 
506: ```typescript
507: getRateCards()
508: ```
509: 
510: ---
511: 
512: ## Search Creators
513: 
514: ```typescript
515: searchCreators()
516: ```
517: 
518: Filter
519: 
520: ```json
521: {
522:   "platform": "tiktok",
523:   "city": "sukabumi"
524: }
525: ```
526: 
527: ---
528: 
529: # 8. Chat Service
530: 
531: ---
532: 
533: ## Create Conversation
534: 
535: ```typescript
536: createConversation()
537: ```
538: 
539: ---
540: 
541: ## Send Message
542: 
543: ```typescript
544: sendMessage()
545: ```
546: 
547: Input
548: 
549: ```json
550: {
551:   "conversationId": "",
552:   "content": ""
553: }
554: ```
555: 
556: ---
557: 
558: Realtime
559: 
560: ```text
561: Message Sent
562: ↓
563: Realtime Event
564: ↓
565: Receiver UI Update
566: ```
567: 
568: ---
569: 
570: # 9. Offer Service
571: 
572: ---
573: 
574: ## Create Offer
575: 
576: ```typescript
577: createOffer()
578: ```
579: 
580: Input
581: 
582: ```json
583: {
584:   "conversationId": "",
585:   "price": 300000
586: }
587: ```
588: 
589: ---
590: 
591: ## Accept Offer
592: 
593: ```typescript
594: acceptOffer()
595: ```
596: 
597: Process
598: 
599: ```text
600: Offer Accepted
601: ↓
602: Create Order
603: ```
604: 
605: ---
606: 
607: ## Reject Offer
608: 
609: ```typescript
610: rejectOffer()
611: ```
612: 
613: ---
614: 
615: # Event
616: 
617: ```text
618: Offer Accepted
619: ↓
620: Order Created
621: ```
622: 
623: ---
624: 
625: # 10. Order Service
626: 
627: ---
628: 
629: ## Get Orders
630: 
631: ```typescript
632: getOrders()
633: ```
634: 
635: ---
636: 
637: ## Upload Deliverable
638: 
639: ```typescript
640: uploadDeliverable()
641: ```
642: 
643: Input
644: 
645: ```json
646: {
647:   "orderId": "",
648:   "fileUrl": ""
649: }
650: ```
651: 
652: ---
653: 
654: ## Approve Deliverable
655: 
656: ```typescript
657: approveDeliverable()
658: ```
659: 
660: Process
661: 
662: ```text
663: Escrow Release
664: ↓
665: Wallet
666: ```
667: 
668: ---
669: 
670: ## Request Revision
671: 
672: ```typescript
673: requestRevision()
674: ```
675: 
676: ---
677: 
678: # 11. Wallet Service
679: 
680: ---
681: 
682: ## Get Wallet
683: 
684: ```typescript
685: getWallet()
686: ```
687: 
688: ---
689: 
690: ## Withdraw Request
691: 
692: ```typescript
693: requestWithdraw()
694: ```
695: 
696: Input
697: 
698: ```json
699: {
700:   "amount": 100000
701: }
702: ```
703: 
704: Validation
705: 
706: ```text
707: Balance >= Amount
708: Min Withdraw
709: ```
710: 
711: ---
712: 
713: Process
714: 
715: ```text
716: Withdraw Pending
717: ```
718: 
719: ---
720: 
721: # 12. Admin Service
722: 
723: ---
724: 
725: ## Review Fraud
726: 
727: ```typescript
728: reviewFraud()
729: ```
730: 
731: ---
732: 
733: ## Review Withdraw
734: 
735: ```typescript
736: approveWithdraw()
737: ```
738: 
739: ```typescript
740: rejectWithdraw()
741: ```
742: 
743: ---
744: 
745: ## Suspend User
746: 
747: ```typescript
748: suspendUser()
749: ```
750: 
751: ---
752: 
753: # Appwrite Event Architecture
754: 
755: Ini yang nanti menjadi backbone sistem.
756: 
757: ```text
758: USER REGISTERED
759: ↓
760: Create Wallet
761: 
762: CAMPAIGN PUBLISHED
763: ↓
764: Notification
765: 
766: CAMPAIGN CLAIMED
767: ↓
768: Notification
769: 
770: SUBMISSION CREATED
771: ↓
772: AI Fraud Detection
773: 
774: SUBMISSION APPROVED
775: ↓
776: Reward Calculation
777: 
778: OFFER ACCEPTED
779: ↓
780: Create Order
781: 
782: PAYMENT SUCCESS
783: ↓
784: Escrow Hold
785: 
786: DELIVERABLE APPROVED
787: ↓
788: Release Escrow
789: 
790: WITHDRAW REQUESTED
791: ↓
792: Admin Review
793: ```
794: 
795: ---
796: 
797: # Permission Model
798: 
799: ## Public
800: 
801: ```text
802: Landing
803: Campaign Explore
804: Creator Explore
805: ```
806: 
807: ---
808: 
809: ## Creator
810: 
811: ```text
812: Claim Campaign
813: Submission
814: Rate Card
815: Withdraw
816: ```
817: 
818: ---
819: 
820: ## UMKM
821: 
822: ```text
823: Campaign
824: Approve Submission
825: Order
826: Escrow
827: ```
828: 
829: ---
830: 
831: ## Admin
832: 
833: ```text
834: All Access
835: ```
836: 
837: ---
838: 
839: # Deliverable Tahap 4 Selesai
840: 
841: Dengan selesainya tahap ini, kita sudah memiliki:
842: 
843: ```text
844: ✅ ERD Final
845: ✅ Collection Schema
846: ✅ User Journey
847: ✅ API Contract
848: ```
849: 
850: Tahap berikutnya yang paling penting sebelum coding adalah **Tahap 5 — Sprint Breakdown & Development Roadmap**, yaitu memecah seluruh Marketiv menjadi sprint mingguan (Sprint 1, Sprint 2, Sprint 3, dst.) lengkap dengan urutan implementasi Appwrite, database, frontend, AI, payment, dan deployment. Ini biasanya menjadi dokumen eksekusi tim.

(End of file - total 850 lines)
</content>
```

---

## Assistant (Build · Claude Sonnet 4.6 · 71.9s)

_Thinking:_



Semua dokumen sudah terbaca. Saya punya gambaran lengkap sekarang — cukup untuk memberi penjelasan detail plus menemukan gap/inkonsistensi. Tidak perlu baca file ke-7 (`07_Architecture.md`) karena sudah cukup datanya.

---

## Flow UMKM — Analisis Lengkap dari Backend Draft

### Gambaran Besar: UMKM Punya 2 Jalur

Ini poin kritis yang perlu divalidasi: **dokumen-dokumen ini belum 100% konsisten satu sama lain.** Saya akan jelaskan setiap jalur lalu tunjukkan gap-nya.

---

## JALUR 1 — Campaign Viral (Pay-Per-View)

### Flow Data Masuk

```
UMKM Register
  → POST: users (role=umkm) + umkm_profiles + wallets (auto via event)

UMKM Buat Campaign
  → POST: campaigns (status=draft)
    field: umkmId, title, category, budget, rewardPer1000Views, cpm, minViews, maxViews

UMKM Generate AI Brief (opsional)
  → POST: /functions/ai-brief { campaignId }
    → tulis ke: ai_requests + campaign_briefs (brief, cta, hashtags, do/don't)

UMKM Upload Asset
  → POST: campaign_assets (type=video|image, fileUrl via Appwrite Storage)

UMKM Publish Campaign
  → PATCH: campaigns.status = "active"
    → Event: CAMPAIGN_PUBLISHED → Notification ke Creator pool
```

### Flow Setelah Creator Klaim

```
Creator klaim → campaign_claims (status=claimed)
  → Event: CAMPAIGN_CLAIMED → Notify UMKM

Creator submit hasil → campaign_submissions
  (postUrl, platform, caption, views)
  → Event: SUBMISSION_CREATED → AI Fraud Detection
    → fraud_checks (score, result: safe|review|rejected)

Jika safe → submission.status = "approved" auto
Jika review → masuk fraud queue → Admin decide → approve/reject/ban
Jika rejected → submission.status = "rejected"
```

### Flow Pembayaran Campaign

```
Setelah submission approved:
  → Calculate reward: (views / 1000) × rewardPer1000Views
  → Kredit ke wallet creator: pendingBalance += reward
  → campaigns.spentAmount += reward
  → campaigns.remainingBudget -= reward

Tracking berakhir (campaign completed/stop):
  → pendingBalance → available balance creator
  → transactions: type=reward, referenceType=campaign
```

**Budget UMKM diambil dari wallet UMKM (via top-up dulu), bukan bayar per transaksi.**

---

## JALUR 2 — Rate Card (Fixed Price / Escrow)

### Flow Data Masuk

```
UMKM Browse Creator
  → GET: creator_profiles + creator_social_accounts + rate_cards + rate_card_packages

UMKM Inisiasi Chat
  → POST: conversations { umkmId, creatorId }

UMKM/Creator Chat & Negosiasi
  → POST: messages { conversationId, senderId, type=text|offer|system }

UMKM Kirim Custom Offer
  → POST: offers { conversationId, price, deadline, revisionLimit }
    status = "pending"

Creator Accept Offer
  → PATCH: offers.status = "accepted"
  → Event: OFFER_ACCEPTED → Create Order
    → POST: orders { umkmId, creatorId, offerId, amount, status=pending_payment }

UMKM Bayar via Midtrans
  → Server Action → Midtrans token
  → UMKM bayar di modal Snap
  → Midtrans webhook → PATCH: orders.status = "escrow"
    → POST: escrows { orderId, amount, status=held }
    → POST: transactions { type=payment }

Creator Kerjakan, Upload Deliverable
  → POST: deliverables { orderId, fileUrl, notes, status=submitted }
  → PATCH: orders.status = "review"

UMKM Review Deliverable
  → Approve → PATCH: orders.status = "approved"
    → Release escrow: escrows.status = "released"
    → wallet creator.balance += amount (dikurangi platform fee)
    → POST: transactions { type=release }
    → PATCH: orders.status = "completed"

  → Request Revision → POST: revisions { orderId, message }
    → PATCH: orders.status = "revision"
    → Creator reupload deliverable → loop kembali ke review
```

---

## Skema Collections yang Dipakai UMKM

| Collection | Dibuat UMKM | Dibaca UMKM | Ditulis Sistem |
|---|---|---|---|
| `users` | Register | Auth | — |
| `umkm_profiles` | Onboarding | Profile page | — |
| `wallets` | Auto (event) | Dashboard, Wallet page | Top-up, refund |
| `campaigns` | Create Campaign | Campaign list/detail | spentAmount, remainingBudget |
| `campaign_assets` | Upload Asset | Campaign detail | — |
| `campaign_briefs` | Via AI | Campaign detail | AI Function |
| `campaign_claims` | — | Campaign detail | Creator (claim) |
| `campaign_submissions` | — | Submission list | Creator (submit) |
| `conversations` | Inisiasi chat | Chat page | — |
| `messages` | Send message | Chat page | System messages |
| `offers` | Kirim offer | Order detail | — |
| `orders` | — (auto dari offer) | Order list/detail | Sistem (status transitions) |
| `escrows` | — (auto dari payment) | Wallet/order | Midtrans webhook |
| `transactions` | — (semua auto) | Wallet history | Sistem |
| `notifications` | — | Notification center | Event triggers |

---

## GAP & INKONSISTENSI yang Perlu Divalidasi

Ini temuan yang saya lihat perlu dikonfirmasi atau direvisi:

---

### GAP 1 — Model Pembayaran Campaign Viral belum konsisten

**Masalah:** `01_MVP.md` (flow global) bilang UMKM **"Bayar Escrow"** setelah offer accepted. Tapi Campaign Viral tidak punya offer/order — UMKM bayar di awal saat **publish campaign** (deposit budget ke wallet, lalu sistem potong per reward).

`04_ERD.md` tidak ada tabel `escrows` untuk Campaign Viral — escrow di sana hanya untuk Rate Card. **Ini sudah benar**, tapi `01_MVP.md` section flow global menyebut "Bayar Escrow" di tengah flow yang seolah-olah berlaku untuk kedua mode.

**Rekomendasi:** Pisahkan flow di `01_MVP.md` menjadi dua flow yang eksplisit, atau tulis catatan bahwa "Escrow" di Campaign Viral = top-up wallet dulu, bukan escrow per-order.

---

### GAP 2 — Wallet UMKM: Top-up atau Pay-per-transaction?

**Masalah:** `02_User_Flow.md` ada seksi **"TOP UP"** untuk Wallet UMKM, yang artinya UMKM mengisi saldo dulu, baru budget campaign dipotong dari saldo. Tapi flow Campaign Viral di dokumen lain menyebut pembayaran saat publish.

**Pertanyaan yang perlu dijawab:** Apakah UMKM harus **top-up wallet dulu** baru bisa publish campaign, atau **bayar langsung saat publish** via Midtrans per campaign? Ini mempengaruhi desain `wallets`, `transactions`, dan trigger Midtrans-nya.

---

### GAP 3 — `approveSubmission` di Campaign Viral: UMKM atau Auto?

**Masalah:** `06_API_Contract.md` punya fungsi `approveSubmission()` yang disebut "UMKM only". Tapi `01_MVP.md` di bagian Campaign Mode **tidak boleh ada approval loop** (kreator klaim → edit → posting, titik).

**Pertanyaan:** Apakah UMKM bisa reject submission di Campaign Viral, atau approval-nya fully otomatis setelah AI Fraud bilang `safe`? Jika UMKM bisa reject, ini bertentangan dengan aturan "no revision loop" di campaign mode.

---

### GAP 4 — `offers` bisa datang dari siapa?

**Masalah:** `04_ERD.md` dan `05_Appwrite_Collections.md` menyebut offer dibuat dari dalam `conversation` — artinya chat dulu baru offer. Tapi `01_MVP.md` section Rate Card menyebut UMKM langsung "Kirim Offer" dari halaman creator profile tanpa harus chat dulu.

**Rekomendasi:** Tentukan apakah conversation **wajib ada** sebelum offer, atau offer bisa dibuat direct (langsung dari rate card package) dan conversation dibuat otomatis.

---

### GAP 5 — `rate_card_packages` vs `rate_cards`: mana yang di-link ke order?

**Masalah:** `orders` di `05_Appwrite_Collections.md` punya field `packageId` dan `offerId`. Tapi tidak ada kejelasan: apakah UMKM bisa order langsung dari `rate_card_packages` (tanpa negosiasi), atau **wajib** melalui offer/chat dulu?

Jika ada "direct order" dari package, maka flow-nya beda dan butuh `createDirectOrder()` yang terpisah dari `acceptOffer()`.

---

### GAP 6 — Tidak ada `collab_post` enforcement di Rate Card

**Masalah:** Requirement dokumen frontend menyebut wajib ada **"Collab Post"** enforcement saat kreator posting (Instagram/TikTok). Tapi di `04_ERD.md`, `05_Appwrite_Collections.md`, dan `06_API_Contract.md` tidak ada field atau collection yang men-track collab post URL atau status collab post-nya.

**Rekomendasi:** Tambahkan field `collabPostUrl` dan `isCollabPostVerified` di `orders` atau `deliverables`.

---

### GAP 7 — `campaign_submissions` tidak punya link langsung ke `campaigns`

Di `05_Appwrite_Collections.md`, `campaign_submissions` punya `claimId`, `campaignId`, `creatorId`. Ini sudah benar. Tapi di `04_ERD.md`, submissions hanya linked ke `claim_id` saja. Pastikan `campaignId` selalu ada di-denormalisasi di submission agar query dashboard UMKM "lihat semua submission per campaign" tidak butuh join dua tabel.

---

## Ringkasan Status

| Area | Status |
|---|---|
| Auth + Register UMKM | Solid, tidak ada gap |
| Onboarding wizard | Solid |
| Campaign Viral — Create & Publish | Solid |
| Campaign Viral — Claim & Submit (sisi kreator) | Solid |
| Campaign Viral — AI Fraud + Reward calc | Solid secara konsep, belum ada formula reward di kode |
| Rate Card — Chat & Offer | Solid, **tapi entry point (direct vs via chat) perlu diperjelas** |
| Rate Card — Order & Escrow | Solid |
| Rate Card — Deliverable, Revision, Approval | Solid |
| Wallet UMKM (Top-up model) | **Perlu keputusan: top-up vs pay-per-campaign** |
| Escrow Campaign vs Escrow Rate Card | **Perlu penegasan di docs bahwa keduanya beda mekanisme** |
| Collab Post enforcement | **Belum ada di backend schema** |
| Dispute & Refund | Ada di flow tapi belum ada collection `disputes` di ERD |

Mana dari gap-gap ini yang ingin dibahas dan diputuskan duluan? Saya bisa bantu rancang solusinya.

---

