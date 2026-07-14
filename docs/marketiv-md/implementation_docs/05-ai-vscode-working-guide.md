# 05 — AI VS Code Working Guide Marketiv

> Dokumen ini menjelaskan cara memakai AI coding assistant di VS Code, Cursor, Copilot, Codex, atau tool sejenis untuk project Marketiv.
> Tujuannya agar AI menghasilkan kode yang konsisten dengan dokumentasi, struktur repo, Appwrite architecture, dan UI direction baru.

---

## 1. Tujuan Dokumen

AI coding assistant sangat berguna untuk mempercepat slicing UI/UX Marketiv.
Namun AI juga mudah salah jika konteks yang diberikan terlalu umum, terlalu panjang, atau bertabrakan.
Dokumen ini menentukan urutan file yang harus dibaca AI sebelum mengerjakan task.
Dokumen ini menentukan cara membuat prompt yang aman.
Dokumen ini menentukan batasan yang tidak boleh dilanggar AI.
Dokumen ini menentukan format output yang diharapkan saat AI membuat kode.
Dokumen ini memastikan AI tidak memakai referensi lama seperti Supabase jika project sudah memakai Appwrite.
Dokumen ini memastikan AI tidak membuat chat di Campaign Mode.
Dokumen ini memastikan AI tidak membuat mutation sensitif di frontend.
Dokumen ini memastikan AI memakai design tokens dan folder structure yang benar.

---

## 2. Golden Rule

AI harus bekerja berdasarkan konteks repo dan dokumentasi, bukan asumsi umum.
AI tidak boleh mengubah file di luar scope prompt.
AI tidak boleh melakukan refactor besar tanpa instruksi eksplisit.
AI tidak boleh menambah dependency tanpa izin.
AI tidak boleh membuat route baru di luar route map.
AI tidak boleh mengarang collection Appwrite.
AI tidak boleh mengarang status enum.
AI tidak boleh mengarang permission rule.
AI tidak boleh mencampur Campaign Mode dan Rate Card Mode.
AI tidak boleh menganggap UI state cukup hanya success state.
AI harus selalu mempertimbangkan loading, empty, error, dan unauthorized state.

---

## 3. Required Context Reading Order

Sebelum coding task besar, AI harus membaca file berikut secara berurutan.
Jangan selalu membaca semua file besar jika task kecil.
Gunakan context yang relevan sesuai task.

### 3.1 Minimal Context for Any Code Task

```txt
.agents/rules/strict-rules.md
.agents/rules/marketiv-context.md
docs/marketiv-md/implementation/05-ai-vscode-working-guide.md
```

Fungsi:
- Memastikan AI mengikuti coding style repo.
- Memastikan AI memahami domain Marketiv.
- Memastikan AI mengikuti workflow prompting.

### 3.2 Context for UI Slicing Task

```txt
docs/marketiv-md/ui-ux/01-visual-direction.md
docs/marketiv-md/ui-ux/02-design-tokens.md
docs/marketiv-md/ui-ux/03-layout-system.md
docs/marketiv-md/ui-ux/04-components-guidelines.md
docs/marketiv-md/implementation/01-slicing-roadmap.md
docs/marketiv-md/implementation/03-component-inventory.md
docs/marketiv-md/implementation/04-design-token-migration.md
```

Fungsi:
- Menjaga visual direction.
- Menjaga token consistency.
- Menghindari duplicate components.

### 3.3 Context for Route/Page Task

```txt
docs/marketiv-md/implementation/02-route-map.md
docs/marketiv-md/features/17-feature-permissions-matrix.md
docs/marketiv-md/features/18-status-lifecycle-reference.md
```

Fungsi:
- Menentukan path final.
- Menentukan role yang boleh akses.
- Menentukan status yang dipakai UI.

### 3.4 Context for Appwrite/Data Task

```txt
docs/marketiv-md/database/README.md
docs/marketiv-md/database/02-collections-schema.md
docs/marketiv-md/database/03-relationships-and-access-patterns.md
docs/marketiv-md/database/04-permissions-and-roles.md
docs/marketiv-md/technical-guidelines/04-appwrite-backend-standards.md
docs/marketiv-md/technical-guidelines/05-security-and-permissions.md
```

Fungsi:
- Mencegah AI mengarang collection atau field.
- Mencegah frontend melakukan mutation sensitif.
- Menjaga Appwrite permission boundary.

### 3.5 Context for Finance/Payment Task

