from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_db_connection
import time

router = APIRouter()

class CompanyCreate(BaseModel):
    name: str

@router.get("/")
async def get_companies():
    conn = get_db_connection()
    rows = conn.execute("SELECT id, name, ts FROM companies").fetchall()
    conn.close()
    return [{"id": r[0], "name": r[1], "ts": r[2]} for r in rows]

@router.post("/")
async def create_company(company: CompanyCreate):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO companies (name, ts) VALUES (?, ?)", (company.name, int(time.time())))
        conn.commit()
        comp_id = cursor.lastrowid
        conn.close()
        return {"id": comp_id, "name": company.name}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail="Company name already exists")

@router.delete("/{company_id}")
async def delete_company(company_id: int):
    if company_id == 1:
        raise HTTPException(status_code=400, detail="Cannot delete default company")
    conn = get_db_connection()
    conn.execute("DELETE FROM companies WHERE id = ?", (company_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}
