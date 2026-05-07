@echo off
setlocal EnableDelayedExpansion

echo ========================================================
echo MatrixKey AIOS - Initialization
echo ========================================================

:: 1. Check Dependencies
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+ and add to PATH.
    pause
    exit /b
)
echo [OK] Python detected.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js and add to PATH.
    pause
    exit /b
)
echo [OK] Node.js detected.

where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Ollama not found. Please install from ollama.com if using local models.
) else (
    echo [OK] Ollama detected.
)

:: 2. Backend Setup
echo.
echo ========================================================
echo Setting up Backend...
echo ========================================================
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo Installing backend dependencies...
pip install -r requirements.txt -q

:: 3. Frontend Setup
echo.
echo ========================================================
echo Setting up Frontend...
echo ========================================================
cd ..\frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

:: 4. Start Services
echo.
echo ========================================================
echo Starting Services...
echo ========================================================

:: Start Backend in a new window
cd ..\backend
start "MatrixKey - Backend" cmd /c "call venv\Scripts\activate.bat && python main.py"

:: Start Frontend in a new window
cd ..\frontend
start "MatrixKey - Frontend" cmd /c "npm run dev"

echo.
echo [SUCCESS] AIOS is booting up in separate windows!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo.
echo Close this window at any time. To stop the servers, close their individual console windows.
pause
