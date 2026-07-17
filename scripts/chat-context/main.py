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


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Chat Context Manager untuk proyek Marketiv"
    )
    subparsers = parser.add_subparsers(dest="command")

    subparsers.add_parser("--ingest", help="Proses sesi baru dari sessions_staging.json")
    subparsers.add_parser("--status", help="Tampilkan status database")

    search_parser = subparsers.add_parser("--search", help="Cari di summary dan memory")
    search_parser.add_argument("query", help="Kata kunci atau regex")
    search_parser.add_argument(
        "--archives", action="store_true", help="Sertakan arsip lama dalam pencarian"
    )
    search_parser.add_argument(
        "--regex", action="store_true", help="Perlakukan query sebagai regex"
    )

    subparsers.add_parser("--list-archives", help="Daftar file arsip")

    # Support flat flag style: python main.py --ingest (bukan subcommand)
    args, unknown = parser.parse_known_args()

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
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
