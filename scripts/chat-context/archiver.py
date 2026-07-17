"""Arsip ringkasan lama ke folder archive/ dengan timestamp."""

from pathlib import Path
from datetime import datetime, timezone
import shutil

MEMORY_DIR = Path(__file__).parent.parent.parent / "memory"
ARCHIVE_DIR = Path(__file__).parent / "data" / "archive"
SUMMARY_FILE = MEMORY_DIR / "project_context_summary.md"


def archive_current_summary() -> Path | None:
    """Pindahkan summary saat ini ke archive/. Return path arsip, atau None jika tidak ada."""
    if not SUMMARY_FILE.exists():
        return None

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    archive_path = ARCHIVE_DIR / f"summary_{timestamp}.md"

    shutil.copy2(SUMMARY_FILE, archive_path)
    return archive_path


def list_archives() -> list[Path]:
    """Daftar semua file arsip, urut dari yang terbaru."""
    if not ARCHIVE_DIR.exists():
        return []
    return sorted(ARCHIVE_DIR.glob("summary_*.md"), reverse=True)


def prune_archives(keep: int = 30) -> int:
    """Hapus arsip lama, pertahankan N terbaru. Return jumlah yang dihapus."""
    archives = list_archives()
    to_delete = archives[keep:]
    for path in to_delete:
        path.unlink()
    return len(to_delete)
