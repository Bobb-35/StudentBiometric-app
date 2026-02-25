# System Architecture Diagram

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  React 19 Frontend (Vite + TypeScript)                       │  │
│  │  - Admin Dashboard      - Lecturer Dashboard                 │  │
│  │  - Student Dashboard    - Login Page                         │  │
│  │  - Course Management    - Attendance Tracking                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    HTTP/REST JSON
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY                                     │
│  Port: 8080 | Context: /api | CORS Enabled                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    SPRING BOOT BACKEND                               │
│                   (Java 17, Spring Boot 3.2)                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CONTROLLER LAYER                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │ AuthController  | UserController   | CourseController  │ │  │
│  │  │ SessionController | RecordController | BiometricController│  │
│  │  │                  (6 Controllers, 41 Endpoints)          │ │  │
│  │  └─────────────────────────────────────────────────────────┘ │  │
│  │                           ▼                                   │  │
│  │  ┌─────────────────────────────────────────────────────────┐ │  │
│  │  │                    SERVICE LAYER                        │ │  │
│  │  │ ┌──────────────────────────────────────────────────┐   │ │  │
│  │  │ │ UserService    | CourseService                  │   │ │  │
│  │  │ │ SessionService | RecordService                  │   │ │  │
│  │  │ │ BiometricService         (5 Services)           │   │ │  │
│  │  │ └──────────────────────────────────────────────────┘   │ │  │
│  │  │              ▼                                          │ │  │
│  │  │  ┌─────────────────────────────────────────────────┐   │ │  │
│  │  │  │            REPOSITORY LAYER (JPA)              │   │ │  │
│  │  │  │ ┌──────────────────────────────────────────┐  │   │ │  │
│  │  │  │ │ UserRepository    | CourseRepository    │  │   │ │  │
│  │  │  │ │ EnrollmentRepository                    │  │   │ │  │
│  │  │  │ │ SessionRepository | RecordRepository    │  │   │ │  │
│  │  │  │ │ BiometricRepository   (6 Repositories)  │  │   │ │  │
│  │  │  │ └──────────────────────────────────────────┘  │   │ │  │
│  │  │  └────────────────────────────────────────────────┘   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │                CONFIGURATION LAYER                  │ │  │
│  │  │ ┌────────────────────────────────────────────────┐ │ │  │
│  │  │ │ CorsConfig | SecurityConfig | Other Configs   │ │ │  │
│  │  │ └────────────────────────────────────────────────┘ │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                        JDBC/SQL
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
│                   MySQL 8.0+ Server                                  │
│                   Port: 3306                                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SCHEMA: biometric_attendance                                │  │
│  │                                                              │  │
│  │ Tables:                                                      │  │
│  │  ├─ users (User accounts with roles)                        │  │
│  │  ├─ courses (Course information)                            │  │
│  │  ├─ course_enrollments (Student-Course relationships)       │  │
│  │  ├─ attendance_sessions (Session management)                │  │
│  │  ├─ attendance_records (Individual attendance marks)        │  │
│  │  └─ biometric_enrollments (Biometric enrollment status)     │  │
│  │                                                              │  │
│  │ Indexes: On all lookup fields for performance               │  │
│  │ Constraints: Foreign keys, cascading delete, uniqueness     │  │
│  │ Sample Data: Pre-loaded for testing                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

React Component
    ▼
API Client (ApiClient.ts)
    ▼
HTTP Request with JSON
    ▼
CORS Check
    ▼
Spring DispatcherServlet
    ▼
Controller (@RequestMapping)
    ▼
Service Business Logic
    ▼
Repository (JPA)
    ▼
Hibernate ORM
    ▼
SQL Query
    ▼
MySQL Database
    ▼
Database Response
    ▼
Hibernate Mapping
    ▼
Entity Objects
    ▼
Service Processing
    ▼
Controller Response
    ▼
JSON Serialization
    ▼
HTTP Response
    ▼
React Component Update
    ▼
UI Rendered to User
```

## Data Model Relationships

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ name        │
│ role        │ ◄─────┐
│ department  │       │
└─────────────┘       │
       │              │
       │ 1:N          │
       │              │
       ▼              │
┌──────────────────┐  │
│ COURSE ENROLLMENTS
│        COURSES   │
├──────────┬─────────┤
│ code (PK)│ id (PK) │
│ name     │ code    │
│ credits  │ name    │
│ schedule │ lecturer_id ──┐
└──────────┬─────────┘    │
       │                  │
       │ 1:N              │
       │                  │
       ▼                  │
┌──────────────────┐      │
│ ATTENDANCE       │      │
│ SESSIONS         │      │
├──────────────────┤      │
│ id (PK)          │      │
│ course_id (FK) ──┘      │
│ lecturer_id (FK) ───────┘
│ date             │
│ status           │ ◄───┐
└──────────────────┘     │
       │                 │
       │ 1:N             │
       │                 │
       ▼                 │
┌──────────────────┐     │
│ ATTENDANCE       │     │
│ RECORDS          │     │
├──────────────────┤     │
│ id (PK)          │     │
│ student_id (FK) ─┼─────┤
│ session_id (FK)  │
│ status           │
└──────────────────┘

┌──────────────────────┐
│ BIOMETRIC            │
│ ENROLLMENTS          │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK) ────────┼─── References USERS
│ fingerprint_enabled  │
│ face_enabled         │
└──────────────────────┘
```

