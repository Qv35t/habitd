@echo off
title HABITD Launcher
echo [habitd] Checking environment...
where node >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause & exit /b 1
)
where pnpm >nul 2>&1
IF %ERRORLEVEL% NEQ 0 ( npm install -g pnpm )
IF NOT EXIST "node_modules\" ( pnpm install )
pnpm dev
