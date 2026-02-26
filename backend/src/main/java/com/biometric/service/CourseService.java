package com.biometric.service;

import com.biometric.model.Course;
import com.biometric.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    @Autowired
    private CourseRepository courseRepository;

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Optional<Course> getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    public List<Course> getCoursesByLecturerId(Long lecturerId) {
        return courseRepository.findByLecturerId(lecturerId);
    }

    public List<Course> getCoursesByDepartment(String department) {
        return courseRepository.findByDepartment(department);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Page<Course> getCoursesPage(Pageable pageable) {
        return courseRepository.findAll(pageable);
    }

    public Course updateCourse(Long id, Course courseDetails) {
        return courseRepository.findById(id).map(course -> {
            course.setName(courseDetails.getName());
            course.setCode(courseDetails.getCode());
            course.setDepartment(courseDetails.getDepartment());
            course.setCredits(courseDetails.getCredits());
            course.setSchedule(courseDetails.getSchedule());
            course.setRoom(courseDetails.getRoom());
            return courseRepository.save(course);
        }).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}
