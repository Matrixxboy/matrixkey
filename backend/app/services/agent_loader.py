import json
import os
from pathlib import Path

BASE = Path(__file__).parent.parent.parent.parent
AGENTS_DIR = BASE / "agents"

def load_agent_config(name: str) -> dict:
    path = AGENTS_DIR / name
    config = {
        "persona": "You are a helpful AI assistant.", 
        "name": name,
        "description": "Default AI Agent"
    }
    
    if not path.exists():
        return config

    persona_file = path / "persona.md"
    if persona_file.exists():
        config["persona"] = persona_file.read_text(encoding="utf-8")
        
    config_file = path / "config.json"
    if config_file.exists():
        try:
            config.update(json.loads(config_file.read_text(encoding="utf-8")))
        except Exception:
            pass
            
    return config

def list_agents():
    if not AGENTS_DIR.exists():
        return []
    return [d.name for d in AGENTS_DIR.iterdir() if d.is_dir()]

def create_agent_files(name: str, description: str, persona: str = ""):
    path = AGENTS_DIR / name
    path.mkdir(parents=True, exist_ok=True)
    
    final_persona = persona or f"You are {name}, {description}. Be helpful, concise, and professional."
    (path / "persona.md").write_text(final_persona, encoding="utf-8")
    
    config_data = {
        "name": name, 
        "description": description
    }
    (path / "config.json").write_text(json.dumps(config_data, indent=2), encoding="utf-8")
    return name
