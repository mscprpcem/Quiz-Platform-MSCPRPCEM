import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Radio, Calendar, BookOpen, Mail, Sparkles, Users,
  LogOut, Menu, X, GraduationCap, ChevronLeft, ChevronRight, Trophy, QrCode
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const currentPath = location.pathname;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of the Admin Portal?')) {
      logout();
      navigate('/frogger/login');
    }
  };

  const menuSections = [
    {
      title: null,
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' }
      ]
    },
    {
      title: 'QUIZ & COMPETITION ENGINE',
      items: [
                { label: 'Live Quiz', icon: Radio, path: '/admin/quizzes' },
        { label: 'Scheduled Quiz', icon: Calendar, path: '/admin/scheduled-quizzes' },
        { label: 'Cumulative Leaderboard', icon: Trophy, path: '/admin/cumulative-leaderboard' },
              ]
    },
    {
      title: 'USER DIRECTORY & ANALYTICS',
      items: [
        { label: 'User Directory', icon: Users, path: '/admin/users' }
      ]
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        { label: 'Email Dispatch', icon: Mail, path: '/admin/email-dispatch' }
      ]
    },
    {
      title: 'COURSES & LEARNING',
      items: [
        { label: 'Courses & Practice', icon: BookOpen, path: '/admin/courses' }
      ]
    }
  ];

  const renderNavItems = () => (
    <div className="space-y-3 pt-1">
      {menuSections.map((section, idx) => (
        <div key={idx} className="space-y-1">
          {(!collapsed || mobileDrawerOpen) && section.title && (
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-2.5 block mb-1">
              {section.title}
            </span>
          )}

          {section.items.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path ||
              (item.path === '/admin/scheduled-quizzes' && currentPath.includes('/admin/scheduled-quizzes')) ||
              (item.path === '/admin/quizzes' && currentPath === '/admin/quizzes' && !currentPath.includes('scheduled'));

            return (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center ${(collapsed && !mobileDrawerOpen) ? 'justify-center py-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-purple-50 text-purple-700 font-extrabold shadow-2xs border border-purple-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                title={(collapsed && !mobileDrawerOpen) ? item.label : undefined}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon size={17} className={isActive ? 'text-purple-600' : 'text-slate-400'} />
                  {(!collapsed || mobileDrawerOpen) && <span>{item.label}</span>}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex font-segoe text-slate-800 text-left relative">

      {/* ════════ DESKTOP STICKY SIDEBAR ════════ */}
      <aside
        className={`hidden md:flex bg-white text-slate-800 flex-col justify-between transition-all duration-300 z-40 sticky top-0 h-screen border-r border-slate-200 shadow-xs flex-shrink-0 relative ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Floating Border Edge Collapse Toggle (< / >) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((prev) => !prev);
          }}
          style={{ position: 'absolute', right: '-14px', top: '20px', zIndex: 50 }}
          className="bg-white border border-slate-200 shadow-md hover:shadow-lg rounded-full w-7 h-7 flex items-center justify-center text-slate-600 hover:text-purple-600 hover:scale-110 transition-all cursor-pointer select-none pointer-events-auto"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Top Header & Navigation Container */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin p-3.5 space-y-3">

          {/* Official MSC-PRPCEM Logo */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 min-h-[38px]">
            {!collapsed ? (
              <div className="flex items-center space-x-2.5">
                <img
                  src="/logo.png"
                  alt="MSC-PRPCEM Logo"
                  className="w-8 h-8 rounded-lg object-contain border border-slate-100 shadow-2xs"
                />
                <div>
                  <h2 className="text-xs font-black text-slate-900 tracking-tight leading-none">MSC-PRPCEM</h2>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Admin Portal</span>
                </div>
              </div>
            ) : (
              <img
                src="/logo.png"
                alt="MSC-PRPCEM Logo"
                className="w-8 h-8 rounded-lg object-contain mx-auto border border-slate-100 shadow-2xs"
              />
            )}
          </div>

          {/* Nav Items */}
          {renderNavItems()}
        </div>

        {/* Bottom User Profile */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="truncate pr-2">
                <div className="text-xs font-black text-slate-900 truncate">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-slate-400 font-semibold truncate">{user?.email || 'Admin Portal'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-10 h-10 mx-auto flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ════════ PHONE MOBILE DRAWER (RESPONSIVE) ════════ */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          ></div>

          <aside className="relative bg-white w-72 h-full flex flex-col justify-between p-5 shadow-2xl z-10 animate-slide-in">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center space-x-2.5">
                  <img src="/logo.png" alt="MSC-PRPCEM Logo" className="w-8 h-8 rounded-lg object-contain" />
                  <div>
                    <h2 className="text-sm font-black text-slate-900 leading-none">MSC-PRPCEM</h2>
                    <span className="text-[10px] text-slate-400 font-bold">Admin Portal</span>
                  </div>
                </div>
                <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {renderNavItems()}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-50 text-red-600 font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ════════ MAIN WORKSPACE ════════ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Top Sticky Header */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Microsoft Student Club
              </span>
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs text-blue-600 font-extrabold">
                Admin Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <span className="text-xs font-black text-slate-700 hidden sm:inline">
                {user?.name || 'Administrator'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Workspace (Scrolls Independently) */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
