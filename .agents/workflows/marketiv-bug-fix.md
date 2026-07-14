---
name: marketiv-bug-fix
description: >
  Diagnoses and fixes bugs specifically for the Marketiv project (marketiv-web) —
  Next.js 16 App Router + React 19 + TypeScript + Tailwind v4 + Supabase. Use
  whenever the user reports a bug or error in Marketiv: gambar campaign/creator
  tidak muncul, hydration error, "use client" error, double submit, loading
  stuck, useEffect infinite loop/stale state, API route error, env var
  undefined, Supabase RLS query kosong, webhook Midtrans gagal, atau bug dari
  pelanggaran business rule Marketiv (chat muncul di Campaign Mode, RBAC bocor,
  kalkulasi komisi/escrow salah). Also trigger for "kenapa error", "kenapa
  gambar ga muncul", "kenapa submit dua kali", "hydration mismatch", "RLS
  kosong padahal ada datanya", or when the user pastes an error/stack trace
  from marketiv-web. Produces a precise, scope-limited fix — directly or as a
  ready-to-paste prompt for Cursor/Copilot/Claude Code — without breaking
  Marketiv's architecture or business rules.
---

# Marketiv Bug Fix Skill

Mendiagnosis root cause bug di **marketiv-web** (Next.js 16 App Router, React 19,
TypeScript, Tailwind v4, Supabase — lihat detail stack aktual di skill
`marketiv-kiro-spec-generator`), dan menghasilkan fix yang presisi dan
scope-limited: langsung sebagai diff kalau user kasih kode di chat, atau sebagai
prompt siap-tempel untuk Cursor/Copilot/Claude Code kalau user minta itu.

---

## Aturan Kritis

1. **Fix HANYA root cause.** Jangan refactor kode di luar yang diperlukan,
   jangan ganti konvensi (`cn()`, struktur `ui/features/layouts`, dsb) tanpa alasan.
2. **Jangan tambah dependency baru** tanpa bilang eksplisit ke user dulu — cek
   `package.json` dulu (saat ini belum ada `@supabase/supabase-js`,
   `midtrans-client`, `zod`, atau `react-hook-form` — kalau fix butuh salah
   satu dari ini, sebutkan sebagai keputusan terpisah, bukan diam-diam ditambahkan).
3. **Setiap fix WAJIB dicek ke Compliance Checklist Marketiv** (lihat bagian
   di bawah) — jangan sampai "fix" untuk satu bug malah melanggar business rule
   (contoh klasik: user komplain UMKM susah nanya ke kreator di Campaign Mode,
   solusi yang BENAR bukan nambahin chat, tapi arahkan ke FAQ / Rate Card Mode).
4. Kalau informasi kurang (file terkait, langkah reproduce, error message
   lengkap), **tanyakan itu dulu dalam satu batch** sebelum menebak-nebak root cause.
5. Selalu tunjukkan **root cause**, bukan cuma tempelan (patch yang cuma
   nyembunyiin gejala tanpa benerin sumbernya ditolak).

---

## Bagian A — Bug React / Next.js Umum

### 🔴 BUG-01: Gambar Eksternal Tidak Muncul (`next/image` domain belum di-whitelist)

**Symptoms:** Error `Invalid src prop ... hostname "..." is not configured under
images in your next.config.js`, atau gambar campaign/creator (yang sumbernya URL
eksternal seperti Unsplash atau nanti Supabase Storage) tidak render sama sekali.

**Root Cause:** `next/image` wajib whitelist domain eksternal — beda dari `<img>` biasa.

```typescript
// next.config.ts — WAJIB ada kalau pakai <Image src="https://..."> dari domain eksternal
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" }, // untuk Supabase Storage nanti
    ],
  },
};

export default nextConfig;
```

---

### 🔴 BUG-02: Hydration Mismatch

**Symptoms:** `Error: Text content does not match server-rendered HTML` atau
`Hydration failed because the initial UI does not match what was rendered on the server`.

