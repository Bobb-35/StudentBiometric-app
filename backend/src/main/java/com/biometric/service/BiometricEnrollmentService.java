package com.biometric.service;

import com.biometric.model.BiometricEnrollment;
import com.biometric.repository.BiometricEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class BiometricEnrollmentService {
    @Autowired
    private BiometricEnrollmentRepository biometricEnrollmentRepository;

    public BiometricEnrollment enrollBiometric(BiometricEnrollment enrollment) {
        return biometricEnrollmentRepository.save(enrollment);
    }

    public Optional<BiometricEnrollment> getEnrollmentByUserId(Long userId) {
        return biometricEnrollmentRepository.findByUserId(userId);
    }

    public BiometricEnrollment updateEnrollment(Long userId, BiometricEnrollment enrollmentDetails) {
        return biometricEnrollmentRepository.findByUserId(userId).map(enrollment -> {
            enrollment.setFingerprintEnrolled(enrollmentDetails.getFingerprintEnrolled());
            enrollment.setFaceEnrolled(enrollmentDetails.getFaceEnrolled());
            return biometricEnrollmentRepository.save(enrollment);
        }).orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }
}
