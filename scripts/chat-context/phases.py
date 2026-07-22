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

import db
from paths import PROGRESS_FILE, MEMORY_INDEX_FILE, MEMORY_DIR

Status = Literal["pending", "in_progress", "done", "blocked"]

# ── definisi lengkap 6 sprint ───────────────────────────────────────────────

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
            ("s3-zod-modules", "Buat skema Zod per modul di src/lib/validations/ (campaign, offer, withdrawal, rate-card, profile)"),
            ("s3-wizard-real", "Wizard campaign: ganti setTimeout → create → createPayment(campaign) → Snap → webhook → publish"),
            ("s3-budget-min", "Selaraskan minimum budget wizard Rp100.000 → MINIMUM_CAMPAIGN_BUDGET Rp50.000"),
            ("s3-fee-buyer", "Verifikasi fee buyer-side di EscrowSimulationCard & PaymentSimulationModal"),
            ("s3-ai-brief", "Wire ai-brief sebagai aksi eksplisit; pertahankan BriefQualityCard sebagai form indicator"),
            ("s3-umkm-settings", "Settings UMKM: toast palsu → updateProfile + validasi Zod"),
            ("s3-campaign-cancel-dup", "Wire cancel/duplicate campaign (hapus id fake campaign_new_${Date.now()})"),
            ("s3-rate-card-crud", "Wire CRUD rate card kreator (create/update/delete/publish draft)"),
            ("s3-kreator-profil", "Wire update profil kreator + upload avatar/banner via validate-and-upload Function"),
            ("s3-withdraw", "Wire requestWithdraw kreator — validasi ≥ Rp50.000 & ≤ saldo, direct processed"),
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
            ("s4-rc-approve", "Alur B: UMKM approve → release-escrow (fee 5% seller-side, tidak optimistis completed)"),
            ("s4-rc-withdraw", "Alur B: saldo kreator bertambah → withdraw"),
            ("s4-clean-negroom", "Hapus auto-reply palsu, localStorage escrow, window.location.reload di NegotiationRoomPage"),
            ("s4-clean-rcoffer", "Hapus special-case orderId === rc-offer-simulated"),
            ("s4-clean-submission", "Hapus review submission dihitung lokal di CampaignDetailPage"),
            ("s4-clean-finance", "Hapus handlePaymentSuccess mutasi lokal + MID-DEMO fabrikasi di FinanceOverviewPage"),
            ("s4-no-chat-campaign", "Verifikasi Campaign Mode zero chat: tidak ada komponen chat di Job Pool & pekerjaan aktif campaign"),
        ],
    },
    {
        "phase_no": 5,
        "name": "Hardening",
        "tasks": [
            ("s5-realtime", "Aktifkan realtime chat & badge notifikasi via src/lib/appwrite/realtime.ts"),
            ("s5-primitive-umkm", "Migrasi 5 fork umkm-dashboard/shared/* → src/components/ui/*"),
            ("s5-primitive-kreator", "Hapus Creator* lokal (EmptyState/ErrorState/Skeleton/StatusBadge/MetricCard) → ui/*"),
            ("s5-metric-unify", "Satukan 3 implementasi metric card kreator"),
            ("s5-modal-unify", "Ganti modal hand-roll (RateCardView, SettingsView) → DashboardModal"),
            ("s5-theme-tokens", "Tokenisasi tema kreator (gradien biru-violet vs orange vs violet #7c3aed)"),
            ("s5-xlsx-fix", "Perbaiki export .xlsx yang menghasilkan bytes CSV"),
            ("s5-skill-update", "Update skill marketiv-data-contracts: RateCard, DeliverableStatus, OfferStatus"),
            ("s5-backend-confirm", "Konfirmasi ke pemilik backend: AdminWithdrawReview, state funded, notify-client-review"),
            ("s5-mock-off", "Set NEXT_PUBLIC_USE_MOCK_DATA=false sebagai default staging"),
        ],
    },
]


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
    return {"done": "✅", "in_progress": "🔄", "blocked": "🚫", "pending": "⬜"}.get(status, "⬜")


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
        total = len(phase["tasks"])
        done = sum(1 for t in phase["tasks"] if t["status"] == "done")
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
        total = len(phase["tasks"])
        done = sum(1 for t in phase["tasks"] if t["status"] == "done")
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
