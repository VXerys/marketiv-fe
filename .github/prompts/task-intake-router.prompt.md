---
description: "Use when starting a new request and unsure which agent to pick; route through Task Intake Router Agent with minimal ambiguity and fast delegation. Keywords: default intake, choose agent, route request, first prompt."
argument-hint: "Paste your task context using the short intake template"
agent: "Task Intake Router Agent"
---
Gunakan prompt ini saat user belum yakin agent mana yang harus dipilih.

Template intake singkat (isi seperlunya):
- Goal utama:
- Context singkat:
- Scope file/area (jika tahu):
- Jenis task: coding | audit-only | route integration | pre-merge | release summary | belum yakin
- Risiko yang dikhawatirkan (opsional):
- Batasan penting (opsional):
- Output yang diinginkan:

Tugas kamu:
1. Klasifikasikan intent user dengan singkat.
2. Pilih agent terbaik (atau urutan agent) beserta alasan ringkas.
3. Jika intent ambigu, tanya maksimal 2 pertanyaan klarifikasi.
4. Jika intent jelas, langsung delegasikan sesuai urutan aman.
5. Kembalikan output dalam format:
   - Intent Classification
   - Selected Agent(s) and Why
   - Delegation Plan and Order
   - Handoff Prompt Draft per agent
   - Next Step for User

Input user:
{{input}}
