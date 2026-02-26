import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Navbar from './components/shared/Navbar';
import AdminDashboard from './components/admin/AdminDashboard';
import LecturerDashboard from './components/lecturer/LecturerDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import { LayoutDashboard } from 'lucide-react';

function AppContent() {
  const { currentUser, isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated || !currentUser) return <Login />;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

      {/* Role badge strip */}
      <div className={`${currentUser.role === 'admin' ? 'bg-purple-600' : currentUser.role === 'lecturer' ? 'bg-blue-600' : 'bg-emerald-600'} text-white text-xs py-1.5 px-4 text-center`}>
        {currentUser.role === 'admin' && '🛡️ Administrator — Full System Access'}
        {currentUser.role === 'lecturer' && '📚 Lecturer Portal — Manage Classes & Attendance Sessions'}
        {currentUser.role === 'student' && `🎓 Student Portal — ${currentUser.name} | ${currentUser.studentId}`}
      </div>

      {currentUser.role === 'admin' && <AdminDashboard />}
      {currentUser.role === 'lecturer' && <LecturerDashboard />}
      {currentUser.role === 'student' && <StudentDashboard />}
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
