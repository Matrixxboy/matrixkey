from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    agent: str = "default"
    model: str = "llama3.2"
    company_id: int = 1
    session_id: Optional[int] = None

class SessionUpdate(BaseModel):
    title: str

class AgentCreate(BaseModel):
    name: str
    description: str
    persona: str = ""

class Message(BaseModel):
    role: str
    content: str
    ts: int

class MemorySearchRequest(BaseModel):
    query: str
    agent: str = "default"
    limit: int = 5
