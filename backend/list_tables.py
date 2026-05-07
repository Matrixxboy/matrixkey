import sqlite3

db_path = r'c:\Utsav\Peronal\matrixkey\backend\matrix.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("--- Tables ---")
tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
for t in tables:
    print(t[0])

conn.close()
