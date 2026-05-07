from app.db.database import get_messages, clear_agent_memory, get_stats
from app.services.memory import search_memory
from app.schemas.chat import MemorySearchRequest
from fastapi import APIRouter

router = APIRouter()

@router.get("/{agent}")
def get_agent_memory(agent: str, limit: int = 50, company_id: int = 1):
    messages = get_messages(agent, limit, company_id=company_id)
    return {"messages": messages}

@router.delete("/{agent}")
def clear_memory(agent: str, company_id: int = 1):
    clear_agent_memory(agent, company_id=company_id)
    return {"status": "cleared"}

@router.get("/stats/all")
def all_stats(company_id: int = 1):
    return get_stats(company_id=company_id)

@router.post("/search")
def search(req: MemorySearchRequest, company_id: int = 1):
    results = search_memory(req.agent, req.query, req.limit, company_id=company_id)
    return {"results": results}
