import httpx
import tiktoken
from fastapi import HTTPException

OLLAMA_URL = "http://localhost:11434/api"

def count_tokens(text: str) -> int:
    """Approximate token count using tiktoken (cl100k_base for GPT-4/Llama3 style)"""
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))
    except:
        # Fallback to rough estimate if tiktoken fails
        return len(text) // 4

async def get_ollama_response(model: str, messages: list[dict]):
    payload = {
        "model": model,
        "messages": messages,
        "stream": False
    }
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(f"{OLLAMA_URL}/chat", json=payload)
            r.raise_for_status()
            data = r.json()
            return data["message"]["content"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

async def list_local_models():
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{OLLAMA_URL}/tags")
            return r.json()
    except:
        return {"models": [], "error": "Ollama not running"}