```txt
docs/marketiv-md/features/11-finance-escrow-wallet-and-withdrawal.md
docs/marketiv-md/technical-guidelines/11-payment-escrow-and-financial-safety.md
docs/marketiv-md/database/02-collections-schema.md
```

Fungsi:
- Mencegah kesalahan financial state.
- Menjaga ledger dan escrow rule.
- Menjaga frontend read-only untuk saldo.

---

## 4. Prompt Template for UI Slicing

Gunakan template ini saat meminta AI membuat halaman atau komponen UI.

```md
## Context
Project: Marketiv Web.
Stack: Next.js App Router, React, TypeScript, Tailwind CSS v4.
Backend target: Appwrite, but this task is UI slicing with mock data only.
Read these files first:
- .agents/rules/strict-rules.md
- docs/marketiv-md/implementation/03-component-inventory.md
- docs/marketiv-md/implementation/04-design-token-migration.md
- docs/marketiv-md/ui-ux/02-design-tokens.md

## Task
Create [component/page name] for [role/feature].

## Scope
Files to create:
- [path]

Files allowed to edit:
- [path]

## Constraints
- Use named export.
- Use props interface.
- Use Tailwind v4 token classes.
- Do not hardcode colors.
- Do not add dependencies.
- Do not touch unrelated files.
- Include loading, empty, and error state if data-driven.
- Campaign Mode must not include chat or contact UI.

## Expected Output
Show the full content of created files only.
Explain any assumptions briefly before code.
```

---

## 5. Prompt Template for Page Route

```md
## Context
We are implementing Marketiv route from the official route map.
Read:
- docs/marketiv-md/implementation/02-route-map.md
- docs/marketiv-md/features/17-feature-permissions-matrix.md
- docs/marketiv-md/implementation/03-component-inventory.md

## Route
[route path]

## Role
[Guest / UMKM / KREATOR / ADMIN]

## Task
Create the page shell and compose existing reusable components.
Use mock data from src/data if backend is not connected.

## Constraints
- Do not create routes outside route map.
- Do not implement backend mutation.
- Do not add chat to Campaign Mode.
- Use DashboardShell for dashboard routes if available.
- Use centralized content constants.

## Expected Output
List files created/modified.
Show code for changed files.
```

---

## 6. Prompt Template for Component Refactor

```md
## Context
This is a targeted refactor in Marketiv.
Read:
- .agents/rules/strict-rules.md
- docs/marketiv-md/implementation/04-design-token-migration.md

## Problem
[Describe exact issue: hardcoded color, wrong token, duplicate component, layout bug]

## Affected Files
- [file path]

## Constraints
- Minimal diff only.
- Preserve behavior.
- Do not change unrelated styling.
- Do not reorder imports unless required.
- Do not add dependency.

## Task
Refactor only the affected component to comply with design tokens.

## Expected Output
Show minimal diff or full file as requested.
```

---

## 7. Prompt Template for Appwrite Integration Later

```md
## Context
Marketiv uses Appwrite as backend.
Read:
- docs/marketiv-md/database/02-collections-schema.md
- docs/marketiv-md/database/04-permissions-and-roles.md
- docs/marketiv-md/technical-guidelines/04-appwrite-backend-standards.md
- docs/marketiv-md/technical-guidelines/05-security-and-permissions.md

## Task
Implement [read/mutation] for [feature].

## Operation Type
[direct client read / backend-only mutation / Appwrite Function call]

## Constraints
- Do not expose Appwrite API key in browser.
- Do not mutate financial state from frontend.
- Do not update payment status from frontend.
- Do not bypass backend-only operations.
- Use collection and field names exactly from database docs.

## Expected Output
Show implementation and explain security boundary.
```

---

## 8. Forbidden AI Behaviors

AI must not do the following:
- Create new top-level `src/` folder without instruction.
- Create random `services/` or `store/` folders without instruction.
- Add Zustand setup unless asked.
- Add shadcn/ui unless asked.
- Add icon libraries unless asked.
- Add chart libraries unless asked.
- Convert Tailwind v4 project to Tailwind v3.
- Create `tailwind.config.js` unless explicitly approved.
- Use Supabase code or terminology.
- Create `supabaseClient.ts`.
- Create SQL migration files.
- Create Campaign chat route.
- Create direct WhatsApp contact in Campaign Mode.
- Update wallet balance from React component.
- Update transaction status from React component.
- Update campaign quota from React component.
- Update validation status from React component.
- Use untyped `any` casually.
- Default export reusable components if strict rules require named export.
- Put static copy directly inside many components when centralized content exists.

