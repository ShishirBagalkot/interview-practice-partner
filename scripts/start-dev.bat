@echo off
echo Starting Interview Practice Partner - Development Mode
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Voice Agent...
start "Voice Agent" cmd /k "cd voice-agent && python api/flask_app.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services started!
echo Backend: http://localhost:5000
echo Voice Agent: http://localhost:5001
echo Frontend: http://localhost:3000
