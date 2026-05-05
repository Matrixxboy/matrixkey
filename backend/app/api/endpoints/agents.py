from fastapi import APIRouter
from app.schemas.chat import AgentCreate
from app.services.agent_loader import list_agents, create_agent_files

router = APIRouter()

@router.get("/")
def get_agents():
    return {"agents": list_agents()}

@router.post("/create")
def create_agent(req: AgentCreate):
    agent_name = create_agent_files(req.name, req.description, req.persona)
    return {"status": "created", "agent": agent_name}
