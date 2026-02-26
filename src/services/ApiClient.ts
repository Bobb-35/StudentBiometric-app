// API Configuration and Client Service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      if (response.status === 204) {
        return null as T;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return null as T;
      }

      const text = await response.text();
      if (!text) {
        return null as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth Endpoints
  auth = {
    login: (email: string, password: string) =>
      this.request('/auth/login', 'POST', { email, password }),
    register: (user: any) => this.request('/auth/register', 'POST', user),
    getUser: (id: number) => this.request(`/auth/user/${id}`),
    getUserByEmail: (email: string) => this.request(`/auth/user/email/${email}`),
    updateUser: (id: number, data: any) => this.request(`/auth/user/${id}`, 'PUT', data),
  };

  // User Endpoints
  users = {
    getAll: () => this.request('/users'),
    getById: (id: number) => this.request(`/users/${id}`),
    getByRole: (role: string) => this.request(`/users/role/${role}`),
    create: (user: any) => this.request('/users', 'POST', user),
    update: (id: number, data: any) => this.request(`/users/${id}`, 'PUT', data),
    delete: (id: number) => this.request(`/users/${id}`, 'DELETE'),
  };

  // Course Endpoints
  courses = {
    getAll: () => this.request('/courses'),
    getById: (id: number) => this.request(`/courses/${id}`),
    getByCode: (code: string) => this.request(`/courses/code/${code}`),
    getByLecturerId: (lecturerId: number) =>
      this.request(`/courses/lecturer/${lecturerId}`),
    getByDepartment: (department: string) =>
      this.request(`/courses/department/${department}`),
    create: (course: any) => this.request('/courses', 'POST', course),
    update: (id: number, data: any) => this.request(`/courses/${id}`, 'PUT', data),
    delete: (id: number) => this.request(`/courses/${id}`, 'DELETE'),
  };

  // Session Endpoints
  sessions = {
    getAll: () => this.request('/sessions'),
    getById: (id: number) => this.request(`/sessions/${id}`),
    getByCourseId: (courseId: number) =>
      this.request(`/sessions/course/${courseId}`),
    getByLecturerId: (lecturerId: number) =>
      this.request(`/sessions/lecturer/${lecturerId}`),
    getByDate: (date: string) => this.request(`/sessions/date/${date}`),
    getByStatus: (status: string) => this.request(`/sessions/status/${status}`),
    create: (session: any) => this.request('/sessions', 'POST', session),
    update: (id: number, data: any) => this.request(`/sessions/${id}`, 'PUT', data),
    delete: (id: number) => this.request(`/sessions/${id}`, 'DELETE'),
  };

  // Attendance Endpoints
  attendance = {
    getAll: () => this.request('/attendance'),
    getById: (id: number) => this.request(`/attendance/${id}`),
    getByStudentId: (studentId: number) =>
      this.request(`/attendance/student/${studentId}`),
    getByCourseId: (courseId: number) =>
      this.request(`/attendance/course/${courseId}`),
    getBySessionId: (sessionId: number) =>
      this.request(`/attendance/session/${sessionId}`),
    getStudentCourseAttendance: (studentId: number, courseId: number) =>
      this.request(`/attendance/student/${studentId}/course/${courseId}`),
    create: (record: any) => this.request('/attendance', 'POST', record),
    update: (id: number, data: any) => this.request(`/attendance/${id}`, 'PUT', data),
    delete: (id: number) => this.request(`/attendance/${id}`, 'DELETE'),
  };

  // Biometric Endpoints
  biometric = {
    getEnrollment: (userId: number) =>
      this.request(`/biometric/user/${userId}`),
    enroll: (enrollment: any) =>
      this.request('/biometric/enroll', 'POST', enrollment),
    updateEnrollment: (userId: number, data: any) =>
      this.request(`/biometric/user/${userId}`, 'PUT', data),
  };

  // Course Enrollment Endpoints
  enrollments = {
    getAll: () => this.request('/enrollments'),
    getById: (id: number) => this.request(`/enrollments/${id}`),
    getByStudentId: (studentId: number) => this.request(`/enrollments/student/${studentId}`),
    getByCourseId: (courseId: number) => this.request(`/enrollments/course/${courseId}`),
    create: (enrollment: any) => this.request('/enrollments', 'POST', enrollment),
    delete: (id: number) => this.request(`/enrollments/${id}`, 'DELETE'),
  };
}

export const apiClient = new ApiClient();
