@echo off
REM Colors for Windows
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Biometric Attendance System - Backend Setup          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [1/4] Checking prerequisites...
where java >nul 2>nul || (
    echo ❌ Java is not installed!
    exit /b 1
)
where mvn >nul 2>nul || (
    echo ❌ Maven is not installed!
    exit /b 1
)
echo [OK] Java and Maven are installed
echo.

echo [2/4] Building Maven project...
call mvn clean install -DskipTests
if errorlevel 1 (
    echo ❌ Maven build failed!
    exit /b 1
)
echo [OK] Maven build successful
echo.

echo [3/4] Setting up database...
echo Please ensure MySQL is running with:
echo   - Host: localhost
echo   - Port: 3306
echo   - Root password: root
echo.
echo Creating database and tables...
mysql -u root -proot < src\main\resources\db\schema.sql
mysql -u root -proot < src\main\resources\db\sample-data.sql
echo [OK] Database setup complete
echo.

echo [4/4] Setup complete!
echo.
echo To start the server, run:
echo   mvn spring-boot:run
echo.
echo Backend will be available at:
echo   http://localhost:8080/api
echo.
pause
