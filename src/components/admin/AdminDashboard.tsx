import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, BookOpen, ClipboardList, TrendingUp, Shield, Activity, UserCheck, AlertCircle, Plus, Trash2, X, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { User, Course } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { users, courses, sessions, records, addUser, deleteUser, addCourse, deleteCourse, isLoading, error } = useApp();
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'courses' | 'reports'>('overview');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student', department: '', studentId: '', staffId: '' });
  const [newCourse, setNewCourse] = useState({ code: '', name: '', lecturerId: '', department: '', schedule: '', room: '', credits: '3' });

  const students = users.filter(u => u.role === 'student');
  const lecturers = users.filter(u => u.role === 'lecturer');
  const totalSessions = sessions.length;
  const totalRecords = records.length;

  const attendanceByDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => ({
    day,
    present: Math.floor(Math.random() * 20) + 25,
    absent: Math.floor(Math.random() * 8) + 2,
  }));

  const pieData = [
    { name: 'Present', value: records.filter(r => r.status === 'present').length },
    { name: 'Late', value: records.filter(r => r.status === 'late').length },
    { name: 'Absent', value: 8 },
  ];

  const handleAddUser = async () => {
    // Validation
    if (!newUser.name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (!newUser.email.trim()) {
      alert('Please enter an email');
      return;
    }
    if (!newUser.password.trim()) {
      alert('Please enter a password');
      return;
    }
    if (!newUser.department.trim()) {
      alert('Please enter a department');
      return;
    }

    try {
      // Don't include ID - let backend generate it
      const user: any = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role.toUpperCase(),
        department: newUser.department,
      };
      
      if (newUser.role === 'student' && newUser.studentId) {
        user.studentId = newUser.studentId;
      }
      if (newUser.role !== 'student' && newUser.staffId) {
        user.staffId = newUser.staffId;
      }

      await addUser(user as User);
      setSuccessMessage(`✓ ${newUser.name} added successfully!`);
      setNewUser({ name: '', email: '', password: '', role: 'student', department: '', studentId: '', staffId: '' });
      setShowAddUser(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddCourse = async () => {
    // Validation
    if (!newCourse.code.trim()) {
      alert('Please enter a course code');
      return;
    }
    if (!newCourse.name.trim()) {
      alert('Please enter a course name');
      return;
    }
    if (!newCourse.department.trim()) {
      alert('Please enter a department');
      return;
    }
    if (!newCourse.lecturerId) {
      alert('Please select a lecturer');
      return;
    }
    if (!newCourse.schedule.trim()) {
      alert('Please enter a schedule');
      return;
    }
    if (!newCourse.room.trim()) {
      alert('Please enter a room');
      return;
    }

    try {
      // Don't include ID - let backend generate it
      const course: any = {
        code: newCourse.code,
        name: newCourse.name,
        lecturerId: parseInt(newCourse.lecturerId),
        department: newCourse.department,
        credits: parseInt(newCourse.credits),
        schedule: newCourse.schedule,
        room: newCourse.room,
      };
      await addCourse(course as Course);
      setSuccessMessage(`✓ ${newCourse.name} created successfully!`);
      setNewCourse({ code: '', name: '', lecturerId: '', department: '', schedule: '', room: '', credits: '3' });
      setShowAddCourse(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(`Failed to create course: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stats = [
    { label: 'Total Students', value: students.length, icon: <Users className="w-6 h-6" />, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Lecturers', value: lecturers.length, icon: <BookOpen className="w-6 h-6" />, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Active Courses', value: courses.length, icon: <ClipboardList className="w-6 h-6" />, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Sessions Today', value: sessions.filter(s => s.date === new Date().toISOString().split('T')[0]).length, icon: <Activity className="w-6 h-6" />, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ];

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'courses', label: 'Courses' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-7 h-7 text-purple-600" /> Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">System Overview & Management</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-sm font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Active
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-in fade-in">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in">
            Error: {error}
          </div>
        )}

        {/* Quick Actions */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => { setActiveSection('users'); setShowAddUser(true); setNewUser({ ...newUser, role: 'student' }); }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-1">👨‍🎓</div>
              <div className="text-xs font-semibold">Add Student</div>
            </button>
            <button
              onClick={() => { setActiveSection('users'); setShowAddUser(true); setNewUser({ ...newUser, role: 'lecturer' }); }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-1">👨‍🏫</div>
              <div className="text-xs font-semibold">Add Lecturer</div>
            </button>
            <button
              onClick={() => { setActiveSection('courses'); setShowAddCourse(true); }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-4 hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-1">📚</div>
              <div className="text-xs font-semibold">Add Course</div>
            </button>
            <button
              onClick={() => setActiveSection('overview')}
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 hover:shadow-lg transition text-center"
            >
              <div className="text-2xl mb-1">📊</div>
              <div className="text-xs font-semibold">Reports</div>
            </button>
          </div>
        )}

        {/* Sub-nav */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id as typeof activeSection)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeSection === s.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.text} flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> Weekly Attendance
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={attendanceByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" /> Attendance Status
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-slate-600">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      {item.name}: {item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Recent Sessions
              </h3>
              <div className="space-y-3">
                {sessions.slice(-4).reverse().map(sess => {
                  const course = courses.find(c => c.id === sess.courseId);
                  const sessRecords = records.filter(r => r.sessionId === sess.id);
                  return (
                    <div key={sess.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{course?.name}</p>
                        <p className="text-xs text-slate-500">{sess.date} • {sess.startTime}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">{sessRecords.length} signed in</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${sess.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {sess.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {activeSection === 'users' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">User Management</h2>
              <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>

            {showAddUser && (
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Create New User</h3>
                    <p className="text-xs text-slate-500 mt-1">Fill in the details below</p>
                  </div>
                  <button onClick={() => setShowAddUser(false)} className="hover:bg-slate-100 p-2 rounded-lg transition"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                {/* Role Selector with Icons */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Select Role</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'student', icon: '👨‍🎓', label: 'Student' },
                      { value: 'lecturer', icon: '👨‍🏫', label: 'Lecturer' },
                      { value: 'admin', icon: '🔐', label: 'Admin' }
                    ].map(r => (
                      <button
                        key={r.value}
                        onClick={() => setNewUser({ ...newUser, role: r.value })}
                        className={`p-3 rounded-xl border-2 transition text-center cursor-pointer ${
                          newUser.role === r.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{r.icon}</div>
                        <div className="text-xs font-medium text-slate-700">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Full Name *</label>
                    <input
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Email *</label>
                    <input
                      placeholder="john@example.com"
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Password *</label>
                    <input
                      placeholder="• • • • • • • •"
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Department *</label>
                    <input
                      placeholder="e.g., Computer Science"
                      value={newUser.department}
                      onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  {newUser.role === 'student' ? (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 block mb-2">Student ID (Optional)</label>
                      <input
                        placeholder="STD-2024-001"
                        value={newUser.studentId}
                        onChange={e => setNewUser({ ...newUser, studentId: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  ) : newUser.role === 'lecturer' ? (
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 block mb-2">Staff ID (Optional)</label>
                      <input
                        placeholder="LEC-003"
                        value={newUser.staffId}
                        onChange={e => setNewUser({ ...newUser, staffId: e.target.value })}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  ) : null}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddUser}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Create User
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    disabled={isLoading}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {['Name', 'Email', 'Role', 'ID', 'Biometric', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500' : user.role === 'lecturer' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-sm font-medium text-slate-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'lecturer' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{user.studentId || user.staffId}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${user.fingerprintId ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>FP</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${user.faceId ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>FACE</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COURSES */}
        {activeSection === 'courses' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Course Management</h2>
              <button onClick={() => setShowAddCourse(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>

            {showAddCourse && (
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Create New Course</h3>
                    <p className="text-xs text-slate-500 mt-1">Set up course details and assign a lecturer</p>
                  </div>
                  <button onClick={() => setShowAddCourse(false)} className="hover:bg-slate-100 p-2 rounded-lg transition"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Course Code *</label>
                    <input
                      placeholder="CS 201"
                      value={newCourse.code}
                      onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Course Name *</label>
                    <input
                      placeholder="Data Structures"
                      value={newCourse.name}
                      onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Department *</label>
                    <input
                      placeholder="Computer Science"
                      value={newCourse.department}
                      onChange={e => setNewCourse({ ...newCourse, department: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Assign Lecturer *</label>
                    <select
                      value={newCourse.lecturerId}
                      onChange={e => setNewCourse({ ...newCourse, lecturerId: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">Select a Lecturer</option>
                      {lecturers.map(lec => (
                        <option key={lec.id} value={lec.id}>{lec.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Schedule *</label>
                    <input
                      placeholder="Mon/Wed 10:00-11:00"
                      value={newCourse.schedule}
                      onChange={e => setNewCourse({ ...newCourse, schedule: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Room *</label>
                    <input
                      placeholder="Building A, Room 101"
                      value={newCourse.room}
                      onChange={e => setNewCourse({ ...newCourse, room: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 block mb-2">Credits *</label>
                    <input
                      placeholder="3"
                      type="number"
                      value={newCourse.credits}
                      onChange={e => setNewCourse({ ...newCourse, credits: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Info Box */}
                {newCourse.lecturerId && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Assigned Lecturer:</span> {lecturers.find(l => l.id === newCourse.lecturerId)?.name}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddCourse}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Create Course
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddCourse(false)}
                    disabled={isLoading}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => {
                const lecturer = users.find(u => u.id === course.lecturerId);
                const courseRecords = records.filter(r => r.courseId === course.id);
                return (
                  <div key={course.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">{course.code}</span>
                      <button onClick={() => deleteCourse(course.id)} className="p-1 text-slate-400 hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">{course.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{course.department}</p>
                    <div className="space-y-1 text-xs text-slate-500">
                      <p>👤 {lecturer?.name}</p>
                      <p>📅 {course.schedule}</p>
                      <p>🏫 {course.room}</p>
                      <p>👥 {course.enrolledStudents.length} students enrolled</p>
                      <p>📊 {courseRecords.length} attendance records</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {activeSection === 'reports' && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">System Reports</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Attendance Records', value: totalRecords, icon: '📋', color: 'bg-blue-50 border-blue-100' },
                { label: 'Total Sessions', value: totalSessions, icon: '📅', color: 'bg-purple-50 border-purple-100' },
                { label: 'Biometric Verifications', value: records.filter(r => r.method !== 'manual').length, icon: '🔐', color: 'bg-emerald-50 border-emerald-100' },
              ].map((item, i) => (
                <div key={i} className={`${item.color} border rounded-2xl p-5`}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-slate-600 text-sm">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Backend Integration Info
              </h3>
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-amber-800 mb-1">Java Spring Boot Backend Required</p>
                  <p className="text-xs text-amber-700">This frontend connects to a Java Spring Boot REST API running on port 8080. The backend handles biometric data processing, JWT authentication, and MySQL database operations.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-blue-800 mb-1">API Endpoints</p>
                  <div className="space-y-1 text-xs font-mono text-blue-700">
                    <p>POST /api/auth/login</p>
                    <p>POST /api/biometric/enroll</p>
                    <p>POST /api/biometric/verify</p>
                    <p>GET /api/attendance/session/{'{'}id{'}'}</p>
                    <p>POST /api/attendance/mark</p>
                    <p>GET /api/reports/course/{'{'}id{'}'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Per-Course Attendance Summary</h3>
              <div className="space-y-3">
                {courses.map(course => {
                  const courseRecs = records.filter(r => r.courseId === course.id);
                  const presentCount = courseRecs.filter(r => r.status === 'present').length;
                  const pct = courseRecs.length > 0 ? Math.round((presentCount / courseRecs.length) * 100) : 0;
                  return (
                    <div key={course.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{course.code} – {course.name}</span>
                          <span className="text-slate-500">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
