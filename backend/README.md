# Biometric Attendance System - Backend API

## Overview
This is a Spring Boot-based REST API for managing biometric-based attendance system. It handles user authentication, course management, attendance tracking, and biometric enrollment.

## System Requirements
- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+
- Windows, macOS, or Linux

## Quick Start

### 1. Prerequisites Installation

**Windows:**
- Download Java 17: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- Download Maven: https://maven.apache.org/download.cgi
- Download MySQL: https://dev.mysql.com/downloads/mysql/

**macOS (using Homebrew):**
```bash
brew install java17
brew install maven
brew install mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install openjdk-17-jdk
sudo apt-get install maven
sudo apt-get install mysql-server
```

### 2. Database Setup

**Start MySQL Service:**

Windows:
- MySQL service typically runs automatically
- Or in Command Prompt: `net start MySQL80`

macOS:
```bash
brew services start mysql
```

Linux:
```bash
sudo systemctl start mysql
```

**Create Database:**

```bash
mysql -u root -p
# Enter password (default: nothing or 'root')
```

Then run the schema file:
```bash
mysql -u root -proot < backend/src/main/resources/db/schema.sql
mysql -u root -proot < backend/src/main/resources/db/sample-data.sql
```

### 3. Build & Run

**Using Windows Batch:**
```bash
cd backend
setup.bat
run.bat
```

**Using Linux/macOS:**
```bash
cd backend
chmod +x setup.sh run.sh
./setup.sh
./run.sh
```

**Or using Maven directly:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on: `http://localhost:8080/api`

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user/{id}` - Get user by ID
- `GET /api/auth/user/email/{email}` - Get user by email
- `PUT /api/auth/user/{id}` - Update user

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role (ADMIN, LECTURER, STUDENT)
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Course Management
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `GET /api/courses/code/{code}` - Get course by code
- `GET /api/courses/lecturer/{lecturerId}` - Get courses by lecturer
- `GET /api/courses/department/{department}` - Get courses by department
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Attendance Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/{id}` - Get session by ID
- `GET /api/sessions/course/{courseId}` - Get sessions by course
- `GET /api/sessions/lecturer/{lecturerId}` - Get sessions by lecturer
- `GET /api/sessions/date/{date}` - Get sessions by date
- `GET /api/sessions/status/{status}` - Get sessions by status
- `POST /api/sessions` - Create session
- `PUT /api/sessions/{id}` - Update session
- `DELETE /api/sessions/{id}` - Delete session

### Attendance Records
- `GET /api/attendance` - Get all records
- `GET /api/attendance/{id}` - Get record by ID
- `GET /api/attendance/student/{studentId}` - Get records by student
- `GET /api/attendance/course/{courseId}` - Get records by course
- `GET /api/attendance/session/{sessionId}` - Get records by session
- `GET /api/attendance/student/{studentId}/course/{courseId}` - Get student course attendance
- `POST /api/attendance` - Create record
- `PUT /api/attendance/{id}` - Update record
- `DELETE /api/attendance/{id}` - Delete record

### Biometric Management
- `GET /api/biometric/user/{userId}` - Get biometric enrollment
- `POST /api/biometric/enroll` - Enroll biometric
- `PUT /api/biometric/user/{userId}` - Update enrollment

## Default Test Credentials

```
Admin Account:
Email: admin@biometric.com
Password: password

Lecturer Account:
Email: lecturer1@biometric.com
Password: password

Student Accounts:
Email: student1@biometric.com
Password: password

Email: student2@biometric.com
Password: password
```

## Configuration

Edit `backend/src/main/resources/application.properties` to configure:

```properties
# Server Port
server.port=8080

# Database Connection
spring.datasource.url=jdbc:mysql://localhost:3306/biometric_attendance
spring.datasource.username=root
spring.datasource.password=root

# CORS Settings
cors.allowed-origins=http://localhost:5173,http://localhost:3000

# Password reset email delivery (Resend)
resend.api-key=${RESEND_API_KEY}
resend.from-email=${RESEND_FROM_EMAIL}
```

## Database Schema

### Tables
1. **users** - Store user accounts (admins, lecturers, students)
2. **courses** - Store course information
3. **course_enrollments** - Store student-course relationships
4. **attendance_sessions** - Store attendance sessions
5. **attendance_records** - Store individual attendance marks
6. **biometric_enrollments** - Store biometric enrollment status

## Troubleshooting

### MySQL Connection Error
```
Error: "Connection refused"
```
**Solution:**
- Ensure MySQL is running: `mysql -u root -p`
- Check connection string in `application.properties`
- Verify username and password

### Port Already In Use
```
Error: "Port 8080 is already in use"
```
**Solution:**
- Change port in `application.properties`: `server.port=8081`
- Or kill the process using port 8080

### Maven Build Fails
**Solution:**
- Clear Maven cache: `mvn clean`
- Update Maven: `mvn -v` (check version)
- Install dependencies: `mvn install`

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/biometric/
│   │   │   ├── controller/     # REST endpoints
│   │   │   ├── model/           # JPA entities
│   │   │   ├── repository/      # Data access
│   │   │   ├── service/         # Business logic
│   │   │   ├── config/          # Configuration classes
│   │   │   └── util/            # Utility classes
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/
│   │           ├── schema.sql
│   │           └── sample-data.sql
│   └── test/
├── pom.xml
├── setup.bat / setup.sh
└── run.bat / run.sh
```

## Development

### Adding New Endpoints
1. Create model in `model/`
2. Create repository in `repository/`
3. Create service in `service/`
4. Create controller in `controller/`

### Database Changes
1. Update JPA model
2. Update SQL schema
3. Run: `mvn spring-boot:run` (JPA will auto-create tables)

## API Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biometric.com","password":"password"}'

# Get all users
curl http://localhost:8080/api/users

# Create course
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{"code":"CS101","name":"Programming","lecturerId":2,"department":"CS","credits":3}'
```

### Using Postman
1. Import the API collection
2. Set base URL: `http://localhost:8080/api`
3. Test endpoints

## Security Notes
- Passwords are hashed using BCrypt
- CORS is enabled for frontend access
- In production, enable JWT-based authentication
- Update `jwt.secret` in properties file

## Support
For issues or questions, check logs in console output during server startup.

## License
This project is part of the Biometric Attendance System application.