**Root Causes & Fixes:**
```tsx
// ❌ CAUSE 1: Nilai berubah antara render server vs client
<p>{new Date().toLocaleString()}</p>        // beda timezone/format server vs browser
<p>{Math.random()}</p>                       // beda tiap render

// ✅ FIX: hitung di client saja, pakai useEffect + state
const [now, setNow] = useState<string | null>(null);
useEffect(() => setNow(new Date().toLocaleString()), []);
return <p>{now ?? "..."}</p>;

// ❌ CAUSE 2: Akses browser-only API langsung di render (window, localStorage)
const isMobile = window.innerWidth < 768; // crash/mismatch di server

// ✅ FIX: guard atau pindah ke useEffect
useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
```

---

### 🔴 BUG-03: Salah Taruh (atau Lupa) `"use client"`

**Symptoms:** `Error: useState only works in a Client Component` / event handler
(`onClick`, `onChange`) tidak jalan sama sekali meskipun kodenya kelihatan benar.

**Debug Checklist:**
1. Komponen pakai hook (`useState`, `useEffect`, dst) atau event handler browser? →
   wajib `"use client"` di baris paling atas file.
2. Komponen **layout** (`layout.tsx`) atau **page** (`page.tsx`) sebaiknya tetap
   Server Component — pindahkan bagian interaktif ke child component terpisah
   yang di-mark `"use client"` (lihat pola `ChatbotFab.tsx` — sudah benar: FAB
   dan panel-nya `"use client"`, tapi `layout.tsx` yang meng-import-nya tetap
   Server Component).
3. Jangan taruh `"use client"` di komponen `ui/` yang murni presentational
   kecuali memang butuh interaktivitas — biar tetap bisa di-render server-side.

---

### 🔴 BUG-04: Stale Closure / Dependency Array `useEffect` Salah

**Symptoms:** `useEffect` jalan pakai state versi lama, auto-scroll/focus tidak
update, atau效 malah infinite loop.

```tsx
// ❌ Stale closure — currentPath yang dipakai di dalam selalu versi awal
useEffect(() => {
  fetch("/api/chat", { body: JSON.stringify({ currentPath }) });
}, []); // currentPath hilang dari dependency array

// ✅ FIX: masukkan semua value dari luar closure yang dipakai di dalam
useEffect(() => {
  fetch("/api/chat", { body: JSON.stringify({ currentPath }) });
}, [currentPath]);

// ❌ Infinite loop — object/array baru dibuat tiap render masuk dependency
useEffect(() => { doSomething(options); }, [options]); // options = {} inline di render

// ✅ FIX: memoize atau pindah ke luar render, atau destructure primitive value-nya
useEffect(() => { doSomething(options); }, [options.foo, options.bar]);
```

Referensi pola yang **sudah benar** di codebase: `ChatbotPanel.tsx` — auto-scroll
`useEffect` men-declare `[messages]` sebagai dependency, dan focus-input `useEffect`
men-declare `[isOpen]`. Ikuti pola ini.

---

### 🔴 BUG-05: Double Submit / Race Condition di Form

**Symptoms:** Klik tombol submit (wizard campaign, klaim job, kirim custom offer)
memicu request 2x, atau data ke-insert duplikat.

```tsx
// ❌ Tidak ada guard — klik cepat 2x = 2 request
async function handleSubmit() {
  setIsLoading(true);
  await fetch("/api/campaigns", { method: "POST", body });
  setIsLoading(false);
}

// ✅ FIX: guard di awal + try/finally biar loading selalu ke-reset
async function handleSubmit() {
  if (isLoading) return;           // guard
  setIsLoading(true);
  try {
    await fetch("/api/campaigns", { method: "POST", body });
  } finally {
    setIsLoading(false);           // selalu reset, sukses maupun gagal
  }
}
```

Perhatikan tombol submit juga harus `disabled={isLoading}` di JSX-nya (pola ini
sudah benar di `ChatbotPanel.tsx` pada tombol kirim pesan).

---

### 🟡 BUG-06: Controlled/Uncontrolled Input Warning

