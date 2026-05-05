import sqlite3
import time
from pathlib import Path

BASE = Path(__file__).parent.parent.parent.parent
MEMORY_DB = BASE / "memory" / "conversations.db"

def init_db():
    MEMORY_DB.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(MEMORY_DB)
    # Messages table
    conn.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT, 
        role TEXT, 
        content TEXT, 
        tokens INTEGER DEFAULT 0,
        ts INTEGER
    )""")
    # Token log table
    conn.execute("""CREATE TABLE IF NOT EXISTS token_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT, 
        tokens INTEGER, 
        ts INTEGER
    )""")
    # Embeddings table for semantic search (Phase 2)
    conn.execute("""CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER,
        embedding BLOB,
        FOREIGN KEY(message_id) REFERENCES messages(id)
    )""")
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect(MEMORY_DB)

def save_message(agent: str, role: str, content: str, tokens: int = 0):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (agent, role, content, tokens, ts) VALUES (?, ?, ?, ?, ?)",
        (agent, role, content, tokens, int(time.time()))
    )
    conn.commit()
    msg_id = cursor.lastrowid
    conn.close()
    return msg_id

def get_messages(agent: str, limit: int = 50):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT role, content, ts FROM messages WHERE agent=? ORDER BY ts DESC LIMIT ?",
        (agent, limit)
    ).fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1], "ts": r[2]} for r in reversed(rows)]

def clear_agent_memory(agent: str):
    conn = get_db_connection()
    conn.execute("DELETE FROM messages WHERE agent=?", (agent,))
    conn.commit()
    conn.close()

def get_stats():
    conn = get_db_connection()
    total = conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
    agents = conn.execute("SELECT agent, COUNT(*) FROM messages GROUP BY agent").fetchall()
    conn.close()
    return {"total_messages": total, "by_agent": {a: c for a, c in agents}}
