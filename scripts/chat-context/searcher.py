"""Pencarian di summary dan arsip menggunakan regex + keyword."""

import re
from pathlib import Path
from paths import MEMORY_DIR, ARCHIVE_DIR, SUMMARY_FILE


def _search_file(path: Path, pattern: re.Pattern) -> list[dict]:
    """Cari pattern di satu file. Return list of {file, line_num, line}."""
    if not path.exists():
        return []

    results = []
    lines = path.read_text(encoding="utf-8").splitlines()
    for i, line in enumerate(lines, start=1):
        if pattern.search(line):
            results.append({"file": str(path.name), "line_num": i, "line": line.strip()})
    return results


def search(
    query: str,
    include_archives: bool = False,
    case_sensitive: bool = False,
    is_regex: bool = False,
) -> list[dict]:
    """
    Cari query di summary dan (opsional) arsip.
    Return list of match dicts: {file, line_num, line, source}.
    """
    flags = 0 if case_sensitive else re.IGNORECASE
    pattern_str = query if is_regex else re.escape(query)
    try:
        pattern = re.compile(pattern_str, flags)
    except re.error as e:
        raise ValueError(f"Regex tidak valid: {e}") from e

    results = []

    # Cari di summary utama dulu
    for match in _search_file(SUMMARY_FILE, pattern):
        match["source"] = "current_summary"
        results.append(match)

    # Cari di semua memory .md files
    for md_file in sorted(MEMORY_DIR.glob("*.md")):
        if md_file == SUMMARY_FILE:
            continue
        for match in _search_file(md_file, pattern):
            match["source"] = "memory"
            results.append(match)

    # Cari di arsip jika diminta
    if include_archives and ARCHIVE_DIR.exists():
        for archive in sorted(ARCHIVE_DIR.glob("summary_*.md"), reverse=True):
            for match in _search_file(archive, pattern):
                match["source"] = "archive"
                results.append(match)

    return results


def format_results(results: list[dict]) -> str:
    if not results:
        return "Tidak ada hasil ditemukan."

    lines = [f"Ditemukan {len(results)} hasil:\n"]
    current_file = None
    for r in results:
        if r["file"] != current_file:
            current_file = r["file"]
            lines.append(f"\n[{r['source'].upper()}] {r['file']}")
            lines.append("-" * 50)
        lines.append(f"  Baris {r['line_num']:>4}: {r['line']}")
    return "\n".join(lines)
