from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.services.ollama import get_ollama_response, count_tokens
from app.services.agent_loader import load_agent_config
from app.db.database import save_message, get_messages
from app.services.memory import save_embedding, search_memory

router = APIRouter()

# In-memory STM (Short Term Memory)
sessions: dict[str, list[dict]] = {}

def get_session(agent: str) -> list[dict]:
    if agent not in sessions:
        # Load last 10 messages from DB to seed session
        history = get_messages(agent, limit=10)
        sessions[agent] = [{"role": m["role"], "content": m["content"]} for m in history]
    return sessions[agent]

def trim_context(messages: list[dict], max_tokens: int = 4096) -> list[dict]:
    """Trim context based on token count (Phase 2)"""
    trimmed = []
    current_tokens = 0
    for msg in reversed(messages):
        msg_tokens = count_tokens(msg["content"])
        if current_tokens + msg_tokens > max_tokens:
            break
        trimmed.insert(0, msg)
        current_tokens += msg_tokens
    return trimmed

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    agent_config = load_agent_config(req.agent)
    session = get_session(req.agent)

    # Add user message
    user_tokens = count_tokens(req.message)
    msg_id = save_message(req.agent, "user", req.message, user_tokens)
    session.append({"role": "user", "content": req.message})
    
    # Generate embedding for LTM (Long Term Memory)
    try:
        save_embedding(msg_id, req.message)
    except Exception as e:
        print(f"Embedding error: {e}")

    # Search Long Term Memory
    memories = search_memory(req.agent, req.message, limit=5)
    context_chunks = [m["content"] for m in memories if m["score"] > 0.4] # Only relevant ones
    
    context_str = ""
    if context_chunks:
        context_str = "\n\nRelevant context from past conversations:\n" + "\n---\n".join(context_chunks)

    # Trim context for Ollama (STM)
    trimmed = trim_context(session)

    # Prepare messages for Ollama
    system_prompt = agent_config["persona"] + context_str
    ollama_messages = [{"role": "system", "content": system_prompt}, *trimmed]

    # Get response
    reply = await get_ollama_response(req.model, ollama_messages)

    # Add assistant message
    assistant_tokens = count_tokens(reply)
    ast_id = save_message(req.agent, "assistant", reply, assistant_tokens)
    session.append({"role": "assistant", "content": reply})
    
    # Generate embedding for assistant reply
    try:
        save_embedding(ast_id, reply)
    except Exception as e:
        print(f"Embedding error: {e}")

    return {
        "reply": reply, 
        "agent": req.agent, 
        "context_length": len(trimmed),
        "tokens": {
            "user": user_tokens,
            "assistant": assistant_tokens
        }
    }
