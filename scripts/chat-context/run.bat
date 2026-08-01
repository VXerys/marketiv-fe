@echo off
REM Helper batch to run Python chat-context commands with correct environment
REM Usage: run.bat --seed-phases
REM        run.bat --phase-status
REM        run.bat --task-done s0-env
REM        run.bat --sync-progress

setlocal
set PYTHON_EXE=C:\Users\PLN\AppData\Local\Programs\Python\Python311\python.exe
set MARKETIV_MEMORY_DIR=C:\Users\PLN\.claude\projects\C--Users-PLN-marketiv-web\memory
set PYTHONIOENCODING=utf-8

if not exist "%PYTHON_EXE%" (
    echo Error: Python not found at %PYTHON_EXE%
    echo Please install Python 3.11 via: winget install -e --id Python.Python.3.11
    exit /b 1
)

cd /d "%~dp0"
"%PYTHON_EXE%" main.py %*
