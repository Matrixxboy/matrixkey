import sqlite3
import os

db_path = r'c:\Utsav\Peronal\matrixkey\memory\conversations.db'
if not os.path.exists(db_path):
    print(f"ERROR: DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Workspace Pages ---")
pages = cursor.execute("SELECT id, company_id, title FROM workspace_pages").fetchall()
for p in pages:
    print(p)

print("\n--- Workspace Tasks ---")
tasks = cursor.execute("SELECT id, company_id, title, status FROM workspace_tasks LIMIT 10").fetchall()
for t in tasks:
    print(t)

conn.close()