---

## 9. Recommended AI Task Granularity

Good AI tasks are small and scoped.
Avoid asking AI to build the entire dashboard in one prompt.
Use batch-based prompting.

Good task examples:
- Create `MetricCard` UI component only.
- Create `StatusBadge` mapping only.
- Create `DashboardShell` with mock navigation only.
- Slice `/dashboard/umkm` using existing components only.
- Replace hardcoded colors in `CampaignCard` only.
- Create dummy data for campaign dashboard only.

Bad task examples:
- Build the entire Marketiv platform.
- Make the dashboard better.
- Implement all Appwrite backend.
- Redesign everything.
- Add payment integration and UI together.
- Refactor project architecture.

---

## 10. Output Requirements for AI

For planning tasks:
- Show affected files.
- Show execution order.
- Show constraints.
- Ask no unnecessary questions if context is enough.

For coding tasks:
- Show created files.
- Show modified files.
- Use complete code for new files.
- Use minimal diff for targeted fixes if requested.
- Include short explanation only.

For review tasks:
- List issues by severity.
- Mention exact file and reason.
- Propose fix without rewriting unrelated code.

For debug tasks:
- Identify likely root cause.
- Show minimal change.
- Explain why bug happened.

---

## 11. AI Context Budget Strategy

Do not paste all docs into one prompt.
Use targeted docs depending on task.
For UI component task, do not include full database docs.
For Appwrite task, do not include full UI docs unless UI is affected.
For route task, include route map and permission matrix.
For status UI task, include status lifecycle and StatusBadge docs.
For finance task, include financial safety docs.
For AI feature task, include AI integration standards.

This keeps AI output focused and reduces hallucination.

---

## 12. Working Sequence for Slicing UI/UX

Recommended sequence:
1. Ask AI to read strict rules and implementation docs.
2. Ask AI to inspect existing files relevant to current task.
3. Ask AI to produce a short plan.
4. Approve or revise the plan.
5. Ask AI to implement one component or one page.
6. Run `npm run lint`.
7. Review responsive layout.
8. Commit small batch.
9. Continue to next component.

Do not let AI implement five pages in one response.
Small commits are easier to review and revert.

---

## 13. Review Checklist for AI Output

Before accepting AI output, check:
- Does it follow folder structure?
- Does it use named export?
- Does it use props interface?
- Does it avoid hardcoded colors?
- Does it use `next/link` for internal navigation?
- Does it use `next/image` for images?
- Does it avoid adding dependencies?
- Does it avoid Supabase references?
- Does it avoid Campaign chat?
- Does it avoid financial frontend mutation?
- Does it include loading/empty/error states when needed?
- Does it respect role-specific routes?
- Does it compile with TypeScript strict mode?
- Does it pass lint?

---

## 14. Suggested First Prompts for Next Work

### 14.1 Foundation Prompt

```md
Read .agents/rules/strict-rules.md and docs/marketiv-md/implementation/04-design-token-migration.md.
Create a focused plan to migrate globals.css tokens to the new Marketiv light mode direction.
Do not modify components yet.
Show the exact token groups you will add and which old aliases you will preserve.
```

### 14.2 Dashboard Shell Prompt

```md
Read .agents/rules/strict-rules.md, docs/marketiv-md/implementation/02-route-map.md, and docs/marketiv-md/implementation/03-component-inventory.md.
Create DashboardShell, DashboardSidebar, and DashboardTopbar components only.
Use mock navigation config.
Do not create pages yet.
Use Tailwind v4 token classes and named exports.
```

### 14.3 UMKM Dashboard Prompt

```md
Read docs/marketiv-md/implementation/01-slicing-roadmap.md, docs/marketiv-md/implementation/02-route-map.md, and docs/marketiv-md/features/04-umkm-dashboard.md.
Slice /dashboard/umkm using mock data.
Use existing foundation components.
Do not implement Appwrite integration.
Do not add chat or creator claim actions.
```

---

## 15. Final Instruction for AI

Work in small, reviewable increments.
Respect existing project style before introducing new code.
When unsure, prefer less change over broad refactor.
When a user asks for slicing, do not implement backend unless explicitly requested.
When a user asks for backend, do not redesign UI unless explicitly requested.
When a user asks for documentation, do not change source code unless explicitly requested.
Always keep Marketiv's product constraints visible: Appwrite backend, escrow safety, Campaign Mode zero-chat, Rate Card Mode chat, light mode dashboard, primary orange, and role separation.
