import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BookOpen, Terminal, Copy, Check, Sparkles, ArrowRight, ArrowLeft,
  GitBranch, Code2, Clock, CheckCircle2, ChevronRight, FileText, Search,
  Compass, HelpCircle, Lightbulb, X, Info
} from 'lucide-react';
import { GIT_CHEATSHEET } from '../data/gitCurriculumData';
import GitLearningView from './GitLearningView';
import GitRoadmapView from './GitRoadmapView';
import GitPracticeDashboard from './GitPracticeDashboard';

export default function GitCourseHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab: urlTab } = useParams();

  // Search filter for Cheat Sheet view
  const [cheatSearch, setCheatSearch] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(null);

  // Tutor Guide visibility (persisted in localStorage)
  const [showTutorGuide, setShowTutorGuide] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_tutor_guide_closed');
      return saved !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissTutorGuide = () => {
    setShowTutorGuide(false);
    try {
      localStorage.setItem('msc_git_tutor_guide_closed', 'true');
    } catch (_) {}
  };

  const handleOpenTutorGuide = () => {
    setShowTutorGuide(true);
    try {
      localStorage.removeItem('msc_git_tutor_guide_closed');
    } catch (_) {}
  };

  // Check current view mode: 'learn' | 'practice' | 'roadmap' | 'cheatsheet' | 'overview'
  const currentView = useMemo(() => {
    if (urlTab === 'learn') return 'learn';
    if (urlTab === 'practice') return 'practice';
    if (urlTab === 'roadmap') return 'roadmap';
    if (urlTab === 'cheatsheet') return 'cheatsheet';
    const path = location.pathname.toLowerCase();
    if (path.endsWith('/learn') || path === '/git/learn' || path === '/courses/git/learn') return 'learn';
    if (path.endsWith('/practice') || path === '/git/practice' || path === '/courses/git/practice' || path === '/practice/git') return 'practice';
    if (path.endsWith('/roadmap') || path === '/git/roadmap' || path === '/courses/git/roadmap') return 'roadmap';
    if (path.endsWith('/cheatsheet') || path === '/git/cheatsheet' || path === '/courses/git/cheatsheet') return 'cheatsheet';
    return 'overview';
  }, [urlTab, location.pathname]);

  // 1. LEARN VIEW (Dedicated Curriculum Workspace)
  if (currentView === 'learn') {
    return (
      <GitLearningView
        onBackToOverview={() => navigate('/courses/git')}
        onJumpToPractice={() => navigate('/courses/git/practice')}
      />
    );
  }

  // 2. PRACTICE VIEW (Dedicated 70-Challenge Problemset Dashboard)
  if (currentView === 'practice') {
    return (
      <GitPracticeDashboard
        onJumpToLearn={() => navigate('/courses/git/learn')}
      />
    );
  }

  // 3. ROADMAP VIEW (Dedicated 30-Day Interactive Plan)
  if (currentView === 'roadmap') {
    return (
      <GitRoadmapView
        onBackToOverview={() => navigate('/courses/git')}
      />
    );
  }

  // Handle command copy
  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // 3. CHEAT SHEET VIEW (Dedicated Clean Light Theme Page)
  if (currentView === 'cheatsheet') {
    const filteredCategories = GIT_CHEATSHEET.map(cat => ({
      ...cat,
      commands: cat.commands.filter(c =>
        c.cmd.toLowerCase().includes(cheatSearch.toLowerCase()) ||
        c.desc.toLowerCase().includes(cheatSearch.toLowerCase())
      )
    })).filter(cat => cat.commands.length > 0);

    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-segoe pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          
          {/* Top Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => navigate('/courses/git')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Git Course Hub</span>
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search commands (e.g. commit, rebase)..."
                value={cheatSearch}
                onChange={(e) => setCheatSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1.5 border-b border-slate-200 pb-4">
            <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider uppercase">
              <FileText size={12} className="text-blue-600" />
              <span>Developer Reference</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Git Quick Reference Cheat Sheet
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Copyable commands for day-to-day software engineering and developer workflows.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {cat.category}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {cat.commands.length} commands
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  {cat.commands.map((item, cIdx) => {
                    const isCopied = copiedCmd === item.cmd;

                    return (
                      <div
                        key={cIdx}
                        className="p-2.5 sm:p-3 bg-slate-50/80 hover:bg-slate-100/90 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between gap-2.5 sm:gap-3 group"
                      >
                        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                          <code className="text-xs sm:text-[13px] font-mono font-bold text-blue-700 block break-all sm:break-normal sm:truncate">
                            {item.cmd}
                          </code>
                          <span className="text-[11px] sm:text-xs text-slate-500 font-medium block leading-snug">
                            {item.desc}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.cmd)}
                          className={`p-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200 shadow-2xs active:scale-95'
                          }`}
                          title="Copy command"
                        >
                          {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // 4. OVERVIEW / LANDING PAGE (Clean Light Theme, No Loaders, No Tracking, With Tutor Guide)
  return (
    <div className="min-h-screen bg-[#F5FAFF] text-slate-800 font-segoe pb-20">
      
      {/* ═════════════════════════════════════════════════════════════════════
          LIGHT THEME HERO HEADER
      ═════════════════════════════════════════════════════════════════════ */}
      <section className="w-full pt-10 sm:pt-14 pb-6 px-4 sm:px-6 flex flex-col items-center text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 text-blue-700 px-3.5 py-1 rounded-full text-xs font-extrabold shadow-2xs">
            <GitBranch size={13} className="text-blue-600" />
            <span>MSC PRPCEM Learning Track</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-slate-900 tracking-tight leading-tight">
            Master <span className="text-blue-600">Git & GitHub</span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            From core version control foundations to branching strategies, GitHub collaboration, and production workflows.
          </p>

          {!showTutorGuide && (
            <button
              onClick={handleOpenTutorGuide}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs transition-all cursor-pointer"
            >
              <Lightbulb size={13} />
              <span>Show Tutor Guide</span>
            </button>
          )}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════
          PROFESSIONAL TUTOR GUIDE FOR FIRST-TIME USERS
      ═════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        
        {showTutorGuide && (
          <div className="bg-white border-2 border-blue-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 animate-fadeIn relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider">
                  <Sparkles size={12} className="text-blue-600" />
                  <span>Student Quick-Start Tutor Guide</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  How to Learn Git & GitHub Efficiently
                </h2>
                <p className="text-xs text-slate-500 font-medium max-w-xl">
                  Follow this 4-step professional workflow designed by engineers to help you build intuition rather than just memorizing commands.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDismissTutorGuide}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss guide"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 pt-1">
              {/* Step 1 */}
              <div
                onClick={() => navigate('/courses/git/learn')}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  <ArrowRight size={13} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Learn Curriculum
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Read topics step by step: understand snapshot models, pointers, and the 3 trees.
                </p>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => navigate('/courses/git/practice')}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  <ArrowRight size={13} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Practice Problemset
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Solve 70 interactive challenges across Terminal foundations, Git architecture, and branch mechanics.
                </p>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => navigate('/courses/git/roadmap')}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  <ArrowRight size={13} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  30-Day Roadmap
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Follow a structured 4-week daily study schedule taking you from beginner to ninja.
                </p>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => navigate('/courses/git/cheatsheet')}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center font-mono">
                    4
                  </span>
                  <ArrowRight size={13} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Daily Cheat Sheet
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Use one-click copy commands for day-to-day workflow, remotes, and emergency undos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            PRIMARY ACTION CARDS (LEARN & PRACTICE)
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* CARD 1: LEARNING */}
          <div
            onClick={() => navigate('/courses/git/learn')}
            className="group bg-white hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white border-2 border-blue-100/90 hover:border-blue-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 flex flex-col items-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-4 sm:mb-5 group-hover:scale-105 transition-transform duration-300">
              <BookOpen size={28} strokeWidth={2.2} className="text-white sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-blue-600 tracking-tight mb-2 sm:mb-2.5">
              Learning
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-5 sm:mb-6 max-w-sm">
              Learn Git & GitHub step by step with 34 comprehensive lessons. Understand the 3 trees, staging, branch mechanics, merge conflicts, and GitHub collaboration.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/courses/git/learn');
              }}
              className="w-full sm:max-w-[220px] py-3 sm:py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all cursor-pointer mt-auto"
            >
              <span>Start Learning</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* CARD 2: PRACTICE */}
          <div
            onClick={() => navigate('/courses/git/practice')}
            className="group bg-white hover:bg-gradient-to-b hover:from-emerald-50/40 hover:to-white border-2 border-emerald-100/90 hover:border-emerald-400 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-9 flex flex-col items-center text-center shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 mb-4 sm:mb-5 group-hover:scale-105 transition-transform duration-300">
              <Terminal size={28} strokeWidth={2.2} className="text-white sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black text-emerald-600 tracking-tight mb-2 sm:mb-2.5">
              Practice Problemset
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-5 sm:mb-6 max-w-sm">
              70 hands-on in-browser simulated Git terminal challenges. Master POSIX shell commands, commits, tree navigation, and branching strategies.
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/courses/git/practice');
              }}
              className="w-full sm:max-w-[220px] py-3 sm:py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all cursor-pointer mt-auto"
            >
              <span>Explore 70 Labs</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TWO DEDICATED TRACK LINKS: ROADMAP & CHEAT SHEET
        ═════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
          
          {/* LINK CARD 1: DEDICATED 30-DAY ROADMAP */}
          <div
            onClick={() => navigate('/courses/git/roadmap')}
            className="bg-white hover:bg-amber-50/20 border border-slate-200/90 hover:border-amber-400 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between space-y-3 sm:space-y-4"
          >
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center">
                <Clock size={18} className="sm:w-5 sm:h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Structured 4-Week Schedule
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors mt-0.5">
                  30-Day Developer Roadmap
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Dedicated page tracking 30 daily goals from basic repo initialization to CI/CD and emergency production hotfixes.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 group-hover:text-amber-800">
              <span>View Dedicated Roadmap</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* LINK CARD 2: DEDICATED CHEAT SHEET */}
          <div
            onClick={() => navigate('/courses/git/cheatsheet')}
            className="bg-white hover:bg-indigo-50/20 border border-slate-200/90 hover:border-indigo-400 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between space-y-3 sm:space-y-4"
          >
            <div className="space-y-2.5 sm:space-y-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center">
                <FileText size={18} className="sm:w-5 sm:h-5" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                  Quick Command Lookup
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors mt-0.5">
                  Git Command Cheat Sheet
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                  Dedicated reference with copyable commands for daily workflow, branching, remotes, and emergency incident recovery.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700 group-hover:text-indigo-800">
              <span>View Full Cheat Sheet</span>
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
