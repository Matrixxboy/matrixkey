from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.db.database import get_db_connection
from typing import List

router = APIRouter()

class HierarchyAssignment(BaseModel):
    parent_agent: str
    child_agent: str
    relationship: str = "reports_to"

@router.get("/hierarchy")
async def get_hierarchy():
    conn = get_db_connection()
    # Get all agents first
    # Note: We might want to pull names from the agents directory too, 
    # but for now we'll look at established relationships
    rows = conn.execute("SELECT parent_agent, child_agent, relationship FROM agent_hierarchy").fetchall()
    conn.close()
    
    # Format as a simple list of links
    links = [{"source": r[0], "target": r[1], "type": r[2]} for r in rows]
    return {"links": links}

@router.post("/assign")
async def assign_agent(assignment: HierarchyAssignment):
    if assignment.parent_agent == assignment.child_agent:
        raise HTTPException(status_code=400, detail="An agent cannot report to itself")
        
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO agent_hierarchy (parent_agent, child_agent, relationship) VALUES (?, ?, ?)",
            (assignment.parent_agent, assignment.child_agent, assignment.relationship)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
    conn.close()
    return {"status": "assigned", "parent": assignment.parent_agent, "child": assignment.child_agent}

@router.delete("/unassign")
async def unassign_agent(parent: str, child: str):
    conn = get_db_connection()
    conn.execute(
        "DELETE FROM agent_hierarchy WHERE parent_agent = ? AND child_agent = ?",
        (parent, child)
    )
    conn.commit()
    conn.close()
    return {"status": "unassigned"}
