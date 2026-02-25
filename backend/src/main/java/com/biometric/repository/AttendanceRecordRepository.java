package com.biometric.repository;

import com.biometric.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findByCourseId(Long courseId);
    List<AttendanceRecord> findBySessionId(Long sessionId);
    List<AttendanceRecord> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
