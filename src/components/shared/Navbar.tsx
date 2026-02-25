import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fingerprint, LogOut, Bell, Menu, X, User, Shield, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}

export default function Navbar({ activeTab, setActiveTab, tabs }: NavbarProps) {
  const { currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
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
