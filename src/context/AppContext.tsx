import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Course, AttendanceSession, AttendanceRecord } from '../types';
import { apiClient } from '../services/ApiClient';

interface EnrollmentLink {
  id?: number;
  studentId: string;
  courseId: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  sessions: AttendanceSession[];
  records: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  enrollCourse: (courseId: string) => Promise<void>;
  addSession: (session: AttendanceSession) => Promise<AttendanceSession | null>;
  closeSession: (sessionId: string) => Promise<void>;
  addRecord: (record: AttendanceRecord) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  fetchRecords: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);
const DATA_SYNC_KEY = 'attendance_data_version';
const REFRESH_POLL_INTERVAL_MS = 5000;

const sortByNumericId = <T extends { id?: number | string }>(items: T[]): T[] =>
  [...items].sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));

const toRole = (role: unknown): 'admin' | 'lecturer' | 'student' => {
  const value = String(role || '').toLowerCase();
  if (value === 'admin' || value === 'lecturer') return value;
  return 'student';
};

const toSessionStatus = (status: unknown): 'active' | 'closed' =>
  String(status || '').toLowerCase() === 'closed' ? 'closed' : 'active';

const toAttendanceType = (type: unknown): 'fingerprint' | 'face' | 'both' => {
  const value = String(type || '').toLowerCase();
  if (value === 'face' || value === 'both') return value;
  return 'fingerprint';
};

const toMethod = (method: unknown): 'fingerprint' | 'face' | 'manual' => {
  const value = String(method || '').toLowerCase();
  if (value === 'face' || value === 'manual') return value;
  return 'fingerprint';
};

const toRecordStatus = (status: unknown): 'present' | 'late' | 'absent' => {
  const value = String(status || '').toLowerCase();
  if (value === 'late' || value === 'absent') return value;
  return 'present';
};

const normalizeEnrollment = (raw: any): EnrollmentLink => ({
  id: raw?.id != null ? Number(raw.id) : undefined,
  studentId: String(raw?.studentId ?? ''),
  courseId: String(raw?.courseId ?? ''),
});

const normalizeUser = (raw: any, enrollments: EnrollmentLink[]): User => {
  const id = String(raw?.id ?? '');
  return {
    id,
    name: String(raw?.name ?? ''),
    email: String(raw?.email ?? ''),
    password: '',
    role: toRole(raw?.role),
    studentId: raw?.studentId || undefined,
    staffId: raw?.staffId || undefined,
    department: raw?.department || undefined,
    fingerprintId: raw?.fingerprintId || undefined,
    faceId: raw?.faceId || undefined,
    avatar: raw?.avatar || undefined,
    enrolledCourses: enrollments.filter(e => e.studentId === id).map(e => e.courseId),
  };
};

const normalizeCourse = (raw: any, enrollments: EnrollmentLink[]): Course => {
  const id = String(raw?.id ?? '');
  return {
    id,
    code: String(raw?.code ?? ''),
    name: String(raw?.name ?? ''),
    lecturerId: String(raw?.lecturerId ?? ''),
    department: String(raw?.department ?? ''),
    credits: Number(raw?.credits ?? 0),
    schedule: String(raw?.schedule ?? ''),
    room: String(raw?.room ?? ''),
    enrolledStudents: enrollments.filter(e => e.courseId === id).map(e => e.studentId),
  };
};

const normalizeSession = (raw: any): AttendanceSession => ({
  id: String(raw?.id ?? ''),
  courseId: String(raw?.courseId ?? ''),
  lecturerId: String(raw?.lecturerId ?? ''),
  date: String(raw?.date ?? ''),
  startTime: String(raw?.startTime ?? ''),
  endTime: raw?.endTime || undefined,
  status: toSessionStatus(raw?.status),
  biometricEnabled: Boolean(raw?.biometricEnabled),
  attendanceType: toAttendanceType(raw?.attendanceType),
});

const normalizeRecord = (raw: any): AttendanceRecord => ({
  id: String(raw?.id ?? ''),
  studentId: String(raw?.studentId ?? ''),
  courseId: String(raw?.courseId ?? ''),
  sessionId: String(raw?.sessionId ?? ''),
  timestamp: String(raw?.timestamp ?? ''),
  method: toMethod(raw?.method),
  status: toRecordStatus(raw?.status),
  verificationScore: raw?.verificationScore != null ? Number(raw.verificationScore) : undefined,
});

const formatLocalDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString().slice(0, 19);
};

const toBackendUser = (user: User) => ({
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role.toUpperCase(),
  studentId: user.studentId || null,
  staffId: user.staffId || null,
  department: user.department || null,
  fingerprintId: user.fingerprintId || null,
  faceId: user.faceId || null,
  avatar: user.avatar || null,
});

