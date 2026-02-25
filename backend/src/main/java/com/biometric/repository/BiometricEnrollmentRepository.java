package com.biometric.repository;

import com.biometric.model.BiometricEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BiometricEnrollmentRepository extends JpaRepository<BiometricEnrollment, Long> {
    Optional<BiometricEnrollment> findByUserId(Long userId);
}
