import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Code2, CheckCircle2, Play, ArrowRight, ArrowLeft,
  Search, Copy, Check, Sparkles, Database, Table, HelpCircle,
  CheckSquare, AlertCircle, ChevronRight, ChevronDown, Layers, Award,
  RotateCcw, ShieldCheck, Clock, Lightbulb, Terminal, Flame, Star,
  Target, BookMarked, Filter, TrendingUp, Trophy, Map
} from 'lucide-react';

import { SQL_MODULES, TOTAL_MODULES_COUNT, TOTAL_TOPICS_COUNT } from '../data/sqlCurriculumData';
import { SQL_CHALLENGES } from '../data/sqlChallenges';
import { SQL_30_DAY_ROADMAP } from '../data/sqlRoadmapData';
import { SQL_INTERVIEW_PROBLEMS } from '../data/sqlInterviewData';
import { executeSqlQuery, getTablesPreview } from '../services/sqlEngine';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SqlLandingPage from './SqlLandingPage';
import SqlLearningView from './SqlLearningView';
import SqlPracticeView from './SqlPracticeView';
import SqlRoadmapView from './SqlRoadmapView';

/**
 * Rich Text & Markdown Parser
 * Parses **bold**, `code`, bullet points, and paragraphs cleanly.
 */
function RichMarkdown({ content, className = '' }) {
  if (!content) return null;

  const parseInline = (text) => {
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

  const lines = content.trim().split('\n');

  return (
    <div className={`space-y-2.5 text-slate-700 leading-relaxed font-normal ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-blue-600 font-black mt-1 text-sm">•</span>
              <span className="flex-1">{parseInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-xs sm:text-sm">
            {parseInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function SqlCourseHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { studentAccount, user } = useAuth();

  // Lightweight SQL user activity ping (at most once per browser session to eliminate server costs)
  useEffect(() => {
    const studentEmail = studentAccount?.email || user?.email;
    if (!studentEmail) return;

    try {
      const sessionKey = `msc_sql_ping_${studentEmail.toLowerCase()}`;
      const alreadyPinged = sessionStorage.getItem(sessionKey);
      if (!alreadyPinged) {
        sessionStorage.setItem(sessionKey, Date.now().toString());
        api.post('/api/analytics/sql-learner-ping', {
          studentEmail: studentEmail,
          studentName: studentAccount?.name || user?.name || studentEmail.split('@')[0],
          studentUsername: studentAccount?.username || studentEmail.split('@')[0]
        }).catch(() => {});
      }
    } catch (_) {}
  }, [studentAccount?.email, user?.email]);

  // Active Mode: 'overview' | 'learn' | 'practice' | 'roadmap' | 'interview' | 'quiz'
  const currentMode = useMemo(() => {
    if (params.tab) return params.tab;
    const path = location.pathname.toLowerCase();
    if (path.endsWith('/learn') || path === '/sql/learn' || path === '/courses/sql/learn') return 'learn';
    if (path.endsWith('/practice') || path === '/sql/practice' || path === '/courses/sql/practice') return 'practice';
    if (path.endsWith('/roadmap') || path === '/sql/roadmap' || path === '/courses/sql/roadmap') return 'roadmap';
    if (path.endsWith('/interview') || path === '/sql/interview' || path === '/courses/sql/interview') return 'interview';
    if (path.endsWith('/quiz') || path === '/sql/quiz' || path === '/courses/sql/quiz') return 'quiz';
    return searchParams.get('mode') || 'overview';
  }, [params.tab, location.pathname, searchParams]);

  // Learn Mode Navigation
  const [selectedModuleId, setSelectedModuleId] = useState('mod-01');
  const [selectedTopicId, setSelectedTopicId] = useState('top-01-01');
  const [learnSearch, setLearnSearch] = useState('');

  // Practice Mode Navigation (Defaults to null so user lands on LeetCode Problemset view)
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(null);
  const [practiceSearch, setPracticeSearch] = useState('');
  const [practiceDifficulty, setPracticeDifficulty] = useState('all');
  const [schemaViewTab, setSchemaViewTab] = useState('data'); // 'data' | 'structure'

  // Interview Mode Navigation
  const [selectedInterviewIndex, setSelectedInterviewIndex] = useState(0);
  const [interviewSearch, setInterviewSearch] = useState('');
  const [interviewDifficulty, setInterviewDifficulty] = useState('all');
  const [showInterviewSolution, setShowInterviewSolution] = useState(false);

  // Quiz Engine State
  const [quizActiveModuleId, setQuizActiveModuleId] = useState('mod-01');
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState({});

  // SQL Execution State
  const [userSql, setUserSql] = useState('');
  const [runningQuery, setRunningQuery] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [tableSchemas, setTableSchemas] = useState([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const setMode = (modeName) => {
    if (modeName === 'overview') {
      navigate('/courses/sql');
    } else if (modeName === 'learn') {
      navigate('/courses/sql/learn');
    } else if (modeName === 'practice') {
      setSelectedChallengeIndex(null);
      navigate('/courses/sql/practice');
    } else if (modeName === 'roadmap') {
      navigate('/courses/sql/roadmap');
    } else if (modeName === 'interview') {
      navigate('/courses/sql/interview');
    } else if (modeName === 'quiz') {
      navigate('/courses/sql/quiz');
    } else {
      navigate(`/courses/sql/${modeName}`);
    }
  };

  // Accordion state for modules in sidebar
  const [expandedModules, setExpandedModules] = useState(() => {
    const initial = {};
    SQL_MODULES.forEach(m => {
      initial[m.id] = m.id === 'mod-01';
    });
    return initial;
  });

  const toggleModuleAccordion = (modId, e) => {
    if (e) e.stopPropagation();
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleExpandAll = () => {
    const next = {};
    SQL_MODULES.forEach(m => { next[m.id] = true; });
    setExpandedModules(next);
  };

  const handleCollapseAll = () => {
    const next = {};
    SQL_MODULES.forEach(m => { next[m.id] = false; });
    setExpandedModules(next);
  };

  // State: Progress in localStorage
  const [completedTopics, setCompletedTopics] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_completed_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Objects
  const activeModule = useMemo(() => {
    return SQL_MODULES.find(m => m.id === selectedModuleId) || SQL_MODULES[0];
  }, [selectedModuleId]);

  const activeTopic = useMemo(() => {
    return activeModule.topics.find(t => t.id === selectedTopicId) || activeModule.topics[0];
  }, [activeModule, selectedTopicId]);

  const activeChallenge = SQL_CHALLENGES[selectedChallengeIndex] || SQL_CHALLENGES[0];
  const activeInterviewProblem = SQL_INTERVIEW_PROBLEMS[selectedInterviewIndex] || SQL_INTERVIEW_PROBLEMS[0];

const FILTERING_MODULE_QUIZ = [
  {
    question: "In SQL, what does the '%' wildcard match when using the LIKE operator?",
    options: [
      "Strictly one single character.",
      "Zero, one, or multiple characters of any type.",
      "Only numeric digits 0 through 9.",
      "Only uppercase characters."
    ],
    correctAnswer: "B",
    type: "Single Choice",
    explanation: "The '%' (percent) wildcard represents 0 or more arbitrary characters, whereas '_' represents strictly one single character."
  },
  {
    question: "Which pattern matches all employee names terminating with the letter 'a'?",
    options: ["'a%'", "'%a'", "'_a'", "'%a%'"],
    correctAnswer: "B",
    type: "Pattern Matching",
    explanation: "'%a' matches any string of characters ending strictly with 'a' (e.g. 'Priya', 'Neha', 'Ananya')."
  },
  {
    question: "Is the SQL BETWEEN operator inclusive or exclusive of its boundary values?",
    options: [
      "Exclusive of both minimum and maximum values.",
      "Inclusive of minimum, but exclusive of maximum.",
      "Inclusive of both minimum and maximum boundary values.",
      "Depends on whether collation is case-sensitive."
    ],
    correctAnswer: "C",
    type: "Range Boundaries",
    explanation: "In SQL, 'BETWEEN 40000 AND 60000' is mathematically inclusive of both limits: >= 40000 AND <= 60000."
  },
  {
    question: "Why does the query 'SELECT * FROM employees WHERE city = NULL;' fail to return rows?",
    options: [
      "Because NULL comparison using '=' evaluates to UNKNOWN under Three-Valued Logic; you must use 'IS NULL'.",
      "Because NULL can only be used on primary key columns.",
      "Because NULL is converted to empty string '' automatically.",
      "Because the query optimizer rejects NULL comparisons as syntax errors."
    ],
    correctAnswer: "A",
    type: "Three-Valued Logic",
    explanation: "Under ANSI SQL Three-Valued Logic, any equality check with NULL returns UNKNOWN. The WHERE clause only admits rows evaluating to TRUE."
  },
  {
    question: "Which query correctly finds employees whose name has 'a' as its exact second character?",
    options: [
      "SELECT * FROM employees WHERE name LIKE '%a%';",
      "SELECT * FROM employees WHERE name LIKE '_a%';",
      "SELECT * FROM employees WHERE name LIKE '__a%';",
      "SELECT * FROM employees WHERE name LIKE 'a_%';"
    ],
    correctAnswer: "B",
    type: "Wildcards",
    explanation: "'_a%' specifies precisely one character before 'a', followed by any remainder."
  },
  {
    question: "Why is 'WHERE (salary BETWEEN 40000 AND 70000) OR (salary IS NULL)' faster on large indexed tables than 'WHERE COALESCE(salary, 50000) BETWEEN 40000 AND 70000'?",
    options: [
      "Because COALESCE is deprecated in SQL.",
      "Because wrapping 'salary' in a scalar function blinds B+ Tree indexes, ruining sargability and causing full table scans.",
      "Because BETWEEN does not accept function outputs.",
      "Because IS NULL evaluates at compile time."
    ],
    correctAnswer: "B",
    type: "FAANG Sargability",
    explanation: "Wrapping indexed columns in scalar runtime functions prevents the database optimizer from performing index range scans."
  }
];

  const currentQuizQuestions = useMemo(() => {
    const mod = SQL_MODULES.find(m => m.id === quizActiveModuleId) || SQL_MODULES[0];
    if (mod?.questions && mod.questions.length > 0) return mod.questions;
    return FILTERING_MODULE_QUIZ;
  }, [quizActiveModuleId]);

  // Filtered Modules for Learn Mode
  const filteredModules = useMemo(() => {
    if (!learnSearch.trim()) return SQL_MODULES;
    const q = learnSearch.toLowerCase();
    return SQL_MODULES.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.summary?.toLowerCase().includes(q) ||
      m.topics.some(t => t.title.toLowerCase().includes(q))
    );
  }, [learnSearch]);

  // Filtered Challenges for Practice Mode
  const filteredChallenges = useMemo(() => {
    return SQL_CHALLENGES.filter((ch, idx) => {
      ch.originalIndex = idx;
      if (practiceDifficulty !== 'all' && ch.difficulty?.toLowerCase() !== practiceDifficulty.toLowerCase()) return false;
      if (practiceSearch.trim()) {
        const q = practiceSearch.toLowerCase();
        return ch.title?.toLowerCase().includes(q) || ch.moduleTitle?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [practiceDifficulty, practiceSearch]);

  // Filtered Interview Questions
  const filteredInterviews = useMemo(() => {
    return SQL_INTERVIEW_PROBLEMS.filter((p, idx) => {
      p.originalIndex = idx;
      if (interviewDifficulty !== 'all' && p.difficulty?.toLowerCase() !== interviewDifficulty.toLowerCase()) return false;
      if (interviewSearch.trim()) {
        const q = interviewSearch.toLowerCase();
        return p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.companyTags?.some(c => c.toLowerCase().includes(q));
      }
      return true;
    });
  }, [interviewDifficulty, interviewSearch]);

  // Sync Practice Challenge Code & Schemas safely
  useEffect(() => {
    if (currentMode !== 'practice' && currentMode !== 'interview') return;
    const targetObj = currentMode === 'interview' ? activeInterviewProblem : activeChallenge;
    if (!targetObj) return;

    setUserSql(targetObj.starterSql || '');
    setQueryResult(null);
    setShowHint(false);
    setShowInterviewSolution(false);

    let isMounted = true;
    setLoadingSchemas(true);
    getTablesPreview(targetObj.setupSql)
      .then(tables => {
        if (isMounted) {
          setTableSchemas(Array.isArray(tables) ? tables : []);
          setLoadingSchemas(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load table schema preview:', err);
        if (isMounted) {
          setTableSchemas([]);
          setLoadingSchemas(false);
        }
      });

    return () => { isMounted = false; };
  }, [selectedChallengeIndex, selectedInterviewIndex, currentMode, activeChallenge, activeInterviewProblem]);

  // Handlers
  const handleToggleTopic = (id) => {
    setCompletedTopics(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
      try { localStorage.setItem('msc_sql_completed_topics', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRunQuery = async () => {
    const targetObj = currentMode === 'interview' ? activeInterviewProblem : activeChallenge;
    if (runningQuery || !targetObj) return;
    setRunningQuery(true);
    try {
      const res = await executeSqlQuery(targetObj.setupSql, userSql);
      setQueryResult(res);
      if (res && res.success && currentMode === 'practice' && !solvedChallenges.includes(activeChallenge.id)) {
        const updated = [...solvedChallenges, activeChallenge.id];
        setSolvedChallenges(updated);
        try { localStorage.setItem('msc_sql_solved_challenges', JSON.stringify(updated)); } catch (_) {}
      }
    } catch (err) {
      setQueryResult({
        success: false,
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message || 'An error occurred while executing the query.'
      });
    } finally {
      setRunningQuery(false);
    }
  };

  const handleJumpToPractice = (topic) => {
    if (topic && topic.id) {
      const directMatch = SQL_CHALLENGES.findIndex(c => c.id === topic.id);
      if (directMatch !== -1) {
        setSelectedChallengeIndex(directMatch);
        setMode('practice');
        return;
      }
    }
    const matchIdx = SQL_CHALLENGES.findIndex(c => 
      c.moduleId?.includes(activeModule.id.replace('mod-', '')) || 
      c.moduleTitle?.toLowerCase().includes(activeModule.title.toLowerCase().split(' ')[0])
    );
    if (matchIdx !== -1) {
      setSelectedChallengeIndex(matchIdx);
    }
    setMode('practice');
  };

  const handleJumpToQuiz = (modId) => {
    setQuizActiveModuleId(modId || activeModule.id);
    setQuizCurrentIndex(0);
    setQuizSelectedAnswers({});
    setMode('quiz');
  };

  return (
    <div className={`bg-slate-50 text-slate-800 font-segoe w-full flex flex-col ${
      currentMode === 'learn' || currentMode === 'practice'
        ? 'h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden'
        : 'min-h-[calc(100vh-64px)]'
    }`}>
      
      {/* =========================================================================
          VIEW 1: LANDING OVERVIEW PAGE (DEFAULT VIEW - ZERO EXTRA TOP BARS!)
         ========================================================================= */}
      {currentMode === 'overview' && (
        <SqlLandingPage
          onSelectMode={setMode}
          onSelectTopic={(modId, topId) => {
            if (modId) setSelectedModuleId(modId);
            if (topId) setSelectedTopicId(topId);
            setMode('learn');
          }}
          completedTopicsCount={completedTopics.length}
          solvedChallengesCount={solvedChallenges.length}
        />
      )}

      {/* =========================================================================
          VIEW 2: ROADMAP VIEW (DEDICATED 30-DAY INTERACTIVE ROADMAP PAGE)
         ========================================================================= */}
      {currentMode === 'roadmap' && (
        <SqlRoadmapView
          onSelectTopic={(modId, topId) => {
            if (modId) setSelectedModuleId(modId);
            if (topId) setSelectedTopicId(topId);
            setMode('learn');
          }}
          onSelectMode={setMode}
          onBackToOverview={() => setMode('overview')}
          completedTopics={completedTopics}
        />
      )}

      {/* =========================================================================
          VIEW 3: LEARN TOPICS WORKSPACE (PIXEL-PERFECT STRUCTURED LEARNING VIEW)
         ========================================================================= */}
      {currentMode === 'learn' && (
        <SqlLearningView
          selectedModuleId={selectedModuleId}
          setSelectedModuleId={setSelectedModuleId}
          selectedTopicId={selectedTopicId}
          setSelectedTopicId={setSelectedTopicId}
          completedTopics={completedTopics}
          onToggleCompleted={handleToggleTopic}
          onJumpToPractice={handleJumpToPractice}
          onBackToOverview={() => setMode('overview')}
        />
      )}

      {/* =========================================================================
          5. VIEW 4: PRACTICE LAB (CHALLENGES WORKSPACE)
         ========================================================================= */}
      {currentMode === 'practice' && (
        <SqlPracticeView
          onJumpToLearn={() => setMode('learn')}
          initialChallengeIndex={selectedChallengeIndex}
        />
      )}

      {/* =========================================================================
          6. VIEW 5: INTERVIEW QUESTIONS & PROBLEMS WORKSPACE
         ========================================================================= */}
      {currentMode === 'interview' && (
        <div className="flex-1 flex w-full relative">
          <aside className="w-80 xl:w-96 shrink-0 bg-white border-r border-slate-200 sticky top-[108px] h-[calc(100vh-108px)] overflow-y-auto z-20 flex flex-col shadow-2xs">
            <div className="p-3.5 space-y-3 flex-1 flex flex-col">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Interview Bank ({SQL_INTERVIEW_PROBLEMS.length})
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">Top Tech Companies</span>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={interviewSearch}
                    onChange={(e) => setInterviewSearch(e.target.value)}
                    placeholder="Search interview questions..."
                    style={{ paddingLeft: '34px', paddingRight: '12px' }}
                    className="w-full py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center space-x-1">
                  {['all', 'intermediate', 'advanced'].map(d => (
                    <button
                      key={d}
                      onClick={() => setInterviewDifficulty(d)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        interviewDifficulty === d
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 flex-1 overflow-y-auto border border-slate-200/80 rounded-xl">
                {filteredInterviews.map((prob) => {
                  const isSelected = prob.originalIndex === selectedInterviewIndex;

                  return (
                    <button
                      key={prob.id}
                      onClick={() => setSelectedInterviewIndex(prob.originalIndex)}
                      className={`w-full text-left p-3 flex items-center justify-between transition-all cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prob.originalIndex + 1}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">#{prob.originalIndex + 1}: {prob.title}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{prob.difficulty} • {prob.companyTags?.slice(0, 2).join(', ')}</div>
                        </div>
                      </div>

                      <ChevronRight size={13} className={`text-slate-400 shrink-0 ${isSelected ? 'text-blue-600' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MAIN INTERVIEW LAB */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full items-start">
              
              <div className="xl:col-span-5 space-y-4 w-full">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex flex-wrap gap-1.5 items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-md">
                      {activeInterviewProblem?.difficulty} • {activeInterviewProblem?.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Freq: {activeInterviewProblem?.frequency}
                    </span>
                  </div>

                  {activeInterviewProblem?.companyTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeInterviewProblem.companyTags.map((comp, cIdx) => (
                        <span key={cIdx} className="bg-blue-50 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200">
                          {comp}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {activeInterviewProblem?.title}
                  </h2>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                    <RichMarkdown content={activeInterviewProblem?.description} />
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setShowInterviewSolution(prev => !prev)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>{showInterviewSolution ? 'Hide Model Solution & Tips' : 'Reveal Expected Solution & Tips'}</span>
                    </button>

                    {showInterviewSolution && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 font-mono text-xs shadow-2xs">
                        <div className="text-[11px] font-bold text-emerald-700 font-sans uppercase">Expected Query Solution:</div>
                        <pre className="bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto text-blue-700 font-bold">
                          {activeInterviewProblem?.expectedSql}
                        </pre>
                        {activeInterviewProblem?.tips && (
                          <div className="pt-2 border-t border-slate-200 text-slate-700 text-[11px] font-sans">
                            <strong className="text-amber-800">Interview Tip:</strong> {activeInterviewProblem.tips}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="xl:col-span-7 space-y-4 w-full">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Terminal size={14} className="text-slate-600" />
                      <span className="text-xs font-black text-slate-700 font-mono">Live Interview Solution Workspace</span>
                    </div>
                    
                    <button
                      onClick={handleRunQuery}
                      disabled={runningQuery}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Play size={12} className="fill-white" />
                      <span>{runningQuery ? 'Running...' : 'Run Query'}</span>
                    </button>
                  </div>

                  <textarea
                    value={userSql}
                    onChange={(e) => setUserSql(e.target.value)}
                    rows={9}
                    className="w-full bg-white text-slate-900 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y border-none font-semibold leading-relaxed"
                    placeholder="-- Write interview SQL solution..."
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-slate-700">Query Output</div>
                  {queryResult ? (
                    queryResult.success ? (
                      <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl bg-white">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-800">
                            <tr>
                              {(queryResult.columns || []).map((col, idx) => (
                                <th key={idx} className="px-3 py-2 border-r border-slate-100 last:border-r-0 whitespace-nowrap">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {(queryResult.values || []).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70">
                                {Array.isArray(row) ? row.map((val, cIdx) => (
                                  <td key={cIdx} className="px-3 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-medium">
                                    {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                  </td>
                                )) : <td className="px-3 py-1.5">{String(row)}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 font-mono">
                        {queryResult.error}
                      </div>
                    )
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 font-medium">
                      Press "Run Query" to verify your SQL logic against sample interview schemas.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          7. VIEW 6: TOPIC QUIZZES WORKSPACE
         ========================================================================= */}
      {currentMode === 'quiz' && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 w-full">
            {currentQuizQuestions.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-10">No questions available for this module yet.</div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-extrabold text-blue-600">
                    Module {activeModule.number} Quiz • Question {quizCurrentIndex + 1} of {currentQuizQuestions.length}
                  </span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 font-extrabold px-2.5 py-0.5 rounded-md">
                    {currentQuizQuestions[quizCurrentIndex]?.type || 'Question'}
                  </span>
                </div>

                <div className="text-base sm:text-lg font-black text-slate-900 leading-snug whitespace-pre-line">
                  {currentQuizQuestions[quizCurrentIndex]?.question}
                </div>

                <div className="space-y-2.5">
                  {(currentQuizQuestions[quizCurrentIndex]?.options || []).map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = quizSelectedAnswers[quizCurrentIndex] === letter;
                    const isCorrect = currentQuizQuestions[quizCurrentIndex]?.correctAnswer === letter;
                    const answered = Boolean(quizSelectedAnswers[quizCurrentIndex]);

                    let cardStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                    if (answered) {
                      if (isCorrect) cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      else if (isSelected) cardStyle = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                    } else if (isSelected) {
                      cardStyle = 'border-blue-600 bg-blue-50 text-blue-950 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => {
                          setQuizSelectedAnswers(prev => ({ ...prev, [quizCurrentIndex]: letter }));
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${cardStyle}`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                          answered && isCorrect
                            ? 'bg-emerald-600 text-white'
                            : answered && isSelected && !isCorrect
                            ? 'bg-rose-600 text-white'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold pt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {quizSelectedAnswers[quizCurrentIndex] && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-1">
                    <div className="text-xs font-extrabold text-blue-900 uppercase">
                      Explanation (Correct Answer: {currentQuizQuestions[quizCurrentIndex]?.correctAnswer})
                    </div>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed">
                      {currentQuizQuestions[quizCurrentIndex]?.explanation}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    disabled={quizCurrentIndex === 0}
                    onClick={() => setQuizCurrentIndex(prev => prev - 1)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>

                  <button
                    disabled={quizCurrentIndex === currentQuizQuestions.length - 1}
                    onClick={() => setQuizCurrentIndex(prev => prev + 1)}
                    className="px-4 py-1.5 rounded-lg text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next Question
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
