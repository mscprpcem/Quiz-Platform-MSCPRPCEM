import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  GitBranch, BookOpen, CheckCircle2, Copy, Check, Terminal,
  ChevronRight, ChevronDown, ChevronUp, ArrowLeft, ArrowRight,
  Search, Menu, X, Clock, Sparkles, Layers, ShieldCheck,
  AlertTriangle, Lightbulb, ExternalLink, Code2, Play, Bookmark,
  CheckSquare, ArrowUpRight, Flame, Trophy, FileText, Compass
} from 'lucide-react';
import { GIT_CURRICULUM } from '../data/gitCurriculumData';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// 5 Interactive Steps for the First-Time Student Tutor Guide
const TUTOR_STEPS = [
  {
    targetId: 'tutor-step-search',
    title: 'Instant Lesson Search',
    description: 'Use this search bar to instantly find any Git command or concept across all 34 lessons (e.g. merge, rebase, conflicts, reflog).',
    icon: Search,
    badge: 'Step 1 of 5'
  },
  {
    targetId: 'tutor-step-progress',
    title: 'Live Reading Progress Tracker',
    description: 'This progress bar tracks your completion across all 34 lessons. Every time you mark a lesson completed, your progress advances.',
    icon: CheckCircle2,
    badge: 'Step 2 of 5'
  },
  {
    targetId: 'tutor-step-syllabus',
    title: '5 Curriculum Tiers',
    description: 'Lessons are organized into 5 progressive levels: Novice Foundations, Branching & History, GitHub Collaboration, Power Tools, and Production Workflows.',
    icon: Layers,
    badge: 'Step 3 of 5'
  },
  {
    targetId: 'tutor-step-complete',
    title: 'Mark Lessons as Completed',
    description: 'Once you finish reading a lesson, click "Mark Completed" at the top or bottom of the lesson to record your mastery.',
    icon: Check,
    badge: 'Step 4 of 5'
  },
  {
    targetId: 'tutor-step-lab',
    title: 'Interactive Git Terminal Lab',
    description: 'Ready to try commands hands-on? Click "Try in Lab" anytime to practice in our in-browser virtual Git terminal simulator with real commit graphs!',
    icon: Terminal,
    badge: 'Step 5 of 5'
  }
];

/**
 * Terminal Code Block with macOS/Linux Window Controls & Git Syntax Highlighting
 */
