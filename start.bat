@echo off
echo ========================================
echo  AI-Powered Research Platform Launcher
echo ========================================
echo.
echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend Dev Server (Port 5173)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ Both servers are launching...
echo.
echo  Backend API:  http://localhost:5000
echo  Frontend App: http://localhost:5173
echo.
pause
