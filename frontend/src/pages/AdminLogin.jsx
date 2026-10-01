import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, Loader2, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated as admin, redirect to admin dashboard
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in both Administrator Email and Password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Prevent legacy .edu admin accounts from submitting
    if (cleanEmail.endsWith('.edu') || cleanEmail.includes('.edu')) {
      setError('Legacy .edu administrator accounts have been removed. Please sign in using your official MSC Verification Platform administrator account.');
      return;
    }

    setLoading(true);
    setError('');
    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res?.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(res?.error || 'Invalid credentials or you lack administrator privileges on the MSC Verification Platform.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-14 px-3.5 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-50 font-segoe">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-10 w-96 h-96 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_rgba(37,99,235,0.08)_0%,_transparent_60%)]"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_rgba(139,92,246,0.06)_0%,_transparent_60%)]"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
          {/* Accent top stripe */}
          <div className="absolute top-0 left-0 w-full h-[4px]" style={{ background: 'linear-gradient(90deg, #2563EB, #0EA5E9, #8B5CF6)' }}></div>

          {/* Header */}
          <div className="text-center space-y-2.5 pt-1">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-100/80 shadow-md shadow-blue-500/10 border border-blue-100">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
            <p className="text-[13px] text-slate-500">
              Sign in with your official administrator email and password configured on the MSC Verification Platform.
            </p>

            {/* Direct Verification Sync Indicator */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-full text-[11px] font-bold mx-auto">
              <Sparkles size={12} className="text-emerald-600" />
              <span>Synced with verify.mscprpcem.tech</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-50 border border-rose-200/90 text-rose-700 p-4 rounded-2xl text-xs font-semibold flex items-start gap-2.5 animate-fade-in shadow-xs">
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">{error}</div>
            </div>
          )}

          {/* Credentials Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3.5">
              {/* Administrator Email */}
              <div className="space-y-1 text-left">
                <label htmlFor="email" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Administrator Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@mscprpcem.tech"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1 text-left">
                <label htmlFor="password" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Synchronization Policy Notice */}
          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 space-y-1 text-center">
            <p>
              🔒 <strong>Verification Platform Synchronization</strong>: Credentials configured on <strong>verify.mscprpcem.tech</strong> work here automatically.
            </p>
            <p className="text-[10px] text-slate-400">
              Legacy .edu administrators have been decommissioned. Password updates are synchronized bidirectionally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
