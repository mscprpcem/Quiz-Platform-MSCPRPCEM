import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  BookOpen, Terminal, Copy, Check, Sparkles, ArrowRight, ArrowLeft,
  GitBranch, Code2, Clock, CheckCircle2, ChevronRight, FileText, Search,
  Compass, HelpCircle, Lightbulb, X, Info, ShieldCheck, Zap, Layers,
  Play, ExternalLink, ChevronDown, Award
} from 'lucide-react';
import { GIT_CHEATSHEET, GIT_CURRICULUM } from '../data/gitCurriculumData';
import { GIT_SUBCHAPTERS } from '../data/gitSubchapters';
import GitLearningView, { GIT_CHAPTERS, TOPIC_SHORT_NAMES } from './GitLearningView';
import GitRoadmapView from './GitRoadmapView';
import GitPracticeDashboard from './GitPracticeDashboard';

export default function GitCourseHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tab: urlTab } = useParams();

  // Search & filters for Cheat Sheet view and Chapter explorer
  const [cheatSearch, setCheatSearch] = useState('');
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [chapterSearch, setChapterSearch] = useState('');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('all');

  // Completed lessons from localStorage
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // Total lessons count
  const totalLessonsCount = useMemo(() => {
    return GIT_CURRICULUM.reduce((acc, tier) => acc + tier.topics.length, 0);
  }, []);

  // Filtered chapters for the redesigned Chapters page
  const chaptersData = useMemo(() => {
    // Map existing curriculum topic objects by slug
    const topicsMap = new Map();

    // Register all 10 subchapters from GIT_SUBCHAPTERS first
    GIT_SUBCHAPTERS.forEach((sub) => {
      topicsMap.set(sub.slug, sub);
      if (sub.aliases) {
        sub.aliases.forEach(a => topicsMap.set(a, sub));
      }
    });

    GIT_CURRICULUM.forEach((tier) => {
      tier.topics.forEach((t) => {
        if (!topicsMap.has(t.slug)) {
          topicsMap.set(t.slug, t);
        }
      });
    });

    return GIT_CHAPTERS.map(ch => {
      const allTopics = ch.topics.map(slug => topicsMap.get(slug)).filter(Boolean);
      
      const filteredTopics = allTopics.filter(t => {
        if (!chapterSearch.trim()) return true;
        const q = chapterSearch.toLowerCase();
        const shortName = TOPIC_SHORT_NAMES[t.slug] || '';
        return (
          t.title.toLowerCase().includes(q) ||
          shortName.toLowerCase().includes(q) ||
          (t.summary && t.summary.toLowerCase().includes(q)) ||
          (t.slug && t.slug.toLowerCase().includes(q)) ||
          ch.title.toLowerCase().includes(q)
        );
      });

      const completedInChapter = allTopics.filter(t => completedLessons.includes(t.slug)).length;

      return {
        ...ch,
        subtitle: ch.partTitle || ch.title,
        topics: allTopics,
        filteredTopics,
        completedCount: completedInChapter,
        totalCount: allTopics.length
      };
    }).filter(ch => {
      if (selectedChapterFilter !== 'all') {
        if (selectedChapterFilter.startsWith('part-')) {
          const partName = selectedChapterFilter.replace('part-', 'Part ');
          if (ch.part !== partName) return false;
        } else if (ch.id !== selectedChapterFilter) {
          return false;
        }
      }
      if (chapterSearch.trim() && ch.filteredTopics.length === 0) return false;
      return true;
    });
  }, [selectedChapterFilter, chapterSearch, completedLessons]);

  // Handle command copy
  const handleCopy = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

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

  // 4. CHEAT SHEET VIEW (Dedicated Clean Developer Reference Page)
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
          
          {/* Top Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => navigate('/courses/git')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>Back to Chapters</span>
            </button>

            <div className="relative w-full sm:w-72">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search commands (e.g. rebase, commit)..."
                value={cheatSearch}
                onChange={(e) => setCheatSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1 border-b border-slate-200 pb-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Git Command Field Cheat Sheet
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Copyable commands for day-to-day workflow, branching, and emergency incident recovery.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {cat.category}
                  </h3>
                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {cat.commands.length} commands
                  </span>
                </div>

                <div className="space-y-2">
                  {cat.commands.map((item, cIdx) => {
                    const isCopied = copiedCmd === item.cmd;

                    return (
                      <div
                        key={cIdx}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-lg border border-slate-200/70 transition-colors flex items-center justify-between gap-2.5"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <code className="text-xs font-mono font-bold text-blue-700 block truncate">
                            {item.cmd}
                          </code>
                          <span className="text-[11px] text-slate-500 block leading-snug">
                            {item.desc}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(item.cmd)}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                              : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200 shadow-2xs'
                          }`}
                          title="Copy command"
                        >
                          {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
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

  const progressPercent = Math.min(100, Math.round((completedLessons.length / totalLessonsCount) * 100));

  // 5. REDESIGNED CHAPTERS PAGE: Clean, Elegant, Developer-Grade Course Catalog
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-segoe pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* ═════════════════════════════════════════════════════════════════════
          TOP HEADER: CLEAN COURSE SUMMARY & TRACK METRICS
      ═════════════════════════════════════════════════════════════════════ */}
      <header className="w-full bg-white border-b border-slate-200 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-5xl xl:max-w-6xl mx-auto space-y-4">
          
          {/* Top Breadcrumb & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>All Courses</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/70">
              Official MSC PRPCEM Curriculum
            </span>
          </div>

          {/* Course Title & Intro */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Git &amp; GitHub <span className="text-blue-600">Chapters</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-normal">
              Master version control chapter by chapter: mental models, staging architecture, branch topologies, interactive rebasing, emergency recovery, and CI/CD pipelines.
            </p>
          </div>

          {/* Track Progress & Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
            <div className="space-y-1.5 sm:max-w-xs w-full">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  Course Progress
                </span>
                <span className="text-blue-600 font-mono font-bold">
                  {completedLessons.length} / {totalLessonsCount} lessons ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(3, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/courses/git/learn')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Continue Reading</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/courses/git/practice')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Terminal size={13} className="text-emerald-600" />
                <span>70 Labs</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/courses/git/cheatsheet')}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText size={13} />
                <span>Cheat Sheet</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════════════════
          MAIN CHAPTERS LIST: PROPER FULL SPACE
      ═════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Search & Chapter Quick Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All Chapters (${GIT_CHAPTERS.length})` },
              { id: 'part-1', label: 'Part 1: Foundations (1–7)' },
              { id: 'part-2', label: 'Part 2: Branching (8–14)' },
              { id: 'part-3', label: 'Part 3: GitHub (15–21)' },
              { id: 'part-4', label: 'Part 4: Power Tools (22–30)' }
            ].map(f => (
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

          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons or topics..."
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            {chapterSearch && (
              <button
                onClick={() => setChapterSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Chapters Cards List */}
        <div className="space-y-4">
          {chaptersData.map((chapter) => {
            const isFinished = chapter.completedCount === chapter.totalCount && chapter.totalCount > 0;

            return (
              <div
                key={chapter.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
              >
                {/* Chapter Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {chapter.number}
                      </span>
                      <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {chapter.title}
                      </h2>
                    </div>
                    {chapter.subtitle && (
                      <p className="text-xs text-slate-500 font-normal pl-7">
                        {chapter.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 sm:self-center pl-7 sm:pl-0">
                    <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                      {chapter.number <= 5 ? `${chapter.completedCount}/${chapter.totalCount} completed` : 'Coming Soon'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (chapter.number <= 5) {
                          navigate(`/courses/git/learn?topic=${chapter.topics?.[0]?.slug || 'day-0-orientation'}`);
                        } else {
                          navigate(`/courses/git/learn?chapter=${chapter.id}`);
                        }
                      }}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg border border-blue-200/80 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <span>{chapter.number <= 5 ? 'Start' : 'Preview'}</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Lessons Grid inside Chapter with Short Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {chapter.filteredTopics.map((topic) => {
                    const isDone = completedLessons.includes(topic.slug);
                    const shortTitle = TOPIC_SHORT_NAMES[topic.slug] || topic.shortTitle || topic.title.replace(/^(?:Day\s*\d+:|\d+\.)\s*/, '');

                    return (
                      <button
                        key={topic.slug}
                        type="button"
                        onClick={() => navigate(`/courses/git/learn?topic=${topic.slug}`)}
                        className="text-left p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/40 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2 truncate min-w-0">
                          {isDone ? (
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 shrink-0" />
                          )}
                          <span className="text-xs text-slate-700 group-hover:text-blue-700 font-medium truncate">
                            {shortTitle}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {topic.readTime ? topic.readTime.replace(' read', '') : '5m'}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </main>

    </div>
  );
}
