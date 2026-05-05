# AIOS - Personal AI Operating System

## Development Roadmap

---

## ✅ PHASE 1 (MVP) — Core Engine

- [x] FastAPI backend with health check
- [x] Ollama model integration (chat endpoint)
- [x] Short-term memory (in-memory conversation history)
- [x] Basic agent loader (persona.md + config.json)
- [x] React frontend with chat UI
- [x] Purple dark theme (#0F0529 base)

## 🔲 PHASE 2 — Memory System

- [x] SQLite conversation persistence (LTM)
- [x] Token counting per message
- [x] Rolling context window with auto-trim
- [x] Summarize old context before truncating
- [x] MiniLM embeddings for semantic search
- [x] `/memory/search?q=` endpoint

## 🔲 PHASE 3 — Agent System

- [ ] Multi-agent switcher (load different persona + skills)
- [ ] Agent builder API: POST /agents/create { description }
- [ ] Skills plugin loader (.py files in skills/)
- [ ] Skill trigger detection in messages
- [ ] Built-in skills: file_reader, code_executor, web_search

## 🔲 PHASE 4 — HuggingFace Support

- [ ] HF model loader (GGUF via llama-cpp-python)
- [ ] Auto-detect model format (ollama vs hf)
- [ ] Model manager UI (list, load, unload)
- [ ] Memory-mapped lazy loading

## 🔲 PHASE 5 — Dashboard & Analytics

- [ ] Token usage tracking (per session/day/month)
- [ ] Memory growth chart
- [ ] Agent activity log
- [ ] SQLite-based analytics aggregation

## 🔲 PHASE 6 — Polish

- [ ] Glassmorphism UI panels
- [ ] Offline-first PWA support
- [ ] Pendrive auto-detect & portable launcher script
- [ ] Export/import agent configs

---

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLite, uvicorn
- **AI**: Ollama (primary), llama-cpp-python (HF/GGUF)
- **Frontend**: React + Tailwind CSS
- **Memory**: SQLite + JSON + (Phase 2) sentence-transformers
- **Run**: `./start.sh` (launches both backend + frontend)
