#!/bin/bash

# Biometric Attendance System - Quick Start Script for Linux/macOS

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Biometric Attendance System - Automatic Setup              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "[1/6] Checking prerequisites..."

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed!"
    echo "Download from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html"
    exit 1
fi
echo "✓ Java found"

if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed!"
    echo "Download from: https://maven.apache.org/download.cgi"
    exit 1
fi
echo "✓ Maven found"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found"

if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH!"
    echo "Install: brew install mysql (macOS) or apt-get install mysql-server (Linux)"
    exit 1
fi
echo "✓ MySQL found"

if ! pgrep -x "mysqld" > /dev/null; then
    echo "⚠ MySQL is not running"
    echo "Start MySQL:"
    echo "  macOS: brew services start mysql"
    echo "  Linux: sudo systemctl start mysql"
    read -p "Press Enter after starting MySQL..."
fi
echo ""

# Setup database
echo "[2/6] Setting up MySQL database..."
mysql -u root -proot < backend/src/main/resources/db/schema.sql 2>/dev/null
mysql -u root -proot < backend/src/main/resources/db/sample-data.sql 2>/dev/null
echo "✓ Database setup complete"
echo ""

# Build backend
echo "[3/6] Building backend..."
cd backend || exit 1
mvn clean install -DskipTests -q
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
echo "✓ Backend built successfully"
cd .. || exit 1
echo ""

# Install frontend dependencies
echo "[4/6] Installing frontend dependencies..."
npm install -q
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies!"
    exit 1
fi
echo "✓ Frontend dependencies installed"
echo ""

# Create .env.local
echo "[5/6] Configuring environment..."
if [ ! -f .env.local ]; then
    echo "VITE_API_URL=http://localhost:8080/api" > .env.local
    echo "✓ .env.local created"
else
    echo "✓ .env.local already exists"
fi
echo ""

echo "[6/6] Setup complete!"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   🎉 Ready to Run!                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Open TWO terminal windows"
echo ""
echo "   WINDOW 1 (Backend) - Run:"
echo "   cd backend"
echo "   mvn spring-boot:run"
echo ""
echo "   WINDOW 2 (Frontend) - Run:"
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "Default login credentials:"
echo "   Email: admin@biometric.com"
echo "   Password: password"
echo ""
