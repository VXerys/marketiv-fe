"""
Entry point untuk chat context manager Marketiv.

Usage:
  python main.py --ingest            Proses sesi baru dari sessions_staging.json
  python main.py --status            Tampilkan status database
  python main.py --search <query>    Cari di summary dan memory
  python main.py --search <query> --archives  Termasuk arsip lama
  python main.py --list-archives     Daftar file arsip
"""

import argparse
import json
import sys
from pathlib import Path

import db
import archiver
import summarizer
import searcher
import phases


STAGING_FILE = Path(__file__).parent / "data" / "sessions_staging.json"


def cmd_ingest() -> None:
    db.init_db()

    new_sessions_raw = []
    if STAGING_FILE.exists():
        with open(STAGING_FILE, encoding="utf-8") as f:
            new_sessions_raw = json.load(f)
    else:
        print(f"[INFO] File staging tidak ditemukan: {STAGING_FILE}")
        print("[INFO] Tidak ada sesi baru untuk diproses.")
        return

    if not new_sessions_raw:
        print("[INFO] Tidak ada sesi baru di staging file.")
        return

    # Daftarkan sesi baru ke SQLite
    for s in new_sessions_raw:
        db.upsert_session(
            session_id=s["id"],
            title=s.get("title", "Tanpa judul"),
            created_at=s.get("created_at", ""),
        )

    # Ambil yang belum diproses
    unprocessed_rows = db.get_unprocessed_sessions()
    unprocessed_ids = {row["id"] for row in unprocessed_rows}
    new_to_process = [s for s in new_sessions_raw if s["id"] in unprocessed_ids]

    if not new_to_process:
        print("[INFO] Semua sesi sudah pernah diproses sebelumnya.")
        return

    print(f"[INFO] Memproses {len(new_to_process)} sesi baru...")

    # Arsipkan summary yang ada
    archive_path = archiver.archive_current_summary()
    if archive_path:
        print(f"[INFO] Summary lama diarsipkan ke: {archive_path.name}")

    # Ambil summary lama dari DB sebelum diarsipkan
    old_summary_row = db.get_latest_summary()
    old_summary_content = old_summary_row["content"] if old_summary_row else ""
    if old_summary_row:
        db.archive_summary(old_summary_row["id"])

    # Hitung total sesi yang sudah diproses
    status_before = db.get_status()
    sessions_covered = status_before["processed_sessions"] + len(new_to_process)

    # Buat ringkasan baru secara inkremental
    try:
        new_content = summarizer.create_incremental_summary(
            new_sessions=new_to_process,
            current_summary=old_summary_content,
            sessions_covered_so_far=status_before["processed_sessions"],
        )
    except Exception as e:
        print(f"[ERROR] Gagal membuat ringkasan: {e}")
        print("[INFO] Rollback: mengembalikan summary lama...")
        if old_summary_content:
            summarizer.write_summary(old_summary_content, status_before["processed_sessions"])
        sys.exit(1)

    # Tulis summary baru
    summarizer.write_summary(new_content, sessions_covered)

    # Tandai sesi sebagai sudah diproses
    db.mark_sessions_processed([s["id"] for s in new_to_process])
    db.save_summary(new_content, version=sessions_covered)

    # Hapus staging file supaya tidak diproses ulang
    STAGING_FILE.unlink(missing_ok=True)

    # Prune arsip lama (simpan 30 terbaru)
    pruned = archiver.prune_archives(keep=30)
    if pruned:
        print(f"[INFO] {pruned} arsip lama dihapus.")

    print(f"[OK] Summary diperbarui. Total sesi tercakup: {sessions_covered}")


def cmd_status() -> None:
    db.init_db()
    status = db.get_status()

    print("=" * 40)
    print("Status Chat Context Manager")
    print("=" * 40)
    for k, v in status.items():
        label = k.replace("_", " ").title()
        print(f"  {label:<35} {v}")

    archives = archiver.list_archives()
    print(f"  {'Jumlah Arsip':<35} {len(archives)}")
    if archives:
        print(f"  {'Arsip Terbaru':<35} {archives[0].name}")
    print("=" * 40)


def cmd_search(query: str, include_archives: bool = False, is_regex: bool = False) -> None:
    try:
        results = searcher.search(
            query=query,
            include_archives=include_archives,
            is_regex=is_regex,
        )
    except ValueError as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(searcher.format_results(results))


