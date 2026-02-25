package com.biometric.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long sessionId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MarkingMethod method;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private Double verificationScore;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
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

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public MarkingMethod getMethod() { return method; }
    public void setMethod(MarkingMethod method) { this.method = method; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public Double getVerificationScore() { return verificationScore; }
    public void setVerificationScore(Double verificationScore) { this.verificationScore = verificationScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum MarkingMethod {
        FINGERPRINT, FACE, MANUAL
    }

    public enum AttendanceStatus {
        PRESENT, LATE, ABSENT
    }
}
