import sqlite3
import time

db_path = r'c:\Utsav\Peronal\matrixkey\memory\conversations.db'
conn = sqlite3.connect(db_path)

try:
    # Create chat_sessions table
    conn.execute("""CREATE TABLE IF NOT EXISTS chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER DEFAULT 1,
        agent TEXT,
        title TEXT,
        ts INTEGER,
        FOREIGN KEY(company_id) REFERENCES companies(id)
    )""")
    print("Created chat_sessions table.")

    # Add session_id to messages
    try:
        conn.execute("ALTER TABLE messages ADD COLUMN session_id INTEGER REFERENCES chat_sessions(id)")
        print("Added session_id to messages.")
    except sqlite3.OperationalError:
        print("session_id already exists in messages.")

    # Group existing messages into default sessions
    cursor = conn.cursor()
    
    # Get all unique (company_id, agent) pairs from messages that don't have a session_id
    pairs = cursor.execute("SELECT DISTINCT company_id, agent FROM messages WHERE session_id IS NULL").fetchall()
    
    for cid, agent in pairs:
        # Create a default session for this pair
        cursor.execute(
            "INSERT INTO chat_sessions (company_id, agent, title, ts) VALUES (?, ?, ?, ?)",
            (cid, agent, f"Legacy Session ({agent})", int(time.time()))
        )
        session_id = cursor.lastrowid
        
        # Update messages
        cursor.execute(
            "UPDATE messages SET session_id = ? WHERE company_id = ? AND agent = ? AND session_id IS NULL",
            (session_id, cid, agent)
        )
        print(f"Migrated messages for Company {cid}, Agent {agent} to Session {session_id}.")

    conn.commit()
    print("Migration complete.")

except Exception as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()
