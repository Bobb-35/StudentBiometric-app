package com.biometric.config;

import com.biometric.model.User;
import com.biometric.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

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
            lecturer.setStaffId("L001");
            lecturer.setDepartment("Computer Science");
            userRepository.save(lecturer);
            
            // Create student user
            User student = new User();
            student.setEmail("student1@biometric.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setName("Jane Doe");
            student.setRole(User.UserRole.STUDENT);
            student.setStudentId("S001");
            student.setDepartment("Computer Science");
            userRepository.save(student);
            
            System.out.println("Sample users initialized successfully");
        }
    }
}
