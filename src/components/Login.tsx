import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, Eye, EyeOff, Shield, Wifi } from 'lucide-react';
import { apiClient } from '../services/ApiClient';

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [fallbackResetUrl, setFallbackResetUrl] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    if (token) {
      setResetToken(token);
      setShowForgot(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 900));
    if (!(await login(email, password))) {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 2500));
    setScanning(false);
    setError('Biometric device not detected. Use credentials instead.');
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setError('Enter your email to receive reset link.');
      return;
    }
    try {
      setSendingReset(true);
      setError('');
      const response: any = await apiClient.auth.forgotPassword(forgotEmail.trim());
      setError(response?.message || 'If the email exists, a reset link has been sent.');
      setFallbackResetUrl(response?.resetUrl || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link.');
      setFallbackResetUrl('');
    } finally {
      setSendingReset(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword || !resetConfirm) {
      setError('Enter and confirm a new password.');
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setResetting(true);
      setError('');
      await apiClient.auth.resetPassword(resetToken, resetPassword);
      setError('Password reset successful. You can now sign in.');
      setResetPassword('');
      setResetConfirm('');
      window.history.replaceState({}, '', window.location.pathname);
      setResetToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex flex-col items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl mb-4">
            <Fingerprint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">BiometriTrack</h1>
          <p className="text-blue-300 mt-1 text-sm">Student Attendance System</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">System Online</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-blue-300" />
            <h2 className="text-white font-semibold text-lg">Secure Login</h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 mb-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          {resetToken ? (
            <div className="space-y-4">
              <div>
                <label className="text-blue-200 text-sm font-medium block mb-1">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-blue-200 text-sm font-medium block mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
              >
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-blue-200 text-sm font-medium block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="text-blue-200 text-sm font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-11 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : 'Sign In'}
            </button>
          </form>
          )}

          {!resetToken && (
            <div className="mt-3">
              <button
                onClick={() => setShowForgot(v => !v)}
                className="text-blue-300 text-xs hover:text-white transition"
              >
                Forgot password?
              </button>
            </div>
          )}

          {!resetToken && showForgot && (
            <div className="mt-3 space-y-2">
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Enter your account email"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleForgotPassword}
                disabled={sendingReset}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm py-2 rounded-xl disabled:opacity-60"
              >
                {sendingReset ? 'Sending...' : 'Send Reset Link'}
              </button>
              {fallbackResetUrl && (
                <a
                  href={fallbackResetUrl}
                  className="block text-xs text-blue-200 underline break-all"
                >
                  Open fallback reset link
                </a>
              )}
            </div>
          )}

          {/* Biometric Button */}
          {!resetToken && (
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent text-blue-300 text-xs px-3">or continue with biometric</span>
            </div>
          </div>
          )}

          {!resetToken && <button onClick={handleBiometricLogin} disabled={scanning}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-3 group">
            {scanning ? (
              <>
                <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-blue-300">Scanning biometric...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-6 h-6 text-blue-300 group-hover:text-white transition" />
                <span>Fingerprint / Face ID</span>
              </>
            )}
          </button>}

        </div>

        <p className="text-center text-blue-400/50 text-xs mt-6">
          © 2024 BiometriTrack • Powered by Java Spring Boot + MySQL
        </p>
      </div>
    </div>
  );
}
