import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Terminal, GitBranch, Search, Filter, CheckCircle2, ChevronRight, ChevronLeft,
  ArrowRight, ArrowLeft, BookOpen, Clock, Trophy, Shuffle, Target, AlertTriangle,
  X, Check, Flame, Layers, Award, Sparkles, ExternalLink, Gauge, FileText, Compass
} from 'lucide-react';
import { GIT_CHALLENGES, getGitChallengeSlug, slugifyTitle } from '../data/gitChallenges';
import { getDifficultyTheme } from '../utils/difficulty';
import { useAuth } from '../context/AuthContext';

// Standard Track Metadata
const TRACK_INFO = {
  all: { label: 'All Tracks', count: 70, icon: Layers },
  terminal: { label: 'Terminal & Shell Foundations', count: 25, badge: 'Track 1', icon: Terminal, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'git-basics': { label: 'Git Repositories & Commits', count: 25, badge: 'Track 2', icon: GitBranch, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  'git-advanced': { label: 'Branching, Merges & Workflows', count: 20, badge: 'Track 3', icon: Compass, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' }
};

export default function GitPracticeDashboard({ onJumpToLearn }) {
  const navigate = useNavigate();
  const { studentAccount, user } = useAuth();

  // Solved challenges stored in localStorage
  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'terminal' | 'git-basics' | 'git-advanced'
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'basic' | 'easy' | 'medium' | 'hard'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'solved' | 'unsolved'
  const [jumpInput, setJumpInput] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // 25 | 50 | 100

  const totalCount = GIT_CHALLENGES.length; // 70
  const solvedCount = solvedChallenges.length;
  const overallPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Difficulty counts & progress
  const basicChallenges = useMemo(() => GIT_CHALLENGES.filter(c => (c.difficulty || '').toLowerCase() === 'basic'), []);
  const easyChallenges = useMemo(() => GIT_CHALLENGES.filter(c => (c.difficulty || '').toLowerCase() === 'easy'), []);
  const mediumChallenges = useMemo(() => GIT_CHALLENGES.filter(c => (c.difficulty || '').toLowerCase() === 'medium'), []);
  const hardChallenges = useMemo(() => GIT_CHALLENGES.filter(c => ['hard', 'extreme'].includes((c.difficulty || '').toLowerCase())), []);

  const solvedBasic = useMemo(() => basicChallenges.filter(c => solvedChallenges.includes(c.id)).length, [basicChallenges, solvedChallenges]);
  const solvedEasy = useMemo(() => easyChallenges.filter(c => solvedChallenges.includes(c.id)).length, [easyChallenges, solvedChallenges]);
  const solvedMedium = useMemo(() => mediumChallenges.filter(c => solvedChallenges.includes(c.id)).length, [mediumChallenges, solvedChallenges]);
  const solvedHard = useMemo(() => hardChallenges.filter(c => solvedChallenges.includes(c.id)).length, [hardChallenges, solvedChallenges]);

  const basicPercent = basicChallenges.length > 0 ? Math.round((solvedBasic / basicChallenges.length) * 100) : 0;
  const easyPercent = easyChallenges.length > 0 ? Math.round((solvedEasy / easyChallenges.length) * 100) : 0;
  const mediumPercent = mediumChallenges.length > 0 ? Math.round((solvedMedium / mediumChallenges.length) * 100) : 0;
  const hardPercent = hardChallenges.length > 0 ? Math.round((solvedHard / hardChallenges.length) * 100) : 0;

  // Track progress
  const terminalChallenges = useMemo(() => GIT_CHALLENGES.filter(c => c.track === 'terminal'), []);
  const gitBasicsChallenges = useMemo(() => GIT_CHALLENGES.filter(c => c.track === 'git-basics'), []);
  const gitAdvancedChallenges = useMemo(() => GIT_CHALLENGES.filter(c => c.track === 'git-advanced'), []);

  const solvedTerminal = useMemo(() => terminalChallenges.filter(c => solvedChallenges.includes(c.id)).length, [terminalChallenges, solvedChallenges]);
  const solvedGitBasics = useMemo(() => gitBasicsChallenges.filter(c => solvedChallenges.includes(c.id)).length, [gitBasicsChallenges, solvedChallenges]);
  const solvedGitAdvanced = useMemo(() => gitAdvancedChallenges.filter(c => solvedChallenges.includes(c.id)).length, [gitAdvancedChallenges, solvedChallenges]);

  // Pick random unsolved challenge
  const handlePickRandom = () => {
    const unsolved = GIT_CHALLENGES.filter(c => !solvedChallenges.includes(c.id));
    const pool = unsolved.length > 0 ? unsolved : GIT_CHALLENGES;
    const randomCh = pool[Math.floor(Math.random() * pool.length)];
    if (randomCh) {
      navigate(`/practice/git/${getGitChallengeSlug(randomCh)}`);
    }
  };

  // Jump to specific lab number (1 to 70)
  const handleJumpToLab = () => {
    const cleanNum = jumpInput.replace(/^#|^q\s*/i, '').trim();
    const num = parseInt(cleanNum, 10);
    if (!isNaN(num) && num >= 1 && num <= totalCount) {
      const ch = GIT_CHALLENGES[num - 1];
      if (ch) {
        navigate(`/practice/git/${getGitChallengeSlug(ch)}`);
      }
    }
  };

  // Filtered Problemset List
  const filteredList = useMemo(() => {
    return GIT_CHALLENGES.map((c, i) => ({ ...c, originalIndex: i })).filter((c) => {
      // Track Filter
      if (selectedTrack !== 'all' && c.track !== selectedTrack) {
        return false;
      }

      // Difficulty Filter
      if (selectedDifficulty !== 'all') {
        const diff = (c.difficulty || '').toLowerCase();
        if (selectedDifficulty === 'hard') {
          if (!['hard', 'extreme'].includes(diff)) return false;
        } else if (diff !== selectedDifficulty) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatus === 'solved' && !solvedChallenges.includes(c.id)) {
        return false;
      }
      if (selectedStatus === 'unsolved' && solvedChallenges.includes(c.id)) {
        return false;
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (c.title || '').toLowerCase().includes(q);
        const matchId = (c.id || '').toLowerCase().includes(q);
        const matchCategory = (c.category || '').toLowerCase().includes(q);
        const matchTags = (c.tags || []).some(t => t.toLowerCase().includes(q));
        const matchScenario = (c.scenario || '').toLowerCase().includes(q);
        return matchTitle || matchId || matchCategory || matchTags || matchScenario;
      }

      return true;
    });
  }, [selectedTrack, selectedDifficulty, selectedStatus, searchQuery, solvedChallenges]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTrack, selectedDifficulty, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedProblems = useMemo(() => {
    if (itemsPerPage >= filteredList.length) return filteredList;
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, validCurrentPage, itemsPerPage]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validCurrentPage <= 2) {
      return [1, 2, 3, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 1) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  }, [totalPages, validCurrentPage]);

  return (
    <div className="w-full min-h-screen bg-slate-50/70 font-segoe text-slate-800 pb-20">
      
      {/* ── SUB-HEADER NAVIGATION TABS (Overview, Learn, Practice, Roadmap, Cheatsheet) ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none text-xs font-bold text-slate-600">
            <Link
              to="/courses/git"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Overview
            </Link>
            <Link
              to="/courses/git/learn"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Learn
            </Link>
            <Link
              to="/courses/git/practice"
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-extrabold border border-blue-200 shadow-2xs"
            >
              Practice Lab ({totalCount})
            </Link>
            <Link
              to="/courses/git/roadmap"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              30-Day Roadmap
            </Link>
            <Link
              to="/courses/git/cheatsheet"
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cheat Sheet
            </Link>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Terminal WASM</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── TOP HERO BANNER & ACTIONS ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Terminal size={20} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Git & GitHub Practice Problemset
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                    {totalCount} Hands-on Labs
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium pt-0.5">
              Practice POSIX shell foundations, repository creation, branching models, 3-way merges, interactive rebase, and conflict resolution in a live terminal sandbox.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0 flex-wrap gap-y-2">
            <button
              type="button"
              onClick={() => onJumpToLearn ? onJumpToLearn() : navigate('/courses/git/learn')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen size={14} />
              <span>Curriculum</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/courses/git/roadmap')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Clock size={14} />
              <span>Roadmap</span>
            </button>

            <button
              type="button"
              onClick={handlePickRandom}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Shuffle size={14} />
              <span>Pick Random Lab</span>
            </button>
          </div>
        </div>

        {/* ── PROGRESS & ANALYTICS CARDS (3-COLUMN GRID) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

          {/* CARD 1: OVERALL SPEEDOMETER GAUGE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge size={13} className="text-blue-600" />
                Overall Lab Progress
              </span>
              <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {solvedCount}/{totalCount} Completed
              </span>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Gauge Arc SVG */}
              <div className="relative w-44 sm:w-48 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 140 82">
                  <defs>
                    <linearGradient id="gitSpeedoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  {/* Outer Background Track */}
                  <path
                    d="M 12 70 A 58 58 0 0 1 128 70"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  {/* Active Progress Arc */}
                  <path
                    d="M 12 70 A 58 58 0 0 1 128 70"
                    fill="none"
                    stroke="url(#gitSpeedoGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="182.2"
                    strokeDashoffset={182.2 - (Math.min(100, Math.max(0, overallPercent)) / 100) * 182.2}
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Needle Pointer */}
                  <line
                    x1="70"
                    y1="70"
                    x2={70 - 45 * Math.cos(Math.PI * (Math.min(100, Math.max(0, overallPercent)) / 100))}
                    y2={70 - 45 * Math.sin(Math.PI * (Math.min(100, Math.max(0, overallPercent)) / 100))}
                    stroke="#0f172a"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Central Hub */}
                  <circle cx="70" cy="70" r="6.5" fill="#0f172a" />
                  <circle cx="70" cy="70" r="2.5" fill="#ffffff" />
                  {/* Bounds */}
                  <text x="12" y="80" fontSize="8.5" fontWeight="800" fill="#94a3b8" textAnchor="middle">0</text>
                  <text x="128" y="80" fontSize="8.5" fontWeight="800" fill="#94a3b8" textAnchor="middle">{totalCount}</text>
                  <text x="70" y="55" fontSize="16" fontWeight="900" fill="#0f172a" textAnchor="middle">{overallPercent}%</text>
                </svg>
              </div>

              {/* Metrics Column */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div>
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
                  <div className="font-mono text-base font-black text-slate-900 leading-tight">
                    {solvedCount} <span className="text-xs text-slate-400 font-bold">/ {totalCount}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                  <div className="font-mono text-xs font-bold text-slate-600">
                    {totalCount - solvedCount} Labs
                  </div>
                </div>
                <div className="pt-0.5">
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                    {solvedCount > 0 ? `${overallPercent}% Verified` : 'Ready to Start'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: DIFFICULTY PROGRESS BARS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-center space-y-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Difficulty Tiers</span>
              <span className="text-[11px] font-bold text-slate-400">Target 100%</span>
            </div>

            {/* Basic (CLI Foundations) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Basic (CLI Shell)
                </span>
                <span className="font-mono text-slate-700">{solvedBasic}/{basicChallenges.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${basicPercent}%` }} />
              </div>
            </div>

            {/* Easy (Git Setup) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-teal-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Easy (Repositories)
                </span>
                <span className="font-mono text-slate-700">{solvedEasy}/{easyChallenges.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${easyPercent}%` }} />
              </div>
            </div>

            {/* Medium (Branching & Merges) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Medium (Branching)
                </span>
                <span className="font-mono text-slate-700">{solvedMedium}/{mediumChallenges.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${mediumPercent}%` }} />
              </div>
            </div>

            {/* Hard / Extreme (Rebase, Conflict, Reflog) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Hard & Extreme
                </span>
                <span className="font-mono text-slate-700">{solvedHard}/{hardChallenges.length}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${hardPercent}%` }} />
              </div>
            </div>
          </div>

          {/* CARD 3: TRACK MASTERY BREAKDOWN */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 border border-blue-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 text-[10px] font-black uppercase tracking-wide flex items-center space-x-1">
                  <Compass size={11} className="text-indigo-600 inline" />
                  <span>3-TRACK CURRICULUM</span>
                </span>
                <span className="font-mono text-xs font-black text-indigo-700">
                  {totalCount - solvedCount} To Complete
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Full-Stack Version Control Mastery
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Complete shell foundation labs, local staging flows, and team collaboration workflows.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              {/* Track 1 Shortcut */}
              <button
                type="button"
                onClick={() => setSelectedTrack('terminal')}
                className="w-full text-left p-2 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-1.5">
                  <Terminal size={13} className="text-blue-600" />
                  <span>Terminal CLI (1-25)</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">{solvedTerminal}/25</span>
              </button>

              {/* Track 2 Shortcut */}
              <button
                type="button"
                onClick={() => setSelectedTrack('git-basics')}
                className="w-full text-left p-2 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-1.5">
                  <GitBranch size={13} className="text-emerald-600" />
                  <span>Git Architecture (26-50)</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">{solvedGitBasics}/25</span>
              </button>

              {/* Track 3 Shortcut */}
              <button
                type="button"
                onClick={() => setSelectedTrack('git-advanced')}
                className="w-full text-left p-2 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-1.5">
                  <Compass size={13} className="text-indigo-600" />
                  <span>Branching & Merge (51-70)</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">{solvedGitAdvanced}/20</span>
              </button>
            </div>
          </div>

        </div>

        {/* ── FILTER & SEARCH TOOLBAR ── */}
        <div className="space-y-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search labs by command (e.g. git rebase, pwd), title, or scenario..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Jump to Lab # */}
            <div className="relative flex items-center shrink-0">
              <input
                type="text"
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJumpToLab();
                }}
                placeholder="Go to #..."
                className="w-24 pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                title="Type lab number (e.g. 55) and press Enter"
              />
              <Target size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Difficulty Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 shrink-0"
            >
              <option value="all">All Difficulties</option>
              <option value="basic">Basic</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard & Extreme</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 shrink-0"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>

          {/* Track Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {Object.entries(TRACK_INFO).map(([key, info]) => {
              const isActive = selectedTrack === key;
              const Icon = info.icon;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSelectedTrack(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon size={13} />
                  <span>{info.label} ({info.count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GIT QUESTIONS TABLE (MATCHING SQL LEETCODE TABLE) ── */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50/80 font-black text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 w-12 text-center">Status</th>
                  <th scope="col" className="px-3 py-3.5 w-14 text-center">#</th>
                  <th scope="col" className="px-4 py-3.5 min-w-[300px]">Problem Statement</th>
                  <th scope="col" className="px-4 py-3.5 min-w-[180px]">Track / Module</th>
                  <th scope="col" className="px-4 py-3.5">Difficulty</th>
                  <th scope="col" className="px-4 py-3.5 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="space-y-3 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                          <AlertTriangle size={22} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm">No Git labs match your current filters</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Try resetting your search query or selecting "All Tracks".
                          </p>
                        </div>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTrack('all');
                              setSelectedDifficulty('all');
                              setSelectedStatus('all');
                              setSearchQuery('');
                            }}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProblems.map((ch, idx) => {
                    const isSolved = solvedChallenges.includes(ch.id);
                    const diffTheme = getDifficultyTheme(ch.difficulty);
                    const targetSlug = getGitChallengeSlug(ch);

                    return (
                      <tr
                        key={ch.id}
                        className={`hover:bg-slate-50/80 transition-colors group ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >
                        {/* Status Checkmark */}
                        <td className="px-4 py-3.5 text-center">
                          {isSolved ? (
                            <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block group-hover:border-slate-400" />
                          )}
                        </td>

                        {/* Canonical Lab # */}
                        <td className="px-3 py-3.5 text-center font-mono">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-black text-slate-600 border border-slate-200/70 font-mono inline-block shadow-2xs">
                            #{ch.originalIndex + 1}
                          </span>
                        </td>

                        {/* Title & Tags */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <Link
                              to={`/practice/git/${targetSlug}`}
                              className="font-bold text-slate-900 hover:text-blue-600 text-xs sm:text-sm transition-colors cursor-pointer block leading-snug"
                            >
                              {ch.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {(ch.tags || []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.2 bg-slate-100 text-slate-500 rounded text-[10px] font-mono font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Track / Module Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-slate-600 font-medium block">
                            {ch.category || ch.moduleTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {ch.track === 'terminal' ? 'CLI Shell' : ch.track === 'git-basics' ? 'Repository Core' : 'Advanced Workflows'}
                          </span>
                        </td>

                        {/* Difficulty Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${diffTheme.badge}`}>
                            {diffTheme.label}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <Link
                            to={`/practice/git/${targetSlug}`}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer ${
                              isSolved
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
                            }`}
                          >
                            <span>{isSolved ? 'Revisit' : 'Solve'}</span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span>Showing {paginatedProblems.length} of {filteredList.length} Labs</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center space-x-1">
                <span>Per Page:</span>
                {[25, 50, 70].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setItemsPerPage(num)}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      itemsPerPage === num
                        ? 'bg-slate-900 text-white'
                        : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {num === 70 ? 'All' : num}
                  </button>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>

                {paginationItems.map((item, idx) => {
                  if (item === '...') {
                    return <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>;
                  }
                  const isCurrent = validCurrentPage === item;
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-2xs font-black'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white cursor-pointer transition-colors"
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
