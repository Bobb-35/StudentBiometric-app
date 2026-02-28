package com.biometric.service;

import com.biometric.model.AttendanceRecord;
import com.biometric.model.AttendanceSession;
import com.biometric.model.User;
import com.biometric.repository.AttendanceRecordRepository;
import com.biometric.repository.AttendanceSessionRepository;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceRecordService {
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BiometricEnrollmentService biometricEnrollmentService;

    @Transactional
    public AttendanceRecord createRecord(AttendanceRecord record) {
        User student = userRepository.findById(record.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found"));
        if (student.getRole() != User.UserRole.STUDENT) {
            throw new RuntimeException("Only students can sign attendance");
        }

        AttendanceSession session = attendanceSessionRepository.findById(record.getSessionId())
            .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != AttendanceSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("This session is not active");
        }

        if (!session.getCourseId().equals(record.getCourseId())) {
            throw new RuntimeException("Invalid course for selected session");
        }

        if (attendanceRecordRepository.existsByStudentIdAndSessionId(record.getStudentId(), record.getSessionId())) {
            throw new RuntimeException("Attendance already marked for this student in this session");
        }

        if (!biometricEnrollmentService.hasFingerprintEnrollment(record.getStudentId())) {
            throw new RuntimeException("Student must enroll fingerprint before signing in");
        }

        LocalDateTime now = LocalDateTime.now();
        record.setTimestamp(now);
        if (record.getMethod() == null) {
            record.setMethod(AttendanceRecord.MarkingMethod.FINGERPRINT);
        }

        LocalDateTime startThreshold = session.getStartedAt() != null
            ? session.getStartedAt()
            : now;
        record.setStatus(now.isAfter(startThreshold.plusMinutes(15))
            ? AttendanceRecord.AttendanceStatus.LATE
            : AttendanceRecord.AttendanceStatus.PRESENT);

        return attendanceRecordRepository.save(record);
    }

    public Optional<AttendanceRecord> getRecordById(Long id) {
        return attendanceRecordRepository.findById(id);
    }

    public List<AttendanceRecord> getRecordsByStudentId(Long studentId) {
        return attendanceRecordRepository.findByStudentId(studentId);
    }

    public List<AttendanceRecord> getRecordsByCourseId(Long courseId) {
        return attendanceRecordRepository.findByCourseId(courseId);
    }

    public List<AttendanceRecord> getRecordsBySessionId(Long sessionId) {
        return attendanceRecordRepository.findBySessionId(sessionId);
    }

    public List<AttendanceRecord> getStudentCourseAttendance(Long studentId, Long courseId) {
        return attendanceRecordRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public List<AttendanceRecord> getAllRecords() {
        return attendanceRecordRepository.findAll();
    }

    public AttendanceRecord updateRecord(Long id, AttendanceRecord recordDetails) {
        return attendanceRecordRepository.findById(id).map(record -> {
            record.setStatus(recordDetails.getStatus());
            record.setVerificationScore(recordDetails.getVerificationScore());
            return attendanceRecordRepository.save(record);
        }).orElseThrow(() -> new RuntimeException("Record not found"));
    }

    public void deleteRecord(Long id) {
        attendanceRecordRepository.deleteById(id);
    }
}
