package com.biometric.service;

import com.biometric.model.AttendanceRecord;
import com.biometric.repository.AttendanceRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceRecordService {
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    public AttendanceRecord createRecord(AttendanceRecord record) {
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
