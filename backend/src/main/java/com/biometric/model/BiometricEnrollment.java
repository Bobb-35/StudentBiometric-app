package com.biometric.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_enrollments")
public class BiometricEnrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Boolean fingerprintEnrolled;

    @Column(nullable = false)
    private Boolean faceEnrolled;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Boolean getFingerprintEnrolled() { return fingerprintEnrolled; }
    public void setFingerprintEnrolled(Boolean fingerprintEnrolled) { this.fingerprintEnrolled = fingerprintEnrolled; }

    public Boolean getFaceEnrolled() { return faceEnrolled; }
    public void setFaceEnrolled(Boolean faceEnrolled) { this.faceEnrolled = faceEnrolled; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
