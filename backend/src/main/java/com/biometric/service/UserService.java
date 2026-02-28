package com.biometric.service;

import com.biometric.model.User;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(User user) {
        if (isBlank(user.getName())) {
            throw new RuntimeException("Name is required");
        }
        if (isBlank(user.getEmail())) {
            throw new RuntimeException("Email is required");
        }
        if (isBlank(user.getPassword())) {
            throw new RuntimeException("Password is required");
        }
        if (user.getRole() == null) {
            throw new RuntimeException("User role is required");
        }

        user.setEmail(user.getEmail().trim().toLowerCase());
        user.setName(user.getName().trim());

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        normalizeRoleSpecificIds(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            if (isBlank(userDetails.getName())) {
                throw new RuntimeException("Name is required");
            }
            if (isBlank(userDetails.getEmail())) {
                throw new RuntimeException("Email is required");
            }
            String normalizedEmail = userDetails.getEmail().trim().toLowerCase();
            userRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new RuntimeException("Email already exists");
                }
            });

            user.setName(userDetails.getName().trim());
            user.setEmail(normalizedEmail);
            user.setDepartment(userDetails.getDepartment());
            user.setAvatar(userDetails.getAvatar());
            if (!isBlank(userDetails.getFingerprintId())) {
                ensureFingerprintUnique(userDetails.getFingerprintId(), user.getId());
                user.setFingerprintId(userDetails.getFingerprintId());
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getUsersPage(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public Optional<User> findByFingerprintId(String fingerprintId) {
        return userRepository.findByFingerprintId(fingerprintId);
    }

    public Optional<User> findByFaceId(String faceId) {
        return userRepository.findByFaceId(faceId);
    }

    public Optional<User> getStudentByStudentId(String studentId) {
        return userRepository.findByStudentId(studentId);
    }

    private void normalizeRoleSpecificIds(User user) {
        if (user.getRole() == User.UserRole.STUDENT) {
            long next = getNextStudentSequence();
            user.setStudentSequence(next);
            user.setStudentId(formatStudentId(next));
            user.setStaffId(null);
            user.setStaffSequence(null);
        } else if (user.getRole() == User.UserRole.LECTURER) {
            long next = getNextLecturerSequence();
            user.setStaffSequence(next);
            user.setStaffId(formatLecturerId(next));
            user.setStudentId(null);
            user.setStudentSequence(null);
        } else {
            user.setStudentId(null);
            user.setStudentSequence(null);
            user.setStaffId(null);
            user.setStaffSequence(null);
        }

        if (!isBlank(user.getFingerprintId())) {
            ensureFingerprintUnique(user.getFingerprintId(), null);
        }
    }

    private long getNextStudentSequence() {
        Long maxSequence = userRepository.findByRole(User.UserRole.STUDENT).stream()
            .map(user -> {
                if (user.getStudentSequence() != null) return user.getStudentSequence();
                return extractNumericSuffix(user.getStudentId());
            })
            .filter(value -> value != null && value > 0)
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);
        return maxSequence + 1L;
    }

    private long getNextLecturerSequence() {
        Long maxSequence = userRepository.findByRole(User.UserRole.LECTURER).stream()
            .map(user -> {
                if (user.getStaffSequence() != null) return user.getStaffSequence();
                return extractNumericSuffix(user.getStaffId());
            })
            .filter(value -> value != null && value > 0)
            .mapToLong(Long::longValue)
            .max()
            .orElse(0L);
        return maxSequence + 1L;
    }

    private String formatStudentId(long sequence) {
        return String.format("STU-%05d", sequence);
    }

    private String formatLecturerId(long sequence) {
        return String.format("LEC-%05d", sequence);
    }

    private void ensureFingerprintUnique(String fingerprintId, Long currentUserId) {
        userRepository.findByFingerprintId(fingerprintId).ifPresent(existing -> {
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new RuntimeException("Fingerprint ID already belongs to another user");
            }
        });
    }

    private Long extractNumericSuffix(String idValue) {
        if (isBlank(idValue)) return null;
        int idx = idValue.lastIndexOf('-');
        String suffix = idx >= 0 ? idValue.substring(idx + 1) : idValue;
        try {
            return Long.parseLong(suffix);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
