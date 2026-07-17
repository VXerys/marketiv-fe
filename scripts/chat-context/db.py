"""SQLite manager untuk tracking sesi yang sudah diproses."""

import sqlite3
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).parent / "data" / "chat_history.db"


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT,
                created_at TEXT,
                processed_at TEXT,
                is_processed INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER,
                content TEXT,
                created_at TEXT,
                archived_at TEXT
            );
        """)


def upsert_session(session_id: str, title: str, created_at: str) -> None:
    with get_connection() as conn:
        conn.execute(
            """
            INSERT OR IGNORE INTO sessions (id, title, created_at, is_processed)
            VALUES (?, ?, ?, 0)
            """,
            (session_id, title, created_at),
        )


def mark_sessions_processed(session_ids: list[str]) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.executemany(
            "UPDATE sessions SET is_processed=1, processed_at=? WHERE id=?",
            [(now, sid) for sid in session_ids],
        )


def get_unprocessed_sessions() -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM sessions WHERE is_processed=0 ORDER BY created_at ASC"
        ).fetchall()


def save_summary(content: str, version: int) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO summaries (version, content, created_at) VALUES (?, ?, ?)",
            (version, content, now),
        )


def get_latest_summary() -> sqlite3.Row | None:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM summaries WHERE archived_at IS NULL ORDER BY version DESC LIMIT 1"
        ).fetchone()


def archive_summary(summary_id: int) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            "UPDATE summaries SET archived_at=? WHERE id=?",
            (now, summary_id),
        )


def get_status() -> dict:
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
        processed = conn.execute(
            "SELECT COUNT(*) FROM sessions WHERE is_processed=1"
        ).fetchone()[0]
        total_summaries = conn.execute("SELECT COUNT(*) FROM summaries").fetchone()[0]
        latest = conn.execute(
            "SELECT version, created_at FROM summaries WHERE archived_at IS NULL ORDER BY version DESC LIMIT 1"
        ).fetchone()

    return {
        "total_sessions": total,
        "processed_sessions": processed,
        "unprocessed_sessions": total - processed,
        "total_summaries": total_summaries,
        "current_summary_version": latest["version"] if latest else None,
        "current_summary_created_at": latest["created_at"] if latest else None,
    }
