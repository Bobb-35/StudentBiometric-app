INSERT INTO courses (code, name, lecturer_id, department, credits, schedule, room, created_at) 
VALUES 
('CS101', 'Introduction to Programming', 2, 'Computer Science', 3, 'MWF 09:00-10:00', 'Room 101', NOW()),
('CS201', 'Data Structures', 2, 'Computer Science', 4, 'MWF 10:30-11:30', 'Room 102', NOW()),
('MATH101', 'Calculus I', 5, 'Mathematics', 4, 'TTh 09:00-10:30', 'Room 201', NOW()),
('MATH201', 'Linear Algebra', 5, 'Mathematics', 3, 'TTh 11:00-12:00', 'Room 202', NOW());

INSERT INTO course_enrollments (student_id, course_id, enrolled_at) VALUES
(3, 1, NOW()),
(3, 2, NOW()),
(4, 1, NOW()),
(4, 3, NOW());

INSERT INTO biometric_enrollments (user_id, fingerprint_enrolled, face_enrolled, enrolled_at) VALUES
(3, TRUE, TRUE, NOW()),
(4, TRUE, FALSE, NOW());
