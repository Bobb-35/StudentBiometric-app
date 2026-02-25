package com.biometric.repository;

import com.biometric.model.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findByCourseId(Long courseId);
    List<AttendanceSession> findByLecturerId(Long lecturerId);
    List<AttendanceSession> findByDate(String date);
    List<AttendanceSession> findByStatus(AttendanceSession.SessionStatus status);
}
