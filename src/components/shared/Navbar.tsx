import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fingerprint, LogOut, Bell, Menu, X, User, Shield, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}

export default function Navbar({ activeTab, setActiveTab, tabs }: NavbarProps) {
  const { currentUser, logout, courses, sessions, records, users } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const roleColors: Record<string, string> = {
    admin: 'from-purple-500 to-violet-600',
    lecturer: 'from-blue-500 to-cyan-600',
    student: 'from-emerald-500 to-teal-600',
  };
  const roleIcons: Record<string, React.ReactNode> = {
    admin: <Shield className="w-4 h-4" />,
    lecturer: <BookOpen className="w-4 h-4" />,
    student: <User className="w-4 h-4" />,
  };

  const today = new Date().toISOString().split('T')[0];

  const notifications = useMemo(() => {
    if (!currentUser) return [] as string[];

    if (currentUser.role === 'admin') {
      const liveSessions = sessions.filter(s => s.status === 'active');
      const students = users.filter(u => u.role === 'student');
      const studentsWithoutFingerprint = students.filter(s => !s.fingerprintId);
      const closedToday = sessions.filter(s => s.status === 'closed' && s.date === today);

      const items: string[] = [];
      if (liveSessions.length > 0) {
        items.push(`${liveSessions.length} live session(s) currently running.`);
      }
      if (studentsWithoutFingerprint.length > 0) {
        items.push(
          `${studentsWithoutFingerprint.length} student(s) have not enrolled fingerprints.`,
        );
      }
      if (closedToday.length > 0) {
        items.push(`${closedToday.length} session(s) have been closed today.`);
      }
      if (items.length === 0) {
        items.push('No urgent admin notifications right now.');
      }
      return items;
    }

    if (currentUser.role === 'lecturer') {
      const myCourses = courses.filter(c => c.lecturerId === currentUser.id);
      const myCourseIds = new Set(myCourses.map(c => c.id));
      const mySessions = sessions.filter(s => myCourseIds.has(s.courseId));
      const myLive = mySessions.filter(s => s.status === 'active');
      const todaySessions = mySessions.filter(s => s.date === today);

      const unsignedCount = myLive.reduce((sum, session) => {
        const course = courses.find(c => c.id === session.courseId);
        const enrolled = course?.enrolledStudents || [];
        const signed = new Set(
          records.filter(r => r.sessionId === session.id).map(r => r.studentId),
        );
        return sum + enrolled.filter(id => !signed.has(id)).length;
      }, 0);

      const items: string[] = [];
      if (myLive.length > 0) {
        items.push(`${myLive.length} live session(s) need monitoring or ending.`);
      }
      if (unsignedCount > 0) {
        items.push(`${unsignedCount} student(s) still not signed in for live sessions.`);
      }
      if (todaySessions.length === 0 && myCourses.length > 0) {
        items.push('No session started today for your courses yet.');
      }
      if (items.length === 0) {
        items.push('No urgent lecturer notifications right now.');
      }
      return items;
    }

    const myEnrolled = new Set(currentUser.enrolledCourses || []);
    const myActiveSessions = sessions.filter(
      s => s.status === 'active' && myEnrolled.has(s.courseId),
    );
    const mySignedSessionIds = new Set(records.filter(r => r.studentId === currentUser.id).map(r => r.sessionId));
    const pendingSignIns = myActiveSessions.filter(s => !mySignedSessionIds.has(s.id)).length;

    const closedForMe = sessions.filter(
      s => s.status === 'closed' && myEnrolled.has(s.courseId),
    );
    const myPresent = records.filter(
      r =>
        r.studentId === currentUser.id &&
        (r.status === 'present' || r.status === 'late') &&
        closedForMe.some(s => s.id === r.sessionId),
    ).length;
    const attendancePct = closedForMe.length > 0 ? Math.round((myPresent / closedForMe.length) * 100) : 100;

    const items: string[] = [];
    if (!currentUser.fingerprintId) {
      items.push('Enroll your fingerprint to avoid sign-in restrictions.');
    }
    if (pendingSignIns > 0) {
      items.push(`${pendingSignIns} active session(s) waiting for your sign-in.`);
    }
    if (attendancePct < 70) {
      items.push(`Attendance is ${attendancePct}%. Improve to stay above 70%.`);
    }
    if (items.length === 0) {
      items.push('No urgent student notifications right now.');
    }
    return items;
  }, [courses, currentUser, records, sessions, today, users]);

  const unreadCount =
    notifications.length === 1 &&
    notifications[0].toLowerCase().includes('no urgent')
      ? 0
      : notifications.length;

  return (
    <>
      <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg leading-none">BiometriTrack</h1>
                <p className="text-slate-400 text-xs">Attendance System</p>
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}>
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setShowNotifications(v => !v)}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-semibold capitalize">
                      {currentUser?.role} Notifications
                    </p>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item, idx) => (
                      <div
                        key={`${item}-${idx}`}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="hidden sm:flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[currentUser?.role || 'student']} flex items-center justify-center text-white`}>
                  {roleIcons[currentUser?.role || 'student']}
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-none">{currentUser?.name.split(' ')[0]}</p>
                  <p className="text-slate-400 text-xs capitalize">{currentUser?.role}</p>
                </div>
              </div>
              <button onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition">
                <LogOut className="w-5 h-5" />
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 px-4 py-3 space-y-1 sticky top-16 z-40">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
