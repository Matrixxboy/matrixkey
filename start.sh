#!/bin/bash

# AIOS Startup Script
# Robust dependency handling for Python, Node, and Ollama

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}⬡ MatrixKey AIOS - Initialization${NC}"

# Check for Python
if ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found. Please install Python 3.10+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python detected${NC}"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js detected${NC}"

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}! Ollama not found in PATH. Please install it from ollama.com${NC}"
else
    echo -e "${GREEN}✓ Ollama detected${NC}"
fi

# 1. Backend Setup
echo -e "\n${CYAN}⬡ Setting up Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python -m venv venv
fi

# Activate venv (detect OS)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID $BACKEND_PID) → http://localhost:8000${NC}"

# 2. Frontend Setup
echo -e "\n${CYAN}⬡ Setting up Frontend...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node dependencies (this may take a minute)...${NC}"
    npm install -s
fi
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID $FRONTEND_PID) → http://localhost:5173${NC}"

# 3. Ollama Model Check
echo -e "\n${CYAN}⬡ Checking Ollama Models...${NC}"
if command -v ollama &> /dev/null; then
    # Try to check if model exists, if not pull it
    if ! ollama list | grep -q "llama3.2"; then
        echo -e "${YELLOW}Pulling llama3.2 model...${NC}"
        ollama pull llama3.2
    fi
    echo -e "${GREEN}✓ Model llama3.2 is ready${NC}"
else
    echo -e "${YELLOW}⚠ Ollama not installed. Skip model check.${NC}"
fi

echo -e "\n${GREEN}⬡ AIOS is running!${NC}"
echo -e "  - Frontend: http://localhost:5173"
echo -e "  - Backend:  http://localhost:8000"
echo -e "  - Use Ctrl+C to stop all services\n"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
