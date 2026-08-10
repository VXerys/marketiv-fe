# 00 — Hard Token Mode

## Rules
1. Kerjakan **1 finding per batch**.
2. Baca hanya source yang dicantumkan finding.
3. Jangan scan seluruh repo kecuali source target tidak cukup.
4. Current code > historical docs.
5. Jangan redesign/unrelated refactor.
6. Pertahankan architecture existing.
7. Reuse helper/service/function existing.
8. Jangan paste ulang source panjang.
9. Jangan mengulang audit di output.
10. Targeted verification dulu; full build di akhir batch.

## Minimal trace
Cukup trace:
`UI -> service -> Function/DB boundary`

Jika finding backend-only, jangan buka UI kecuali kontrak berubah.

## Search order
1. exact file
2. exact symbol/function
3. direct dependency
4. repo search hanya jika blocker

## Output agent
Maksimal:
```md
Diagnosis:
- max 3 bullets

Changed:
- file: change

Verify:
- command -> PASS/FAIL

Remaining:
- only real blocker
```

## Stop condition
Stop bila:
- root cause fixed;
- acceptance finding terpenuhi;
- targeted test pass.

Jangan lanjut ke finding lain otomatis.
