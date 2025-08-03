@echo off
echo ========================================
echo    FOREST FIRE MONITORING SYSTEM
echo ========================================
echo.

echo Starting Forest Fire Monitoring System...
echo.

echo [1/6] Installing dependencies...
call npm install
echo.

echo [2/6] Starting Heat Sensor...
start "Heat Sensor" cmd /k "node sensors/heat_sensor.js"
timeout /t 2 /nobreak >nul

echo [3/6] Starting Smoke Sensor...
start "Smoke Sensor" cmd /k "node sensors/smoke_sensor.js"
timeout /t 2 /nobreak >nul

echo [4/6] Starting Fire Sensor...
start "Fire Sensor" cmd /k "node sensors/fire_sensor.js"
timeout /t 2 /nobreak >nul

echo [5/6] Starting Wind Sensor...
start "Wind Sensor" cmd /k "node sensors/wind_sensor.js"
timeout /t 2 /nobreak >nul

echo [6/6] Starting Alarm System...
start "Alarm System" cmd /k "node alarm_system.js"
timeout /t 2 /nobreak >nul

echo.
echo [OPTIONAL] Starting Monitor Dashboard...
start "Monitor Dashboard" cmd /k "node monitor_dashboard.js"

echo.
echo ========================================
echo All systems started successfully!
echo.
echo To start Node-RED, run: npx node-red
echo Then open: http://127.0.0.1:1880/
echo ========================================
echo.
pause 