def cmd_list_archives() -> None:
    archives = archiver.list_archives()
    if not archives:
        print("Belum ada file arsip.")
        return

    print(f"Ditemukan {len(archives)} arsip:\n")
    for i, path in enumerate(archives, start=1):
        size_kb = path.stat().st_size / 1024
        print(f"  {i:>3}. {path.name}  ({size_kb:.1f} KB)")


# ── phase & task commands ────────────────────────────────────────────────────

def cmd_seed_phases() -> None:
    """Seed definisi 6 sprint ke SQLite (idempoten)."""
    phases.seed_phases()
    print("[OK] Phase definitions seeded ke database.")
    phases.print_status_table()


def cmd_phase_status() -> None:
    phases.seed_phases()
    phases.print_status_table()


def cmd_phase_start(phase_no: int) -> None:
    phases.seed_phases()
    phases.set_phase_status(phase_no, "in_progress")
    print(f"[OK] Sprint {phase_no} → in_progress")
    cmd_sync_progress()


def cmd_phase_done(phase_no: int) -> None:
    phases.seed_phases()
    phases.set_phase_status(phase_no, "done")
    print(f"[OK] Sprint {phase_no} → done")
    cmd_sync_progress()


def cmd_task_done(task_key: str) -> None:
    phases.seed_phases()
    phases.set_task_status(task_key, "done")
    print(f"[OK] Task '{task_key}' → done")
    cmd_sync_progress()


def cmd_task_block(task_key: str, reason: str) -> None:
    phases.seed_phases()
    phases.set_task_status(task_key, "blocked", note=reason)
    print(f"[OK] Task '{task_key}' → blocked: {reason}")
    cmd_sync_progress()


def cmd_task_start(task_key: str) -> None:
    phases.seed_phases()
    phases.set_task_status(task_key, "in_progress")
    print(f"[OK] Task '{task_key}' → in_progress")
    cmd_sync_progress()


def cmd_sync_progress() -> None:
    phases.seed_phases()
    phases.write_progress()
    from paths import PROGRESS_FILE
    print(f"[OK] integration_progress.md diperbarui → {PROGRESS_FILE}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Chat Context Manager untuk proyek Marketiv"
    )
    # No subparsers — gunakan flat flag style yang sudah berjalan

    if "--ingest" in sys.argv:
        cmd_ingest()
    elif "--status" in sys.argv:
        cmd_status()
    elif "--search" in sys.argv:
        idx = sys.argv.index("--search")
        if idx + 1 >= len(sys.argv):
            print("[ERROR] Masukkan query setelah --search")
            sys.exit(1)
        query = sys.argv[idx + 1]
        include_archives = "--archives" in sys.argv
        is_regex = "--regex" in sys.argv
        cmd_search(query, include_archives=include_archives, is_regex=is_regex)
    elif "--list-archives" in sys.argv:
        cmd_list_archives()

    # ── phase / task commands ─────────────────────────────────────────────
    elif "--seed-phases" in sys.argv:
        cmd_seed_phases()
    elif "--phase-status" in sys.argv:
        cmd_phase_status()
    elif "--phase-start" in sys.argv:
        idx = sys.argv.index("--phase-start")
        if idx + 1 >= len(sys.argv):
            print("[ERROR] Masukkan nomor sprint setelah --phase-start")
            sys.exit(1)
        cmd_phase_start(int(sys.argv[idx + 1]))
    elif "--phase-done" in sys.argv:
        idx = sys.argv.index("--phase-done")
        if idx + 1 >= len(sys.argv):
            print("[ERROR] Masukkan nomor sprint setelah --phase-done")
            sys.exit(1)
        cmd_phase_done(int(sys.argv[idx + 1]))
    elif "--task-done" in sys.argv:
        idx = sys.argv.index("--task-done")
        if idx + 1 >= len(sys.argv):
            print("[ERROR] Masukkan task key setelah --task-done")
            sys.exit(1)
        cmd_task_done(sys.argv[idx + 1])
    elif "--task-start" in sys.argv:
        idx = sys.argv.index("--task-start")
        if idx + 1 >= len(sys.argv):
            print("[ERROR] Masukkan task key setelah --task-start")
            sys.exit(1)
        cmd_task_start(sys.argv[idx + 1])
    elif "--task-block" in sys.argv:
        idx = sys.argv.index("--task-block")
        if idx + 2 >= len(sys.argv):
            print('[ERROR] Gunakan: --task-block <key> "<alasan>"')
            sys.exit(1)
        cmd_task_block(sys.argv[idx + 1], sys.argv[idx + 2])
    elif "--sync-progress" in sys.argv:
        cmd_sync_progress()

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
