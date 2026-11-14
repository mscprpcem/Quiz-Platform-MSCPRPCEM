import React from 'react';
import {
  BookOpen, Terminal, ArrowRight, Filter, TrendingUp, Trophy, BookMarked,
  Briefcase, FileText, GitBranch, Sparkles, Map, ChevronRight, CheckCircle2, Clock, Search
} from 'lucide-react';

export default function GitLandingPage({
  onSelectMode,
  completedLessonsCount = 0,
  totalLessonsCount = 30,
  chaptersData = [],
  selectedChapterFilter = 'all',
  setSelectedChapterFilter,
  chapterSearch = '',
  setChapterSearch,
  onSelectChapter
}) {
  const progressPercent = totalLessonsCount > 0
    ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100))
    : 0;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 font-segoe text-slate-800 flex flex-col pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* =========================================================================
          HERO SECTION & CTA CARDS
         ========================================================================= */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 flex flex-col items-center">
        
        {/* HERO TITLE & GRAPHICS */}
        <div className="w-full relative flex items-center justify-center min-h-[150px]">
          
          {/* LEFT FLANKING GRAPHIC: 2D MAC TERMINAL CODE SNIPPET (VISIBLE ON XL+) */}
          <div className="hidden xl:block absolute left-2 lg:left-4 top-1 select-none pointer-events-none transition-transform hover:scale-105 duration-300">
            <span className="absolute -top-3 left-12 text-blue-400 font-black text-base opacity-70 animate-pulse">+</span>
            <span className="absolute top-20 -left-4 text-blue-300 font-bold text-xs opacity-50">+</span>
            <div className="absolute -bottom-3 left-6 w-2 h-2 rounded-full border border-blue-300 opacity-60" />

            <div className="w-60 lg:w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 space-y-2.5 transform -rotate-1">
              <div className="flex items-center space-x-1.5 pb-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>

              <div className="font-mono text-[11px] space-y-1 text-slate-800 leading-relaxed">
                <div>
                  <span className="text-blue-600 font-black">$</span> <span className="text-slate-700 font-bold">git checkout -b</span> <span className="text-emerald-600 font-black">feat/auth</span>
                </div>
                <div>
                  <span className="text-blue-600 font-black">$</span> <span className="text-slate-700 font-bold">git add .</span> <span className="text-slate-400">&amp;&amp;</span> <span className="text-slate-700 font-bold">git commit</span>
                </div>
                <div>
                  <span className="text-blue-600 font-black">$</span> <span className="text-slate-700 font-bold">git rebase</span> <span className="text-purple-600 font-black">main</span>
                </div>
                <div>
                  <span className="text-blue-600 font-black">$</span> <span className="text-slate-700 font-bold">git push origin</span> <span className="text-emerald-600 font-black">feat/auth</span>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER HERO TEXT */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5 relative z-10 px-2">
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-tight">
              Master <span className="text-blue-600">Git &amp; GitHub</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-600 tracking-tight">
              From Terminal Foundations to Advanced Branching, Rebase &amp; CI/CD
            </p>

            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl mx-auto">
              Learn version control step by step with interactive lessons, mental models, 70+ hands-on terminal practice labs, and enterprise production workflows.
            </p>
          </div>

          {/* RIGHT FLANKING GRAPHIC: 2D VECTOR GIT GRAPH */}
          <div className="hidden xl:block absolute right-2 lg:right-4 -top-1 select-none pointer-events-none transition-transform hover:scale-105 duration-300">
            <div className="relative w-56 h-48 flex items-center justify-center">
              
              {/* Dashed Orbit & Sparkles */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 220 190" fill="none">
                <ellipse cx="110" cy="95" rx="85" ry="50" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.55" transform="rotate(-10 110 95)" />
                <path d="M190 35v10M185 40h10" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                <path d="M25 130v8M21 134h8" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <circle cx="200" cy="110" r="2.5" fill="#3B82F6" opacity="0.5" />
                <circle cx="20" cy="55" r="2" fill="#60A5FA" opacity="0.5" />
              </svg>

              {/* 2D Vector Branch Graph */}
              <div className="relative z-10 filter drop-shadow-[0_8px_20px_rgba(37,99,235,0.12)]">
                <svg className="w-32 h-32" viewBox="0 0 130 130" fill="none">
                  {/* Main Branch Line */}
                  <line x1="25" y1="95" x2="105" y2="95" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
                  
                  {/* Feature Branch Arc */}
                  <path d="M 45 95 C 45 45, 85 45, 85 45" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
                  {/* Merge Arc */}
                  <path d="M 85 45 C 95 45, 105 75, 105 95" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />

                  {/* Commits on main */}
                  <circle cx="25" cy="95" r="7" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="3" />
                  <circle cx="45" cy="95" r="7" fill="#3B82F6" stroke="#DBEAFE" strokeWidth="2" />
                  <circle cx="75" cy="95" r="7" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="3" />
                  <circle cx="105" cy="95" r="8" fill="#2563EB" stroke="#93C5FD" strokeWidth="2" />

                  {/* Commits on feature */}
                  <circle cx="65" cy="45" r="6.5" fill="#D1FAE5" stroke="#10B981" strokeWidth="2.5" />
                  <circle cx="85" cy="45" r="6.5" fill="#10B981" stroke="#A7F3D0" strokeWidth="2" />

                  {/* Branch Labels */}
                  <rect x="92" y="108" width="32" height="15" rx="4" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
                  <text x="108" y="119" textAnchor="middle" fill="#1E40AF" fontSize="8" fontWeight="bold" fontFamily="monospace">main</text>
                </svg>
              </div>

              {/* Floating 2D Badge: Branch Icon */}
              <div className="absolute top-1 left-0 bg-white/95 backdrop-blur-md rounded-xl p-2 border border-blue-200/90 shadow-[0_4px_16px_rgba(37,99,235,0.12)] z-20 transform -rotate-3 hover:rotate-0 transition-transform">
                <GitBranch size={16} className="text-blue-600" />
              </div>

              {/* Floating 2D Badge: Terminal Prompt */}
              <div className="absolute top-3 -right-2 bg-white/95 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-emerald-200/90 shadow-[0_4px_16px_rgba(16,185,129,0.12)] z-20 transform rotate-3 hover:rotate-0 transition-transform">
                <span className="font-mono text-emerald-600 font-black text-xs">git commit</span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            TWO MAIN CALL-TO-ACTION CARDS (LEARNING & PRACTICE)
           ========================================================================= */}
        <div className="w-full max-w-4xl mx-auto mt-8 sm:mt-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            
            {/* CARD 1: LEARNING */}
            <div
              onClick={() => onSelectMode('learn')}
              className="group bg-white hover:bg-gradient-to-b hover:from-blue-50/40 hover:to-white border-2 border-blue-100/90 hover:border-blue-400 rounded-3xl p-7 sm:p-9 flex flex-col items-center text-center shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 mb-5 group-hover:scale-105 transition-transform duration-300">
                <BookOpen size={34} strokeWidth={2.2} className="text-white" />
              </div>

              <h2 className="text-2xl sm:text-[26px] font-black text-blue-600 tracking-tight mb-2.5">
                Learning
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-7 max-w-[280px]">
                Learn Git &amp; GitHub concepts step by step with mental models, staging architecture, visual diagrams, and command breakdowns.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMode('learn');
                }}
                className="w-full max-w-[220px] py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all cursor-pointer mt-auto"
              >
                <span>Start Learning</span>
                <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* CARD 2: PRACTICE */}
            <div
              onClick={() => onSelectMode('practice')}
              className="group bg-white hover:bg-gradient-to-b hover:from-emerald-50/40 hover:to-white border-2 border-emerald-100/90 hover:border-emerald-400 rounded-3xl p-7 sm:p-9 flex flex-col items-center text-center shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 mb-5 group-hover:scale-105 transition-transform duration-300">
                <Terminal size={34} strokeWidth={2.2} className="text-white" />
              </div>

              <h2 className="text-2xl sm:text-[26px] font-black text-emerald-600 tracking-tight mb-2.5">
                Practice
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-7 max-w-[280px]">
                Solve 70 hands-on terminal &amp; version control labs with live bash execution, automated verification, and GitMeter.
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMode('practice');
                }}
                className="w-full max-w-[220px] py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all cursor-pointer mt-auto"
              >
                <span>Start Practice</span>
                <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

        {/* =========================================================================
            SECTION: INTERVIEW READINESS & ADVANCED TRACKS
           ========================================================================= */}
        <div id="interview-section" className="w-full max-w-5xl mx-auto mt-16 sm:mt-20 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black tracking-wider uppercase">
                <Briefcase size={12} className="text-amber-600" />
                <span>Interview Readiness &amp; Advanced Tracks</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Curated Git Tracks &amp; Developer Resources
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-xs">
              Workflow patterns, production incident runbooks, and reference materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            
            {/* Card 1: 30-Day Git Roadmap (Active!) */}
            <div
              onClick={() => onSelectMode('roadmap')}
              className="bg-white hover:bg-blue-50/20 border border-slate-200/90 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[190px] group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold">
                  <Map size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    30-Day Git Roadmap
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Structured day-by-day learning pathway from terminal basics to branching, rebasing, and open-source mastery.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                <span>View Roadmap</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Git Command Cheat Sheet (Active!) */}
            <div
              onClick={() => onSelectMode('cheatsheet')}
              className="bg-white hover:bg-amber-50/20 border border-slate-200/90 hover:border-amber-400 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[190px] group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center font-bold">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                    Command Cheat Sheet
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Quick-lookup guide for everyday git workflow, branch management, cherry-picking, and reflog recovery.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-800">
                <span>Open Cheat Sheet</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Interactive Rebase & Conflicts */}
            <div
              onClick={() => onSelectMode('practice')}
              className="bg-white hover:bg-emerald-50/20 border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[190px] group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center font-bold">
                  <GitBranch size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    Rebase &amp; Conflicts Lab
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Interactive practice on git rebase -i, squash commits, cherry-pick hotfixes, and 3-way merge conflict resolution.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                <span>Launch Practice</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Enterprise CI/CD & Actions */}
            <div
              onClick={() => onSelectMode('learn')}
              className="bg-white hover:bg-indigo-50/20 border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer min-h-[190px] group"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors leading-snug">
                    CI/CD &amp; GitHub Actions
                  </h4>
                  <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Automate testing, linting, build pipelines, and production release tags using GitHub Actions workflows.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                <span>Explore Workflows</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            BOTTOM HIGHLIGHTS BAR
           ========================================================================= */}
        <div className="w-full max-w-5xl mx-auto mt-14 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center space-x-3.5 pt-1 sm:pt-0 sm:px-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0">
                <BookMarked size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                  Learn at Your Pace
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  30 Structured Chapters
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center space-x-3.5 pt-3 sm:pt-0 sm:px-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 flex items-center justify-center shrink-0">
                <Filter size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                  Smart Practice
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  70 Hands-On Terminal Labs
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center space-x-3.5 pt-3 sm:pt-0 sm:px-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 border border-amber-100/80 flex items-center justify-center shrink-0">
                <TrendingUp size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                  Track Progress
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Live GitMeter &amp; Accuracy
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center space-x-3.5 pt-3 sm:pt-0 sm:px-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
                <Trophy size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-xs sm:text-[13px] font-black text-slate-900 leading-tight">
                  Production Ready
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Real-world Branching &amp; CI/CD
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            CHAPTER CATALOG / EXPLORER SECTION
           ========================================================================= */}
        {chaptersData && chaptersData.length > 0 && (
          <div className="w-full max-w-5xl mx-auto mt-16 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Course Catalog
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                  Explore Course Chapters ({chaptersData.length} Chapters)
                </h3>
              </div>

              {/* Search box */}
              {setChapterSearch && (
                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search chapters or topics..."
                    value={chapterSearch}
                    onChange={(e) => setChapterSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              )}
            </div>

            {/* Quick Part Filters */}
            {setSelectedChapterFilter && (
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'all', label: `All Chapters (${chaptersData.length})` },
                  { id: 'part-1', label: 'Part 1: Foundations (1–7)' },
                  { id: 'part-2', label: 'Part 2: Branching (8–14)' },
                  { id: 'part-3', label: 'Part 3: GitHub (15–21)' },
                  { id: 'part-4', label: 'Part 4: Power Tools (22–30)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedChapterFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedChapterFilter === f.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chaptersData.map((ch) => {
                const isComingSoon = !['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5'].includes(ch.id);

                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      if (onSelectChapter) {
                        onSelectChapter(ch.id);
                      } else {
                        onSelectMode('learn');
                      }
                    }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {ch.part}
                        </span>
                        {isComingSoon ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            Coming Soon
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            Available
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {ch.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-500 leading-relaxed line-clamp-2">
                        {ch.topics && ch.topics.length > 0
                          ? `${ch.topics.length} topic${ch.topics.length > 1 ? 's' : ''}: ${ch.topics.map(t => t.title || t.slug).join(', ')}`
                          : ch.subtitle || 'Comprehensive Git module.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                      <span>{isComingSoon ? 'View Chapter Details' : 'Start Reading'}</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

