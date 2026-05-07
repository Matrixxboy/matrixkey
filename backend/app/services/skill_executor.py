import os
import sys
import io
from pathlib import Path
from app.db.database import get_db_connection

SKILLS_DIR = Path("skills")

class SkillContext:
    def __init__(self, company_id: int, agent_name: str):
        self.company_id = company_id
        self.agent_name = agent_name
        self.db = get_db_connection()
        self.output = io.StringIO()

    def log(self, message):
        self.output.write(str(message) + "\n")

    def close(self):
        self.db.close()

def execute_skill(skill_name: str, args: str, company_id: int, agent_name: str):
    skill_file = SKILLS_DIR / f"{skill_name}.py"
    if not skill_file.exists():
        return f"Error: Skill '{skill_name}' not found."

    context = SkillContext(company_id, agent_name)
    
    # Prepare global environment for the skill
    global_env = {
        "print": context.log
    }

    try:
        code = skill_file.read_text()
        exec(code, global_env)
        
        if "run" in global_env:
            # Call the run function explicitly
            result = global_env["run"](args, context)
            if result:
                context.log(result)
        else:
            return f"Error: Skill '{skill_name}' does not define a run() function."
            
        final_result = context.output.getvalue()
        return final_result if final_result else "Skill executed successfully (no output)."
    except Exception as e:
        return f"Error executing skill '{skill_name}': {str(e)}"
    finally:
        context.close()

def list_available_skills():
    if not SKILLS_DIR.exists():
        return []
    return [f.stem for f in SKILLS_DIR.glob("*.py")]
