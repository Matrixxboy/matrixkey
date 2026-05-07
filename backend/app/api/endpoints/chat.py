from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.chat import ChatRequest, SessionUpdate
from app.services.ollama import get_ollama_response, count_tokens
from app.services.agent_loader import load_agent_config
from app.db.database import save_message, get_messages, get_sessions, create_session, update_session_title, delete_session
from app.services.memory import save_embedding, search_memory
from app.services.skill_executor import execute_skill, list_available_skills
import re

router = APIRouter()

# In-memory STM (Short Term Memory)
active_sessions: dict[int, list[dict]] = {}

def get_session(session_id: int, company_id: int = 1) -> list[dict]:
    if session_id not in active_sessions:
        history = get_messages(session_id, limit=20, company_id=company_id)
        active_sessions[session_id] = [{"role": m["role"], "content": m["content"]} for m in history]
    return active_sessions[session_id]

def trim_context(messages: list[dict], max_tokens: int = 4096) -> list[dict]:
    trimmed = []
    current_tokens = 0
    for msg in reversed(messages):
        msg_tokens = count_tokens(msg["content"])
        if current_tokens + msg_tokens > max_tokens:
            break
        trimmed.insert(0, msg)
        current_tokens += msg_tokens
    return trimmed

async def generate_session_title(company_id: int, session_id: int, first_message: str):
    prompt = f"Generate a very short, 2-4 word title for a chat session starting with this message: '{first_message}'. Do not use quotes or prefixes, just the title."
    messages = [{"role": "user", "content": prompt}]
    title = await get_ollama_response("llama3.2", messages)
    clean_title = title.replace('"', '').replace("'", "").strip()
    update_session_title(session_id, clean_title, company_id)

@router.get("/sessions")
def get_chat_sessions(company_id: int = 1, agent: str = "Orion"):
    return get_sessions(company_id, agent)

@router.get("/messages")
def get_session_messages(session_id: int, company_id: int = 1):
    return get_messages(session_id, company_id, limit=100)

@router.put("/sessions/{session_id}")
def rename_chat_session(session_id: int, req: SessionUpdate, company_id: int = 1):
    update_session_title(session_id, req.title, company_id)
    return {"status": "success"}

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: int, company_id: int = 1):
    delete_session(session_id, company_id)
    if session_id in active_sessions:
        del active_sessions[session_id]
    return {"status": "success"}

@router.post("/chat")
async def chat_endpoint(req: ChatRequest, background_tasks: BackgroundTasks):
    agent_config = load_agent_config(req.agent)
    skills = list_available_skills()
    
    # Session Management
    session_id = req.session_id
    if not session_id:
        session_id = create_session(req.company_id, req.agent, "New Session")
        background_tasks.add_task(generate_session_title, req.company_id, session_id, req.message)
        
    session = get_session(session_id, company_id=req.company_id)

    # Add user message
    user_tokens = count_tokens(req.message)
    msg_id = save_message(session_id, req.agent, "user", req.message, user_tokens, company_id=req.company_id)
    session.append({"role": "user", "content": req.message})
    
    # Context Search (Removed automatic injection to prevent RAG hallucinations)
    # The agent must now explicitly use the [CALL:search_memory:QUERY] skill if it needs past info.
    context_str = ""

    # Agentic System Prompt
    skill_manual = """
## SKILL MANUAL
1. manage_workspace: Advanced task engine.
   - [CALL:manage_workspace:list] -> Shows all operations.
   - [CALL:manage_workspace:create:TITLE] -> Create a new objective.
   - [CALL:manage_workspace:subtask:PARENT_ID:TITLE] -> Add a dependency.
   - [CALL:manage_workspace:status:ID:STATUS] -> Update state (tasks, pending, completed, blocked).
   - [CALL:manage_workspace:delete:ID] -> Remove unit.
2. switch_agent: Transfer to another specialized essence.
   - [CALL:switch_agent:AGENT_NAME] -> Hand over.
3. read_file: Read file contents from the local filesystem.
   - [CALL:read_file:PATH] -> Returns file contents.
4. system_cmd: Run a terminal command.
   - [CALL:system_cmd:COMMAND] -> Returns stdout/stderr.
5. search_memory: Semantic search of past long-term conversations.
   - [CALL:search_memory:QUERY] -> Returns relevant memory chunks.

## GUIDELINES
- REASONING: You MUST enclose your internal thought process in <reasoning> tags before taking any action or answering.
- CONFIRMATION: If a request is ambiguous or high-impact (like deleting), ask for specific confirmation before taking action.
- NOTIFICATION: After executing a skill and receiving a SKILL_RESULT, you MUST tell the user exactly what you have done in clear, natural language.
"""
    
    skill_list_str = ", ".join(skills)
    system_prompt = f"""
{agent_config['persona']}

{context_str}

{skill_manual}

## EXECUTION PROTOCOL
To use a skill, respond EXACTLY with your reasoning, followed by:
[CALL:skill_name:args]
Then wait for the result. Do not perform multiple calls in one turn.
Example:
<reasoning>I need to check the tasks to answer this.</reasoning>
[CALL:manage_workspace:list]
"""

    loop_count = 0
    final_reply = ""
    workspace_modified = False
    
    while loop_count < 3:
        trimmed = trim_context(session)
        ollama_messages = [{"role": "system", "content": system_prompt}, *trimmed]
        
        reply = await get_ollama_response(req.model, ollama_messages)
        
        # Check for tool call [CALL:name:args]
        call_match = re.search(r"\[CALL:(\w+):(.+)\]", reply)
        if call_match:
            skill_name = call_match.group(1)
            skill_args = call_match.group(2)
            
            # Track workspace modifications
            if skill_name == "manage_workspace" and not skill_args.startswith("list"):
                workspace_modified = True

            # Execute Skill
            result = execute_skill(skill_name, skill_args, req.company_id, req.agent)
            
            # Handle Agent Switching
            if "SWITCH_TO_AGENT:" in result:
                new_agent = result.split(":")[1].strip()
                return {
                    "reply": f"Handing over to {new_agent}...",
                    "agent": new_agent,
                    "session_id": session_id,
                    "switched": True,
                    "workspace_modified": workspace_modified
                }

            # Add to session
            session.append({"role": "assistant", "content": reply})
            session.append({"role": "user", "content": f"SKILL_RESULT:\n{result}\n\nINSTRUCTION: Using the result above, answer my previous request. You MUST present the actual data/information retrieved to me clearly. Do NOT just say 'I retrieved the data'—actually show me the data."})
            loop_count += 1
            continue
        else:
            final_reply = reply
            break

    # Save final assistant message
    assistant_tokens = count_tokens(final_reply)
    save_message(session_id, req.agent, "assistant", final_reply, assistant_tokens, company_id=req.company_id)
    session.append({"role": "assistant", "content": final_reply})

    return {
        "reply": final_reply, 
        "agent": req.agent,
        "session_id": session_id,
        "skills_used": loop_count,
        "workspace_modified": workspace_modified
    }
