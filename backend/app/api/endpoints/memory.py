from app.db.database import get_messages, clear_agent_memory, get_stats
from app.services.memory import search_memory
from app.schemas.chat import MemorySearchRequest
from fastapi import APIRouter

router = APIRouter()

@router.get("/{agent}")
def get_agent_memory(agent: str, limit: int = 50):
    messages = get_messages(agent, limit)
    return {"messages": messages}

@router.delete("/{agent}")
def clear_memory(agent: str):
    clear_agent_memory(agent)
    return {"status": "cleared"}

@router.get("/stats/all")
def all_stats():
    return get_stats()

@router.post("/search")
def search(req: MemorySearchRequest):
    results = search_memory(req.agent, req.query, req.limit)
    return {"results": results}
