package com.biometric.controller;

import com.biometric.model.BiometricEnrollment;
import com.biometric.service.BiometricEnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/biometric")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BiometricEnrollmentController {
    @Autowired
    private BiometricEnrollmentService enrollmentService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<BiometricEnrollment> getEnrollmentByUserId(@PathVariable Long userId) {
        return enrollmentService.getEnrollmentByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/enroll")
    public ResponseEntity<BiometricEnrollment> enrollBiometric(@RequestBody BiometricEnrollment enrollment) {
        BiometricEnrollment created = enrollmentService.enrollBiometric(enrollment);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<BiometricEnrollment> updateEnrollment(
            @PathVariable Long userId,
            @RequestBody BiometricEnrollment enrollmentDetails) {
        return ResponseEntity.ok(enrollmentService.updateEnrollment(userId, enrollmentDetails));
    }
}
