package com.biometric.repository;

import com.biometric.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.UserRole role);
    Optional<User> findByStudentId(String studentId);
    Optional<User> findByStaffId(String staffId);
    Optional<User> findByFingerprintId(String fingerprintId);
    Optional<User> findByFaceId(String faceId);
}
