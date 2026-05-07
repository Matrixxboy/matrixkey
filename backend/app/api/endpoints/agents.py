from fastapi import APIRouter, HTTPException
from app.schemas.chat import AgentCreate
from app.services.agent_loader import list_agents, create_agent_files, load_agent_config
import shutil
from pathlib import Path
import json

router = APIRouter()
AGENTS_DIR = Path("agents")

@router.get("/")
def get_agents():
    return {"agents": list_agents()}

@router.get("/{name}")
def get_agent_details(name: str):
    try:
        config = load_agent_config(name)
        return {"name": name, **config}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Agent not found")

@router.post("/create")
def create_agent(req: AgentCreate):
    agent_name = create_agent_files(req.name, req.description, req.persona)
    return {"status": "created", "agent": agent_name}

@router.put("/{name}")
def update_agent(name: str, req: AgentCreate):
    agent_dir = AGENTS_DIR / name
    if not agent_dir.exists():
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update config.json
    config_path = agent_dir / "config.json"
    config = {"name": req.name, "description": req.description}
    config_path.write_text(json.dumps(config, indent=4))
    
    # Update persona.md
    persona_path = agent_dir / "persona.md"
    persona_path.write_text(req.persona)
    
    # Rename directory if name changed
    if name != req.name:
        new_dir = AGENTS_DIR / req.name
        agent_dir.rename(new_dir)
        
    return {"status": "updated"}

@router.delete("/{name}")
def delete_agent(name: str):
    agent_dir = AGENTS_DIR / name
    if agent_dir.exists():
        shutil.rmtree(agent_dir)
    return {"status": "deleted"}
