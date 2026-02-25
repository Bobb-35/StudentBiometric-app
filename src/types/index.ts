export type Role = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  studentId?: string;
  staffId?: string;
  department?: string;
  fingerprintId?: string;
  faceId?: string;
  avatar?: string;
  enrolledCourses?: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  lecturerId: string;
  department: string;
  credits: number;
  schedule: string;
  room: string;
  enrolledStudents: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  sessionId: string;
  timestamp: string;
  method: 'fingerprint' | 'face' | 'manual';
  status: 'present' | 'late' | 'absent';
  verificationScore?: number;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  lecturerId: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
  biometricEnabled: boolean;
  attendanceType: 'fingerprint' | 'face' | 'both';
}

export interface BiometricEnrollment {
  userId: string;
  fingerprintEnrolled: boolean;
  faceEnrolled: boolean;
  enrolledAt?: string;
}
