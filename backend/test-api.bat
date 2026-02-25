@echo off
REM API Testing Script for Windows - Test all endpoints

setlocal enabledelayedexpansion
set "BASE_URL=http://localhost:8080/api"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Biometric Attendance System - API Test Suite        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo === Authentication Tests ===
echo.
echo Testing: Login as Admin
curl -X POST "%BASE_URL%/auth/login" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@biometric.com\",\"password\":\"password\"}"
echo.
echo.

echo === User Management Tests ===
echo.
echo Testing: Get all users
curl -X GET "%BASE_URL%/users"
echo.
echo.

echo Testing: Get user by ID
curl -X GET "%BASE_URL%/users/1"
echo.
echo.

echo === Course Management Tests ===
echo.
echo Testing: Get all courses
curl -X GET "%BASE_URL%/courses"
echo.
echo.

echo Testing: Get courses by lecturer
curl -X GET "%BASE_URL%/courses/lecturer/2"
echo.
echo.

echo === Attendance Tests ===
echo.
echo Testing: Get all attendance records
curl -X GET "%BASE_URL%/attendance"
echo.
echo.

echo Testing: Get student attendance
curl -X GET "%BASE_URL%/attendance/student/3"
echo.
echo.

echo === Biometric Tests ===
echo.
echo Testing: Get biometric enrollment
curl -X GET "%BASE_URL%/biometric/user/3"
echo.
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║              API Testing Complete                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo If all tests passed, your backend is working correctly!
echo.
pause
