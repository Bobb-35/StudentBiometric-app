package com.biometric.service;

import com.biometric.model.AttendanceSession;
import com.biometric.model.Course;
import com.biometric.model.User;
import com.biometric.repository.AttendanceSessionRepository;
import com.biometric.repository.CourseRepository;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceSessionService {
    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;

    @Transactional
    public AttendanceSession createSession(AttendanceSession session) {
        User lecturer = userRepository.findById(session.getLecturerId())
            .orElseThrow(() -> new RuntimeException("Lecturer not found"));
        if (lecturer.getRole() != User.UserRole.LECTURER) {
            throw new RuntimeException("Only lecturers can start sessions");
        }

        Course course = courseRepository.findById(session.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found"));
        if (!course.getLecturerId().equals(session.getLecturerId())) {
            throw new RuntimeException("Lecturer can only start sessions for assigned courses");
        }

        LocalDateTime now = LocalDateTime.now();
        session.setStartedAt(now);
        session.setDate(now.toLocalDate().toString());
        session.setStartTime(now.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")));
        session.setStatus(AttendanceSession.SessionStatus.ACTIVE);
        session.setEndTime(null);
        session.setEndedAt(null);

        return attendanceSessionRepository.save(session);
    }

    public Optional<AttendanceSession> getSessionById(Long id) {
        return attendanceSessionRepository.findById(id);
    }

    public List<AttendanceSession> getSessionsByCourseId(Long courseId) {
        return attendanceSessionRepository.findByCourseId(courseId);
    }

    public List<AttendanceSession> getSessionsByLecturerId(Long lecturerId) {
        return attendanceSessionRepository.findByLecturerId(lecturerId);
    }

    public List<AttendanceSession> getSessionsByDate(String date) {
        return attendanceSessionRepository.findByDate(date);
    }

    public List<AttendanceSession> getSessionsByStatus(AttendanceSession.SessionStatus status) {
        return attendanceSessionRepository.findByStatus(status);
    }

    public List<AttendanceSession> getAllSessions() {
        return attendanceSessionRepository.findAll();
    }

    @Transactional
    public AttendanceSession updateSession(Long id, AttendanceSession sessionDetails) {
        return attendanceSessionRepository.findById(id).map(session -> {
            if (sessionDetails.getStatus() == AttendanceSession.SessionStatus.CLOSED
                && session.getStatus() != AttendanceSession.SessionStatus.CLOSED) {
                LocalDateTime endedAt = LocalDateTime.now();
                session.setEndedAt(endedAt);
                session.setEndTime(endedAt.toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")));
                session.setStatus(AttendanceSession.SessionStatus.CLOSED);
            }

            if (sessionDetails.getBiometricEnabled() != null) {
                session.setBiometricEnabled(sessionDetails.getBiometricEnabled());
            }
            if (sessionDetails.getAttendanceType() != null) {
                session.setAttendanceType(sessionDetails.getAttendanceType());
            }
            return attendanceSessionRepository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public boolean isSessionOpenForAttendance(AttendanceSession session, LocalDateTime attemptTime) {
        if (session.getStatus() != AttendanceSession.SessionStatus.ACTIVE) {
            return false;
        }

        LocalDate sessionDate = LocalDate.parse(session.getDate());
        LocalTime startTime = LocalTime.parse(session.getStartTime());
        LocalDateTime startedAt = LocalDateTime.of(sessionDate, startTime);
        return !attemptTime.isBefore(startedAt);
    }

    public void deleteSession(Long id) {
        attendanceSessionRepository.deleteById(id);
    }
}