## API Endpoint Hierarchy

```
/api/
│
├── /auth
│   ├── POST /login          (User login)
│   ├── POST /register       (User registration)
│   ├── GET /user/:id        (Get user by ID)
│   ├── GET /user/email/:email (Get user by email)
│   └── PUT /user/:id        (Update user)
│
├── /users
│   ├── GET /                (Get all users)
│   ├── GET /:id             (Get user by ID)
│   ├── GET /role/:role      (Get users by role)
│   ├── POST /               (Create user)
│   ├── PUT /:id             (Update user)
│   └── DELETE /:id          (Delete user)
│
├── /courses
│   ├── GET /                (Get all courses)
│   ├── GET /:id             (Get course by ID)
│   ├── GET /code/:code      (Get course by code)
│   ├── GET /lecturer/:id    (Get lecturer's courses)
│   ├── GET /department/:dept (Get dept courses)
│   ├── POST /               (Create course)
│   ├── PUT /:id             (Update course)
│   └── DELETE /:id          (Delete course)
│
├── /sessions
│   ├── GET /                (Get all sessions)
│   ├── GET /:id             (Get session by ID)
│   ├── GET /course/:id      (Get course sessions)
│   ├── GET /lecturer/:id    (Get lecturer sessions)
│   ├── GET /date/:date      (Get sessions by date)
│   ├── GET /status/:status  (Filter by status)
│   ├── POST /               (Create session)
│   ├── PUT /:id             (Update session)
│   └── DELETE /:id          (Delete session)
│
├── /attendance
│   ├── GET /                (Get all records)
│   ├── GET /:id             (Get record by ID)
│   ├── GET /student/:id     (Get student's records)
│   ├── GET /course/:id      (Get course attendance)
│   ├── GET /session/:id     (Get session records)
│   ├── GET /student/:sid/course/:cid (Student course attendance)
│   ├── POST /               (Mark attendance)
│   ├── PUT /:id             (Update record)
│   └── DELETE /:id          (Delete record)
│
└── /biometric
    ├── GET /user/:id        (Get enrollment status)
    ├── POST /enroll         (Enroll biometric)
    └── PUT /user/:id        (Update enrollment)
```

## Technology Stack

```
┌──────────────────┐
│  FRONTEND        │
├──────────────────┤
│ React 19.2.3     │
│ TypeScript 5.9   │
│ Tailwind CSS 4   │
│ Vite 7.2.4       │
│ Lucide Icons     │
└──────────────────┘
        │
     HTTP/JSON
        │
┌──────────────────┐
│  BACKEND         │
├──────────────────┤
│ Java 17          │
│ Spring Boot 3.2  │
│ Spring Data JPA  │
│ Spring Security  │
│ Maven 3.8+       │
└──────────────────┘
        │
      JDBC/SQL
        │
┌──────────────────┐
│  DATABASE        │
├──────────────────┤
│ MySQL 8.0+       │
│ 6 Tables         │
│ Indexed Queries  │
│ Referential Integrity
└──────────────────┘
        │
┌──────────────────┐
│  DEPLOYMENT      │
├──────────────────┤
│ Docker           │
│ Docker Compose   │
│ JAR Executable   │
└──────────────────┘
```

## File Organization

```
biometric-attendance-system-app/
│
├── FRONTEND (React + TypeScript)
│   ├── src/
│   │   ├── components/          (React components)
│   │   ├── context/             (State management)
│   │   ├── services/            (API client)
│   │   ├── types/               (TypeScript types)
│   │   └── data/                (Mock/test data)
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── BACKEND (Java + Spring Boot)
│   ├── src/main/java/com/biometric/
│   │   ├── controller/          (REST endpoints)
│   │   ├── service/             (Business logic)
│   │   ├── repository/          (Data access)
│   │   ├── model/               (JPA entities)
│   │   ├── config/              (Configuration)
│   │   └── util/                (Utilities)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/                  (SQL schemas)
│   ├── pom.xml
│   ├── Dockerfile
│   └── setup.sh / setup.bat
│
├── DOCUMENTATION
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   ├── QUICKSTART.md
│   ├── COMPLETION_CHECKLIST.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── This file
│
├── CONFIGURATION
│   ├── docker-compose.yml
│   ├── .env.local
│   └── .gitignore
│
└── SCRIPTS
    ├── quickstart.sh / quickstart.bat
    └── verify-setup.sh / verify-setup.bat
```

## Database Connection Flow

```
Application
    │
    ▼
Spring Data JPA (Repository)
    │
    ▼
Hibernate ORM
    │
    ▼
MySQL Connector/J (JDBC Driver)
    │
    ▼
Connection Pooling (HikariCP)
    │
    ▼
MySQL Server (3306)
    │
    ▼
Database: biometric_attendance
    │
    ├─ users
    ├─ courses
    ├─ course_enrollments
    ├─ attendance_sessions
    ├─ attendance_records
    └─ biometric_enrollments
```

---

**This architecture ensures:**
✓ Clean separation of concerns
✓ Scalability
✓ Maintainability
✓ Security
✓ Performance
✓ Flexibility for extensions
