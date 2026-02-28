package com.biometric.controller;

import com.biometric.model.AttendanceSession;
import com.biometric.service.AttendanceSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AttendanceSessionController {
    @Autowired
    private AttendanceSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<AttendanceSession>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceSession> getSessionById(@PathVariable Long id) {
        return sessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceSession>> getSessionsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(sessionService.getSessionsByCourseId(courseId));
    }

    @GetMapping("/lecturer/{lecturerId}")
    public ResponseEntity<List<AttendanceSession>> getSessionsByLecturerId(@PathVariable Long lecturerId) {
        return ResponseEntity.ok(sessionService.getSessionsByLecturerId(lecturerId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AttendanceSession>> getSessionsByDate(@PathVariable String date) {
        return ResponseEntity.ok(sessionService.getSessionsByDate(date));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AttendanceSession>> getSessionsByStatus(@PathVariable String status) {
        try {
            AttendanceSession.SessionStatus sessionStatus = AttendanceSession.SessionStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(sessionService.getSessionsByStatus(sessionStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    public ResponseEntity<AttendanceSession> createSession(@RequestBody AttendanceSession session) {
        try {
            AttendanceSession createdSession = sessionService.createSession(session);
            return ResponseEntity.ok(createdSession);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceSession> updateSession(@PathVariable Long id, @RequestBody AttendanceSession sessionDetails) {
        try {
            return ResponseEntity.ok(sessionService.updateSession(id, sessionDetails));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