function TerminalCodeBlock({ code, title = 'Terminal — bash', language = 'bash' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderHighlightedLine = (line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={idx} className="h-4" />;
    }

    if (trimmed.startsWith('#')) {
      return (
        <div key={idx} className="text-slate-400 italic font-mono text-[12px] sm:text-[13px] leading-relaxed">
          {line}
        </div>
      );
    }

    const isCommandLine = trimmed.startsWith('$') || trimmed.startsWith('git ') || trimmed.startsWith('cd ') || trimmed.startsWith('touch ') || trimmed.startsWith('mkdir ') || trimmed.startsWith('cat ');

    if (!isCommandLine) {
      return (
        <div key={idx} className="text-slate-300 font-mono text-[12px] sm:text-[13px] leading-relaxed">
          {line}
        </div>
      );
    }

    const tokens = line.split(/(\s+|"[^"]*"|'[^']*'|--[a-zA-Z0-9_-]+|-[a-zA-Z0-9]+|\b(?:git|cd|touch|mkdir|cat|echo|rm|npm|npx)\b|\b(?:init|status|add|commit|branch|checkout|switch|merge|rebase|stash|push|pull|fetch|clone|reset|revert|log|reflog|bisect|cherry-pick|tag|remote|restore|diff|show|config)\b)/g);

    return (
      <div key={idx} className="font-mono text-[12px] sm:text-[13px] leading-relaxed">
        {tokens.map((tok, tIdx) => {
          if (!tok) return null;
          const trimmedTok = tok.trim();

          if (trimmedTok === '$') {
            return <span key={tIdx} className="text-slate-500 font-bold select-none">{tok}</span>;
          }
          if (['git', 'cd', 'touch', 'mkdir', 'cat', 'echo', 'rm', 'npm', 'npx'].includes(trimmedTok)) {
            return <span key={tIdx} className="text-cyan-400 font-black">{tok}</span>;
          }
          if (['init', 'status', 'add', 'commit', 'branch', 'checkout', 'switch', 'merge', 'rebase', 'stash', 'push', 'pull', 'fetch', 'clone', 'reset', 'revert', 'log', 'reflog', 'bisect', 'cherry-pick', 'tag', 'remote', 'restore', 'diff', 'show', 'config'].includes(trimmedTok)) {
            return <span key={tIdx} className="text-amber-300 font-bold">{tok}</span>;
          }
          if (trimmedTok.startsWith('-')) {
            return <span key={tIdx} className="text-purple-300 font-semibold">{tok}</span>;
          }
          if ((trimmedTok.startsWith('"') && trimmedTok.endsWith('"')) || (trimmedTok.startsWith("'") && trimmedTok.endsWith("'"))) {
            return <span key={tIdx} className="text-emerald-300 font-medium">{tok}</span>;
          }
          return <span key={tIdx} className="text-slate-200">{tok}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg my-5">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 inline-block" />
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
            <Terminal size={12} className="text-cyan-400" />
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 text-[11px] font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Copy command to clipboard"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className={copied ? 'text-emerald-400 font-bold' : ''}>
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-x-auto selection:bg-cyan-500/30 selection:text-white custom-scrollbar">
        {code.split('\n').map((line, idx) => renderHighlightedLine(line, idx))}
      </div>
    </div>
  );
}

/**
 * Visual Monospace Architecture / Commit Graph Diagram Block
 */
function VisualDiagramBlock({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#0d1117] shadow-lg my-5">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 font-mono font-bold select-none">
        <span className="flex items-center gap-1.5 text-cyan-400">
          <GitBranch size={13} />
          Architecture & Flow Diagram
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto font-mono text-[12px] sm:text-[13px] leading-relaxed text-cyan-300/95 whitespace-pre selection:bg-blue-500/30 custom-scrollbar">
        {content}
      </div>
    </div>
  );
}

/**
 * Rich Markdown Lesson Content Parser
 */
function GitLessonContent({ markdown, onJumpToPractice }) {
  if (!markdown) return null;

  const blocks = markdown.trim().split('\n\n');

  const renderInline = (text) => {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-extrabold text-slate-900 bg-slate-100/90 px-1 py-0.5 rounded text-inherit">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={match.index} className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  return (
    <div className="space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed font-normal">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace('### ', '');
          return (
            <div key={idx} className="pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full inline-block" />
                {headingText}
              </h3>
            </div>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-base sm:text-lg font-black text-slate-800 pt-2 tracking-tight">
              {trimmed.replace('#### ', '')}
            </h4>
          );
        }

        if (trimmed.startsWith('```')) {
          const codeLines = trimmed.split('\n');
          const firstLine = codeLines[0].replace('```', '').trim().toLowerCase();
          const cleanCode = codeLines.slice(1, -1).join('\n');

          const isDiagram = ['┌', '├', '│', '─', '►', '▲', '▼', '◄', '└──', 'Commit'].some(char => cleanCode.includes(char)) && !firstLine.includes('bash');

          if (isDiagram) {
            return <VisualDiagramBlock key={idx} content={cleanCode} />;
          }

          return (
            <TerminalCodeBlock
              key={idx}
              code={cleanCode}
              title={firstLine ? `Terminal — ${firstLine}` : 'Git Terminal'}
              language={firstLine || 'bash'}
            />
          );
        }

        if (trimmed.startsWith('> 💡') || trimmed.startsWith('>💡')) {
          const text = trimmed.replace(/^>\s*💡\s*/, '');
          return (
            <aside key={idx} className="my-6 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-yellow-50/80 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 text-lg">
                  💡
                </div>
                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-900 block">
                    Developer Mental Model (ELI5)
                  </span>
                  <div className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                    {renderInline(text)}
                  </div>
                </div>
              </div>
            </aside>
          );
        }

        if (trimmed.startsWith('> ⚠️') || trimmed.startsWith('> 🚨') || trimmed.startsWith('>⚠️') || trimmed.startsWith('>🚨')) {
          const isCritical = trimmed.includes('🚨');
          const cleanText = trimmed.replace(/^>\s*[⚠️🚨]\s*/, '');
          return (
            <aside
              key={idx}
              className={`my-6 rounded-2xl p-5 border-l-4 shadow-xs ${
                isCritical
                  ? 'bg-rose-50/80 border-rose-600 text-rose-950'
                  : 'bg-amber-50/80 border-amber-500 text-amber-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  size={20}
                  className={`shrink-0 mt-0.5 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`}
                />
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    {isCritical ? 'Critical Security & Production Rule' : 'Important Developer Warning'}
                  </span>
                  <div className="text-xs sm:text-sm leading-relaxed font-medium">
                    {renderInline(cleanText)}
                  </div>
                </div>
              </div>
            </aside>
          );
        }

        if (trimmed.startsWith('> ')) {
          const cleanQuote = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote key={idx} className="my-6 border-l-4 border-blue-500 bg-blue-50/60 p-4 sm:p-5 rounded-r-2xl text-blue-950 text-xs sm:text-sm shadow-xs flex items-start space-x-3">
              <Lightbulb size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {renderInline(cleanQuote)}
              </div>
            </blockquote>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').filter(l => l.trim().startsWith('* ') || l.trim().startsWith('- '));
          return (
            <ul key={idx} className="space-y-2 pl-2">
              {items.map((item, iIdx) => {
                const itemText = item.trim().replace(/^[-*]\s+/, '');
                return (
                  <li key={iIdx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                    <span className="text-blue-600 font-black mt-1 text-sm">•</span>
                    <span className="flex-1 leading-relaxed">{renderInline(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        if (trimmed === '---') {
          return <hr key={idx} className="my-6 border-slate-200" />;
        }

        return (
          <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * GitLearningView: Dedicated Full-Height Learning Environment (Modeled after SqlLearningView)
 */
export default function GitLearningView({
  selectedTopicSlug: propTopicSlug,
  setSelectedTopicSlug: propSetTopicSlug,
  completedLessons: propCompletedLessons,
  onToggleCompleted: propOnToggleCompleted,
  onBackToOverview,
  onJumpToPractice
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // First-time Tutor Guide state: ONLY triggers automatically for the first-time user
  const [activeTutorStep, setActiveTutorStep] = useState(() => {
    try {
      const seen = localStorage.getItem('msc_git_learn_tour_done');
      return seen === 'true' ? null : 0;
    } catch {
      return null;
    }
  });

  const handleCloseTutor = () => {
    setActiveTutorStep(null);
    try {
      localStorage.setItem('msc_git_learn_tour_done', 'true');
    } catch (_) {}
  };

  // Dynamic positioning for the tutor guide tooltip card (side of the target element)
  const [popoverPos, setPopoverPos] = useState(null);

  useEffect(() => {
    if (activeTutorStep === null) {
      setPopoverPos(null);
      return;
    }

    const step = TUTOR_STEPS[activeTutorStep];
    const updatePosition = () => {
      const el = document.getElementById(step.targetId);
      if (!el) {
        setPopoverPos({ isFallback: true });
        return;
      }

      const rect = el.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;

      if (isMobile) {
        setPopoverPos({ isFallback: true });
        return;
      }

      // Sidebar targets (Search, Progress, Syllabus): position directly on the side (right of the element)
      if (['tutor-step-search', 'tutor-step-progress', 'tutor-step-syllabus'].includes(step.targetId)) {
        setPopoverPos({
          top: Math.max(16, rect.top - 8),
          left: rect.right + 14,
          arrow: 'left'
        });
      } else {
        // Header targets (Complete, Lab): position directly below the element
        setPopoverPos({
          top: rect.bottom + 12,
          left: Math.max(16, rect.right - 340),
          arrow: 'top'
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [activeTutorStep]);

  // 1. All topics flattened for linear indexing & Prev/Next navigation
  const allTopicsFlat = useMemo(() => {
    const list = [];
    GIT_CURRICULUM.forEach((tier, tierIdx) => {
      tier.topics.forEach((topic, topicIdx) => {
        list.push({
          ...topic,
          tierId: tier.id,
          tierLevel: tier.level,
          tierTitle: tier.title,
          tierBadge: tier.badge,
          tierIndex: tierIdx,
          lessonCode: `${tier.level}.${topicIdx + 1}`,
          globalIndex: list.length + 1
        });
      });
    });
    return list;
  }, []);

  const totalTopicsCount = allTopicsFlat.length;

  // 2. Active topic slug state (URL query param > props > default)
  const initialSlug = searchParams.get('topic') || propTopicSlug || 'git-basics';
  const [currentTopicSlug, setCurrentTopicSlug] = useState(initialSlug);

  useEffect(() => {
    const paramTopic = searchParams.get('topic');
    if (paramTopic && paramTopic !== currentTopicSlug) {
      setCurrentTopicSlug(paramTopic);
    }
  }, [searchParams]);

  const activeTopic = useMemo(() => {
    const found = allTopicsFlat.find(t => t.slug === currentTopicSlug);
    return found || allTopicsFlat[0];
  }, [allTopicsFlat, currentTopicSlug]);

  const activeTierId = activeTopic.tierId;

  // 3. Accordion state for 5 Tiers
  const [expandedTiers, setExpandedTiers] = useState(() => {
    const initial = {};
    GIT_CURRICULUM.forEach(t => {
      initial[t.id] = t.id === activeTierId || t.id === 'tier-1';
    });
    return initial;
  });

  useEffect(() => {
    if (activeTierId) {
      setExpandedTiers(prev => ({ ...prev, [activeTierId]: true }));
    }
  }, [activeTierId]);

  const toggleTier = (tierId) => {
    setExpandedTiers(prev => ({ ...prev, [tierId]: !prev[tierId] }));
  };

  // 4. Completed lessons state
  const [completedLessons, setCompletedLessons] = useState(() => {
    if (propCompletedLessons && propCompletedLessons.length > 0) return propCompletedLessons;
    try {
      const saved = localStorage.getItem('msc_git_completed_lessons');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (propCompletedLessons && propCompletedLessons.length > 0) {
      setCompletedLessons(propCompletedLessons);
    }
  }, [propCompletedLessons]);

  const isCurrentLessonCompleted = completedLessons.includes(activeTopic.slug);
  const progressPercent = Math.min(100, Math.round((completedLessons.length / totalTopicsCount) * 100));

  // 5. Toggle completed action
  const handleToggleCompleted = async (slugToToggle = activeTopic.slug) => {
    const isCompleted = completedLessons.includes(slugToToggle);
    const updated = isCompleted
      ? completedLessons.filter(s => s !== slugToToggle)
      : Array.from(new Set([...completedLessons, slugToToggle]));

    setCompletedLessons(updated);
    try {
      localStorage.setItem('msc_git_completed_lessons', JSON.stringify(updated));
    } catch (_) {}

    if (propOnToggleCompleted) {
      propOnToggleCompleted(slugToToggle);
    }

    if (user?.email) {
      try {
        await api.post('/git/progress/lesson', {
          lessonSlug: slugToToggle,
          email: user.email
        });
      } catch (_) {}
    }

    if (!isCompleted) {
      addToast && addToast('Lesson marked completed! (+1)', 'success');
    }
  };

  // 6. Topic selection handler
  const handleSelectTopic = (slug) => {
    setCurrentTopicSlug(slug);
    if (propSetTopicSlug) propSetTopicSlug(slug);
    setSearchParams({ topic: slug }, { replace: true });
    setMobileMenuOpen(false);

    const readerEl = document.getElementById('git-lesson-article-container');
    if (readerEl) readerEl.scrollTop = 0;
  };

  // 7. Navigation (Previous & Next Lesson)
  const currentGlobalIndex = activeTopic.globalIndex; // 1-indexed
  const previousTopic = currentGlobalIndex > 1 ? allTopicsFlat[currentGlobalIndex - 2] : null;
  const nextTopic = currentGlobalIndex < totalTopicsCount ? allTopicsFlat[currentGlobalIndex] : null;

  const handleNextLesson = () => {
    if (nextTopic) {
      handleSelectTopic(nextTopic.slug);
    }
  };

  const handlePreviousLesson = () => {
    if (previousTopic) {
      handleSelectTopic(previousTopic.slug);
    }
  };

  const handleCompleteAndNext = () => {
    if (!isCurrentLessonCompleted) {
      handleToggleCompleted(activeTopic.slug);
    }
    if (nextTopic) {
      handleSelectTopic(nextTopic.slug);
    }
  };

  // 8. Prevent duplicate outer window scrollbar while in full-height learning view
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  return (
    <div
      style={{ height: 'calc(100vh - 64px)', overflow: 'hidden' }}
      className="w-full h-[calc(100vh-64px)] flex font-segoe text-slate-800 bg-white overflow-hidden relative"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR: SYLLABUS DIRECTORY (Desktop >= 1024px)
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-80 xl:w-88 border-r border-slate-200/90 bg-white flex flex-col shrink-0 h-full select-none z-10 shadow-xs hidden lg:flex">
        
        {/* Top Header: Progress & Course Hub Deep-link */}
        <div className="p-4 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToOverview ? onBackToOverview : () => navigate('/courses/git')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Git Course Hub</span>
            </button>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              34 Lessons
            </span>
          </div>

          {/* Reading Progress Tracker (Target for Tutor Step 2) */}
          <div
            id="tutor-step-progress"
            className={`space-y-1.5 pt-0.5 rounded-xl p-1.5 transition-all ${
              activeTutorStep === 1 ? 'ring-2 ring-blue-500 bg-blue-50/60 shadow-md' : ''
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                Reading Progress
              </span>
              <span className="text-blue-600 font-mono font-black">
                {completedLessons.length} / {totalTopicsCount} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Search Input (Target for Tutor Step 1 - Positioned on side) */}
          <div
            id="tutor-step-search"
            className={`relative pt-1 rounded-xl transition-all ${
              activeTutorStep === 0 ? 'ring-2 ring-blue-500 bg-blue-50/60 p-1 shadow-md' : ''
            }`}
          >
            <Search size={13} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search topics (e.g. merge, rebase, reflog)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-700"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Tier & Topic Accordion (Target for Tutor Step 3) */}
        <div
          id="tutor-step-syllabus"
          className={`flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar transition-all ${
            activeTutorStep === 2 ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
          }`}
        >
          {GIT_CURRICULUM.map((tier) => {
            const filteredTopics = tier.topics.filter(t =>
              t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.summary.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (searchQuery && filteredTopics.length === 0) return null;

            const isExpanded = expandedTiers[tier.id] !== false || Boolean(searchQuery);
            const isTierActive = activeTierId === tier.id;
            const completedInTier = tier.topics.filter(t => completedLessons.includes(t.slug)).length;

            return (
              <div key={tier.id} className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                {/* Tier Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleTier(tier.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isTierActive
                      ? 'bg-blue-50/70 border-b border-blue-100 text-blue-950 font-black'
                      : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 font-extrabold'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                      {tier.level}
                    </span>
                    <span className="text-xs truncate">{tier.title.split(':')[0]}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {completedInTier}/{tier.topics.length}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Topics List */}
                {isExpanded && (
                  <div className="p-1 space-y-0.5 bg-white">
                    {filteredTopics.map((topic, topicIdx) => {
                      const isSelected = activeTopic.slug === topic.slug;
                      const isCompleted = completedLessons.includes(topic.slug);
                      const lessonCode = `${tier.level}.${topicIdx + 1}`;

                      return (
                        <button
                          key={topic.slug}
                          type="button"
                          onClick={() => handleSelectTopic(topic.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-black border border-blue-200 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate pr-2">
                            {isCompleted ? (
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                            ) : (
                              <span
                                className={`text-[10px] font-mono font-bold shrink-0 px-1 py-0.5 rounded ${
                                  isSelected ? 'bg-blue-200 text-blue-900 font-black' : 'text-slate-500 bg-slate-100'
                                }`}
                              >
                                {lessonCode}
                              </span>
                            )}
                            <span className="truncate">{topic.title.replace(/^\d+\.\s*/, '')}</span>
                          </div>

                          <span className="text-[10px] text-slate-400 shrink-0 font-normal">
                            {topic.readTime.replace(' read', '')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN WORKSPACE: TOP WORKSPACE BAR + SCROLLABLE LESSON READER
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-slate-50/40">
        
        {/* Sticky Workspace Top Header */}
        <header className="h-14 border-b border-slate-200 bg-white px-3 sm:px-6 flex items-center justify-between shrink-0 z-10 shadow-2xs">
          
          {/* Left: Mobile Drawer Trigger + Breadcrumbs */}
          <div className="flex items-center space-x-2 sm:space-x-3 truncate pr-2 sm:pr-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Menu size={16} />
              <span className="hidden sm:inline">Syllabus</span>
            </button>

            <nav className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-bold truncate">
              <span className="text-slate-400 hidden md:inline">Git & GitHub</span>
              <span className="text-slate-300 hidden md:inline">/</span>
              <span className="text-blue-600 shrink-0 hidden sm:inline">{activeTopic.tierBadge}</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-slate-800 font-black truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[260px] md:max-w-xs">{activeTopic.title}</span>
            </nav>
          </div>

          {/* Right: Quick Action Buttons (NO permanent Tutor Guide button) */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Mark as Completed Toggle Button (Target for Tutor Step 4) */}
            <button
              id="tutor-step-complete"
              type="button"
              onClick={() => handleToggleCompleted(activeTopic.slug)}
              className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border shrink-0 ${
                activeTutorStep === 3 ? 'ring-2 ring-blue-500 shadow-md' : ''
              } ${
                isCurrentLessonCompleted
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 font-extrabold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 border-slate-200'
              }`}
            >
              <CheckCircle2
                size={14}
                className={isCurrentLessonCompleted ? 'text-emerald-600' : 'text-slate-400'}
                strokeWidth={isCurrentLessonCompleted ? 2.5 : 2}
              />
              <span className="hidden xs:inline">{isCurrentLessonCompleted ? 'Completed' : 'Mark Completed'}</span>
              <span className="xs:hidden">{isCurrentLessonCompleted ? 'Done' : 'Mark'}</span>
            </button>

            {/* Try in Git Lab (Target for Tutor Step 5) */}
            <button
              id="tutor-step-lab"
              type="button"
              onClick={() => navigate('/practice/git/lab')}
              className={`hidden xs:inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                activeTutorStep === 4 ? 'ring-2 ring-cyan-400 shadow-md' : ''
              }`}
            >
              <Terminal size={13} className="text-cyan-400" />
              <span>Lab</span>
              <span className="hidden md:inline">Practice</span>
            </button>
          </div>
        </header>

        {/* Scrollable Lesson Article Body */}
        <div
          id="git-lesson-article-container"
          className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 custom-scrollbar"
        >
          <article className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn text-slate-900">
            
            {/* 1. TOPIC HEADER BANNER */}
            <header className="space-y-3.5 pb-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-black tracking-wide shadow-xs">
                    {activeTopic.tierBadge}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200">
                    Lesson {activeTopic.lessonCode}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    {activeTopic.readTime}
                  </span>
                  <span>•</span>
                  <span>{currentGlobalIndex} of {totalTopicsCount}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {activeTopic.title}
              </h1>

              {/* Lesson Summary Card */}
              {activeTopic.summary && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-blue-950 text-xs sm:text-sm font-medium leading-relaxed flex items-start space-x-3">
                  <Compass size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 block">
                      Lesson Objectives & Core Concept
                    </span>
                    <p>{activeTopic.summary}</p>
                  </div>
                </div>
              )}
            </header>

            {/* 2. MAIN LESSON MARKDOWN CONTENT */}
            <GitLessonContent
              markdown={activeTopic.content}
              onJumpToPractice={() => navigate('/practice/git/lab')}
            />

            {/* 3. KEY TAKEAWAYS CHECKLIST */}
            <section className="pt-6 border-t border-slate-200">
              <div className="bg-emerald-50/70 border-l-4 border-emerald-500 rounded-r-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 text-emerald-900 font-black text-sm uppercase tracking-wider">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span>Key Architectural Takeaways</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <span>Always run <code className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-1 py-0.5 rounded">git status</code> before and after state transitions to keep mental clarity.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <span>Git tracks file snapshots rather than diffs, ensuring complete cryptographic tamper resistance.</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                    <span>Commits should be atomic: one logical change per commit with conventional message formatting.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. BOTTOM LESSON NAVIGATION CONTROLS */}
            <footer className="pt-8 pb-16 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {previousTopic ? (
                  <button
                    type="button"
                    onClick={handlePreviousLesson}
                    className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center sm:justify-start gap-2 cursor-pointer shadow-xs group"
                  >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block font-normal">Previous Lesson</span>
                      <span className="text-slate-900 font-extrabold truncate max-w-[200px] block">
                        {previousTopic.title.replace(/^\d+\.\s*/, '')}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {nextTopic ? (
                  <button
                    type="button"
                    onClick={handleCompleteAndNext}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center sm:justify-end gap-2.5 cursor-pointer active:scale-95 group"
                  >
                    <div className="text-right">
                      <span className="text-[10px] text-blue-100 block font-medium">
                        {isCurrentLessonCompleted ? 'Continue Reading' : 'Mark Done & Next'}
                      </span>
                      <span className="text-white font-black truncate max-w-[220px] block">
                        {nextTopic.title.replace(/^\d+\.\s*/, '')}
                      </span>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <Trophy size={16} className="text-emerald-600" />
                    <span>Congratulations! You reached the end of the Git & GitHub curriculum!</span>
                  </div>
                )}
              </div>
            </footer>

          </article>
        </div>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          MOBILE SLIDE-OVER DRAWER (<1024px)
      ═══════════════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slideIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitBranch size={16} className="text-blue-600" />
                <span className="font-black text-sm text-slate-900">Git Syllabus</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-slate-50 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Reading Progress</span>
                <span className="text-blue-600 font-mono font-black">{completedLessons.length} / {totalTopicsCount} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Mobile Search Input */}
              <div className="relative pt-0.5">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-6 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {GIT_CURRICULUM.map((tier) => {
                const filteredTopics = tier.topics.filter(t =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.summary.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (searchQuery && filteredTopics.length === 0) return null;

                return (
                  <div key={tier.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 text-xs font-black text-slate-800 flex justify-between items-center">
                      <span>{tier.title.split(':')[0]}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {tier.topics.filter(t => completedLessons.includes(t.slug)).length}/{tier.topics.length}
                      </span>
                    </div>
                    <div className="p-1 space-y-0.5">
                      {filteredTopics.map((t, idx) => {
                        const isSel = activeTopic.slug === t.slug;
                        const isDone = completedLessons.includes(t.slug);
                        return (
                          <button
                            key={t.slug}
                            onClick={() => handleSelectTopic(t.slug)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                              isSel
                                ? 'bg-blue-50 text-blue-700 font-black'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate pr-2">{t.title}</span>
                            {isDone ? (
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">{tier.level}.{idx + 1}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FIRST-TIME USER TUTOR POPOVER (POSITIONED ON SIDE OF SEARCH / ELEMENT)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTutorStep !== null && (
        <div
          style={
            popoverPos && !popoverPos.isFallback
              ? { top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }
              : undefined
          }
          className={`fixed z-50 animate-fadeIn ${
            popoverPos && !popoverPos.isFallback
              ? 'w-[320px] sm:w-[350px]'
              : 'bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm'
          }`}
        >
          <div className="relative bg-white border-2 border-blue-500 rounded-2xl p-4 sm:p-5 shadow-[0_12px_36px_rgba(37,99,235,0.22)] space-y-3">
            
            {/* Directional Arrow pointing left towards Search/Sidebar */}
            {popoverPos && popoverPos.arrow === 'left' && (
              <div className="hidden lg:block absolute -left-2.5 top-6 w-4 h-4 bg-white border-l-2 border-b-2 border-blue-500 transform rotate-45" />
            )}

            {/* Directional Arrow pointing up towards Header Buttons */}
            {popoverPos && popoverPos.arrow === 'top' && (
              <div className="hidden lg:block absolute right-8 -top-2.5 w-4 h-4 bg-white border-l-2 border-t-2 border-blue-500 transform rotate-45" />
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  {React.createElement(TUTOR_STEPS[activeTutorStep].icon, { size: 16 })}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {TUTOR_STEPS[activeTutorStep].badge}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    {TUTOR_STEPS[activeTutorStep].title}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseTutor}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Dismiss guide"
              >
                <X size={15} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {TUTOR_STEPS[activeTutorStep].description}
            </p>

            {/* Stepper Dots & Action Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-1.5">
                {TUTOR_STEPS.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === activeTutorStep ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-1.5">
                {activeTutorStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTutorStep(prev => prev - 1)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (activeTutorStep < TUTOR_STEPS.length - 1) {
                      setActiveTutorStep(prev => prev + 1);
                    } else {
                      handleCloseTutor();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer flex items-center space-x-1"
                >
                  <span>{activeTutorStep === TUTOR_STEPS.length - 1 ? 'Got it!' : 'Next'}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
