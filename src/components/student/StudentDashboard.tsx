import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fingerprint, Camera, CheckCircle, XCircle, Clock, BookOpen, TrendingUp, AlertTriangle, Shield, User } from 'lucide-react';
import { AttendanceRecord } from '../../types';
import { authenticateWithDeviceBiometrics } from '../../utils/deviceBiometric';
import { apiClient } from '../../services/ApiClient';

export default function StudentDashboard() {
  const { currentUser, courses, sessions, records, addRecord, enrollCourse } = useApp();
  const [activeView, setActiveView] = useState<'dashboard' | 'courses' | 'sign-in' | 'history' | 'profile'>('dashboard');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'processing' | 'done'>('idle');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; status?: string } | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [scanMethod, setScanMethod] = useState<'fingerprint' | 'face'>('fingerprint');
  const [biometricEnrollment, setBiometricEnrollment] = useState({ fingerprintEnrolled: false, faceEnrolled: false });
  const [enrollingMethod, setEnrollingMethod] = useState<'fingerprint' | 'face' | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const myEnrolled = currentUser?.enrolledCourses || [];
  const myCourses = courses.filter(c => myEnrolled.includes(c.id));
  const availableCourses = courses.filter(c => !myEnrolled.includes(c.id));
  const myRecords = records.filter(r => r.studentId === currentUser?.id);
  const activeSessions = sessions.filter(s => s.status === 'active' && myEnrolled.includes(s.courseId));
  const hasAnyBiometricEnrollment = biometricEnrollment.fingerprintEnrolled || biometricEnrollment.faceEnrolled;

  const getAttendancePct = (courseId: string) => {
    const courseSessions = sessions.filter(s => s.courseId === courseId && s.status === 'closed');
    if (courseSessions.length === 0) return 0;
    const attended = myRecords.filter(r => r.courseId === courseId && r.status !== 'absent').length;
    return Math.min(Math.round((attended / courseSessions.length) * 100), 100);
  };

  const loadBiometricEnrollment = async () => {
    if (!currentUser?.id) return;
    try {
      const enrollment = await apiClient.biometric.getEnrollment(Number(currentUser.id));
      setBiometricEnrollment({
        fingerprintEnrolled: Boolean(enrollment?.fingerprintEnrolled),
        faceEnrolled: Boolean(enrollment?.faceEnrolled),
      });
    } catch {
      setBiometricEnrollment({ fingerprintEnrolled: false, faceEnrolled: false });
    }
  };

  useEffect(() => {
    loadBiometricEnrollment().catch(() => {});
  }, [currentUser?.id]);

  const handleEnrollBiometric = async (method: 'fingerprint' | 'face') => {
    if (!currentUser) return;

    try {
      setEnrollingMethod(method);
      setActionMessage(null);
      await authenticateWithDeviceBiometrics(currentUser.id, currentUser.name);

      const nextEnrollment = {
        fingerprintEnrolled: biometricEnrollment.fingerprintEnrolled || method === 'fingerprint',
        faceEnrolled: biometricEnrollment.faceEnrolled || method === 'face',
      };

      try {
        await apiClient.biometric.updateEnrollment(Number(currentUser.id), nextEnrollment);
      } catch {
        await apiClient.biometric.enroll({
          userId: Number(currentUser.id),
          fingerprintEnrolled: nextEnrollment.fingerprintEnrolled,
          faceEnrolled: nextEnrollment.faceEnrolled,
        });
      }

      setBiometricEnrollment(nextEnrollment);
      setActionMessage(`${method === 'fingerprint' ? 'Fingerprint' : 'Face'} enrolled successfully.`);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Biometric enrollment failed. Please retry.');
    } finally {
      setEnrollingMethod(null);
    }
  };

  const handleBiometricScan = async () => {
    if (!selectedSessionId) return;
    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session) return;

    const alreadySigned = records.some(r => r.studentId === currentUser?.id && r.sessionId === selectedSessionId);
    if (alreadySigned) {
      setScanResult({ success: false, message: 'You have already signed in for this session!' });
      return;
    }

    if (scanMethod === 'fingerprint' && !biometricEnrollment.fingerprintEnrolled) {
      setScanResult({ success: false, message: 'Enroll fingerprint first before signing attendance.' });
      return;
    }
    if (scanMethod === 'face' && !biometricEnrollment.faceEnrolled) {
      setScanResult({ success: false, message: 'Enroll face recognition first before signing attendance.' });
      return;
    }

    setScanning(true);
    setScanStep('scanning');
    await new Promise(r => setTimeout(r, 1500));
    setScanStep('processing');
    try {
      await authenticateWithDeviceBiometrics(currentUser!.id, currentUser!.name);
      const now = new Date();
      const record: AttendanceRecord = {
        id: '',
        studentId: currentUser!.id,
        courseId: session.courseId,
        sessionId: selectedSessionId,
        timestamp: now.toISOString(),
        method: scanMethod,
        status: 'present',
        verificationScore: 100,
      };
      await addRecord(record);
      setScanStep('done');
      setScanResult({ success: true, message: 'Attendance marked successfully using device biometric.', status: 'present' });
    } catch (err) {
      setScanStep('done');
      setScanResult({ success: false, message: err instanceof Error ? err.message : 'Biometric verification failed. Please retry.' });
    }

    setScanning(false);
    setTimeout(() => { setScanStep('idle'); setScanResult(null); }, 4000);
  };

  const totalPresent = myRecords.filter(r => r.status === 'present').length;
  const totalLate = myRecords.filter(r => r.status === 'late').length;
  const overallPct = sessions.filter(s => myEnrolled.includes(s.courseId) && s.status === 'closed').length > 0
    ? Math.round(((totalPresent + totalLate) / sessions.filter(s => myEnrolled.includes(s.courseId) && s.status === 'closed').length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold">
                {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-bold text-lg">{currentUser?.name}</p>
                <p className="text-blue-200 text-sm">{currentUser?.studentId}</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{totalPresent}</p>
              <p className="text-blue-200 text-xs">Present</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{totalLate}</p>
              <p className="text-blue-200 text-xs">Late</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{overallPct}%</p>
              <p className="text-blue-200 text-xs">Rate</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { id: 'dashboard', label: 'Home', icon: '🏠' },
            { id: 'courses', label: 'Courses', icon: '📚' },
            { id: 'sign-in', label: 'Sign In', icon: '🔐' },
            { id: 'history', label: 'History', icon: '📋' },
            { id: 'profile', label: 'Profile', icon: '👤' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id as typeof activeView)}
              className={`py-2 rounded-xl text-xs font-medium transition flex flex-col items-center gap-1 ${activeView === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              {tab.id === 'sign-in' && activeSessions.length > 0 && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className="space-y-5">
            {activeSessions.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-emerald-800">Active Sessions — Sign in now!</h3>
                </div>
                {activeSessions.map(sess => {
                  const course = courses.find(c => c.id === sess.courseId);
                  const signed = records.some(r => r.studentId === currentUser?.id && r.sessionId === sess.id);
                  return (
                    <div key={sess.id} className="flex items-center justify-between bg-white rounded-xl p-3 mt-2">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{course?.name}</p>
                        <p className="text-xs text-slate-500">{course?.code} • {sess.startTime}</p>
                      </div>
                      {signed ? (
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">✓ Signed</span>
                      ) : (
                        <button onClick={() => { setSelectedSessionId(sess.id); setActiveView('sign-in'); }}
                          className="bg-blue-600 text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-blue-700 transition">
                          Sign In
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> My Courses
              </h3>
              <div className="space-y-3">
                {myCourses.map(course => {
                  const pct = getAttendancePct(course.id);
                  const warning = pct < 70;
                  return (
                    <div key={course.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${warning && pct > 0 ? 'border-amber-200' : 'border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-lg">{course.code}</span>
                          <p className="font-semibold text-slate-800 mt-1 text-sm">{course.name}</p>
                          <p className="text-xs text-slate-500">{course.schedule}</p>
                        </div>
                        {warning && pct > 0 && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-sm font-bold ${pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                      </div>
                      {warning && pct > 0 && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Attendance below 70% — at risk!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* COURSES - Browse & Enroll */}
        {activeView === 'courses' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> Available Courses
            </h2>

            {availableCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Already enrolled in all available courses!</p>
                <p className="text-xs text-slate-400 mt-1">Contact admin to add new courses</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-lg">{course.code}</span>
                        <p className="font-semibold text-slate-900 mt-1">{course.name}</p>
                        <p className="text-sm text-slate-600 mt-1">{course.schedule} • Room {course.room}</p>
                        <p className="text-xs text-slate-500 mt-2">{course.department} • {course.credits} credits</p>
                      </div>
                      <button
                        onClick={async () => {
                          if (!hasAnyBiometricEnrollment) {
                            setActionMessage('Please enroll biometrics first before enrolling in a course.');
                            setActiveView('profile');
                            return;
                          }
                          await enrollCourse(course.id);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl transition whitespace-nowrap ml-2"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {myCourses.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-800 mb-3">My Enrolled Courses ({myCourses.length})</h3>
                <div className="space-y-2">
                  {myCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between bg-emerald-50 rounded-xl p-3">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{course.name}</p>
                        <p className="text-xs text-slate-600">{course.code} • {course.schedule}</p>
                      </div>
                      <span className="bg-emerald-200 text-emerald-700 text-xs px-2 py-1 rounded-lg font-medium">✓ Enrolled</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIGN IN */}
        {activeView === 'sign-in' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-6 h-6 text-blue-600" /> Biometric Sign-In
            </h2>

            {activeSessions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No Active Sessions</p>
                <p className="text-slate-400 text-sm mt-1">Wait for your lecturer to start a session</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-2">Select Session</label>
                  <div className="space-y-2">
                    {activeSessions.map(sess => {
                      const course = courses.find(c => c.id === sess.courseId);
                      const alreadySigned = records.some(r => r.studentId === currentUser?.id && r.sessionId === sess.id);
                      return (
                        <button key={sess.id}
                          onClick={() => !alreadySigned && setSelectedSessionId(sess.id)}
                          disabled={alreadySigned}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition ${selectedSessionId === sess.id ? 'bg-blue-50 border-blue-400' : alreadySigned ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                          <div className="text-left">
                            <p className="font-medium text-slate-800">{course?.name}</p>
                            <p className="text-xs text-slate-500">{course?.code} • {sess.startTime} • {sess.attendanceType}</p>
                          </div>
                          {alreadySigned ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : selectedSessionId === sess.id ? <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-blue-500" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedSessionId && !records.some(r => r.studentId === currentUser?.id && r.sessionId === selectedSessionId) && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    {!hasAnyBiometricEnrollment && (
                      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                        Enroll at least one biometric method in Profile before signing attendance.
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-800 mb-4">Choose Biometric Method</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {(['fingerprint', 'face'] as const).map(method => (
                        <button key={method} onClick={() => setScanMethod(method)}
                          className={`py-4 rounded-2xl border flex flex-col items-center gap-2 transition ${scanMethod === method ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                          {method === 'fingerprint' ? <Fingerprint className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
                          <span className="font-medium text-sm capitalize">{method}</span>
                        </button>
                      ))}
                    </div>

                    {/* Scanner Animation */}
                    <div className="flex flex-col items-center mb-6">
                      <div className={`w-32 h-32 rounded-3xl flex items-center justify-center mb-4 transition-all ${scanStep === 'scanning' ? 'bg-blue-100 animate-pulse' : scanStep === 'processing' ? 'bg-amber-100' : scanResult?.success ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {scanStep === 'idle' && (
                          scanMethod === 'fingerprint' ? <Fingerprint className="w-16 h-16 text-slate-400" /> : <Camera className="w-16 h-16 text-slate-400" />
                        )}
                        {scanStep === 'scanning' && (
                          <div className="relative">
                            {scanMethod === 'fingerprint' ? <Fingerprint className="w-16 h-16 text-blue-500" /> : <Camera className="w-16 h-16 text-blue-500" />}
                            <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-30" />
                          </div>
                        )}
                        {scanStep === 'processing' && (
                          <div className="w-10 h-10 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                        )}
                        {scanStep === 'done' && scanResult?.success && <CheckCircle className="w-16 h-16 text-emerald-500" />}
                        {scanStep === 'done' && !scanResult?.success && <XCircle className="w-16 h-16 text-red-500" />}
                      </div>
                      <p className="text-slate-500 text-sm text-center">
                        {scanStep === 'idle' && 'Place your finger or look at camera'}
                        {scanStep === 'scanning' && 'Scanning... Hold still'}
                        {scanStep === 'processing' && 'Verifying identity...'}
                        {scanResult?.message}
                      </p>
                    </div>

                    <button onClick={handleBiometricScan} disabled={scanning}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 text-lg">
                      {scanning ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : scanMethod === 'fingerprint' ? (
                        <><Fingerprint className="w-6 h-6" /> Scan Fingerprint</>
                      ) : (
                        <><Camera className="w-6 h-6" /> Scan Face</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* HISTORY */}
        {activeView === 'history' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> Attendance History
            </h2>
            {myRecords.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
                <p className="text-slate-400">No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...myRecords].reverse().map(rec => {
                  const course = courses.find(c => c.id === rec.courseId);
                  return (
                    <div key={rec.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${rec.status === 'present' ? 'bg-emerald-100' : rec.status === 'late' ? 'bg-amber-100' : 'bg-red-100'}`}>
                          {rec.method === 'fingerprint' ? <Fingerprint className={`w-5 h-5 ${rec.status === 'present' ? 'text-emerald-600' : rec.status === 'late' ? 'text-amber-600' : 'text-red-600'}`} /> : <Camera className={`w-5 h-5 ${rec.status === 'present' ? 'text-emerald-600' : 'text-amber-600'}`} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{course?.code} – {course?.name}</p>
                          <p className="text-xs text-slate-400">{new Date(rec.timestamp).toLocaleDateString()} • {new Date(rec.timestamp).toLocaleTimeString()} • {rec.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.status === 'present' ? 'bg-emerald-100 text-emerald-700' : rec.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {rec.status}
                        </span>
                        {rec.verificationScore && <p className="text-xs text-slate-400 mt-1">{rec.verificationScore}% match</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeView === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" /> My Profile
            </h2>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {currentUser?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{currentUser?.name}</h3>
                  <p className="text-slate-500 text-sm">{currentUser?.email}</p>
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Student</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Student ID', value: currentUser?.studentId },
                  { label: 'Department', value: currentUser?.department },
                  { label: 'Email', value: currentUser?.email },
                  { label: 'Enrolled Courses', value: `${myEnrolled.length} courses` },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500 text-sm">{item.label}</span>
                    <span className="text-slate-800 text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Biometric Enrollment
              </h3>
              {actionMessage && (
                <div className="mb-3 text-xs rounded-lg px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200">
                  {actionMessage}
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-800">Fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${biometricEnrollment.fingerprintEnrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {biometricEnrollment.fingerprintEnrolled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                    <button
                      onClick={() => handleEnrollBiometric('fingerprint')}
                      disabled={enrollingMethod !== null}
                      className="text-xs px-2 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      {enrollingMethod === 'fingerprint' ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-slate-800">Face Recognition</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${biometricEnrollment.faceEnrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {biometricEnrollment.faceEnrolled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                    <button
                      onClick={() => handleEnrollBiometric('face')}
                      disabled={enrollingMethod !== null}
                      className="text-xs px-2 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {enrollingMethod === 'face' ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Enroll biometrics here before joining or signing course sessions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


