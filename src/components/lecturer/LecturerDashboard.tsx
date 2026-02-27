import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Play, Square, Users, Fingerprint, Camera, ClipboardCheck, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { AttendanceSession, AttendanceRecord } from '../../types';

export default function LecturerDashboard() {
  const { currentUser, courses, sessions, records, users, addSession, closeSession, addRecord } = useApp();
  const [activeView, setActiveView] = useState<'courses' | 'session' | 'records'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'both'>('fingerprint');
  const [scanning, setScanning] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; studentName?: string } | null>(null);
  const [selectedSessionForRecords, setSelectedSessionForRecords] = useState<string | null>(null);

  const myCourses = courses.filter(c => c.lecturerId === currentUser?.id);
  const today = new Date().toISOString().split('T')[0];
  const activeSession = sessions.find(s => s.id === activeSessionId && s.status === 'active');

  const startSession = async () => {
    if (!selectedCourse) return;
    const now = new Date();
    const session: AttendanceSession = {
      id: '',
      courseId: selectedCourse,
      lecturerId: currentUser!.id,
      date: today,
      startTime: now.toTimeString().slice(0, 5),
      status: 'active',
      biometricEnabled: true,
      attendanceType: biometricType,
    };
    const created = await addSession(session);
    if (created) {
      setActiveSessionId(created.id);
      setActiveView('session');
    }
  };

  const endSession = async () => {
    if (activeSessionId) {
      await closeSession(activeSessionId);
      setActiveSessionId(null);
      setActiveView('records');
      setSelectedSessionForRecords(activeSessionId);
    }
  };

  const simulateScan = async (studentId: string, method: 'fingerprint' | 'face') => {
    const student = users.find(u => u.id === studentId);
    if (!student) return;

    // Check already signed in
    const alreadySigned = records.some(r => r.studentId === studentId && r.sessionId === activeSessionId);
    if (alreadySigned) {
      setScanResult({ success: false, message: `${student.name} already marked attendance!` });
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    setScanning(studentId);
    await new Promise(r => setTimeout(r, 2000));
    setScanning(null);

    const score = Math.floor(Math.random() * 15) + 83;
    const success = score > 75;
    const sessionStart = activeSession?.startTime || '00:00';
    const nowTime = new Date().toTimeString().slice(0, 5);
    const isLate = nowTime > sessionStart.replace(/(\d+):(\d+)/, (_, h, m) => `${String(parseInt(h)).padStart(2, '0')}:${m}`) + '15';

    if (success) {
      const record: AttendanceRecord = {
        id: `rec-${Date.now()}`,
        studentId,
        courseId: selectedCourse!,
        sessionId: activeSessionId!,
        timestamp: new Date().toISOString(),
        method,
        status: isLate ? 'late' : 'present',
        verificationScore: score,
      };
      await addRecord(record);
      setScanResult({ success: true, message: `${student.name} — Verified! (${score}% match)`, studentName: student.name });
    } else {
      setScanResult({ success: false, message: `Biometric mismatch for ${student.name}. Please retry.` });
    }
    setTimeout(() => setScanResult(null), 3500);
  };

  const getSessionRecords = (sessionId: string) => records.filter(r => r.sessionId === sessionId);
  const getStudentName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const myCourseIds = myCourses.map(c => c.id);
  const mySessions = sessions.filter(s => myCourseIds.includes(s.courseId) && s.lecturerId === currentUser?.id);

  const csvEscape = (value: string | number | undefined) => {
    if (value == null) return '';
    const str = String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const exportSessionReport = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const course = courses.find(c => c.id === session.courseId);
    const sessionRecords = getSessionRecords(sessionId);
    const signedStudentIds = new Set(sessionRecords.map(r => r.studentId));
    const absentIds = (course?.enrolledStudents || []).filter(id => !signedStudentIds.has(id));

    const header = [
      'Session ID',
      'Course Code',
      'Course Name',
      'Date',
      'Start Time',
      'End Time',
      'Student Name',
      'Student ID',
      'Status',
      'Method',
      'Timestamp',
      'Verification Score',
    ];

    const presentOrLateRows = sessionRecords.map(rec => {
      const student = users.find(u => u.id === rec.studentId);
      return [
        session.id,
        course?.code || '',
        course?.name || '',
        session.date,
        session.startTime,
        session.endTime || '',
        student?.name || 'Unknown',
        student?.studentId || rec.studentId,
        rec.status,
        rec.method,
        rec.timestamp,
        rec.verificationScore ?? '',
      ];
    });

    const absentRows = absentIds.map(studentId => {
      const student = users.find(u => u.id === studentId);
      return [
        session.id,
        course?.code || '',
        course?.name || '',
        session.date,
        session.startTime,
        session.endTime || '',
        student?.name || 'Unknown',
        student?.studentId || studentId,
        'absent',
        '',
        '',
        '',
      ];
    });

    const csv = [header, ...presentOrLateRows, ...absentRows]
      .map(row => row.map(value => csvEscape(value as string | number | undefined)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const safeCourseCode = (course?.code || 'attendance').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeCourseCode}_${session.date}_session_${session.id}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" /> Lecturer Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage classes & track student attendance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'session', label: 'Live Session', icon: <Play className="w-4 h-4" /> },
            { id: 'records', label: 'Attendance Records', icon: <ClipboardCheck className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id as typeof activeView)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeView === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
              {tab.icon} {tab.label}
              {tab.id === 'session' && activeSession && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-1" />
              )}
            </button>
          ))}
        </div>

        {/* MY COURSES */}
        {activeView === 'courses' && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {myCourses.map(course => {
                const enrolled = course.enrolledStudents.length;
                const todaySess = sessions.filter(s => s.courseId === course.id && s.date === today);
                const totalRecs = records.filter(r => r.courseId === course.id && r.status === 'present').length;
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg">{course.code}</span>
                        <h3 className="font-semibold text-slate-800 mt-2">{course.name}</h3>
                        <p className="text-xs text-slate-500">{course.department}</p>
                      </div>
                      <div className="text-2xl">📚</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-slate-900">{enrolled}</p>
                        <p className="text-xs text-slate-500">Students</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-slate-900">{totalRecs}</p>
                        <p className="text-xs text-slate-500">Present Records</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1 mb-4">
                      <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.schedule}</p>
                      <p>🏫 {course.room}</p>
                      <p>📅 Today's Sessions: {todaySess.length}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedCourse(course.id); setActiveView('session'); }}
                      className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> Start Attendance Session
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIVE SESSION */}
        {activeView === 'session' && (
          <div className="space-y-5">
            {!activeSession ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-5">Start Attendance Session</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Select Course</label>
                    <select value={selectedCourse || ''} onChange={e => setSelectedCourse(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">-- Select a course --</option>
                      {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">Biometric Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['fingerprint', 'face', 'both'] as const).map(type => (
                        <button key={type} onClick={() => setBiometricType(type)}
                          className={`py-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1 ${biometricType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                          {type === 'fingerprint' ? <Fingerprint className="w-5 h-5" /> : type === 'face' ? <Camera className="w-5 h-5" /> : <span className="text-base">🔐</span>}
                          <span className="capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={startSession} disabled={!selectedCourse}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                    <Play className="w-5 h-5" /> Start Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Session Info */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-emerald-100 text-sm font-medium">LIVE SESSION</span>
                      </div>
                      <h2 className="text-xl font-bold">{courses.find(c => c.id === activeSession.courseId)?.name}</h2>
                      <p className="text-emerald-100 text-sm mt-1">{courses.find(c => c.id === activeSession.courseId)?.code} • Started {activeSession.startTime}</p>
                    </div>
                    <button onClick={endSession}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition">
                      <Square className="w-4 h-4" /> End
                    </button>
                  </div>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span>📊 {getSessionRecords(activeSessionId!).length} signed in</span>
                    <span>🔐 {biometricType}</span>
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div className={`rounded-2xl p-4 flex items-center gap-3 ${scanResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    {scanResult.success ? <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                    <p className={`text-sm font-medium ${scanResult.success ? 'text-emerald-800' : 'text-red-800'}`}>{scanResult.message}</p>
                  </div>
                )}

                {/* Student List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" /> Enrolled Students
                    </h3>
                    <span className="text-sm text-slate-500">{courses.find(c => c.id === activeSession.courseId)?.enrolledStudents.length} enrolled</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {courses.find(c => c.id === activeSession.courseId)?.enrolledStudents.map(stdId => {
                      const student = users.find(u => u.id === stdId);
                      const signed = records.find(r => r.studentId === stdId && r.sessionId === activeSessionId);
                      const isScanning = scanning === stdId;
                      return (
                        <div key={stdId} className="flex items-center justify-between p-4 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${signed ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              {student?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{student?.name}</p>
                              <p className="text-xs text-slate-400">{student?.studentId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {signed ? (
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${signed.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {signed.status === 'present' ? '✓ Present' : '⏰ Late'}
                                </span>
                                <span className="text-xs text-slate-400">{signed.verificationScore}%</span>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                {(biometricType === 'fingerprint' || biometricType === 'both') && (
                                  <button onClick={() => simulateScan(stdId, 'fingerprint')} disabled={isScanning}
                                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition disabled:opacity-50">
                                    {isScanning ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                                  </button>
                                )}
                                {(biometricType === 'face' || biometricType === 'both') && (
                                  <button onClick={() => simulateScan(stdId, 'face')} disabled={isScanning}
                                    className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition disabled:opacity-50">
                                    {isScanning ? <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-500 rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECORDS */}
        {activeView === 'records' && (
          <div className="space-y-5">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {mySessions.map(sess => {
                const course = courses.find(c => c.id === sess.courseId);
                return (
                  <button key={sess.id} onClick={() => setSelectedSessionForRecords(sess.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition ${selectedSessionForRecords === sess.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                    {course?.code} • {sess.date}
                    <span className={`ml-2 text-xs ${sess.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {sess.status === 'active' ? '● Live' : '✓ Closed'}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedSessionForRecords ? (() => {
              const sess = sessions.find(s => s.id === selectedSessionForRecords);
              const course = courses.find(c => c.id === sess?.courseId);
              const sessRecs = getSessionRecords(selectedSessionForRecords);
              const allStudents = course?.enrolledStudents || [];
              const presentIds = sessRecs.map(r => r.studentId);
              const absentIds = allStudents.filter(id => !presentIds.includes(id));

              return (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{course?.name}</h3>
                        <p className="text-sm text-slate-500">{sess?.date} • {sess?.startTime} – {sess?.endTime || 'Ongoing'}</p>
                      </div>
                      <div className="flex gap-3 text-center">
                        <div className="bg-emerald-50 rounded-xl px-4 py-2">
                          <p className="text-lg font-bold text-emerald-700">{sessRecs.filter(r => r.status === 'present').length}</p>
                          <p className="text-xs text-emerald-600">Present</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl px-4 py-2">
                          <p className="text-lg font-bold text-amber-700">{sessRecs.filter(r => r.status === 'late').length}</p>
                          <p className="text-xs text-amber-600">Late</p>
                        </div>
                        <div className="bg-red-50 rounded-xl px-4 py-2">
                          <p className="text-lg font-bold text-red-700">{absentIds.length}</p>
                          <p className="text-xs text-red-600">Absent</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sessRecs.map(rec => (
                        <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${rec.status === 'present' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                              {getStudentName(rec.studentId).split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{getStudentName(rec.studentId)}</p>
                              <p className="text-xs text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()} • {rec.method}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{rec.verificationScore}%</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${rec.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {rec.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {absentIds.map(id => (
                        <div key={id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-300 flex items-center justify-center text-white text-xs font-bold">
                              {getStudentName(id).split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-red-800 text-sm">{getStudentName(id)}</p>
                              <p className="text-xs text-red-400">No check-in recorded</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">Absent</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => exportSessionReport(selectedSessionForRecords!)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Export Attendance Report
                  </button>
                </div>
              );
            })() : (
              <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Select a session above to view attendance records</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
