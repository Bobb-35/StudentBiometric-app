package com.biometric.config;

import com.biometric.model.User;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Comparator;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Only initialize if no users exist
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setEmail("admin@biometric.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setRole(User.UserRole.ADMIN);
            admin.setDepartment("Administration");
            userRepository.save(admin);
            
            // Create lecturer user
            User lecturer = new User();
            lecturer.setEmail("lecturer1@biometric.com");
            lecturer.setPassword(passwordEncoder.encode("lecturer123"));
            lecturer.setName("Dr. John Smith");
            lecturer.setRole(User.UserRole.LECTURER);
            lecturer.setStaffSequence(1L);
            lecturer.setStaffId("LEC-00001");
            lecturer.setDepartment("Computer Science");
            userRepository.save(lecturer);
            
            // Create student user
            User student = new User();
            student.setEmail("student1@biometric.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setName("Jane Doe");
            student.setRole(User.UserRole.STUDENT);
            student.setStudentSequence(1L);
            student.setStudentId("STU-00001");
            student.setDepartment("Computer Science");
            userRepository.save(student);
            
            System.out.println("Sample users initialized successfully");
        }

        backfillRoleIds();
    }

    private void backfillRoleIds() {
        List<User> students = userRepository.findByRole(User.UserRole.STUDENT).stream()
            .sorted(Comparator.comparing(User::getId))
            .toList();
        long studentSeq = 1L;
        for (User student : students) {
            if (student.getStudentSequence() != null && student.getStudentSequence() >= studentSeq) {
                studentSeq = student.getStudentSequence() + 1L;
                continue;
            }
            if (student.getStudentSequence() == null) {
                student.setStudentSequence(studentSeq);
            }
            if (student.getStudentId() == null || student.getStudentId().isBlank()) {
                student.setStudentId(String.format("STU-%05d", studentSeq));
            }
            userRepository.save(student);
            studentSeq = Math.max(studentSeq + 1L, student.getStudentSequence() + 1L);
        }

        List<User> lecturers = userRepository.findByRole(User.UserRole.LECTURER).stream()
            .sorted(Comparator.comparing(User::getId))
            .toList();
        long lecturerSeq = 1L;
        for (User lecturer : lecturers) {
            if (lecturer.getStaffSequence() != null && lecturer.getStaffSequence() >= lecturerSeq) {
                lecturerSeq = lecturer.getStaffSequence() + 1L;
                continue;
            }
            if (lecturer.getStaffSequence() == null) {
                lecturer.setStaffSequence(lecturerSeq);
            }
            if (lecturer.getStaffId() == null || lecturer.getStaffId().isBlank()) {
                lecturer.setStaffId(String.format("LEC-%05d", lecturerSeq));
            }
            userRepository.save(lecturer);
            lecturerSeq = Math.max(lecturerSeq + 1L, lecturer.getStaffSequence() + 1L);
        }
    }
}
