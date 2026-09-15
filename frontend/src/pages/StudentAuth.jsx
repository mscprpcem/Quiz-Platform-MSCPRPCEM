import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, CheckCircle2, ArrowRight, AlertCircle,
  AlertTriangle, Loader2, BookOpen, Eye, EyeOff, KeyRound, ArrowLeft, ShieldCheck,
  ExternalLink, Search, Sparkles, Check, X
} from 'lucide-react';

export default function StudentAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    studentAccount, studentLogin, studentRegister, studentLogout, 
    forgotPassword, verifyOtp, resetPassword, checkUsername 
  } = useAuth();

  const verificationPortalUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VERIFICATION_PORTAL_URL) || 'https://verify.mscprpcem.tech';

  // Mode: 'login' | 'register' | 'forgot-password'
  const isRegisterInitial = location.pathname.includes('register');
  const [mode, setMode] = useState(isRegisterInitial ? 'register' : 'login');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isUsernameCustomized, setIsUsernameCustomized] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '', error: '' });
  const [lookupHandle, setLookupHandle] = useState('');

  // Debounced real-time username availability check against Verification Portal
  useEffect(() => {
    if (mode !== 'register' || !formData.username || formData.username.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '', error: '' });
      return;
    }

    const clean = formData.username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    setUsernameStatus(prev => ({ ...prev, checking: true, error: '' }));

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername(clean);
        if (res) {
          setUsernameStatus({
            checking: false,
            available: res.available !== false,
            message: res.available !== false ? '✓ Handle is available on Verification Portal!' : '',
            error: res.available === false ? (res.error || 'Username handle is already registered') : ''
          });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, available: true, message: '✓ Handle format is valid', error: '' });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.username, mode]);

  // Search & open verification portal profile
  const handleProfileSearchSubmit = (e) => {
    e.preventDefault();
    const clean = (lookupHandle || '').trim().replace(/^@+/, '').toLowerCase();
    if (!clean) return;
    window.open(`${verificationPortalUrl}/u/${encodeURIComponent(clean)}`, '_blank', 'noopener,noreferrer');
  };

  // Forgot Password / OTP State
  const [resetStep, setResetStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP, 3 = Enter New Password
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Registration OTP State
  const [regStep, setRegStep] = useState(1); // 1 = Form, 2 = Enter Verification OTP
  const [registerOtp, setRegisterOtp] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setMode('register');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const autoUser = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        name: value,
        username: isUsernameCustomized ? prev.username : autoUser
      }));
    } else if (name === 'username') {
      setIsUsernameCustomized(true);
      setFormData(prev => ({
        ...prev,
        username: value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  // Determine target return URL after authentication
  const getReturnUrl = () => {
    const params = new URLSearchParams(location.search);
    const target = params.get('redirect') || params.get('returnUrl') || params.get('from') || location.state?.from || sessionStorage.getItem('msc_quiz_return_url');
    
    if (target && typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/login') && !target.startsWith('/register') && !target.startsWith('/student/login') && !target.startsWith('/student/register')) {
      sessionStorage.removeItem('msc_quiz_return_url');
      return target;
    }
    return '/courses';
  };

  // Auto-redirect if student is already authenticated
  useEffect(() => {
    if (studentAccount) {
      const returnUrl = getReturnUrl();
      if (returnUrl && returnUrl !== '/courses') {
        const timer = setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [studentAccount]);

  // Handle Send Reset OTP (Step 1)
  const handleSendResetOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await forgotPassword(formData.email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || `Verification code sent to ${formData.email.trim()}.`);
      setResetStep(2);
      setResetOtp('');
    } else {
      setError(res.error || 'Failed to send verification code. Check your email.');
    }
  };

  // Handle Resend Register OTP (Step 2)
  const handleResendRegisterOtp = async () => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const finalUsername = (formData.username || formData.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).replace(/[^a-z0-9_-]/g, '');
    const res = await studentRegister({
      name: formData.name.trim(),
      username: finalUsername,
      email: formData.email.trim(),
      password: formData.password
    });
    setLoading(false);

    if (res.requireVerification || res.success) {
      setSuccessMsg(`New 6-digit verification code sent to ${formData.email.trim()}.`);
      setRegisterOtp('');
    } else {
      setError(res.error || 'Failed to resend verification code.');
    }
  };

  // Handle Verify Reset OTP (Step 2)
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await verifyOtp(formData.email.trim(), resetOtp.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Code verified! Enter your new password.');
      setResetStep(3);
    } else {
      setError(res.error || 'Invalid or expired code. Please try again.');
    }
  };

  // Handle Complete Password Reset (Step 3: Update & Auto-Login)
  const handleCompletePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const res = await resetPassword(formData.email.trim(), resetOtp.trim(), newPassword);

    if (res.success) {
      setSuccessMsg('Password updated! Signing you in...');
      
      const loginRes = await studentLogin(formData.email.trim(), newPassword);
      setLoading(false);

      const destination = getReturnUrl();
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 800);
    } else {
      setLoading(false);
      setError(res.error || 'Failed to update password.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const { name, username, email, password, confirmPassword } = formData;
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      if (mode === 'register') {
        const finalUsername = (username || name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')).replace(/[^a-z0-9_-]/g, '');
        const res = await studentRegister({
          name: name.trim(),
          username: finalUsername,
          email: cleanEmail,
          password,
          otp: regStep === 2 ? registerOtp.trim() : undefined
        });

        if (res.requireVerification) {
          setRegStep(2);
          setSuccessMsg(res.message || `Verification code sent to ${cleanEmail}.`);
        } else if (res.success) {
          setSuccessMsg('Account created and verified successfully! Redirecting...');
          setRegStep(1);
          setRegisterOtp('');
          const destination = getReturnUrl();
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 800);
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await studentLogin(cleanEmail, password);
        if (res.success) {
          setSuccessMsg('Signed in successfully! Redirecting...');
          const destination = getReturnUrl();
          setTimeout(() => {
            navigate(destination, { replace: true });
          }, 600);
        } else {
          setError(res.error || 'Invalid email or password.');
          if (res.requireVerification) {
            setMode('register');
            setRegStep(2);
            setSuccessMsg('Your account requires email verification. Please enter the 6-digit OTP code to complete verification.');
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, show student profile session card
  if (studentAccount) {
    const returnUrl = getReturnUrl();
    const studentHandle = studentAccount.username || studentAccount.email.split('@')[0];
    const profileUrl = `${verificationPortalUrl}/u/${studentHandle}`;

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4 bg-slate-50 font-segoe">
        <div className="max-w-md w-full animate-fade-in space-y-4">
          
          <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-center">
            
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
              <span className="text-2xl font-black">{studentAccount.name ? studentAccount.name.charAt(0).toUpperCase() : 'S'}</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs" title="Verified Member">
                <ShieldCheck size={13} />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-slate-900">{studentAccount.name}</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-mono text-xs font-bold border border-blue-100">
                <span>@{studentHandle}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{studentAccount.email}</p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Direct Verification Portal Profile Button */}
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <ShieldCheck size={16} />
                <span>Open Verification Profile</span>
                <ExternalLink size={14} className="opacity-80" />
              </a>

              {returnUrl && returnUrl !== '/courses' && (
                <button
                  onClick={() => navigate(returnUrl, { replace: true })}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Continue Back to Quiz</span>
                  <ArrowRight size={14} />
                </button>
              )}

              <button
                onClick={() => navigate('/courses')}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <BookOpen size={15} className="text-blue-600" />
                <span>Browse Quizzes & Courses</span>
              </button>

              <button
                onClick={studentLogout}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>

          </div>

          {/* Search any Profile on Verification Portal */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-xs text-left space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Search size={14} className="text-blue-600" />
                <span>Search Verification Portal</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">verify.mscprpcem.tech</span>
            </div>

            <form onSubmit={handleProfileSearchSubmit} className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">@</span>
                <input
                  type="text"
                  placeholder="Enter username handle"
                  value={lookupHandle}
                  onChange={(e) => setLookupHandle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold bg-slate-50/50 focus:bg-white focus:border-blue-600 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <span>View</span>
                <ExternalLink size={12} />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 bg-slate-50 font-segoe">
      <div className="max-w-md w-full animate-fade-in">
        
        {/* Clean, Focused White Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-7 sm:p-9 shadow-sm space-y-6 text-left">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <img src="/logo.png" alt="MSC Logo" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">MSC PRPCEM</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'forgot-password'
                ? 'Reset Password'
                : mode === 'register'
                ? 'Create an Account'
                : 'Sign In'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'forgot-password'
                ? 'Enter your details to restore account access'
                : mode === 'register'
                ? 'Enter your information to get started'
                : 'Enter your credentials to continue'}
            </p>
          </div>

          {/* Authentication Required Info Banner when redirected */}
          {(new URLSearchParams(location.search).get('returnUrl') || new URLSearchParams(location.search).get('redirect') || location.state?.from || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('msc_quiz_return_url'))) && (
            <div className="p-3.5 bg-blue-50/90 border border-blue-200/90 rounded-2xl flex items-start space-x-2.5 text-blue-900 shadow-2xs animate-fadeIn">
              <Lock size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed font-medium">
                <strong className="font-extrabold text-blue-950">Authentication Required: </strong>
                Please sign in or create an account to access learning courses, practice problemsets, and the interactive SQL lab.
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot-password' ? (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-center space-x-2">
              <AlertTriangle size={15} className="flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot-password' ? (
            resetStep === 1 ? (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      name="email"
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            ) : resetStep === 2 ? (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                {/* Spam Folder Alert Notice */}
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start space-x-2 text-left animate-fade-in shadow-xs">
                  <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={15} />
                  <div className="text-[11px] text-rose-800 leading-snug">
                    <span className="font-bold text-rose-900">Notice:</span> If you cannot find the verification code in your inbox, please <span className="font-bold underline text-rose-950">check your Spam or Junk folder</span>.
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs w-full">
                    <label className="font-semibold text-slate-700">6-Digit Code</label>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setResetStep(1)}
                        className="text-[11px] text-slate-500 hover:underline cursor-pointer"
                      >
                        Change Email
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSendResetOtp}
                        className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <KeyRound size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-center bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">New Password</label>
                  <div className="relative flex items-center">
                    <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Sign In</span>
                  )}
                </button>
              </form>
            )
          ) : (
            /* LOGIN & REGISTER FORMS */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && regStep === 2 ? (
                <div className="space-y-3.5 animate-fade-in">
                  {/* Spam Folder Alert Notice */}
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-start space-x-2 text-left animate-fade-in shadow-xs">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={15} />
                    <div className="text-[11px] text-rose-800 leading-snug">
                      <span className="font-bold text-rose-900">Notice:</span> If you cannot find the verification code in your inbox, please <span className="font-bold underline text-rose-950">check your Spam or Junk folder</span>.
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Verification Code</label>
                    <div className="relative flex items-center">
                      <KeyRound size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        maxLength={6}
                        value={registerOtp}
                        onChange={(e) => setRegisterOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="123456"
                        required
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-center bg-slate-50/50 focus:bg-white focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      ← Change Details
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleResendRegisterOtp}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || registerOtp.length < 6}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {/* Name (Register only) */}
                  {mode === 'register' && (
                    <>
                      <div className="space-y-1 animate-fade-in">
                        <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                        <div className="relative flex items-center">
                          <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Amit Yadav"
                            required={mode === 'register'}
                            className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                          />
                        </div>
                      </div>

                      {/* Username Handle */}
                      <div className="space-y-1 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-slate-700">Username Handle</label>
                          <span className="text-[10px] text-slate-400 font-mono">for verification URL</span>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-xs font-black text-slate-400 select-none">@</span>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="amityadav"
                            required={mode === 'register'}
                            className={`w-full border rounded-xl pl-8 pr-8 py-2 text-xs font-mono font-bold text-slate-800 transition-all outline-none ${
                              usernameStatus.available === true
                                ? 'border-emerald-400 bg-emerald-50/30 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'
                                : usernameStatus.available === false
                                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-600'
                                : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                            }`}
                          />
                          <div className="absolute right-3 flex items-center">
                            {usernameStatus.checking ? (
                              <Loader2 size={13} className="animate-spin text-blue-500" />
                            ) : usernameStatus.available === true ? (
                              <Check size={14} className="text-emerald-600 stroke-[3]" />
                            ) : usernameStatus.available === false ? (
                              <X size={14} className="text-rose-600 stroke-[3]" />
                            ) : null}
                          </div>
                        </div>

                        {/* Real-time Availability & Verification Portal URL Preview */}
                        <div className="flex items-center justify-between text-[10px] px-1">
                          {usernameStatus.checking ? (
                            <span className="text-blue-500 font-medium">Checking Verification Portal...</span>
                          ) : usernameStatus.available === true ? (
                            <span className="text-emerald-600 font-bold">✓ Available on Verification Portal</span>
                          ) : usernameStatus.available === false ? (
                            <span className="text-rose-600 font-bold">{usernameStatus.error || 'Username is already registered'}</span>
                          ) : (
                            <span className="text-slate-400 font-mono">verify.mscprpcem.tech/u/{formData.username || 'username'}</span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                    <div className="relative flex items-center">
                      <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">Password</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot-password');
                            setResetStep(1);
                            setError('');
                            setSuccessMsg('');
                          }}
                          className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••••••"
                        required
                        className="w-full border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Register only) */}
                  {mode === 'register' && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                      <div className="relative flex items-center">
                        <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm password"
                          required={mode === 'register'}
                          className="w-full border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>{mode === 'register' ? 'Create Account' : 'Sign In'}</span>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Footer Switch */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            {mode === 'register' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : mode === 'forgot-password' ? (
              <span>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
