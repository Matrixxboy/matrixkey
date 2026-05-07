from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path

router = APIRouter()
SKILLS_DIR = Path("skills")
SKILLS_DIR.mkdir(exist_ok=True)

class SkillCreate(BaseModel):
    name: str
    code: str

@router.get("/")
def list_skills():
    skills = []
    for f in SKILLS_DIR.glob("*.py"):
        skills.append(f.stem)
    return {"skills": skills}

@router.get("/{name}")
def get_skill(name: str):
    file_path = SKILLS_DIR / f"{name}.py"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Skill not found")
    return {"name": name, "code": file_path.read_text()}

@router.post("/")
def create_skill(skill: SkillCreate):
    file_path = SKILLS_DIR / f"{skill.name}.py"
    file_path.write_text(skill.code)
    return {"status": "created", "name": skill.name}

@router.put("/{name}")
def update_skill(name: str, skill: SkillCreate):
    file_path = SKILLS_DIR / f"{name}.py"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Skill not found")
    
    # If name changed, rename file
    if name != skill.name:
        new_path = SKILLS_DIR / f"{skill.name}.py"
        file_path.rename(new_path)
        file_path = new_path
        
    file_path.write_text(skill.code)
    return {"status": "updated", "name": skill.name}

@router.delete("/{name}")
def delete_skill(name: str):
    file_path = SKILLS_DIR / f"{name}.py"
    if file_path.exists():
        file_path.unlink()
    return {"status": "deleted"}
