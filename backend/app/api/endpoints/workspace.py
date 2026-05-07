from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time
from app.db.database import get_db_connection
import json

router = APIRouter()

class PageBlock(BaseModel):
    id: str
    type: str
    content: str
    metadata: Optional[dict] = None

class PageCreate(BaseModel):
    title: str
    blocks: List[PageBlock]

class PageUpdate(BaseModel):
    title: Optional[str] = None
    blocks: Optional[List[PageBlock]] = None

@router.get("/pages")
async def get_pages(company_id: int = 1):
    conn = get_db_connection()
    rows = conn.execute("SELECT id, title, ts FROM workspace_pages WHERE company_id = ? ORDER BY ts DESC", (company_id,)).fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "ts": r[2]} for r in rows]

@router.post("/pages")
async def create_page(page: PageCreate, company_id: int = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO workspace_pages (company_id, title, content, ts) VALUES (?, ?, ?, ?)",
        (company_id, page.title, json.dumps([b.dict() for b in page.blocks]), int(time.time()))
    )
    conn.commit()
    page_id = cursor.lastrowid
    conn.close()
    return {"id": page_id, "title": page.title}

@router.get("/pages/{page_id}")
async def get_page(page_id: int, company_id: int = 1):
    conn = get_db_connection()
    row = conn.execute("SELECT id, title, content, ts FROM workspace_pages WHERE id = ? AND company_id = ?", (page_id, company_id)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Page not found")
    return {
        "id": row[0],
        "title": row[1],
        "blocks": json.loads(row[2]),
        "ts": row[3]
    }

@router.put("/pages/{page_id}")
async def update_page(page_id: int, page: PageUpdate, company_id: int = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    if page.title is not None:
        updates.append("title = ?")
        params.append(page.title)
    if page.blocks is not None:
        updates.append("content = ?")
        params.append(json.dumps([b.dict() for b in page.blocks]))
    
    if not updates:
        return {"status": "no changes"}
        
    params.append(page_id)
    params.append(company_id)
    cursor.execute(f"UPDATE workspace_pages SET {', '.join(updates)} WHERE id = ? AND company_id = ?", params)
    conn.commit()
    conn.close()
    return {"status": "updated"}

@router.delete("/pages/{page_id}")
async def delete_page(page_id: int):
    conn = get_db_connection()
    conn.execute("DELETE FROM workspace_pages WHERE id = ?", (page_id,))
    conn.execute("DELETE FROM workspace_tasks WHERE page_id = ?", (page_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# Task Endpoints
class TaskBase(BaseModel):
    title: str
    status: str = "tasks"
    description: Optional[str] = None
    parent_id: Optional[int] = None
    position: int = 0

class TaskCreate(TaskBase):
    page_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None

@router.get("/pages/{page_id}/tasks")
async def get_tasks(page_id: int, company_id: int = 1):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, title, status, description, parent_id, position, ts FROM workspace_tasks WHERE page_id = ? AND company_id = ? ORDER BY position ASC", 
        (page_id, company_id)
    ).fetchall()
    conn.close()
    return [
        {
            "id": r[0], "title": r[1], "status": r[2], 
            "description": r[3], "parent_id": r[4], 
            "position": r[5], "ts": r[6]
        } for r in rows
    ]

@router.post("/tasks")
async def create_task(task: TaskCreate, company_id: int = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO workspace_tasks (company_id, page_id, title, status, description, parent_id, position, ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (company_id, task.page_id, task.title, task.status, task.description, task.parent_id, task.position, int(time.time()))
    )
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"id": task_id, "title": task.title}

@router.put("/tasks/{task_id}")
async def update_task(task_id: int, task: TaskUpdate, company_id: int = 1):
    conn = get_db_connection()
    cursor = conn.cursor()
    updates = []
    params = []
    for field, value in task.dict(exclude_unset=True).items():
        updates.append(f"{field} = ?")
        params.append(value)
    
    if not updates: return {"status": "no changes"}
    
    params.append(task_id)
    params.append(company_id)
    cursor.execute(f"UPDATE workspace_tasks SET {', '.join(updates)} WHERE id = ? AND company_id = ?", params)
    conn.commit()
    conn.close()
    return {"status": "updated"}

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = get_db_connection()
    conn.execute("DELETE FROM workspace_tasks WHERE id = ? OR parent_id = ?", (task_id, task_id))
    conn.commit()
    conn.close()
    return {"status": "deleted"}
