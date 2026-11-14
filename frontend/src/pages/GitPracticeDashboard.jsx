import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Terminal, GitBranch, Search, Filter, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'basic' | 'easy' | 'medium' | 'hard'
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'solved' | 'unsolved'
  const [jumpInput, setJumpInput] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // 25 | 50 | 100

  const totalCount = GIT_CHALLENGES.length; // 70
  const solvedCount = solvedChallenges.length;
  const overallPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Category extraction & prioritization (Display active category first if selected)
  const categories = useMemo(() => {
    const set = new Set();
    GIT_CHALLENGES.forEach((c) => {
      const cat = c.category || c.moduleTitle;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, []);

  const displayCategories = useMemo(() => {
    if (selectedCategory === 'all') return categories;
    return [selectedCategory, ...categories.filter((c) => c !== selectedCategory)];
  }, [categories, selectedCategory]);

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

      // Category Filter
      if (selectedCategory !== 'all') {
        const cat = c.category || c.moduleTitle;
        if (cat !== selectedCategory) {
          return false;
        }
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
  }, [selectedTrack, selectedCategory, selectedDifficulty, selectedStatus, searchQuery, solvedChallenges]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTrack, selectedCategory, selectedDifficulty, selectedStatus, searchQuery]);

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

        {/* ── HEADER & ACTIONS ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Terminal size={18} />
              </div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Git & GitHub Practice
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  {totalCount} Labs
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Hands-on POSIX shell and version control labs with live terminal execution.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onJumpToLearn ? onJumpToLearn() : navigate('/courses/git/learn')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen size={13} />
              <span>Curriculum</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/courses/git/roadmap')}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Clock size={13} />
              <span>Roadmap</span>
            </button>

            <button
              type="button"
              onClick={handlePickRandom}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center shrink-0"
              title="Pick Random Lab"
            >
              <Shuffle size={14} />
            </button>
          </div>
        </div>

        {/* ── GITMETER & DIFFICULTY OVERVIEW ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

            {/* Left: GitMeter Gauge */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge size={14} className="text-blue-600" />
                  GitMeter
                </span>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {solvedCount} / {totalCount} Completed
                </span>
              </div>

              <div className="flex items-center space-x-4 pt-1">
                {/* GitMeter SVG Gauge */}
                <div className="relative w-40 sm:w-44 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 140 82">
                    <defs>
                      <linearGradient id="gitMeterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
                    {/* Active GitMeter Arc */}
                    <path
                      d="M 12 70 A 58 58 0 0 1 128 70"
                      fill="none"
                      stroke="url(#gitMeterGradient)"
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
                    {/* Center Hub */}
                    <circle cx="70" cy="70" r="6.5" fill="#0f172a" />
                    <circle cx="70" cy="70" r="2.5" fill="#ffffff" />
                    {/* Bounds */}
                    <text x="12" y="80" fontSize="8.5" fontWeight="700" fill="#94a3b8" textAnchor="middle">0</text>
                    <text x="128" y="80" fontSize="8.5" fontWeight="700" fill="#94a3b8" textAnchor="middle">{totalCount}</text>
                    {/* Percentage */}
                    <text x="70" y="55" fontSize="16" fontWeight="800" fill="#0f172a" textAnchor="middle">{overallPercent}%</text>
                  </svg>
                </div>

                {/* Solved / Remaining details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                    <div className="font-mono text-sm font-bold text-slate-700">
                      {totalCount - solvedCount} <span className="text-xs text-slate-400 font-normal">labs</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GitMeter Rate</div>
                    <div className="font-mono text-xs font-bold text-slate-600">
                      {overallPercent}% Completed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Divider for LG+ screens */}
            <div className="hidden lg:block lg:col-span-1 flex justify-center">
              <div className="w-px h-28 bg-slate-200" />
            </div>

            {/* Right: Difficulty Breakdown */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Difficulty Tiers</span>
                <span className="text-[11px] font-mono text-slate-400">Target 100%</span>
              </div>

              {/* Basic */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Basic (CLI Shell)
                  </span>
                  <span className="font-mono text-slate-600">{solvedBasic} / {basicChallenges.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${basicPercent}%` }} />
                </div>
              </div>

              {/* Easy */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-teal-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Easy (Repositories)
                  </span>
                  <span className="font-mono text-slate-600">{solvedEasy} / {easyChallenges.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${easyPercent}%` }} />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium (Branching)
                  </span>
                  <span className="font-mono text-slate-600">{solvedMedium} / {mediumChallenges.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${mediumPercent}%` }} />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Hard & Extreme
                  </span>
                  <span className="font-mono text-slate-600">{solvedHard} / {hardChallenges.length}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${hardPercent}%` }} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── GIT PROBLEMSET TABLE & FILTERS CONTAINER ── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {/* Filter & Search Toolbar */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search labs by command (e.g. git rebase, pwd), title, or scenario..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
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
                  className="w-24 pl-7 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                  title="Type lab number (e.g. 55) and press Enter"
                />
                <Target size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Difficulty Dropdown */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 shrink-0"
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
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500 shrink-0"
              >
                <option value="all">All Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>

            {/* Track & Topic Filter Pills (Uses full space, no box on chevron) */}
            <div className="flex items-start justify-between gap-2 pt-0.5">
              <div
                className={`flex flex-wrap items-center gap-1.5 flex-1 min-w-0 transition-all ${
                  isTopicsExpanded ? '' : 'max-h-8 overflow-hidden'
                }`}
              >
                {/* Track Pills */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrack('all');
                    setSelectedCategory('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                    selectedTrack === 'all' && selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers size={13} />
                  <span>All Labs ({totalCount})</span>
                </button>

                {Object.entries(TRACK_INFO).filter(([k]) => k !== 'all').map(([key, info]) => {
                  const isActive = selectedTrack === key && selectedCategory === 'all';
                  const Icon = info.icon;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => {
                        setSelectedTrack(key);
                        setSelectedCategory('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{info.label.split('&')[0].trim()} ({info.count})</span>
                    </button>
                  );
                })}

                {/* Detailed Category Pills */}
                {displayCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedTrack('all');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Expand / Collapse Icon (NO Box, minimal chevron icon) */}
              <button
                type="button"
                onClick={() => setIsTopicsExpanded((prev) => !prev)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0 mt-0.5"
                title={isTopicsExpanded ? 'Collapse topic filters' : 'Expand all topic filters'}
              >
                {isTopicsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
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
                              setSelectedCategory('all');
                              setSelectedDifficulty('all');
                              setSelectedStatus('all');
                              setSearchQuery('');
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all cursor-pointer shadow-xs"
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
