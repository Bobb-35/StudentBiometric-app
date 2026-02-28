package com.biometric.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "attendance_sessions",
    indexes = {
        @Index(name = "idx_session_course_id", columnList = "course_id"),
        @Index(name = "idx_session_lecturer_id", columnList = "lecturer_id"),
        @Index(name = "idx_session_date", columnList = "date"),
        @Index(name = "idx_session_status", columnList = "status")
    }
)
public class AttendanceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "lecturer_id", nullable = false)
    private Long lecturerId;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String startTime;

    private String endTime;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    @Column(nullable = false)
    private Boolean biometricEnabled;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BiometricType attendanceType;

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

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getLecturerId() { return lecturerId; }
    public void setLecturerId(Long lecturerId) { this.lecturerId = lecturerId; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Boolean getBiometricEnabled() { return biometricEnabled; }
    public void setBiometricEnabled(Boolean biometricEnabled) { this.biometricEnabled = biometricEnabled; }

    public BiometricType getAttendanceType() { return attendanceType; }
    public void setAttendanceType(BiometricType attendanceType) { this.attendanceType = attendanceType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum SessionStatus {
        ACTIVE, CLOSED
    }

    public enum BiometricType {
        FINGERPRINT, FACE, BOTH
    }
}
