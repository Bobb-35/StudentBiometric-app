package com.biometric.controller;

import com.biometric.model.CourseEnrollment;
import com.biometric.service.CourseEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CourseEnrollmentController {
    @Autowired
    private CourseEnrollmentService enrollmentService;

    @GetMapping
    public ResponseEntity<List<CourseEnrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseEnrollment> getEnrollmentById(@PathVariable Long id) {
        return enrollmentService.getEnrollmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudentId(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourseId(courseId));
    }

    @PostMapping
    public ResponseEntity<CourseEnrollment> createEnrollment(@RequestBody CourseEnrollment enrollment) {
        return ResponseEntity.ok(enrollmentService.createEnrollment(enrollment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.noContent().build();
    }
}
