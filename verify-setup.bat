@echo off
REM Installation Verification Script for Windows

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        Biometric Attendance System - Verification Script      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set PASSED=0
set FAILED=0

echo === Checking Prerequisites ===
echo.

echo Checking Java...
where java >nul 2>nul
if errorlevel 1 (
    echo ❌ Java: Not installed
    set /a FAILED+=1
) else (
    echo ✓ Java: Found
    set /a PASSED+=1
)

echo Checking Maven...
where mvn >nul 2>nul
if errorlevel 1 (
    echo ❌ Maven: Not installed
    set /a FAILED+=1
) else (
    echo ✓ Maven: Found
    set /a PASSED+=1
)

echo Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js: Not installed
    set /a FAILED+=1
) else (
    echo ✓ Node.js: Found
    set /a PASSED+=1
)

echo Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo ❌ npm: Not installed
    set /a FAILED+=1
) else (
    echo ✓ npm: Found
    set /a PASSED+=1
)

echo Checking MySQL...
where mysql >nul 2>nul
if errorlevel 1 (
    echo ❌ MySQL: Not installed
    set /a FAILED+=1
) else (
    echo ✓ MySQL: Found
    set /a PASSED+=1
)

echo.
echo === Checking Backend Files ===
echo.

if exist "backend\pom.xml" (
    echo ✓ pom.xml: Found
    set /a PASSED+=1
) else (
    echo ❌ pom.xml: Not found
    set /a FAILED+=1
)

if exist "backend\src\main\resources\application.properties" (
    echo ✓ application.properties: Found
    set /a PASSED+=1
) else (
    echo ❌ application.properties: Not found
    set /a FAILED+=1
)

echo.
echo === Checking Frontend Files ===
echo.

if exist "package.json" (
    echo ✓ package.json: Found
    set /a PASSED+=1
) else (
    echo ❌ package.json: Not found
    set /a FAILED+=1
)

if exist ".env.local" (
    echo ✓ .env.local: Found
    set /a PASSED+=1
) else (
    echo ❌ .env.local: Not found
    set /a FAILED+=1
)

echo.
echo === Checking Documentation ===
echo.

if exist "README.md" (
    echo ✓ README.md: Found
    set /a PASSED+=1
) else (
    echo ❌ README.md: Not found
    set /a FAILED+=1
)

if exist "SETUP_GUIDE.md" (
    echo ✓ SETUP_GUIDE.md: Found
    set /a PASSED+=1
) else (
    echo ❌ SETUP_GUIDE.md: Not found
    set /a FAILED+=1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║             Verification Results                              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Components Found:  %PASSED% ✓
echo Components Missing: %FAILED% ❌
echo.

if %FAILED% equ 0 (
    echo ✓ All components are properly installed!
    echo.
    echo Next steps:
    echo 1. Run: quickstart.bat
    echo 2. Or manually start:
    echo    - Terminal 1: cd backend ^&^& mvn spring-boot:run
    echo    - Terminal 2: npm run dev
    echo 3. Open: http://localhost:5173
) else (
    echo ❌ Some components are missing!
    echo.
    echo See SETUP_GUIDE.md for installation instructions
)

echo.
pause
