# Biometric Attendance System - Complete Setup Guide

## Project Architecture

```
biometric-attendance-system-app/
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Global state management
│   │   ├── services/    # API client
│   │   ├── types/       # TypeScript types
│   │   └── data/        # Mock data
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.local       # Environment variables
│
└── backend/
    ├── src/main/java/com/biometric/
    │   ├── controller/   # REST endpoints
    │   ├── model/        # JPA entities
    │   ├── repository/   # Data access layer
    │   ├── service/      # Business logic
    │   ├── config/       # Configuration
    │   └── util/         # Utilities
    ├── src/main/resources/
    │   ├── application.properties
    │   └── db/
    │       ├── schema.sql
    │       └── sample-data.sql
    ├── pom.xml
    ├── setup.bat / setup.sh
    └── run.bat / run.sh
```

## Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: 8GB RAM minimum
- **Disk Space**: 10GB for development tools

### Required Software
1. **Java 17+**
   - Download: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - Verify: `java -version`

2. **Maven 3.8+**
   - Download: https://maven.apache.org/download.cgi
   - Verify: `mvn -v`

3. **MySQL 8.0+**
   - Download: https://dev.mysql.com/downloads/mysql/
   - Verify: `mysql --version`

4. **Node.js 18+** (for frontend)
   - Download: https://nodejs.org/
   - Verify: `node --version`, `npm --version`

## Installation Steps

### Step 1: Clone/Setup Project

```bash
cd biometric-attendance-system-app
```

### Step 2: Setup MySQL Database

**Start MySQL Service:**

**Windows:**
- MySQL should start automatically after installation
- Or in Command Prompt: `net start MySQL80`

**macOS:**
```bash
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo systemctl start mysql
```

**Create Database:**

```bash
# Open MySQL shell
mysql -u root -p
# Enter password (press Enter if no password set, or enter 'root')

# Create database
CREATE DATABASE biometric_attendance;
EXIT;
```

Or run the schema file:
```bash
mysql -u root -proot < backend/src/main/resources/db/schema.sql
mysql -u root -proot < backend/src/main/resources/db/sample-data.sql
```

### Step 3: Configure Backend

1. Edit `backend/src/main/resources/application.properties`:

```properties
# Update if your MySQL password is different
spring.datasource.password=root

# Configure CORS for your frontend URL
cors.allowed-origins=http://localhost:5173
```

2. Windows:
```bash
cd backend
setup.bat
```

Linux/macOS:
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

### Step 4: Setup Frontend

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
VITE_API_URL=http://localhost:8080/api
```

3. Verify setup:
```bash
npm run build
```

## Running the Application

### Terminal 1: Start Backend

**Windows:**
```bash
cd backend
run.bat
```

**Linux/macOS:**
```bash
cd backend
./run.sh
```

Or:
```bash
cd backend
mvn spring-boot:run
```

Backend starts on: `http://localhost:8080/api`

### Terminal 2: Start Frontend

```bash
npm run dev
```

Frontend starts on: `http://localhost:5173`

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@biometric.com | password |
| Lecturer | lecturer1@biometric.com | password |
| Student | student1@biometric.com | password |
| Student | student2@biometric.com | password |

## Testing the System

### 1. Login Test
- Open http://localhost:5173
- Login with admin@biometric.com / password
- Should see admin dashboard

### 2. Backend API Test

**Using cURL:**
```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biometric.com","password":"password"}'

# Get all users
curl http://localhost:8080/api/users

# Get all courses
curl http://localhost:8080/api/courses
```

**Using Postman:**
- Import collection from `backend/postman-collection.json` (if available)
- Set base URL: `http://localhost:8080/api`
- Test endpoints

### 3. Database Verification

```bash
mysql -u root -proot
USE biometric_attendance;
SELECT * FROM users;
SELECT * FROM courses;
SELECT * FROM attendance_sessions;
EXIT;
```

## API Documentation

### Authentication
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

### Get All Users
```
GET /api/users
```

