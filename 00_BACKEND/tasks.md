1. SKEMA & CONFIG
   - Tambah kolom ke order: review_deadline_at (datetime, optional), auto_approved (boolean, optional, default false), revision_count (int, optional, default 0), revision_limit (int, optional, default 0), reminder_sent_at (datetime, optional)
   - Edit di `appwrite/generate_appwrite_json.cjs` dan `appwrite.config.json` MANUAL (jangan jalankan script generate).
   - Pastikan Appwrite console live diupdate menggunakan MCP untuk `orders` collection (`databases/6a4c8598001da3b0d7f0/collections/orders/attributes/...`).

2. FUNCTION 1: track-order-review
   - Event-driven: "databases.6a4c8598001da3b0d7f0.tables.deliverables.rows.*.create"
   - Daftarkan di MCP (console live), lalu update `appwrite.config.json`, `appwrite/function-scopes.json`.
   - Kode: load order. If status ∉ {in_progress, revision} -> return "ignored".
   - Set deadline = deliverable.createdAt + 3 hari. 
   - revision_count = max(existing, deliverable.version - 1). 
   - revision_limit = dari order.offerId atau packageId.
   - Idempoten: hitung dari createdAt. Guard: jika ada deadline & version <= existing yg dihitung.

3. FUNCTION 2: auto-approve-orders
   - Cron "0 * * * *"
   - Daftarkan di MCP, update `appwrite.config.json`, `appwrite/function-scopes.json`.
   - Loop `deliverables` dg status="submitted/delivered".
   - Cek order status ∈ {in_progress, revision}. Skip "dispute". Skip "approved".
   - `now >= deadline` -> set deliverable status="approved" (memicu event `release-escrow`), set order.auto_approved = true. Notif: "Tenggat review lewat...".
   - Loop `orders` utk Reminder H-1: deadline dlm 24j, reminder_sent_at kosong. Notif UMKM, isi reminder_sent_at.

4. DOCS
   - Update docs/02_Modules/Orders/50_Database.md (orders table).
   - Update docs/02_Modules/Orders/30_Business_Rules.md (1 permintaan = 1 revisi, timer reset).
   - Update docs/02_Modules/Orders/70_Backend.md (track & auto-approve, payload).
   - Update docs/02_Modules/Orders/90_Events.md (event baru deliverables).

5. TESTS
   - tests/integration/functions.test.ts (tambah case sesuai permintaan).

6. VALIDASI & LAPORAN
   - Pastikan semua file termutasi dan test hijau. MCP sinkron dg repo.
