package com.biometric.service;

import com.biometric.model.AttendanceSession;
import com.biometric.repository.AttendanceSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceSessionService {
    @Autowired
    private AttendanceSessionRepository attendanceSessionRepository;

    public AttendanceSession createSession(AttendanceSession session) {
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

    public AttendanceSession updateSession(Long id, AttendanceSession sessionDetails) {
        return attendanceSessionRepository.findById(id).map(session -> {
            session.setStatus(sessionDetails.getStatus());
            session.setEndTime(sessionDetails.getEndTime());
            session.setBiometricEnabled(sessionDetails.getBiometricEnabled());
            return attendanceSessionRepository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public void deleteSession(Long id) {
        attendanceSessionRepository.deleteById(id);
    }
}
