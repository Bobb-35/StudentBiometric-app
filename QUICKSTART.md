# Biometric Attendance System - Quick Start

## One-Command Setup (Windows)

Open PowerShell or Command Prompt and run:

```bash
./quickstart.bat
```

This script will:
1. Check prerequisites (Java, Maven, Node.js, MySQL)
2. Setup MySQL database
3. Build backend
4. Install frontend dependencies
5. Start both servers

## One-Command Setup (Linux/macOS)

```bash
chmod +x quickstart.sh
./quickstart.sh
```

## What Gets Installed

✓ Backend (Spring Boot) - Port 8080
✓ Frontend (Vite + React) - Port 5173
✓ MySQL Database
✓ All dependencies

## After Setup

1. **Frontend**: http://localhost:5173
2. **Backend API**: http://localhost:8080/api
3. **Login**: admin@biometric.com / password

## If Something Goes Wrong

1. Check MySQL is running
2. Delete `backend/target` and rebuild
3. Delete `node_modules` and run `npm install`
4. Check port availability (8080, 5173)

## Docker Alternative

```bash
docker-compose up
```

Starts everything in containers automatically.