**Symptoms:** Console warning `A component is changing an uncontrolled input to
be controlled`, atau input di form wizard (misal Step 3 Budget & Kuota) glitch
saat pertama kali diisi.

```tsx
// ❌ initial value undefined → jadi uncontrolled dulu, lalu controlled
const [budget, setBudget] = useState<number | undefined>(); // undefined!

// ✅ FIX: selalu inisialisasi dengan tipe & default value yang konsisten
const [budget, setBudget] = useState<string>(""); // string kosong, bukan undefined
```

---

## Bagian B — Bug Data & Backend (API Route / Supabase / Midtrans)

### 🔴 BUG-07: API Route Tidak Ada Try-Catch / Status Code Salah

**Symptoms:** Frontend selalu dapat generic error meski penyebabnya validasi
(harusnya 400) bukan server crash (500), atau sebaliknya error tertelan tanpa
pesan yang jelas ke user.

```typescript
// ❌ Tidak ada try-catch, tidak ada validasi status code
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await doSomething(body);
  return NextResponse.json(result);
}

// ✅ Pola yang benar — ikuti src/app/api/chat/route.ts yang sudah ada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.requiredField) {
      return NextResponse.json({ error: "requiredField wajib diisi" }, { status: 400 });
    }
    const result = await doSomething(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

### 🔴 BUG-08: Env Var Undefined atau Ke-expose ke Client

**Symptoms:** `process.env.X` jadi `undefined` di browser console, ATAU (lebih
bahaya) secret key kebaca di Network tab / bundle client-side.

**Debug Checklist:**
1. Value butuh dibaca di **browser**? → wajib prefix `NEXT_PUBLIC_`, dan itu
   berarti value-nya **tidak boleh secret** (contoh sah: `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`).
2. Value itu **secret** (`SUPABASE_SERVICE_ROLE_KEY`, `MIDTRANS_SERVER_KEY`,
   `OPENROUTER_API_KEY`, calon `OPENAI_API_KEY`)? → **JANGAN PERNAH** kasih prefix
   `NEXT_PUBLIC_`, dan pastikan cuma diakses di API Route / server component,
   tidak pernah di file yang ada `"use client"`.
3. Habis ubah `.env.local`? → restart `next dev`, Next.js tidak hot-reload env var.

---

### 🔴 BUG-09: Supabase RLS Bikin Query "Kosong Diam-Diam" (Setelah Supabase Terintegrasi)

**Symptoms:** Query berhasil (tidak ada error), tapi hasilnya array kosong
padahal datanya ada di database.

**Root Cause:** RLS policy aktif tapi tidak match dengan `auth.uid()` request
saat ini — Supabase **tidak** melempar error untuk row yang diblokir RLS, cuma
tidak mengembalikannya.

**Debug Checklist:**
```sql
-- Cek dulu: apakah RLS policy match dengan kondisi user yang login?
-- Contoh policy dari DATABASE.md — pastikan kolom pembanding benar
CREATE POLICY "UMKM can see own campaigns"
  ON campaigns FOR SELECT
  USING (id_umkm = auth.uid()); -- pastikan id_umkm memang UUID user yang login, bukan id lain
```
1. Test query yang sama pakai `supabaseAdmin` (service role, server-only) — kalau
   hasilnya ADA data, berarti memang RLS yang blokir, bukan query salah.
2. Pastikan client yang dipakai untuk request user biasa adalah `supabase`
   (anon key + JWT user), bukan `supabaseAdmin` — `supabaseAdmin` cuma boleh
   dipakai di operasi khusus admin/service, jangan jadi default untuk semua query.

---

### 🟠 BUG-10 (Security): Midtrans Webhook Diproses Tanpa Validasi Signature

**Symptoms:** Status transaksi bisa berubah dari request palsu ke endpoint
webhook (celah keamanan finansial — bukan sekadar bug UI).

```typescript
// ❌ Langsung percaya body webhook tanpa verifikasi
export async function POST(request: NextRequest) {
  const notification = await request.json();
  await updateTransactionStatus(notification.order_id, "Escrow"); // BAHAYA
}

