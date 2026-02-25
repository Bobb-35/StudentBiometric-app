package com.biometric.service;

import com.biometric.model.CourseEnrollment;
import com.biometric.repository.CourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseEnrollmentService {
    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    public CourseEnrollment createEnrollment(CourseEnrollment enrollment) {
        return enrollmentRepository.save(enrollment);
    }

    public Optional<CourseEnrollment> getEnrollmentById(Long id) {
        return enrollmentRepository.findById(id);
    }

    public List<CourseEnrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    public List<CourseEnrollment> getEnrollmentsByStudentId(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<CourseEnrollment> getEnrollmentsByCourseId(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
}
