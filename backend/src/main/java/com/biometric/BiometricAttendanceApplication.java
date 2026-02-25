package com.biometric;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BiometricAttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BiometricAttendanceApplication.class, args);
        System.out.println("✓ Biometric Attendance System Backend is running on http://localhost:8080/api");
    }
}
