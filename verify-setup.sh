#!/bin/bash

# Installation Verification Script
# Verifies all components are properly installed

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        Biometric Attendance System - Verification Script      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PASSED=0
FAILED=0

# Function to check component
check_component() {
    local name=$1
    local command=$2
    
    if command -v $command &> /dev/null; then
        version=$($command --version 2>&1 | head -n1)
        echo "✓ $name: $version"
        ((PASSED++))
    else
        echo "❌ $name: Not installed"
        ((FAILED++))
    fi
}

# Function to check file
check_file() {
    local name=$1
    local path=$2
    
    if [ -f "$path" ]; then
        echo "✓ $name: Found"
        ((PASSED++))
    else
        echo "❌ $name: Not found at $path"
        ((FAILED++))
    fi
}

echo "=== Checking Prerequisites ==="
echo ""

check_component "Java" "java"
check_component "Maven" "mvn"
check_component "Node.js" "node"
check_component "npm" "npm"
check_component "MySQL" "mysql"

echo ""
echo "=== Checking Backend Files ==="
echo ""

check_file "pom.xml" "backend/pom.xml"
check_file "Application.java" "backend/src/main/java/com/biometric/BiometricAttendanceApplication.java"
check_file "application.properties" "backend/src/main/resources/application.properties"
check_file "Database Schema" "backend/src/main/resources/db/schema.sql"

echo ""
echo "=== Checking Frontend Files ==="
echo ""

check_file "package.json" "package.json"
check_file "vite.config.ts" "vite.config.ts"
check_file "AppContext.tsx" "src/context/AppContext.tsx"
check_file "ApiClient.ts" "src/services/ApiClient.ts"
check_file ".env.local" ".env.local"

echo ""
echo "=== Checking Documentation ==="
echo ""

check_file "README.md" "README.md"
check_file "Setup Guide" "SETUP_GUIDE.md"
check_file "Quick Start" "QUICKSTART.md"
check_file "Backend README" "backend/README.md"

echo ""
echo "=== Checking Build Scripts ==="
echo ""

check_file "setup.bat" "backend/setup.bat"
check_file "run.bat" "backend/run.bat"
check_file "quickstart.bat" "quickstart.bat"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║             Verification Results                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Components Found:  $PASSED ✓"
echo "Components Missing: $FAILED ❌"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✓ All components are properly installed!"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./quickstart.sh (Linux/macOS) or quickstart.bat (Windows)"
    echo "2. Or manually start:"
    echo "   - Terminal 1: cd backend && mvn spring-boot:run"
    echo "   - Terminal 2: npm run dev"
    echo "3. Open: http://localhost:5173"
    exit 0
else
    echo "❌ Some components are missing!"
    echo ""
    echo "See SETUP_GUIDE.md for installation instructions"
    exit 1
fi