// ✅ WAJIB validasi signature dulu (pakai Midtrans SDK)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const notification = await snap.transaction.notification(body); // ini yang validasi signature
  if (notification.transaction_status === "settlement" || notification.transaction_status === "capture") {
    await updateTransactionStatus(notification.order_id, "Escrow");
  }
  return NextResponse.json({ received: true });
}
```

---

## Bagian C — Regresi Business Rule Marketiv (Khusus Project Ini)

Kategori bug ini **tidak ada di project lain** — spesifik ke aturan bisnis
Marketiv. Kalau lolos, dampaknya bukan cuma bug teknis tapi pelanggaran
spesifikasi produk.

### 🟠 BUG-11: Fitur Chat/Kontak Muncul di Campaign Mode

**Symptoms:** Ada tombol chat, form kontak, link WhatsApp, atau kolom komentar
yang somehow ke-render di halaman/komponen Campaign Mode (Job Pool, detail
campaign, submit bukti tayang).

**Root Cause biasanya:** komponen chat/kontak dibuat generic dan ke-reuse tanpa
sadar di context Campaign Mode, atau kondisi mode-check hilang/salah.

**Fix:** hapus render-nya sepenuhnya di Campaign Mode (bukan cuma di-hide via
CSS `display:none` — itu tetap ada di DOM/bundle). Kalau butuh komponen serupa
untuk Rate Card Mode, pastikan ada guard eksplisit:
```tsx
{mode === "rate-card" && <ChatPanel orderId={orderId} />}
// TIDAK ADA fallback chat apapun untuk mode === "campaign"
```

---

### 🟠 BUG-12: RBAC Bypass — Role Tidak Dicek di API Route

**Symptoms:** User dengan role KREATOR bisa hit endpoint yang seharusnya cuma
untuk UMKM (atau sebaliknya), biasanya karena frontend cuma nyembunyiin tombol
tapi API route-nya tidak validasi ulang.

```typescript
// ❌ Frontend hide tombol "Buat Campaign" untuk KREATOR, tapi API tidak cek role
export async function POST(request: NextRequest) {
  const body = await request.json();
  await createCampaign(body); // siapapun yang tau endpoint-nya bisa hit ini
}

// ✅ WAJIB cek role di API route juga — jangan andalkan UI hiding saja
export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (session.role !== "UMKM") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await request.json();
  await createCampaign(body);
}
```
RLS di Supabase adalah lapisan kedua (defense-in-depth) — **bukan pengganti**
cek role di API route.

---

### 🟠 BUG-13: Kalkulasi Uang Pakai Float JavaScript Langsung

**Symptoms:** Total budget, komisi 15%/10%, atau dana tiered payout hasilnya
selisih sedikit dari yang diharapkan (contoh klasik: `0.1 + 0.2 !== 0.3` di JS).

```typescript
// ❌ Operasi float langsung untuk uang — rawan presisi salah di angka besar/berulang
const komisi = totalBudget * 0.15;

