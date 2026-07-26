"""Lokasi folder memory dan data — satu sumber kebenaran untuk semua modul."""

import os
from pathlib import Path

# Folder memory Claude yang sebenarnya dimuat tiap sesi.
# Bisa dioverride lewat env MARKETIV_MEMORY_DIR (berguna di mesin lain / CI).
DEFAULT_MEMORY_DIR = (
    Path.home() / ".claude" / "projects" / "C--Users-PLN-marketiv-web" / "memory"
)

MEMORY_DIR = Path(os.environ.get("MARKETIV_MEMORY_DIR", DEFAULT_MEMORY_DIR))

DATA_DIR = Path(__file__).parent / "data"
ARCHIVE_DIR = DATA_DIR / "archive"

SUMMARY_FILE = MEMORY_DIR / "project_context_summary.md"
PROGRESS_FILE = MEMORY_DIR / "integration_progress.md"
MEMORY_INDEX_FILE = MEMORY_DIR / "MEMORY.md"
