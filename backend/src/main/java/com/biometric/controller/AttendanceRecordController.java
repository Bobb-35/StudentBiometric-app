package com.biometric.controller;

import com.biometric.model.AttendanceRecord;
import com.biometric.service.AttendanceRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AttendanceRecordController {
    @Autowired
    private AttendanceRecordService recordService;

    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllRecords() {
        return ResponseEntity.ok(recordService.getAllRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecord> getRecordById(@PathVariable Long id) {
        return recordService.getRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecord>> getRecordsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(recordService.getRecordsByStudentId(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceRecord>> getRecordsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(recordService.getRecordsByCourseId(courseId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<AttendanceRecord>> getRecordsBySessionId(@PathVariable Long sessionId) {
        return ResponseEntity.ok(recordService.getRecordsBySessionId(sessionId));
    }

    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<AttendanceRecord>> getStudentCourseAttendance(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(recordService.getStudentCourseAttendance(studentId, courseId));
    }

    @PostMapping
    public ResponseEntity<AttendanceRecord> createRecord(@RequestBody AttendanceRecord record) {
        try {
            AttendanceRecord createdRecord = recordService.createRecord(record);
            return ResponseEntity.ok(createdRecord);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecord> updateRecord(@PathVariable Long id, @RequestBody AttendanceRecord recordDetails) {
        return ResponseEntity.ok(recordService.updateRecord(id, recordDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        recordService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }
}
