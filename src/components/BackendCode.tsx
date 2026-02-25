import { useState } from 'react';
import { Code2, Database, Server, X, Copy, Check } from 'lucide-react';

const javaCode = `// ========================================
// BiometriTrack - Java Spring Boot Backend
// ========================================

// 1. Student Entity (JPA)
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String department;
    private String fingerprintTemplate; // Base64 encoded
    private String faceTemplate;        // Base64 encoded
    private boolean biometricEnrolled;

    @ManyToMany
    @JoinTable(name = "student_courses")
    private List<Course> enrolledCourses;
    // ... getters/setters
}

// 2. Attendance Record Entity
@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    @ManyToOne
    private AttendanceSession session;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private VerificationMethod method; // FINGERPRINT, FACE

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;   // PRESENT, LATE, ABSENT

    private double verificationScore;
}

// 3. Biometric Service
@Service
public class BiometricService {

    @Autowired
    private FingerprintEngine fingerprintEngine;

    @Autowired
    private FaceRecognitionEngine faceEngine;

    public BiometricVerificationResult verifyFingerprint(
            String capturedTemplate, String storedTemplate) {
        double score = fingerprintEngine.match(capturedTemplate, storedTemplate);
        boolean verified = score >= FINGERPRINT_THRESHOLD; // 80.0
        return new BiometricVerificationResult(verified, score);
    }

    public BiometricVerificationResult verifyFace(
            byte[] capturedImage, String storedTemplate) {
        double score = faceEngine.compare(capturedImage, storedTemplate);
        boolean verified = score >= FACE_THRESHOLD; // 75.0
        return new BiometricVerificationResult(verified, score);
    }

    public String enrollFingerprint(byte[] fingerprintData) {
        return fingerprintEngine.extractTemplate(fingerprintData);
    }

    public String enrollFace(byte[] faceImage) {
        return faceEngine.extractTemplate(faceImage);
    }
}

// 4. Attendance Controller
@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private BiometricService biometricService;

    @PostMapping("/session/start")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<SessionDTO> startSession(
            @RequestBody StartSessionRequest req,
            Authentication auth) {
        AttendanceSession session = attendanceService.startSession(
            req.getCourseId(),
            auth.getName(),
            req.getBiometricType()
        );
        return ResponseEntity.ok(new SessionDTO(session));
    }

    @PostMapping("/mark")
    public ResponseEntity<AttendanceResult> markAttendance(
            @RequestBody MarkAttendanceRequest req) {
        // Fetch student biometric template from DB
        Student student = studentService.findByStudentId(req.getStudentId());

        // Verify biometric
        BiometricVerificationResult result;
        if (req.getMethod() == FINGERPRINT) {
            result = biometricService.verifyFingerprint(
                req.getCapturedTemplate(),
                student.getFingerprintTemplate()
            );
        } else {
            result = biometricService.verifyFace(
                req.getCapturedImage(),
                student.getFaceTemplate()
            );
        }

        if (!result.isVerified()) {
            return ResponseEntity.status(401)
                .body(new AttendanceResult(false, "Biometric mismatch"));
        }

        // Mark attendance
        AttendanceRecord record = attendanceService.markAttendance(
            student, req.getSessionId(), req.getMethod(), result.getScore()
        );
        return ResponseEntity.ok(new AttendanceResult(true, record));
    }

    @GetMapping("/session/{sessionId}/records")
    @PreAuthorize("hasRole('LECTURER') or hasRole('ADMIN')")
    public ResponseEntity<List<AttendanceRecordDTO>> getSessionRecords(
            @PathVariable Long sessionId) {
        List<AttendanceRecord> records =
            attendanceService.getSessionRecords(sessionId);
        return ResponseEntity.ok(records.stream()
            .map(AttendanceRecordDTO::new).collect(Collectors.toList()));
    }

    @GetMapping("/report/course/{courseId}")
    public ResponseEntity<CourseAttendanceReport> getCourseReport(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(
            attendanceService.generateCourseReport(courseId)
        );
    }
}

// 5. JWT Authentication
@Component
public class JwtUtil {
    @Value("\${jwt.secret}")
    private String secret;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userDetails.getAuthorities());
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
}`;

