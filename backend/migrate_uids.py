import sqlite3
import time

db_path = r'c:\Utsav\Peronal\matrixkey\memory\conversations.db'
conn = sqlite3.connect(db_path)

# Add uid column to workspace_tasks if not exists
try:
    conn.execute("ALTER TABLE workspace_tasks ADD COLUMN uid TEXT")
    print("Added uid column to workspace_tasks")
except sqlite3.OperationalError:
    print("uid column already exists")

# Populate existing tasks with UIDs
tasks = conn.execute("SELECT id, company_id FROM workspace_tasks WHERE uid IS NULL").fetchall()
for tid, cid in tasks:
    uid = f"UNIT-{cid:02d}-{tid:03d}"
    conn.execute("UPDATE workspace_tasks SET uid = ? WHERE id = ?", (uid, tid))

conn.commit()
conn.close()