// ✅ FIX: bulatkan eksplisit di titik kritis, atau kerja dalam satuan terkecil (rupiah bulat/sen)
const komisi = Math.round(totalBudget * 0.15);
// Untuk kalkulasi berantai (lihat FEATURES.md § 2.5 tiered payout), bulatkan
// di SETIAP langkah sebelum dipakai ke langkah berikutnya, jangan cuma di akhir.
```

---

## Compliance Checklist — Cek Sebelum Kasih Fix Final

- [ ] Fix tidak menambahkan chat/kontak/komentar ke Campaign Mode
- [ ] Fix tidak bikin upload video final ke server Marketiv (harus tetap URL eksternal)
- [ ] Fix tidak melewati Escrow untuk transfer dana
- [ ] Fix tidak expose secret key ke client-side
- [ ] Fix tidak melewati validasi role/RBAC yang sudah ada
- [ ] Fix tidak menambah dependency baru secara diam-diam
- [ ] Fix konsisten dengan konvensi folder (`ui/features/layouts`) dan `cn()` helper

---

## Diagnosis Workflow

### Step 1 — Klasifikasi Bug
Cocokkan gejala ke salah satu BUG-01 s/d BUG-13. Kalau tidak jelas, tanyakan:
*"Apa yang terjadi vs yang diharapkan? Di halaman/komponen mana? Setelah aksi apa?
Ada error message atau stack trace-nya?"*

### Step 2 — Identifikasi Root Cause
Pakai debug checklist dari pattern yang cocok. Minta file terkait kalau belum dikasih.

### Step 3 — Kasih Fix

**Kalau user kasih kode langsung di chat** → tunjukkan fix sebagai diff minimal
(bagian yang berubah saja) + penjelasan 1 kalimat kenapa ini benerin root cause,
dan konfirmasi sudah lolos Compliance Checklist di atas.

**Kalau user minta prompt untuk Cursor/Copilot/Claude Code** → pakai template ini:

```
## Context
Marketiv (marketiv-web) — Next.js 16 App Router, React 19, TypeScript, Tailwind v4.
Data flow: Page (Server Component) → Feature Component (Client Component, src/components/features/) → API Route (src/app/api/.../route.ts) → Supabase.

## Bug Report
Halaman/Komponen: [...]
Trigger: [aksi user yang memicu bug]
Symptom: [apa yang terjadi]
Expected: [apa yang seharusnya terjadi]
Pattern: [BUG-0X dari Marketiv Bug Fix skill]

## Root Cause (identified)
[jelaskan 1-2 kalimat]

## Affected Files
- [file path]

## Constraints
- Fix HANYA root cause — jangan refactor kode yang tidak terkait
- Jangan ubah public API/props signature tanpa alasan
- Jangan tambah package baru tanpa persetujuan eksplisit
- Jangan langgar Marketiv hard constraints: zero-chat Campaign Mode, escrow wajib,
  RBAC check di API route, no secret key di client, max 3 rate card per kreator
- Jangan sentuh fitur yang sedang di-freeze: [isi kalau ada]

## Expected Output
Minimal diff, hanya baris yang berubah.
Jelaskan kenapa ini fix root cause dalam 1 kalimat.
```

---

## Quick Reference: Gotcha Umum Marketiv-Web

| Situasi | Pola Benar | Kesalahan Umum |
|---|---|---|
| Conditional className | `cn(base, variantStyles[variant], className)` — `className` di akhir | `className` diletakkan duluan, jadi ke-override oleh style default |
| Loading state form | `useState<boolean>` + `try { ... } finally { setIsLoading(false) }` | Reset loading cuma di happy path, macet kalau error |
| Gambar eksternal | Whitelist domain di `next.config.ts` → `images.remotePatterns` | Pakai `<Image src="https://...">` domain baru tanpa update config |
| Secret API key | Hanya di API Route/server, tanpa prefix `NEXT_PUBLIC_` | Ke-import di Client Component atau nempel di bundle browser |
| Query per role (Supabase) | Filter `auth.uid()` di RLS **dan** cek role di API route | Cuma andalkan UI hide tombol (security by obscurity) |
| Kalkulasi Rupiah | `Math.round()` di tiap langkah kalkulasi berantai | Float dibiarkan mengambang sampai step terakhir |
| `useEffect` cleanup | `return () => { clearTimeout/unsubscribe }` | Lupa cleanup → duplicate listener / memory leak |
| Webhook Midtrans | Validasi via `snap.transaction.notification(body)` dulu | Langsung pakai `body` mentah dari request tanpa verifikasi |

---

## Tips

- Kalau bug ternyata bukan bug teknis tapi gap requirement (misal: "harusnya ada
  fitur X tapi belum ada"), itu bukan scope skill ini — arahkan ke
  `marketiv-kiro-spec-generator` untuk di-spec-kan dulu sebelum dikerjakan.
- Update Bagian A/B kalau ada dependency baru resmi masuk (Supabase, Midtrans,
  dsb) — pattern di atas untuk Supabase (BUG-09) masih anticipatory karena
  client-nya belum ter-install saat skill ini dibuat.
