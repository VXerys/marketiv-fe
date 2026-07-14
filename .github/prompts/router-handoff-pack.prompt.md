---
description: "Use when converting Task Intake Router output into ready-to-send handoff prompts so specialist agents can be invoked without rewriting context. Keywords: handoff pack, delegation prompt, router output, specialist invocation."
argument-hint: "Paste router output and ask for clean handoff prompts"
agent: "Task Intake Router Agent"
---
Gunakan prompt ini setelah router memberi rencana delegasi, agar tiap handoff siap pakai tanpa editing manual.

Tugas kamu:
1. Ambil hasil routing yang diberikan user.
2. Ubah menjadi paket handoff prompt siap kirim ke setiap agent target.
3. Pastikan tiap prompt memuat: tujuan, scope, constraints, expected output.
4. Jaga prompt tetap ringkas, spesifik, dan bebas ambiguitas.
5. Jika data penting hilang, tanya maksimal 2 pertanyaan klarifikasi.

Format output wajib:
1. Execution Order
2. Handoff Prompt 1
3. Handoff Prompt 2
4. Handoff Prompt N (sesuai jumlah agent)
5. Final Gate Reminder (jika relevan)

Input user:
{{input}}
