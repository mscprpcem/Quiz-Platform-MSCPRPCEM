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
import GitLandingPage from './GitLandingPage';

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

  // Mode navigation handler
  const setMode = (modeName) => {
    if (modeName === 'overview') {
      navigate('/courses/git');
    } else if (modeName === 'learn') {
      navigate('/courses/git/learn');
    } else if (modeName === 'practice') {
      navigate('/courses/git/practice');
    } else if (modeName === 'roadmap') {
      navigate('/courses/git/roadmap');
    } else if (modeName === 'cheatsheet') {
      navigate('/courses/git/cheatsheet');
    } else {
      navigate(`/courses/git/${modeName}`);
    }
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
              <span>Back to Overview</span>
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

  // 5. LANDING OVERVIEW PAGE (Default view when currentView === 'overview')
  return (
    <GitLandingPage
      onSelectMode={setMode}
      completedLessonsCount={completedLessons.length}
      totalLessonsCount={totalLessonsCount}
      chaptersData={chaptersData}
      selectedChapterFilter={selectedChapterFilter}
      setSelectedChapterFilter={setSelectedChapterFilter}
      chapterSearch={chapterSearch}
      setChapterSearch={setChapterSearch}
      onSelectChapter={(chapterId) => navigate(`/courses/git/learn?chapter=${chapterId}`)}
    />
  );
}
