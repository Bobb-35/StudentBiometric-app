-- Create Database
CREATE DATABASE IF NOT EXISTS biometric_attendance;
USE biometric_attendance;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'LECTURER', 'STUDENT') NOT NULL,
    student_id VARCHAR(50),
    staff_id VARCHAR(50),
    department VARCHAR(100),
    fingerprint_id VARCHAR(255),
    face_id VARCHAR(255),
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_student_id (student_id),
    INDEX idx_staff_id (staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    lecturer_id BIGINT NOT NULL,
    department VARCHAR(100) NOT NULL,
    credits INT NOT NULL,
    schedule VARCHAR(255),
    room VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_lecturer_id (lecturer_id),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Enrollments Table
CREATE TABLE IF NOT EXISTS course_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Sessions Table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    lecturer_id BIGINT NOT NULL,
    date VARCHAR(20) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10),
    status ENUM('ACTIVE', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    biometric_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    attendance_type ENUM('FINGERPRINT', 'FACE', 'BOTH') NOT NULL DEFAULT 'BOTH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_course_id (course_id),
    INDEX idx_lecturer_id (lecturer_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method ENUM('FINGERPRINT', 'FACE', 'MANUAL') NOT NULL,
    status ENUM('PRESENT', 'LATE', 'ABSENT') NOT NULL DEFAULT 'PRESENT',
    verification_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_session_id (session_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Biometric Enrollments Table
CREATE TABLE IF NOT EXISTS biometric_enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    fingerprint_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    face_enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data for testing
INSERT INTO users (email, password, name, role, department, created_at) VALUES
('admin@biometric.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxFP2MVRA', 'Administrator', 'ADMIN', 'Administration', NOW()),
('lecturer1@biometric.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxFP2MVRA', 'Dr. John Smith', 'LECTURER', 'Computer Science', NOW()),
('student1@biometric.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxFP2MVRA', 'Alice Johnson', 'STUDENT', 'Computer Science', NOW()),
('student2@biometric.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxFP2MVRA', 'Bob Wilson', 'STUDENT', 'Computer Science', NOW()),
('lecturer2@biometric.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxFP2MVRA', 'Prof. Sarah Davis', 'LECTURER', 'Mathematics', NOW());

-- Note: Password is 'password' encrypted with BCrypt
