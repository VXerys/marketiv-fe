"""
Pelacak progress sprint integrasi Appwrite untuk Marketiv.

Tabel SQLite (ditambahkan ke chat_history.db via db.init_db()):
  phases       — satu baris per sprint (0–5)
  phase_tasks  — checklist item per sprint

Status values:
  pending | in_progress | done | blocked
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
import re

import db
from paths import PROGRESS_FILE, MEMORY_INDEX_FILE, MEMORY_DIR

Status = Literal["pending", "in_progress", "done", "blocked", "superseded"]

# ── definisi lengkap 7 sprint ───────────────────────────────────────────────

PHASE_DEFINITIONS: list[dict] = [
    {
        "phase_no": 0,
        "name": "Fondasi Bersama",
        "tasks": [
            ("s0-env", "Isi .env + dokumentasikan NEXT_PUBLIC_USE_MOCK_DATA di .env.example"),
            ("s0-types", "Hapus status.ts & umkmDashboard.ts; perbaiki kanon tipe UMKM & Kreator"),
            ("s0-auth", "Buat AuthProvider + hook useAuth (account.get → role/status)"),
            ("s0-guard-umkm", "Buat src/app/dashboard/umkm/layout.tsx dengan role guard"),
            ("s0-guard-kreator", "Pasang role guard di src/app/dashboard/kreator/layout.tsx"),
            ("s0-backend-chat", "Tambah getConversations() di 00_BACKEND/src/services/chat.service.ts"),
            ("s0-backend-offer", "Tambah getOffers() & getOfferById() di offer.service.ts"),
            ("s0-backend-order", "Tambah getOrderById(), getDeliverables(), getRevisions() di order.service.ts"),
            ("s0-backend-claim", "Tambah getMyClaims() di claim.service.ts"),
            ("s0-backend-creator", "Tambah getRateCardById(), list-own-drafts, deleteRateCard() di creator.service.ts"),
            ("s0-backend-submission", "Tambah getSubmissionsByCampaign() di submission.service.ts"),
            ("s0-backend-asset", "Buat campaign-asset.service.ts (add/list/removeCampaignAsset)"),
            ("s0-creator-appwrite", "Buat src/services/creator/creator-appwrite.service.ts (kerangka stub)"),
            ("s0-loading-umkm", "Tambah loading.tsx di semua route UMKM"),
            ("s0-loading-kreator", "Tambah loading.tsx di semua route Kreator"),
            ("s0-tracker", "Bangun phases.py + tabel SQLite + --phase-status/--sync-progress"),
        ],
    },
    {
        "phase_no": 1,
        "name": "Read-only UMKM",
        "tasks": [
            ("s1-appwrite-read", "Implementasi 16 fungsi read di umkm-appwrite.service.ts"),
            ("s1-overview", "Overview: ganti src/data/umkmDashboard.ts bypass → getDashboardSummary/getCampaigns"),
            ("s1-creators", "Creators: ganti src/data/creators.ts + fabrikasi inline → getCreators/getCreatorById/getCreatorRateCards"),
            ("s1-creators-mock", "Hidupkan creators.mock.ts & rate-cards.mock.ts (saat ini dead code)"),
            ("s1-finance", "Finance: pakai getFinanceSummary/getEscrowOverview, bukan hitung ulang di klien"),
            ("s1-loading-timers", "Ganti semua setTimeout loading timer dengan fetch nyata di UMKM"),
            ("s1-creators-error", "Hidupkan CreatorErrorState.tsx (dead code, tidak pernah dirender)"),
            ("s1-overview-empty", "Tambah empty state Overview"),
            ("s1-submission-review", "Lengkapi layar/tab review submission per campaign (getSubmissionsByCampaign)"),
            ("s1-analytics-soon", "Tandai Analytics 'coming soon', matikan selector & tombol Export yang mati"),
            ("s1-businessname", "Ganti businessName hardcode di analitik/pengaturan/keuangan page.tsx"),
            ("s1-delete-data", "Hapus src/data/umkmDashboard.ts & src/data/creators.ts"),
        ],
    },
    {
        "phase_no": 2,
        "name": "Read-only Kreator",
        "tasks": [
            ("s2-appwrite-read", "Implementasi 11 fungsi read di creator-appwrite.service.ts"),
            ("s2-remove-creator002", "Ganti hardcode creator_002 → userId dari useAuth di semua service call"),
            ("s2-profil-settings", "Wire Profil/Settings ke service (hapus unsplash fallback, email/sesi hardcode)"),
            ("s2-rate-card", "Wire Rate Card read (termasuk draft list, bukan hanya published)"),
            ("s2-job-pool", "Wire Job Pool → hapus MOCK_BRIEF di JobDetailView.tsx:46-90"),
            ("s2-pekerjaan-aktif", "Wire Pekerjaan Aktif → hapus dummyViews & mockViews, URL Drive hardcode"),
            ("s2-negosiasi", "Wire Negosiasi list & room (read)"),
            ("s2-keuangan", "Wire Keuangan kreator → hapus label 'menunggu persetujuan'"),
            ("s2-simulated-flags", "Hapus semua flag *Simulated di semua view kreator"),
            ("s2-profil-orphan", "Hapus ProfilView.tsx (orphan, tidak pernah dirender) atau merge ke SettingsView"),
            ("s2-mockOrdersCount", "Hapus mockOrdersCount = 14 di RateCardView.tsx:297"),
            ("s2-ui-expired", "Tambah tampilan state 'expired' klaim & badge fraudStatus terpisah"),
        ],
    },
    {
        "phase_no": 3,
        "name": "Write Satu-Sisi",
        "tasks": [
            ("s3-write-foundation", "Ekstrak helper ServiceResult ke src/services/shared + FUNCTION_IDS aksi + helper upload storage"),
            ("s3-zod-modules", "Buat skema Zod per modul di src/lib/validations/ (campaign, withdrawal, rate-card, profile); offer ditunda ke Sprint 4"),
            ("s3-ssr-session", "Pindahkan baca 4 route dari Server Component ke klien — prasyarat verifikasi Appwrite nyata"),
            ("s3-wizard-real", "Wizard campaign: tulis campaigns+campaign_briefs+campaign_assets (draft) → create-payment → Snap; publish→active tetap Sprint 4"),
            ("s3-budget-min", "Selaraskan minimum budget wizard Rp100.000 → MINIMUM_CAMPAIGN_BUDGET Rp50.000"),
            ("s3-fee-buyer", "Satukan biaya platform ke 2% (3 komponen masih hardcode 0.15)"),
            ("s3-ai-brief", "Wire ai-brief sebagai aksi eksplisit; pertahankan BriefQualityCard sebagai form indicator"),
            ("s3-umkm-settings", "Settings UMKM: toast palsu → updateProfile + validasi Zod"),
            ("s3-campaign-cancel-dup", "Wire jeda/duplicate campaign (hapus id fake campaign_new_${Date.now()})"),
            ("s3-rate-card-crud", "Wire CRUD rate card kreator (create/update/delete/publish draft), 1 rate_cards per paket"),
            ("s3-kreator-profil", "Wire update profil kreator + upload avatar ke bucket avatars + akun sosial + portofolio CRUD"),
            ("s3-withdraw", "Function request-withdrawal + wiring penarikan kreator; hapus ADMIN_FEE karangan"),
            ("s3-payment-fix", "Fix create-payment tulis total_amount/fee_amount/campaign_id + webhook bandingkan total_amount"),
            ("s3-backend-handoff", "Tulis handoff Sprint 3 ke 00_BACKEND/integration-context/ (permintaan kolom, temuan, status verifikasi)"),
        ],
    },
    {
        "phase_no": 4,
        "name": "Alur Lintas-Role",
        "tasks": [
            ("s4-ppv-publish", "Alur A: UMKM buat + top-up + publish campaign jadi active"),
            ("s4-ppv-claim", "Alur A: Kreator klaim campaign (campaign-claimed Function)"),
            ("s4-ppv-submit", "Alur A: Kreator submit bukti URL TikTok → ai-fraud-precheck"),
            ("s4-ppv-review", "Alur A: UMKM review approve/reject submission (hanya status pending)"),
            ("s4-ppv-reward", "Alur A: approve → calculate-campaign-reward → pendingBalance bertambah"),
            ("s4-ppv-expire", "Alur A: verifikasi expire-stale-claims"),
            ("s4-rc-chat", "Alur B: UMKM browse kreator → chat createConversation"),
            ("s4-rc-offer", "Alur B: UMKM kirim Custom Offer (createOffer, UMKM-only)"),
            ("s4-rc-accept", "Alur B: Kreator accept offer → create-order Function (no double-trigger)"),
            ("s4-rc-payment", "Alur B: UMKM bayar → create-escrow"),
            ("s4-rc-deliverable", "Alur B: Kreator upload deliverable"),
            ("s4-rc-approve", "Alur B: UMKM approve → release-escrow (fee 2% seller-side per ADR-008, tidak optimistis completed)"),
            ("s4-rc-withdraw", "Alur B: saldo kreator bertambah → withdraw"),
            ("s4-clean-negroom", "Hapus auto-reply palsu, escrow setState lokal, window.location.reload di NegotiationRoomPage"),
            ("s4-clean-rcoffer", "Hapus special-case orderId === rc-offer-simulated"),
            ("s4-clean-submission", "Hapus review submission dihitung lokal di CampaignDetailPage"),
            ("s4-clean-finance", "Hapus handlePaymentSuccess mutasi lokal + MID-DEMO fabrikasi di FinanceOverviewPage"),
            ("s4-no-chat-campaign", "Verifikasi Campaign Mode zero chat: tidak ada komponen chat di Job Pool & pekerjaan aktif campaign"),
        ],
    },
    {
        "phase_no": 5,
        "name": "Hardening",
        # Prefiks [FE]/[BE] menandai siapa yang mengeksekusi. [BE] = wewenang tim
        # backend (push/deploy/permission/scopes); frontend hanya menyiapkan
        # handoff-nya. Lihat memori feedback_function_deploy_is_backend_team.
        "tasks": [
            # ── temuan validasi 2026-07-28 (docs/audits/2026-07-28-validasi-sidebar-integrasi.md)
            ("s5-ssr-to-client", "[FE] Pindahkan 8 route Server Component ke klien — sesi Appwrite hidup di browser"),
            ("s5-overview-dto", "[FE] Sambungkan getOverview() ke Function get-umkm-dashboard-summary"),
            ("s5-sidebar-fabrikasi", "[FE] Buang 2 panel hardcode di DashboardSidebar & CreatorDashboardSidebar"),
            ("s5-notifikasi-wire", "[FE] Sambungkan /notifikasi kedua role ke collection notifications"),
            ("s5-businessname-hardcode", "[FE] Hapus 7 fallback 'Dapur Sehat Sukabumi' — kegagalan baca harus tampil sebagai kegagalan"),
            ("s5-deploy-alur-b", "[BE] Deploy §B handoff Alur B: 2 Function baru, 6 diperbarui, harden-permissions gel. 3 & 4"),
            # ── rencana Sprint 5 semula
            ("s5-realtime", "[FE] Aktifkan realtime chat & badge notifikasi via src/lib/appwrite/realtime.ts"),
            # Breakdown 2026-07-29. Parent lama di bawah dimigrasikan menjadi
            # `superseded`: komponen bukan lima fork yang setara, sehingga satu
            # task "migrasi" memaksa redesign yang tidak diperlukan.
            ("s5-umkm-shared-map", "[FE] Petakan penggunaan primitive UMKM; tetapkan batas API ResponsiveDataRow yang tidak ekuivalen"),
            ("s5-umkm-progress-canonical", "[FE] Jadikan DashboardProgress bertoken sebagai implementasi kanonik; hapus versi deprecated bergradien mentah"),
            ("s5-umkm-barrel-consolidate", "[FE] Verifikasi dan pertahankan DashboardButton/DashboardCard sebagai re-export tipis ke shared"),
            ("s5-umkm-responsive-row-contract", "[FE] Pertahankan dua kontrak ResponsiveDataRow; ekstrak hanya primitive rendah yang benar-benar sama"),
            ("s5-primitive-kreator", "[FE] Hapus Creator* lokal (EmptyState/ErrorState/Skeleton/StatusBadge/MetricCard) → ui/*"),
            ("s5-metric-unify", "[FE] Satukan 3 implementasi metric card kreator"),
            ("s5-modal-unify", "[FE] Ganti modal hand-roll (RateCardView, SettingsView) → DashboardModal"),
            # Breakdown 2026-07-29. Baseline 139 hex di 12 file: pekerjaan ini
            # perlu kontrak token, batch per surface, lalu verifikasi residual.
            ("s5-theme-inventory", "[FE] Catat baseline hex kreator dan peta setiap warna ke token semantik"),
            ("s5-theme-token-contract", "[FE] Lengkapi kontrak token tema kreator di globals.css sebelum mengganti pemakaian"),
            ("s5-theme-dashboard", "[FE] Tokenisasi surface dashboard kreator tanpa mengubah makna status"),
            ("s5-theme-workspace", "[FE] Tokenisasi Pekerjaan Aktif dan Keuangan kreator"),
            ("s5-theme-settings-modals", "[FE] Tokenisasi Settings, Rate Card, dan modal kreator"),
            ("s5-theme-residual", "[FE] Bersihkan hex kreator tersisa; kecualikan nilai yang memang data/asset"),
            ("s5-theme-verify", "[FE] Verifikasi scan hex, typecheck, dan lint file per batch tokenisasi"),
            ("s5-xlsx-fix", "[FE] Perbaiki export .xlsx yang menghasilkan bytes CSV"),
            ("s5-skill-update", "[FE] Update skill marketiv-data-contracts: RateCard, DeliverableStatus, OfferStatus"),
            ("s5-backend-confirm", "[BE] Konfirmasi ke pemilik backend: AdminWithdrawReview, state funded, notify-client-review"),
            # Mock tidak boleh dimatikan saat database live kosong: dashboard
            # berubah menjadi empty state dan mengaburkan review UI. Gate ini
            # sengaja mengikuti E2E dua akun Sprint 6.
            ("s5-mock-off-prerequisites", "[FE] Siapkan gate data nyata dan E2E dua akun; mock tetap ON selama review UI"),
            ("s5-mock-off-staging", "[FE] Set NEXT_PUBLIC_USE_MOCK_DATA=false di staging setelah gate E2E lulus"),
        ],
    },
    {
        "phase_no": 6,
        "name": "Autentikasi",
        # Rencana lengkap: docs/audits/2026-07-28-sprint-6-auth-plan.md
        # Prasyarat demo 2 akun — bukan lanjutannya. Lihat §B1 dokumen validasi.
        "tasks": [
            ("s6-session-fix", "[FE] Perbaiki getSession(): query users lewat kolom userId, bukan $id"),
            ("s6-auth-service", "[FE] Buat auth.service.ts — register/login/OAuth/recovery dengan pola ServiceResult"),
            ("s6-zod-auth", "[FE] Skema Zod src/lib/validations/auth.schema.ts (login, register 2 role, forgot, reset)"),
            ("s6-route-group", "[FE] Route group src/app/(auth)/ + layout + redirect bila sesi sudah ada"),
            ("s6-login", "[FE] Halaman /login — email+password, tombol Google, hormati ?next="),
            ("s6-register", "[FE] Halaman /register — form dinamis ?role=, alur sinkron create-user-profile"),
            ("s6-forgot", "[FE] Halaman /lupa-password — createRecovery() + layar konfirmasi"),
            ("s6-reset", "[FE] Halaman /reset-password — updateRecovery() dari userId & secret di query"),
            ("s6-oauth-google", "[FE] Google OAuth + halaman callback; UMKM lengkapi data tambahan"),
            ("s6-guard-redirect", "[FE] RoleGuard redirect ke /login?next=; cabut bypass mode mock"),
            ("s6-logout", "[FE] Sambungkan modal logout kedua sidebar ke logout() + redirect /login"),
            ("s6-navbar-cta", "[FE] Navbar & landing: Masuk → /login, Daftar → /register?role="),
            ("s6-status-suspended", "[FE] Tolak login akun suspended dengan pesan eksplisit"),
            ("s6-backend-handoff", "[BE] Handoff backend: execute permission create-user-profile, OAuth Google, URL recovery"),
            ("s6-e2e-2akun", "[FE] E2E: daftar + login 1 akun UMKM & 1 akun Kreator dengan mock OFF"),
        ],
    },
]


LEGACY_SPRINT5_TASKS = {
    "s5-primitive-umkm": (
        "[FE] Migrasi 5 fork umkm-dashboard/shared/* → src/components/ui/*",
        "Dipecah menjadi s5-umkm-shared-map, s5-umkm-progress-canonical, "
        "s5-umkm-barrel-consolidate, dan s5-umkm-responsive-row-contract.",
    ),
    "s5-theme-tokens": (
        "[FE] Tokenisasi tema kreator (gradien biru-violet vs orange vs violet #7c3aed)",
        "Dipecah menjadi s5-theme-inventory, s5-theme-token-contract, s5-theme-dashboard, "
        "s5-theme-workspace, s5-theme-settings-modals, s5-theme-residual, dan s5-theme-verify.",
    ),
    "s5-mock-off": (
        "[FE] Set NEXT_PUBLIC_USE_MOCK_DATA=false sebagai default staging",
        "Dipecah menjadi s5-mock-off-prerequisites dan s5-mock-off-staging; "
        "menunggu E2E dua akun karena data live masih kosong.",
    ),
}

MIGRATION_DONE_TASKS = {
    "s5-umkm-shared-map": "Audit sudah selesai: ResponsiveDataRow punya kontrak berbeda dan tidak boleh dipaksa menyatu.",
    "s5-umkm-barrel-consolidate": "Sudah diverifikasi: DashboardButton dan DashboardCard adalah re-export tipis.",
    "s5-umkm-responsive-row-contract": "Keputusan arsitektur sudah dibuat: dua API dipertahankan; bukan target rename/redesign.",
    "s5-theme-inventory": "Baseline sudah tercatat: 139 hex mentah di 12 file kreator.",
}


# ── helpers ──────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def seed_phases() -> None:
    """Insert semua phase + task ke SQLite jika belum ada (idempoten)."""
    db.init_db()
    with db.get_connection() as conn:
        for phase in PHASE_DEFINITIONS:
            conn.execute(
                "INSERT OR IGNORE INTO phases (phase_no, name, status) VALUES (?, ?, 'pending')",
                (phase["phase_no"], phase["name"]),
            )
            for key, title in phase["tasks"]:
                conn.execute(
                    "INSERT OR IGNORE INTO phase_tasks (key, phase_no, title, status) VALUES (?, ?, ?, 'pending')",
                    (key, phase["phase_no"], title),
                )
    _migrate_sprint5_breakdown()


def _migrate_sprint5_breakdown() -> None:
    """Preserve parent history while replacing oversized Sprint 5 tasks."""
    with db.get_connection() as conn:
        for key, (title, note) in LEGACY_SPRINT5_TASKS.items():
            conn.execute(
                "INSERT OR IGNORE INTO phase_tasks (key, phase_no, title, status, note) VALUES (?, 5, ?, 'superseded', ?)",
                (key, title, note),
            )
            conn.execute(
                "UPDATE phase_tasks SET status='superseded', note=?, updated_at=? "
                "WHERE key=? AND phase_no=5 AND status NOT IN ('done', 'superseded')",
                (note, _now(), key),
            )
        for key, note in MIGRATION_DONE_TASKS.items():
            conn.execute(
                "UPDATE phase_tasks SET status='done', note=?, updated_at=? "
                "WHERE key=? AND phase_no=5 AND status!='done'",
                (note, _now(), key),
            )


def bootstrap_from_progress_snapshot() -> bool:
    """Restore an empty local tracker from memory without overwriting live state."""
    db.init_db()
    with db.get_connection() as conn:
        if conn.execute("SELECT COUNT(*) FROM phase_tasks").fetchone()[0]:
            return False
    if not PROGRESS_FILE.exists():
        raise FileNotFoundError(f"Progress snapshot tidak ditemukan: {PROGRESS_FILE}")

    seed_phases()
    text = PROGRESS_FILE.read_text(encoding="utf-8")
    icon_status = {"✅": "done", "🔄": "in_progress", "🚫": "blocked", "⬜": "pending"}
    phase_re = re.compile(r"^##\s+([✅🔄🚫⬜])\s+Sprint\s+(\d+)", re.MULTILINE)
    task_re = re.compile(r"^-\s+([✅🔄🚫⬜])\s+`([^`]+)`", re.MULTILINE)
    with db.get_connection() as conn:
        for icon, phase_no in phase_re.findall(text):
            conn.execute("UPDATE phases SET status=? WHERE phase_no=?", (icon_status[icon], int(phase_no)))
        for icon, key in task_re.findall(text):
            conn.execute("UPDATE phase_tasks SET status=?, updated_at=? WHERE key=?", (icon_status[icon], _now(), key))

    _migrate_sprint5_breakdown()
    return True


def set_phase_status(phase_no: int, status: Status, note: str = "") -> None:
    db.init_db()
    now = _now()
    with db.get_connection() as conn:
        if status == "in_progress":
            conn.execute(
                "UPDATE phases SET status=?, started_at=? WHERE phase_no=?",
                (status, now, phase_no),
            )
        elif status == "done":
            conn.execute(
                "UPDATE phases SET status=?, completed_at=? WHERE phase_no=?",
                (status, now, phase_no),
            )
        else:
            conn.execute(
                "UPDATE phases SET status=? WHERE phase_no=?",
                (status, phase_no),
            )


def set_task_status(task_key: str, status: Status, note: str = "") -> None:
    db.init_db()
    with db.get_connection() as conn:
        conn.execute(
            "UPDATE phase_tasks SET status=?, note=?, updated_at=? WHERE key=?",
            (status, note or None, _now(), task_key),
        )


def get_progress() -> list[dict]:
    """Return list phase dicts, masing-masing berisi tasks list."""
    db.init_db()
    with db.get_connection() as conn:
        phases = conn.execute(
            "SELECT phase_no, name, status, started_at, completed_at FROM phases ORDER BY phase_no"
        ).fetchall()
        tasks = conn.execute(
            "SELECT key, phase_no, title, status, note, updated_at FROM phase_tasks ORDER BY phase_no, key"
        ).fetchall()

    tasks_by_phase: dict[int, list] = {}
    for t in tasks:
        tasks_by_phase.setdefault(t["phase_no"], []).append(dict(t))

    return [
        {**dict(p), "tasks": tasks_by_phase.get(p["phase_no"], [])}
        for p in phases
    ]


def _status_icon(status: str) -> str:
    return {"done": "✅", "in_progress": "🔄", "blocked": "🚫", "pending": "⬜", "superseded": "⏭️"}.get(status, "⬜")


def render_markdown() -> str:
    """Hasilkan konten integration_progress.md."""
    now = _now()[:19].replace("T", " ")
    progress = get_progress()

    lines = [
        "---",
        "name: integration-progress",
        "description: Status sprint integrasi Appwrite Marketiv — diperbarui tiap sesi",
        "metadata:",
        "  type: project",
        f"  updated_at: {now}",
        "---",
        "",
        "# Progress Integrasi Appwrite — Marketiv",
        "",
        f"_Terakhir diperbarui: {now} UTC_",
        "",
    ]

    for phase in progress:
        active_tasks = [t for t in phase["tasks"] if t["status"] != "superseded"]
        total = len(active_tasks)
        done = sum(1 for t in active_tasks if t["status"] == "done")
        pct = int(done / total * 100) if total else 0
        icon = _status_icon(phase["status"])
        lines.append(f"## {icon} Sprint {phase['phase_no']} — {phase['name']} ({done}/{total} · {pct}%)")
        lines.append("")
        for task in phase["tasks"]:
            t_icon = _status_icon(task["status"])
            note_str = f" _{task['note']}_" if task.get("note") else ""
            lines.append(f"- {t_icon} `{task['key']}` {task['title']}{note_str}")
        lines.append("")

    return "\n".join(lines)


def write_progress() -> None:
    """Tulis integration_progress.md ke MEMORY_DIR dan pastikan terdaftar di MEMORY.md."""
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(render_markdown(), encoding="utf-8")

    # Pastikan ada pointer di MEMORY.md
    if MEMORY_INDEX_FILE.exists():
        index = MEMORY_INDEX_FILE.read_text(encoding="utf-8")
        pointer = "- [Integration Progress](integration_progress.md)"
        if "integration_progress.md" not in index:
            with MEMORY_INDEX_FILE.open("a", encoding="utf-8") as f:
                f.write(f"\n{pointer} — Status sprint integrasi Appwrite (Phase 0–5)\n")


def print_status_table() -> None:
    progress = get_progress()
    print()
    print("=" * 65)
    print("  Sprint Integrasi Appwrite — Marketiv")
    print("=" * 65)
    for phase in progress:
        active_tasks = [t for t in phase["tasks"] if t["status"] != "superseded"]
        total = len(active_tasks)
        done = sum(1 for t in active_tasks if t["status"] == "done")
        blocked = sum(1 for t in phase["tasks"] if t["status"] == "blocked")
        pct = int(done / total * 100) if total else 0
        icon = _status_icon(phase["status"])
        print(f"\n  {icon} Sprint {phase['phase_no']}: {phase['name']}")
        print(f"     Progress : {done}/{total} tasks selesai ({pct}%)")
        if blocked:
            print(f"     Blocked  : {blocked} task")
        for task in phase["tasks"]:
            if task["status"] != "pending":
                t_icon = _status_icon(task["status"])
                print(f"     {t_icon} [{task['key']}] {task['title'][:55]}")
    print()
    print("=" * 65)
