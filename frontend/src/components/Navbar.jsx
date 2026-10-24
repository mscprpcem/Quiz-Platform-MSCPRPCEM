import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentAuthModal from './StudentAuthModal';
import { LogOut, Home, BarChart2, BookOpen, Trophy, Play, User, Palette, Menu, X, FileCode, ShieldCheck, CheckCircle2, ExternalLink, Lock } from 'lucide-react';

export default function Navbar() {
  const { user, logout, studentAccount, studentLogin, studentLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return null;
  }

  const confirmLogout = () => {
    setShowConfirm(true);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    studentLogout();
    navigate('/');
    setShowConfirm(false);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentEmailInput || !studentPasswordInput) return;
    setLoadingLogin(true);
    await studentLogin(studentEmailInput, studentEmailInput.split('@')[0], studentPasswordInput);
    setLoadingLogin(false);
    setShowStudentModal(false);
  };

  const navTo = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const NavButton = ({ onClick, isActive, icon: Icon, label, className = '' }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'text-brand-blue bg-brand-lightBlue shadow-sm'
          : 'text-brand-textMuted hover:text-brand-textMain hover:bg-brand-lightBlue/60'
      } ${className}`}
    >
      <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const MobileNavButton = ({ onClick, isActive, icon: Icon, label, className = '' }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
        isActive
          ? 'text-blue-700 bg-blue-50/90 shadow-2xs font-black border border-blue-200/60'
          : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-transparent'
      } ${className}`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
      <span>{label}</span>
    </button>
  );

  const verificationPortalUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VERIFICATION_PORTAL_URL) || 'https://verify.mscprpcem.tech';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-200 bg-white border-slate-200/80 text-brand-textMain shadow-[0_2px_8px_rgba(0,120,212,0.06)]">
        {/* Microsoft Signature 4-Quadrant Color Strip */}
        <div className="ms-quadrant-bar"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[60px] items-center">
            {/* Logo Section */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer group"
              onClick={() => navTo('/')}
            >
              <img
                src="/logo.png"
                alt="MSC-PRPCEM Logo"
                className="w-8 h-8 rounded-md object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-black text-brand-textMain tracking-tight text-base">MSC-PRPCEM</span>
            </div>

            {/* Navigation Items (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              <NavButton
                onClick={() => navTo('/')}
                isActive={isActive('/')}
                icon={Home}
                label="Home"
              />
              <NavButton
                onClick={() => navTo('/courses')}
                isActive={isActive('/courses')}
                icon={BookOpen}
                label="Courses"
              />
              <NavButton
                onClick={() => navTo('/join')}
                isActive={isActive('/join')}
                icon={Play}
                label="Join Quiz"
              />
              <NavButton
                onClick={() => navTo('/leaderboard')}
                isActive={isActive('/leaderboard') || isActive('/standings')}
                icon={Trophy}
                label="Leaderboard"
              />

              {/* Student Account or Admin Account Status / Sign Out vs Login */}
              {studentAccount ? (
                <div className="flex items-center space-x-2">
                  <a
                    href={`https://verify.mscprpcem.tech/u/${encodeURIComponent(studentAccount.username || studentAccount.email.split('@')[0])}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all group"
                    title="Open Verification Profile on verify.mscprpcem.tech"
                  >
                    <ShieldCheck size={14} className="text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-blue-900 truncate max-w-[130px]">
                      @{studentAccount.username || studentAccount.email.split('@')[0]}
                    </span>
                    <ExternalLink size={11} className="text-blue-400 group-hover:text-blue-600" />
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navTo('/admin')}
                    className="flex items-center space-x-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-900 cursor-pointer transition-all"
                    title="Open Admin Dashboard"
                  >
                    <ShieldCheck size={14} className="text-purple-600 flex-shrink-0" />
                    <span className="truncate max-w-[120px]">{user.name || user.email?.split('@')[0] || 'Admin'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <NavButton
                  onClick={() => navTo('/login')}
                  isActive={isActive('/login')}
                  icon={User}
                  label="Login"
                />
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              className="md:hidden p-2.5 rounded-xl transition-all text-brand-textMuted hover:text-brand-blue hover:bg-brand-lightBlue active:scale-95 cursor-pointer"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} className="text-brand-blue" /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-brand-border bg-white shadow-xl animate-fade-in divide-y divide-slate-100 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-3 space-y-1">
              <MobileNavButton
                onClick={() => navTo('/')}
                isActive={isActive('/')}
                icon={Home}
                label="Home"
              />
              <MobileNavButton
                onClick={() => navTo('/courses')}
                isActive={isActive('/courses')}
                icon={BookOpen}
                label="All Quizzes & Courses"
              />
              <MobileNavButton
                onClick={() => navTo('/join')}
                isActive={isActive('/join')}
                icon={Play}
                label="Join Live Quiz"
              />
              <MobileNavButton
                onClick={() => navTo('/leaderboard')}
                isActive={isActive('/leaderboard') || isActive('/standings')}
                icon={Trophy}
                label="Leaderboard & Standings"
              />
              <MobileNavButton
                onClick={() => navTo('/practice')}
                isActive={isActive('/practice')}
                icon={FileCode}
                label="Practice Challenges"
              />
              
              <div className="pt-2 border-t border-slate-100">
                <a
                  href="https://verify.mscprpcem.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span>Verification Portal</span>
                  </div>
                  <ExternalLink size={13} className="text-slate-400" />
                </a>
              </div>
            </div>

            {/* Student Auth / Profile Section */}
            <div className="p-4 bg-slate-50/60">
              {studentAccount ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-white border border-blue-100 rounded-2xl shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200/60">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {studentAccount.name || studentAccount.email.split('@')[0]}
                        </div>
                        <div className="text-[10px] text-blue-600 font-mono font-bold truncate">
                          @{studentAccount.username || studentAccount.email.split('@')[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://verify.mscprpcem.tech/u/${encodeURIComponent(studentAccount.username || studentAccount.email.split('@')[0])}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span>Profile</span>
                      <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => {
                        studentLogout();
                        logout();
                        setMobileOpen(false);
                        navigate('/');
                      }}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : user ? (
                <div className="space-y-2.5">
                  <div className="p-3 bg-white border border-purple-100 rounded-2xl shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200/60">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {user.name || 'Admin'}
                        </div>
                        <div className="text-[10px] text-purple-600 font-mono font-bold truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navTo('/admin')}
                      className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        studentLogout();
                        setMobileOpen(false);
                        navigate('/');
                      }}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navTo('/login')}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User size={15} />
                    <span>Student Login / Register</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent page content from hiding under fixed navbar */}
      <div className="h-[63px] w-full shrink-0" aria-hidden="true" />

      {/* Student Account Email & Password Auth Modal */}
      <StudentAuthModal 
        isOpen={showStudentModal} 
        onClose={() => setShowStudentModal(false)} 
      />

      {/* Custom Logout Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-brand-border rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-scale-in space-y-5 text-zinc-800">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
                <LogOut size={20} />
              </div>
              <h3 className="text-lg font-black tracking-tight text-brand-textMain">Confirm Sign Out</h3>
              <p className="text-xs sm:text-sm text-brand-textMuted max-w-xs leading-relaxed">
                Are you sure you want to log out of the administration portal?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] bg-brand-bgLight hover:bg-zinc-100 border border-brand-border text-zinc-655 hover:text-brand-textMain"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-grow flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer select-none"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
