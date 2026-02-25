@echo off
REM Biometric Attendance System - Quick Start Script for Windows

color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     Biometric Attendance System - Automatic Setup              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check prerequisites
echo [1/6] Checking prerequisites...
where java >nul 2>nul
if errorlevel 1 (
    echo ❌ Java is not installed!
    echo Download from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
    pause
    exit /b 1
)
echo ✓ Java found

where mvn >nul 2>nul
if errorlevel 1 (
    echo ❌ Maven is not installed!
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo ✓ Maven found

where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found

where mysql >nul 2>nul
if errorlevel 1 (
    echo ❌ MySQL is not installed or not in PATH!
    echo Download from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)
echo ✓ MySQL found
echo.

REM Setup database
echo [2/6] Setting up MySQL database...
mysql -u root -proot < backend\src\main\resources\db\schema.sql 2>nul
mysql -u root -proot < backend\src\main\resources\db\sample-data.sql 2>nul
if errorlevel 1 (
    echo ⚠ Warning: Could not execute SQL files
    echo Make sure MySQL is running with username 'root' and password 'root'
) else (
    echo ✓ Database setup complete
)
echo.

REM Build backend
echo [3/6] Building backend...
cd backend
call mvn clean install -DskipTests -q
if errorlevel 1 (
    echo ❌ Backend build failed!
    pause
    exit /b 1
)
echo ✓ Backend built successfully
cd ..
echo.

REM Install frontend dependencies
echo [4/6] Installing frontend dependencies...
call npm install -q
if errorlevel 1 (
    echo ❌ Failed to install frontend dependencies!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

REM Create .env.local
echo [5/6] Configuring environment...
if not exist .env.local (
    echo VITE_API_URL=http://localhost:8080/api > .env.local
    echo ✓ .env.local created
) else (
    echo ✓ .env.local already exists
)
echo.

echo [6/6] Setup complete!
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   🎉 Ready to Run!                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo.
echo 1. Open TWO PowerShell/CMD windows
echo.
echo    WINDOW 1 (Backend) - Run:
echo    cd backend
echo    mvn spring-boot:run
echo.
echo    WINDOW 2 (Frontend) - Run:
echo    npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo Default login credentials:
echo   Email: admin@biometric.com
echo   Password: password
echo.
pause
