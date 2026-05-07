import sqlite3
import time
from pathlib import Path

BASE = Path(__file__).parent.parent.parent.parent
MEMORY_DB = BASE / "memory" / "conversations.db"

def init_db():
    MEMORY_DB.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(MEMORY_DB)
    # Token log table
    conn.execute("""CREATE TABLE IF NOT EXISTS token_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent TEXT, 
        tokens INTEGER, 
        ts INTEGER
    )""")
    # Companies (Phase: Multi-Tenancy)
    conn.execute("""CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        ts INTEGER
    )""")
    # Messages table
    conn.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER DEFAULT 1,
        agent TEXT, 
        role TEXT, 
        content TEXT, 
        tokens INTEGER DEFAULT 0,
        ts INTEGER,
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )""")
    # Embeddings table for semantic search (Phase 2)
    conn.execute("""CREATE TABLE IF NOT EXISTS embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER,
        embedding BLOB,
        FOREIGN KEY(message_id) REFERENCES messages(id)
    )""")
    # Workspace Pages (Phase: Orchestrator)
    conn.execute("""CREATE TABLE IF NOT EXISTS workspace_pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER DEFAULT 1,
        title TEXT,
        content TEXT, -- JSON blocks
        ts INTEGER,
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )""")
    # Agent Hierarchy (Phase: Orchestrator)
    conn.execute("""CREATE TABLE IF NOT EXISTS agent_hierarchy (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER DEFAULT 1,
        parent_agent TEXT,
        child_agent TEXT,
        relationship TEXT,
        UNIQUE(company_id, parent_agent, child_agent),
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )""")
    # Workspace Tasks (Enhanced Workspace)
    conn.execute("""CREATE TABLE IF NOT EXISTS workspace_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT,
        company_id INTEGER DEFAULT 1,
        page_id INTEGER,
        title TEXT,
        status TEXT DEFAULT 'tasks', -- tasks, pending, completed, blocked
        description TEXT,
        parent_id INTEGER DEFAULT NULL,
        position INTEGER DEFAULT 0,
        ts INTEGER,
        FOREIGN KEY(company_id) REFERENCES companies(id),
        FOREIGN KEY(page_id) REFERENCES workspace_pages(id)
    )""")
    # Seed default company
    conn.execute("INSERT OR IGNORE INTO companies (id, name, ts) VALUES (1, 'Default Corp', ?)", (int(time.time()),))
    conn.commit()
    conn.close()

def get_db_connection():
    return sqlite3.connect(MEMORY_DB)

# --- Session Management ---

def create_session(company_id: int, agent: str, title: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO chat_sessions (company_id, agent, title, ts) VALUES (?, ?, ?, ?)",
        (company_id, agent, title, int(time.time()))
    )
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return session_id

def get_sessions(company_id: int, agent: str):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, title, ts FROM chat_sessions WHERE company_id=? AND agent=? ORDER BY ts DESC",
        (company_id, agent)
    ).fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "ts": r[2]} for r in rows]

def update_session_title(session_id: int, title: str, company_id: int):
    conn = get_db_connection()
    conn.execute("UPDATE chat_sessions SET title=? WHERE id=? AND company_id=?", (title, session_id, company_id))
    conn.commit()
    conn.close()

def delete_session(session_id: int, company_id: int):
    conn = get_db_connection()
    # Delete associated messages first
    conn.execute("DELETE FROM messages WHERE session_id=? AND company_id=?", (session_id, company_id))
    # Delete session
    conn.execute("DELETE FROM chat_sessions WHERE id=? AND company_id=?", (session_id, company_id))
    conn.commit()
    conn.close()

# --- Messages ---

def save_message(session_id: int, agent: str, role: str, content: str, tokens: int = 0, company_id: int = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (company_id, session_id, agent, role, content, tokens, ts) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (company_id, session_id, agent, role, content, tokens, int(time.time()))
    )
    conn.commit()
    msg_id = cursor.lastrowid
    conn.close()
    return msg_id

def get_messages(session_id: int, company_id: int = 1, limit: int = 50):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT role, content, ts FROM messages WHERE session_id=? AND company_id=? ORDER BY ts DESC LIMIT ?",
        (session_id, company_id, limit)
    ).fetchall()
    conn.close()
    return [{"role": r[0], "content": r[1], "ts": r[2]} for r in reversed(rows)]

def clear_agent_memory(agent: str, company_id: int = 1):
    conn = get_db_connection()
    conn.execute("DELETE FROM messages WHERE agent=? AND company_id=?", (agent, company_id))
    conn.commit()
    conn.close()

def get_stats(company_id: int = 1):
    conn = get_db_connection()
    total = conn.execute("SELECT COUNT(*) FROM messages WHERE company_id=?", (company_id,)).fetchone()[0]
    agents = conn.execute("SELECT agent, COUNT(*) FROM messages WHERE company_id=? GROUP BY agent", (company_id,)).fetchall()
    conn.close()
    return {"total_messages": total, "by_agent": {a: c for a, c in agents}}
