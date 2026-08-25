# Marketiv Stabilization & Bug Burn-down Spec v1

## 1. Purpose

Dokumen ini adalah **execution specification** untuk menutup backlog bug, correctness issue, regression, UAT gap, dan QA debt Marketiv yang masih relevan pada branch `staging`, dengan fokus menyelesaikan sebanyak mungkin masalah dalam satu stabilization run tanpa merusak area yang sedang dikerjakan anggota tim lain.

Spec ini dibuat untuk digunakan oleh **Codex** sebagai engineering agent utama.

Target utamanya bukan “mengubah semua card Trello menjadi Done”, melainkan:

1. melakukan rekonsiliasi antara Trello dan repository current;
2. memperbaiki bug yang benar-benar masih ada;
3. tidak mengulang implementasi bug yang sudah diperbaiki oleh Spec 01–03 atau commit baru;
4. menutup P0/P1 non-withdrawal berdasarkan source of truth current;
5. menjalankan acceptance test yang relevan;
6. menambah regression test pada setiap bug yang benar-benar diperbaiki;
7. melakukan full verification gate di akhir;
8. menghasilkan deployment handoff yang jelas untuk frontend, Appwrite schema, dan Appwrite Functions;
9. tidak menyentuh withdrawal.

## 2. Repository

Repository:

`marketiv-id/marketiv-web`

Target branch:

`staging`

Latest remote commit yang diamati saat spec disusun:

`14fe080d89fb56050d878d6fd0fd0b0103a737a2`

Message:

`feat(negotiation): implement custom offer workflows and backend functions`

Codex **tidak boleh mengasumsikan commit ini masih HEAD ketika mulai bekerja**. Current local `staging` harus diperiksa ulang saat execution.

## 3. Source hierarchy

Untuk stabilization run ini gunakan urutan sumber berikut:

1. **Current local repository / current staging code**
2. Current Appwrite schema/config/function wiring dalam repository
3. Current tests
4. Current Trello bug/UAT cards
5. Current workflow/business-rule docs
6. Older docs / older Trello baseline hanya sebagai historical reference

Jika Trello mengatakan bug masih open tetapi current code sudah memperbaikinya:

`repository current wins`.

Card tersebut masuk kategori `VERIFY_ONLY` atau `ALREADY_FIXED_VERIFIED`, bukan diimplementasikan ulang.

Jika dokumentasi lama berbeda dengan current code, jangan diam-diam digabungkan.

## 4. Stabilization philosophy

Ini adalah **bug burn-down**, bukan rewrite.

Rules:

- preserve architecture jika masih layak;
- perubahan minimal tetapi production-grade;
- jangan melakukan unrelated refactor;
- jangan mengubah Campaign menjadi Rate Card atau sebaliknya;
- financial state harus server-authoritative;
- permission/auth harus fail-closed;
- jangan membuat fake validation;
- jangan membuat arbitrary business rule;
- setiap bug yang diperbaiki harus punya regression coverage yang masuk akal;
- full test dilakukan di akhir, targeted test boleh dilakukan selama implementation.

## 5. High-level execution

Urutan:

1. Baseline + working-tree safety
2. Trello ↔ current code reconciliation
3. P0: Admin verified views
4. P0: Rate Card Collab Post settlement safety
5. P1: fee disclosure/config consistency
6. Verify existing Rate Card Spec 01–03
7. Non-withdrawal UAT bug discovery/fix pass
8. Campaign UI/UX correctness polish bila waktu cukup
9. Playwright critical flows non-withdrawal
10. Full verification
11. Deployment matrix
12. Trello status proposal

## 6. Hard exclusion

**Withdrawal is completely out of scope.**

Withdrawal sedang dikerjakan oleh tim backend lain.

Baca:

`02_SCOPE_AND_GUARDRAILS.md`

sebelum melakukan edit apa pun.

## 7. Definition of Done

Stabilization run selesai bila:

- setiap candidate Trello item sudah diklasifikasikan;
- P0 non-withdrawal yang bisa diselesaikan secara benar sudah ditutup atau diberi blocker eksplisit;
- P1 relevant sudah fixed atau verified stale;
- Rate Card Spec 01–03 tidak mengalami regression;
- targeted regression tests tersedia;
- full code gates dijalankan;
- critical Playwright non-withdrawal dijalankan/diperbaiki semampunya;
- deployment/redeploy list tersedia;
- tidak ada withdrawal-specific code yang berubah;
- runtime-only gap dibedakan dari code-level completion;
- tidak ada completion claim yang tidak dibuktikan.