const sqlCode = `-- ============================================
-- BiometriTrack Database Schema (MySQL)
-- ============================================

CREATE DATABASE IF NOT EXISTS biometritrack;
USE biometritrack;

-- Users table (shared for all roles)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_uid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN','LECTURER','STUDENT') NOT NULL,
    department VARCHAR(100),
    student_id VARCHAR(30) UNIQUE,
    staff_id VARCHAR(30) UNIQUE,
    fingerprint_template LONGTEXT,
    face_template LONGTEXT,
    biometric_enrolled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    lecturer_id BIGINT NOT NULL,
    department VARCHAR(100),
    credits INT DEFAULT 3,
    schedule VARCHAR(100),
    room VARCHAR(50),
    academic_year VARCHAR(10),
    semester ENUM('FIRST','SECOND','THIRD'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Student-Course enrollment
CREATE TABLE student_courses (
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Attendance sessions
CREATE TABLE attendance_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_uid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    course_id BIGINT NOT NULL,
    lecturer_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status ENUM('ACTIVE','CLOSED','CANCELLED') DEFAULT 'ACTIVE',
    biometric_type ENUM('FINGERPRINT','FACE','BOTH') DEFAULT 'FINGERPRINT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Attendance records
CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_method ENUM('FINGERPRINT','FACE','MANUAL') NOT NULL,
    status ENUM('PRESENT','LATE','ABSENT') NOT NULL DEFAULT 'PRESENT',
    verification_score DECIMAL(5,2),
    device_id VARCHAR(50),
    ip_address VARCHAR(45),
    UNIQUE KEY unique_student_session (student_id, session_id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Biometric audit log
CREATE TABLE biometric_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action ENUM('ENROLL','VERIFY','UPDATE','DELETE') NOT NULL,
    biometric_type ENUM('FINGERPRINT','FACE') NOT NULL,
    success BOOLEAN NOT NULL,
    score DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_id VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Useful views
CREATE VIEW attendance_summary AS
SELECT
    u.name AS student_name,
    u.student_id,
    c.code AS course_code,
    c.name AS course_name,
    COUNT(ar.id) AS sessions_attended,
    COUNT(CASE WHEN ar.status='PRESENT' THEN 1 END) AS present_count,
    COUNT(CASE WHEN ar.status='LATE' THEN 1 END) AS late_count,
    ROUND(COUNT(ar.id) * 100.0 /
        NULLIF((SELECT COUNT(*) FROM attendance_sessions
                WHERE course_id = c.id AND status='CLOSED'), 0), 2)
        AS attendance_percentage
FROM users u
JOIN student_courses sc ON u.id = sc.student_id
JOIN courses c ON sc.course_id = c.id
LEFT JOIN attendance_records ar ON u.id = ar.student_id AND c.id = ar.course_id
WHERE u.role = 'STUDENT'
GROUP BY u.id, c.id;

-- Stored procedure: mark attendance
DELIMITER //
CREATE PROCEDURE mark_attendance(
    IN p_student_id BIGINT,
    IN p_session_id BIGINT,
    IN p_method VARCHAR(20),
    IN p_score DECIMAL(5,2)
)
BEGIN
    DECLARE v_start_time TIME;
    DECLARE v_status VARCHAR(10);

    SELECT start_time INTO v_start_time
    FROM attendance_sessions WHERE id = p_session_id;

    SET v_status = IF(CURRENT_TIME() > ADDTIME(v_start_time, '00:15:00'),
                      'LATE', 'PRESENT');

    INSERT INTO attendance_records
        (student_id, session_id, course_id, verification_method, status, verification_score)
    SELECT p_student_id, p_session_id, course_id, p_method, v_status, p_score
    FROM attendance_sessions WHERE id = p_session_id
    ON DUPLICATE KEY UPDATE status = v_status;
END //
DELIMITER ;

-- Indexes for performance
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_sessions_course ON attendance_sessions(course_id);`;

export default function BackendCode({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'java' | 'sql'>('java');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'java' ? javaCode : sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl w-full max-w-4xl my-4 shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Backend Source Code</h2>
              <p className="text-slate-400 text-xs">Java Spring Boot + MySQL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-slate-700">
          <button onClick={() => setActiveTab('java')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'java' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Server className="w-4 h-4" /> Java (Spring Boot)
          </button>
          <button onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'sql' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <Database className="w-4 h-4" /> SQL (MySQL)
          </button>
          <button onClick={handleCopy}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[70vh]">
          <pre className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
            {activeTab === 'java' ? javaCode : sqlCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
