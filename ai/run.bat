@echo off
echo =========================================
echo DRoSeal AI Pipeline Server (FastAPI) Start
echo =========================================

echo 1. Creating venv and installing packages...
if not exist "venv" (
    echo [Info] Creating new virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
echo [Info] Installing requirements...
pip install -r requirements.txt

echo.
echo 2. Starting FastAPI Server...
echo (Close this window or press Ctrl+C to stop)
echo.
python main.py
pause
