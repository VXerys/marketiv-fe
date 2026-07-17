"""Buat ringkasan inkremental dari sesi baru + ringkasan lama via Claude API."""

import os
import json
from pathlib import Path
from datetime import datetime, timezone

import anthropic

MEMORY_DIR = Path(__file__).parent.parent.parent / "memory"
SUMMARY_FILE = MEMORY_DIR / "project_context_summary.md"

SYSTEM_PROMPT = """Kamu adalah asisten yang bertugas membuat ringkasan konteks proyek Marketiv
dari percakapan-percakapan terdahulu. Ringkasan harus padat, informatif, dan berguna bagi
Claude di sesi berikutnya agar tidak perlu membaca ulang semua chat sebelumnya.

Fokus pada:
- Status fitur/pekerjaan yang sedang atau sudah dikerjakan
- Keputusan teknis penting yang sudah dibuat
- Hal yang user sudah jelaskan agar tidak perlu diulang
- Bug atau isu yang sedang diinvestigasi
- Konteks bisnis spesifik Marketiv yang relevan

Hindari:
- Detail implementasi yang bisa ditemukan di kode
- Hal yang sudah ada di CLAUDE.md atau docs proyek
- Informasi yang bersifat sementara dan sudah tidak relevan
"""

SUMMARY_TEMPLATE = """---
name: project-context-summary
description: Ringkasan konteks proyek Marketiv dari percakapan terdahulu — dimuat otomatis setiap sesi
metadata:
  type: project
  generated_at: {generated_at}
  sessions_covered: {sessions_covered}
---

{content}
"""


def _load_current_summary() -> str:
    if SUMMARY_FILE.exists():
        return SUMMARY_FILE.read_text(encoding="utf-8")
    return ""


def _load_new_sessions(staging_path: Path) -> list[dict]:
    if not staging_path.exists():
        return []
    with open(staging_path, encoding="utf-8") as f:
        return json.load(f)


def create_incremental_summary(
    new_sessions: list[dict],
    current_summary: str,
    sessions_covered_so_far: int = 0,
) -> str:
    """Kirim ringkasan lama + sesi baru ke Claude API, return konten ringkasan baru."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    user_content_parts = []

    if current_summary:
        user_content_parts.append(
            f"## Ringkasan Konteks Sebelumnya\n\n{current_summary}"
        )

    if new_sessions:
        sessions_text = "\n\n---\n\n".join(
            f"### Sesi: {s.get('title', s.get('id', 'Tanpa judul'))}\n"
            f"Tanggal: {s.get('created_at', 'tidak diketahui')}\n\n"
            f"{s.get('transcript', s.get('summary', '(tidak ada konten)'))}"
            for s in new_sessions
        )
        user_content_parts.append(
            f"## Sesi Percakapan Baru ({len(new_sessions)} sesi)\n\n{sessions_text}"
        )

    if not user_content_parts:
        return current_summary

    user_message = "\n\n".join(user_content_parts)
    user_message += (
        "\n\n---\n\nBuat ringkasan konteks proyek yang diperbarui. "
        "Gabungkan informasi dari ringkasan sebelumnya dengan sesi-sesi baru. "
        "Hapus informasi yang sudah tidak relevan. "
        "Format output dalam markdown dengan bagian: "
        "## Status Proyek Saat Ini, ## Keputusan Teknis Penting, "
        "## Pekerjaan Terakhir, ## Konteks yang Perlu Diingat"
    )

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    return response.content[0].text


def write_summary(content: str, sessions_covered: int) -> None:
    MEMORY_DIR.mkdir(parents=True, exist_ok=True)
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    full_content = SUMMARY_TEMPLATE.format(
        generated_at=generated_at,
        sessions_covered=sessions_covered,
        content=content,
    )
    SUMMARY_FILE.write_text(full_content, encoding="utf-8")
