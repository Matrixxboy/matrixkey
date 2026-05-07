from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.endpoints import chat, agents, memory, workspace, orchestrator, company, skills
from app.db.database import init_db
from app.services.ollama import list_local_models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB on startup
    init_db()
    yield

app = FastAPI(title="AIOS - Personal AI Operating System", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, tags=["Chat"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(workspace.router, prefix="/workspace", tags=["Workspace"])
app.include_router(orchestrator.router, prefix="/orchestrator", tags=["Orchestrator"])
app.include_router(company.router, prefix="/company", tags=["Company"])
app.include_router(skills.router, prefix="/skills", tags=["Skills"])

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.1.0 (Refactored)"}

@app.get("/models")
async def get_models():
    return await list_local_models()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