### Create Course
```
POST /api/courses
{
  "code": "CS301",
  "name": "Advanced Programming",
  "lecturerId": 2,
  "department": "Computer Science",
  "credits": 4,
  "schedule": "MWF 14:00-15:00",
  "room": "Room 301"
}
```

For complete API documentation, see [Backend README](backend/README.md)

## Build & Deployment

### Build Frontend
```bash
npm run build
# Output in dist/ folder
```

### Build Backend
```bash
cd backend
mvn clean install
# Output: target/attendance-system-1.0.0.jar
```

### Run JAR File
```bash
java -jar target/attendance-system-1.0.0.jar
```

## Troubleshooting

### Issue: Backend fails to start

**Solution 1: Check MySQL**
```bash
mysql -u root -p
# If error, start MySQL service
```

**Solution 2: Clear Maven cache**
```bash
cd backend
mvn clean
mvn install
mvn spring-boot:run
```

### Issue: Frontend shows "Cannot connect to API"

**Check 1: Backend is running**
```bash
# In browser: http://localhost:8080/api/users
# Should return JSON array
```

**Check 2: CORS Configuration**
- Verify `cors.allowed-origins` in `application.properties`
- Should include `http://localhost:5173`

**Check 3: .env.local file**
```
VITE_API_URL=http://localhost:8080/api
```

### Issue: MySQL connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Windows:**
```bash
net start MySQL80
```

**macOS:**
```bash
brew services start mysql
```

**Linux:**
```bash
sudo systemctl start mysql
```

### Issue: Port already in use

**Port 8080 (Backend):**
```bash
# Windows - Find process on port 8080
netstat -ano | findstr :8080
# Kill process
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8080
kill -9 <PID>
```

**Port 5173 (Frontend):**
```bash
# Change Vite port in vite.config.ts
```

## Development Workflow

### Making Changes

1. **Frontend Changes**
   - Edit files in `src/`
   - Changes hot-reload automatically
   - No rebuild needed

2. **Backend Changes**
   - Edit Java files
   - Rebuild and restart: `mvn spring-boot:run`
   - Or use hot reload plugin (optional)

3. **Database Schema Changes**
   - Update JPA models
   - Update SQL schema
   - Restart backend (JPA will auto-create tables)

### Adding New Features

**Example: Add new User Role**

1. Update TypeScript type in `src/types/index.ts`
2. Update Java enum in `backend/src/main/java/com/biometric/model/User.java`
3. Add controller endpoint in `backend/src/main/java/com/biometric/controller/`
4. Update API client in `src/services/ApiClient.ts`
5. Add UI component in `src/components/`

## Performance Tips

1. **Database Indexing**
   - Indexes already added to database
   - Check MySQL slow query log

2. **Frontend Optimization**
   - Use React.memo for expensive components
   - Lazy load routes
   - Optimize images

3. **Backend Optimization**
   - Enable JPA caching
   - Add database connection pooling
   - Use pagination for large datasets

## Security Checklist

- [ ] Change MySQL password from 'root'
- [ ] Update JWT secret in application.properties
- [ ] Enable HTTPS for production
- [ ] Set strong CORS allowed-origins
- [ ] Remove default test credentials
- [ ] Setup database backups
- [ ] Enable SQL injection prevention
- [ ] Add rate limiting

## Production Deployment

### Backend (Docker)

Create `backend/Dockerfile`:
```dockerfile
FROM openjdk:17
COPY target/attendance-system-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t attendance-system:1.0 .
docker run -p 8080:8080 attendance-system:1.0
```

### Frontend (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080/api;
    }
}
```

## Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [Vite Documentation](https://vitejs.dev)

## Support & Issues

If you encounter any issues:

1. **Check Logs**
   - Backend: Console output
   - Frontend: Browser console (F12)
   - Database: MySQL error log

2. **Common Issues**
   - See Troubleshooting section above
   - Check if services are running
   - Verify configuration files

3. **Contact**
   - Check project documentation
   - Review error messages carefully
   - Verify all prerequisites are installed

---

**Last Updated**: February 2026
**Version**: 1.0.0
