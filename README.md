# Biometric Attendance System

A complete biometric-based attendance management system with React frontend and Spring Boot backend.

## Features

✅ **User Management**
- Three roles: Admin, Lecturer, Student
- Secure authentication with password hashing
- User profile management

✅ **Course Management**
- Create and manage courses
- Lecturer assignment
- Student enrollment
- Department organization

✅ **Attendance Tracking**
- Manual attendance marking
- Fingerprint biometric support
- Face recognition support
- Real-time session management
- Attendance statistics

✅ **Biometric System**
- Fingerprint enrollment
- Face recognition enrollment
- Verification scoring
- Multi-modal biometric support

✅ **Admin Dashboard**
- User management
- System statistics
- Report generation
- Course administration

## Technology Stack

**Frontend:**
- React 19
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

**Backend:**
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0
- Spring Security
- Maven

## Quick Start

### Easiest Way (Automated Setup)

**Windows:**
```bash
./quickstart.bat
```

**Linux/macOS:**
```bash
chmod +x quickstart.sh
./quickstart.sh
```

### Docker Setup

```bash
docker-compose up
```

### Manual Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
mvn spring-boot:run
```

Backend runs on: http://localhost:8080/api

### Terminal 2: Start Frontend
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@biometric.com | password |
| Lecturer | lecturer1@biometric.com | password |
| Student | student1@biometric.com | password |

## Project Structure

```
biometric-attendance-system-app/
├── src/                          # Frontend source
│   ├── components/               # React components
│   ├── context/                  # Global state
│   ├── services/                 # API client
│   ├── types/                    # TypeScript types
│   └── ...
├── backend/                      # Spring Boot backend
│   ├── src/main/java/           # Java source code
│   ├── src/main/resources/       # Configuration and SQL
│   ├── pom.xml                   # Maven configuration
│   └── ...
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite configuration
├── docker-compose.yml            # Docker composition
├── SETUP_GUIDE.md                # Detailed setup guide
└── QUICKSTART.md                 # Quick start guide
```

## Key Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/{id}` - Get student attendance
- `GET /api/courses/{id}/attendance` - Get course attendance

For complete API documentation, see [Backend README](backend/README.md)

## Common Issues & Solutions

### MySQL Connection Error
```
Error: Connection refused
```
**Solution:** Start MySQL service
- Windows: `net start MySQL80`
- macOS: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Port Already In Use
**Solution:** Change port in application.properties or kill existing process

### Frontend Can't Connect to Backend
**Solution:** 
1. Ensure backend is running: `https://localhost:8080/api/users`
2. Check `.env.local` has correct API URL
3. Verify CORS settings in application.properties

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more troubleshooting.

## Development

### Making Changes

**Frontend**
- Edit files in `src/`
- Hot reload automatic
- No rebuild needed

**Backend**
- Edit Java files
- Restart with `mvn spring-boot:run`
- Database changes auto-apply via JPA

### Adding Features

1. Update types in `src/types/index.ts`
2. Create backend model in `backend/src/main/java/com/biometric/model/`
3. Create service and controller
4. Update API client in `src/services/ApiClient.ts`
5. Add UI component in `src/components/`

## Production Deployment

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for Docker and deployment instructions.

## Database Schema

The system uses MySQL with the following main tables:
- **users** - User accounts (admins, lecturers, students)
- **courses** - Course information
- **course_enrollments** - Student-course relationships
- **attendance_sessions** - Attendance sessions
- **attendance_records** - Individual attendance marks
- **biometric_enrollments** - Biometric enrollment status

## Support

For detailed setup instructions and troubleshooting:
1. Read [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Check [Backend README](backend/README.md)
3. Review [QUICKSTART.md](QUICKSTART.md)

## License

This project is provided as-is for educational and development purposes.

## Version

**Current Version:** 1.0.0
**Last Updated:** February 2026

---

**Ready to get started?** Run `./quickstart.bat` (Windows) or `./quickstart.sh` (Linux/macOS)!
