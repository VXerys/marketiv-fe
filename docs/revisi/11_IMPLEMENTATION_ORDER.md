# 11 — Implementation Order

## P0
1. `UMKM-SEC-01` lock orders
2. `UMKM-SEC-03` backend role guard
3. `UMKM-SEC-04` lock conversation/message
4. `UMKM-FIN-01` escrow recovery
5. `UMKM-OPS-01` live Function env/deployment

Do not combine P0 into one large refactor.

## P1
6. `UMKM-SEC-02`
7. `UMKM-FIN-02`
8. `UMKM-CAM-01`
9. `UMKM-FIN-03`
10. `UMKM-LEGAL-01`

## P2
11. `UMKM-PERF-01`
12. `UMKM-UX-01`
13. `UMKM-DATA-01`
14. `UMKM-DATA-02`
15. `UMKM-DATA-03`
16. `UMKM-NOTIF-01`
17. `UMKM-SET-01`
18. `UMKM-SET-02`
19. `UMKM-FILE-01`
20. `UMKM-PRIV-01`
21. `UMKM-SUP-01`

## P3
22. `UMKM-PROC-01`

## DoD per finding
- root cause fixed;
- no unrelated refactor;
- targeted test pass;
- negative auth/security test if relevant;
- targeted typecheck/lint;
- staging E2E for financial flow;
- evidence: commit + test result.