const toBackendCourse = (course: Course) => ({
  code: course.code,
  name: course.name,
  lecturerId: Number(course.lecturerId),
  department: course.department,
  credits: Number(course.credits),
  schedule: course.schedule,
  room: course.room,
});

const toBackendSession = (session: AttendanceSession) => ({
  courseId: Number(session.courseId),
  lecturerId: Number(session.lecturerId),
  date: session.date,
  startTime: session.startTime,
  endTime: session.endTime || null,
  status: session.status.toUpperCase(),
  biometricEnabled: session.biometricEnabled,
  attendanceType: session.attendanceType.toUpperCase(),
});

const toBackendRecord = (record: AttendanceRecord) => ({
  studentId: Number(record.studentId),
  courseId: Number(record.courseId),
  sessionId: Number(record.sessionId),
  timestamp: formatLocalDateTime(record.timestamp),
  method: record.method.toUpperCase(),
  status: record.status.toUpperCase(),
  verificationScore: record.verificationScore ?? null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always require explicit login on each app load.
    localStorage.removeItem('currentUser');
  }, []);

  const bumpDataVersion = () => {
    localStorage.setItem(DATA_SYNC_KEY, String(Date.now()));
  };

  const syncCurrentUser = (nextUsers: User[]) => {
    if (!currentUser) return;
    const updated = nextUsers.find(u => u.id === currentUser.id);
    if (updated) {
      setCurrentUser(prev => (prev ? { ...prev, ...updated } : prev));
    }
  };

  const applyEnrollmentLocal = (studentId: string, courseId: string) => {
    setEnrollments(prev => {
      if (prev.some(e => e.studentId === studentId && e.courseId === courseId)) return prev;
      return [...prev, { studentId, courseId }];
    });

    setUsers(prev =>
      prev.map(user => {
        if (user.id !== studentId) return user;
        const enrolledCourses = user.enrolledCourses || [];
        if (enrolledCourses.includes(courseId)) return user;
        return { ...user, enrolledCourses: [...enrolledCourses, courseId] };
      }),
    );

    setCourses(prev =>
      prev.map(course => {
        if (course.id !== courseId) return course;
        if (course.enrolledStudents.includes(studentId)) return course;
        return { ...course, enrolledStudents: [...course.enrolledStudents, studentId] };
      }),
    );

    setCurrentUser(prev => {
      if (!prev || prev.id !== studentId) return prev;
      const enrolledCourses = prev.enrolledCourses || [];
      if (enrolledCourses.includes(courseId)) return prev;
      return { ...prev, enrolledCourses: [...enrolledCourses, courseId] };
    });
  };

  const refreshUsersCoursesEnrollments = async () => {
    const [usersData, coursesData, enrollmentData] = await Promise.all([
      apiClient.users.getAll().catch(() => []),
      apiClient.courses.getAll().catch(() => []),
      apiClient.enrollments.getAll().catch(() => []),
    ]);

    const normalizedEnrollments = Array.isArray(enrollmentData)
      ? enrollmentData.map(normalizeEnrollment)
      : [];
    const normalizedUsers = Array.isArray(usersData)
      ? usersData.map((u: any) => normalizeUser(u, normalizedEnrollments))
      : [];
    const normalizedCourses = Array.isArray(coursesData)
      ? coursesData.map((c: any) => normalizeCourse(c, normalizedEnrollments))
      : [];

    setEnrollments(normalizedEnrollments);
    setUsers(sortByNumericId(normalizedUsers));
    setCourses(sortByNumericId(normalizedCourses));
    syncCurrentUser(normalizedUsers);
  };

  const refreshAllData = async () => {
    const [usersResult, coursesResult, sessionsResult, recordsResult, enrollmentsResult] =
      await Promise.allSettled([
        apiClient.users.getAll(),
        apiClient.courses.getAll(),
        apiClient.sessions.getAll(),
        apiClient.attendance.getAll(),
        apiClient.enrollments.getAll(),
      ]);

    const resolvedEnrollments =
      enrollmentsResult.status === 'fulfilled' && Array.isArray(enrollmentsResult.value)
        ? enrollmentsResult.value
        : [];
    const normalizedEnrollments = resolvedEnrollments.map(normalizeEnrollment);

    if (usersResult.status === 'fulfilled' && Array.isArray(usersResult.value)) {
      const normalizedUsers = sortByNumericId(
        usersResult.value.map((u: any) => normalizeUser(u, normalizedEnrollments)),
      );
      setUsers(normalizedUsers);
      syncCurrentUser(normalizedUsers);
    }

    if (coursesResult.status === 'fulfilled' && Array.isArray(coursesResult.value)) {
      setCourses(
        sortByNumericId(
          coursesResult.value.map((c: any) => normalizeCourse(c, normalizedEnrollments)),
        ),
      );
    }

    if (sessionsResult.status === 'fulfilled' && Array.isArray(sessionsResult.value)) {
      setSessions(sortByNumericId(sessionsResult.value.map(normalizeSession)));
    }

    if (recordsResult.status === 'fulfilled' && Array.isArray(recordsResult.value)) {
      setRecords(sortByNumericId(recordsResult.value.map(normalizeRecord)));
    }

    setEnrollments(normalizedEnrollments);
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      await refreshUsersCoursesEnrollments();
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      await refreshUsersCoursesEnrollments();
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.sessions.getAll();
      setSessions(Array.isArray(data) ? data.map(normalizeSession) : []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.attendance.getAll();
      setRecords(Array.isArray(data) ? data.map(normalizeRecord) : []);
    } catch (err) {
      console.error('Failed to fetch records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await refreshAllData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === DATA_SYNC_KEY) {
        refreshAllData().catch(() => {});
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshAllData().catch(() => {});
    }, REFRESH_POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.auth.login(email, password);

      if (response && response.id) {
        let enrolledCourses: string[] = [];
        const role = toRole(response.role);
        if (role === 'student') {
          const myEnrollments = await apiClient.enrollments
            .getByStudentId(Number(response.id))
            .catch(() => []);
          if (Array.isArray(myEnrollments)) {
            enrolledCourses = myEnrollments.map((e: any) => String(e.courseId));
          }
        }

        const user: User = {
          id: String(response.id),
          email: String(response.email),
          name: String(response.name),
          password: '',
          role,
          studentId: response.studentId || undefined,
          staffId: response.staffId || undefined,
          enrolledCourses,
        };
        setCurrentUser(user);
        return true;
      }

      setError('Login failed: Invalid credentials');
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    apiClient.clearToken();
  };

  const enrollCourse = async (courseId: string) => {
    if (!currentUser) return;
    const studentId = currentUser.id;
    if ((currentUser.enrolledCourses || []).includes(courseId)) return;

    try {
      setIsLoading(true);
      setError(null);
      await apiClient.enrollments.create({
        studentId: Number(studentId),
        courseId: Number(courseId),
      });
      applyEnrollmentLocal(studentId, courseId);
      await refreshUsersCoursesEnrollments().catch(() => {});
      bumpDataVersion();
    } catch (err) {
      // Fallback: keep student flow working when enrollment endpoint is unavailable.
      applyEnrollmentLocal(studentId, courseId);
      console.warn('Enrollment API failed; applied local enrollment fallback.', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addSession = async (session: AttendanceSession): Promise<AttendanceSession | null> => {
    try {
      setIsLoading(true);
      const created = await apiClient.sessions.create(toBackendSession(session));
      const normalized = normalizeSession(created);
      setSessions(prev => {
        const next = prev.filter(s => s.id !== normalized.id);
        return [...next, normalized];
      });
      await refreshAllData().catch(() => {});
      bumpDataVersion();
      return normalized;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        await apiClient.sessions.update(Number(sessionId), {
          ...toBackendSession(session),
          status: 'CLOSED',
        });
        await refreshAllData();
        bumpDataVersion();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close session');
    } finally {
      setIsLoading(false);
    }
  };

  const addRecord = async (record: AttendanceRecord) => {
    try {
      setIsLoading(true);
      await apiClient.attendance.create(toBackendRecord(record));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create record');
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (user: User) => {
    try {
      setIsLoading(true);
      await apiClient.users.create(toBackendUser(user));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (user: User) => {
    try {
      setIsLoading(true);
      await apiClient.users.update(Number(user.id), toBackendUser(user));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setIsLoading(true);
      await apiClient.users.delete(Number(userId));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async (course: Course) => {
    try {
      setIsLoading(true);
      await apiClient.courses.create(toBackendCourse(course));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCourse = async (course: Course) => {
    try {
      setIsLoading(true);
      await apiClient.courses.update(Number(course.id), toBackendCourse(course));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      await apiClient.courses.delete(Number(courseId));
      await refreshAllData();
      bumpDataVersion();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        courses,
        sessions,
        records,
        isLoading,
        error,
        login,
        logout,
        enrollCourse,
        addSession,
        closeSession,
        addRecord,
        addUser,
        updateUser,
        deleteUser,
        addCourse,
        updateCourse,
        deleteCourse,
        fetchUsers,
        fetchCourses,
        fetchSessions,
        fetchRecords,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
