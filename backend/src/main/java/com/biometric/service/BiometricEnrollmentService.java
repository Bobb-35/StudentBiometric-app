package com.biometric.service;

import com.biometric.model.BiometricEnrollment;
import com.biometric.model.User;
import com.biometric.repository.BiometricEnrollmentRepository;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class BiometricEnrollmentService {
    @Autowired
    private BiometricEnrollmentRepository biometricEnrollmentRepository;
    @Autowired
    private UserRepository userRepository;

    @Transactional
    public BiometricEnrollment enrollBiometric(BiometricEnrollment enrollment) {
        if (enrollment.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }
        User user = userRepository.findById(enrollment.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(enrollment.getFingerprintEnrolled())) {
            if (isBlank(user.getFingerprintId())) {
                throw new RuntimeException("Fingerprint ID is required for fingerprint enrollment");
            }
            userRepository.findByFingerprintId(user.getFingerprintId())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Fingerprint is already enrolled by another user");
                });
        } else {
            user.setFingerprintId(null);
        }
        userRepository.save(user);

        return biometricEnrollmentRepository.save(enrollment);
    }

    public Optional<BiometricEnrollment> getEnrollmentByUserId(Long userId) {
        return biometricEnrollmentRepository.findByUserId(userId);
    }

    @Transactional
    public BiometricEnrollment updateEnrollment(Long userId, BiometricEnrollment enrollmentDetails) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(enrollmentDetails.getFingerprintEnrolled())) {
            if (isBlank(user.getFingerprintId())) {
                throw new RuntimeException("Fingerprint ID is required for fingerprint enrollment");
            }
            userRepository.findByFingerprintId(user.getFingerprintId())
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Fingerprint is already enrolled by another user");
                });
        } else {
            user.setFingerprintId(null);
        }
        userRepository.save(user);

        return biometricEnrollmentRepository.findByUserId(userId).map(enrollment -> {
            enrollment.setFingerprintEnrolled(enrollmentDetails.getFingerprintEnrolled());
            enrollment.setFaceEnrolled(enrollmentDetails.getFaceEnrolled());
            return biometricEnrollmentRepository.save(enrollment);
        }).orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }

    public boolean hasFingerprintEnrollment(Long userId) {
        return biometricEnrollmentRepository.findByUserId(userId)
            .map(BiometricEnrollment::getFingerprintEnrolled)
            .orElse(false);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
