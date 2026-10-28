import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Database, Play, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft,
  BookOpen, Code2, Trophy, ListOrdered, Table, Layers, Clock, Eye,
  HelpCircle, Share2, Award, Check, ExternalLink, Zap, Sun, Moon,
  Plus, Edit, Trash2, ShieldCheck, UserCheck, Search, ChevronDown, X
} from 'lucide-react';
import { SQL_CHALLENGES, getStoredCustomChallenges, deleteCustomChallenge, slugifyTitle, getChallengeSlug } from '../data/sqlChallenges';
import { executeSqlQuery, validateSqlQuery, getTablesPreview } from '../services/sqlEngine';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminSqlModal from '../components/AdminSqlModal';
import ProblemStatementView from '../components/ProblemStatementView';
import { getDifficultyTheme } from '../utils/difficulty';
import LabSettingsDropdown, { getSavedSettings } from '../components/LabSettingsDropdown';
import SqlLeaderboardModal from '../components/SqlLeaderboardModal';
import { getSqlChallengePoints } from './SqlPracticeView';

export default function SqlPractice() {
  const navigate = useNavigate();
  const { challengeId } = useParams();
  const { user, studentAccount } = useAuth();
  // Strictly authenticated Administrator check
  const isAdmin = Boolean(user && user.role === 'admin' && localStorage.getItem('msc_quiz_token') && !studentAccount);

  // Light / Dark Theme toggle (Default is false = LIGHT THEME)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('msc_sql_theme');
      return savedTheme === 'dark'; // Defaults to false (Light Theme)
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('msc_sql_theme', next ? 'dark' : 'light');
      } catch (_) {}
      return next;
    });
  };

  // Admin Custom Challenges State
  const [customChallenges, setCustomChallenges] = useState(() => getStoredCustomChallenges());
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  // Combine built-in + admin custom challenges
  const allChallenges = useMemo(() => {
    return [...SQL_CHALLENGES, ...customChallenges];
  }, [customChallenges]);

  // Find active challenge based on URL slug, legacy id, or default to first
  const activeChallenge = useMemo(() => {
    if (challengeId) {
      const found = allChallenges.find(c => 
        c.slug === challengeId || 
        c.id === challengeId ||
        slugifyTitle(c.title) === challengeId
      );
      if (found) return found;
    }
    return allChallenges[0] || SQL_CHALLENGES[0];
  }, [challengeId, allChallenges]);

  const selectedChallengeIndex = useMemo(() => {
    const idx = allChallenges.findIndex(c => c.id === activeChallenge?.id);
    return idx !== -1 ? idx : 0;
  }, [allChallenges, activeChallenge]);

  const nextChallenge = allChallenges[selectedChallengeIndex + 1] || null;
  const prevChallenge = allChallenges[selectedChallengeIndex - 1] || null;

  // Auto-redirect /practice/sql/lab or old id URL to proper heading-slug URL
  useEffect(() => {
    if (activeChallenge) {
      const targetSlug = getChallengeSlug(activeChallenge);
      if (challengeId !== targetSlug) {
        navigate(`/practice/sql/${targetSlug}`, { replace: true });
      }
    }
  }, [challengeId, activeChallenge, navigate]);

  // User query code state
  const [userQuery, setUserQuery] = useState(activeChallenge?.starterSql || '');
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'schema' | 'solution'
  const [activeConsoleTab, setActiveConsoleTab] = useState('output'); // 'output' | 'expected'
  const [labSettings, setLabSettings] = useState(() => getSavedSettings());

  // Automatically switch away from solution tab if disabled in settings
  useEffect(() => {
    if (!labSettings.showCheatSheet && activeTab === 'solution') {
      setActiveTab('problem');
    }
  }, [labSettings, activeTab]);

  // Solved challenges stored in localStorage
  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_solved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Drawer Search & Track Filter State
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerTrack, setDrawerTrack] = useState('all'); // 'all' | 'filtering' | 'ddl' | 'dml' | 'solved'

  // Dynamic track counts
  const filteringCount = useMemo(() => allChallenges.filter(c => c.id?.startsWith('filt-') || c.moduleId?.startsWith('filt-')).length, [allChallenges]);
  const ddlCount = useMemo(() => allChallenges.filter(c => c.id?.startsWith('ddl-') || c.moduleId?.startsWith('ddl-')).length, [allChallenges]);
  const dmlCount = useMemo(() => allChallenges.filter(c => c.id?.startsWith('dml-') || c.moduleId?.startsWith('dml-')).length, [allChallenges]);
  const insertCount = useMemo(() => allChallenges.filter(c => c.id?.startsWith('insert-') || c.moduleId?.includes('day5')).length, [allChallenges]);

  // Filtered challenges for drawer
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter(ch => {
      const isFilt = ch.id?.startsWith('filt-') || ch.moduleId?.startsWith('filt-');
      const isDdl = ch.id?.startsWith('ddl-') || ch.moduleId?.startsWith('ddl-');
      const isDml = ch.id?.startsWith('dml-') || ch.moduleId?.startsWith('dml-');
      const isInsert = ch.id?.startsWith('insert-') || ch.moduleId?.includes('day5');

      if (drawerTrack === 'filtering' && !isFilt) return false;
      if (drawerTrack === 'ddl' && !isDdl) return false;
      if (drawerTrack === 'dml' && !isDml) return false;
      if (drawerTrack === 'insert' && !isInsert) return false;
      if (drawerTrack === 'solved' && !solvedChallenges.includes(ch.id)) return false;

      if (drawerSearch.trim()) {
        const q = drawerSearch.toLowerCase();
        const matchTitle = ch.title?.toLowerCase().includes(q);
        const matchModule = ch.moduleTitle?.toLowerCase().includes(q);
        const matchTag = ch.tags?.some(t => t.toLowerCase().includes(q));
        const matchId = ch.id?.toLowerCase().includes(q);
        return matchTitle || matchModule || matchTag || matchId;
      }
      return true;
    });
  }, [allChallenges, drawerTrack, drawerSearch, solvedChallenges]);

  // Execution & Validation state
  const [running, setRunning] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [schemaPreviews, setSchemaPreviews] = useState([]);
  const [loadingSchema, setLoadingSchema] = useState(false);

  // Hints & solution reveals
  const [revealedHints, setRevealedHints] = useState({});
  const [solutionRevealed, setSolutionRevealed] = useState(false);

  // Persistent hint viewing tracking { [challengeId]: true }
  const [viewedHints, setViewedHints] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_viewed_hints');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Solved details breakdown { [challengeId]: { difficulty, isClean, points, solvedAt } }
  const [solvedDetails, setSolvedDetails] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_solved_details');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Cumulative SQL points
  const [sqlPoints, setSqlPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_points');
      if (saved) return Number(saved);
      const details = localStorage.getItem('msc_sql_solved_details');
      if (details) {
        const parsed = JSON.parse(details);
        return Object.values(parsed).reduce((acc, c) => acc + (Number(c.points) || 0), 0);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  // Sync initial student rank from backend leaderboard
  useEffect(() => {
    const email = studentAccount?.email || user?.email;
    if (!email) return;

    api.get('/api/analytics/sql/leaderboard', {
      params: { currentEmail: email, limit: 1 }
    }).then(res => {
      if (res.data?.currentUserStats) {
        if (res.data.currentUserStats.rank) setLeaderboardRank(res.data.currentUserStats.rank);
        if (res.data.currentUserStats.totalPoints && res.data.currentUserStats.totalPoints > sqlPoints) {
          setSqlPoints(res.data.currentUserStats.totalPoints);
          try { localStorage.setItem('msc_sql_points', res.data.currentUserStats.totalPoints.toString()); } catch (_) {}
        }
      }
    }).catch(() => {});
  }, [studentAccount?.email, user?.email]);

  const markHintViewed = (cId) => {
    if (!cId) return;
    setViewedHints(prev => {
      const next = { ...prev, [cId]: true };
      try { localStorage.setItem('msc_sql_viewed_hints', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  // Drawer / Problem list state
  const [showDrawer, setShowDrawer] = useState(false);

  // Responsive Desktop detection
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile View Switcher: 'problem' | 'editor'
  const [mobileView, setMobileView] = useState('problem');

  // Splitter: Left pane width percentage (default 42%, min 20%, max 75%)
  const workspaceRef = useRef(null);
  const rightPaneRef = useRef(null);
  const [leftWidthPercent, setLeftWidthPercent] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_splitter_width');
      return saved ? parseFloat(saved) : 42;
    } catch {
      return 42;
    }
  });
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);

  // Splitter: Editor height percentage (default 52%, min 20%, max 80%)
  const [editorHeightPercent, setEditorHeightPercent] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_editor_height_percent');
      return saved ? parseFloat(saved) : 52;
    } catch {
      return 52;
    }
  });
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);

  const latestLeftWidthRef = useRef(leftWidthPercent);
  latestLeftWidthRef.current = leftWidthPercent;

  const latestEditorHeightRef = useRef(editorHeightPercent);
  latestEditorHeightRef.current = editorHeightPercent;

  // Dragging logic for Horizontal Splitter (Left vs Right Pane Width)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingHorizontal || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(20, Math.min(80, rawPercent));
      latestLeftWidthRef.current = clamped;
      setLeftWidthPercent(clamped);
    };

    const handleMouseUp = () => {
      if (isDraggingHorizontal) {
        setIsDraggingHorizontal(false);
        try {
          localStorage.setItem('msc_sql_splitter_width', latestLeftWidthRef.current.toString());
        } catch (_) {}
      }
    };

    if (isDraggingHorizontal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingHorizontal]);

  // Dragging logic for Vertical Splitter (Editor vs Console Height)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVertical || !rightPaneRef.current) return;
      const rect = rightPaneRef.current.getBoundingClientRect();
      const rawPercent = ((e.clientY - rect.top) / rect.height) * 100;
      const clamped = Math.max(20, Math.min(80, rawPercent));
      latestEditorHeightRef.current = clamped;
      setEditorHeightPercent(clamped);
    };

    const handleMouseUp = () => {
      if (isDraggingVertical) {
        setIsDraggingVertical(false);
        try {
          localStorage.setItem('msc_sql_editor_height_percent', latestEditorHeightRef.current.toString());
        } catch (_) {}
      }
    };

    if (isDraggingVertical) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingVertical]);

  const isCurrentSolved = solvedChallenges.includes(activeChallenge?.id);

  // Refresh and load starter code when active challenge changes
  useEffect(() => {
    if (!activeChallenge) return;
    setUserQuery(activeChallenge.starterSql || '');
    setQueryResult(null);
    setValidationResult(null);
    setRevealedHints({});
    setSolutionRevealed(false);
    setActiveConsoleTab('output');

    let isMounted = true;
    setLoadingSchema(true);
    getTablesPreview(activeChallenge.setupSql).then(previews => {
      if (isMounted) {
        setSchemaPreviews(previews);
        setLoadingSchema(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeChallenge?.id]);

  // Handle Ctrl+Enter shortcut to run query
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunQuery();
    }
  };

  // Run Query (Preview output)
  const handleRunQuery = async () => {
    if (running || evaluating || !activeChallenge) return;
    setRunning(true);
    setActiveConsoleTab('output');
    if (!isDesktop) setMobileView('console');
    try {
      const result = await executeSqlQuery(activeChallenge.setupSql, userQuery);
      setQueryResult(result);
      // Zero server cost: Execution runs 100% locally in browser WebAssembly
    } catch (err) {
      setQueryResult({
        success: false,
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message
      });
    } finally {
      setRunning(false);
    }
  };

  // Submit Solution (Validation against canonical expected SQL)
  const handleValidateSolution = async () => {
    if (running || evaluating || !activeChallenge) return;
    setEvaluating(true);
    setActiveConsoleTab('output');
    if (!isDesktop) setMobileView('console');
    try {
      const valRes = await validateSqlQuery(
        activeChallenge.setupSql,
        userQuery,
        activeChallenge.expectedSql,
        activeChallenge.checkOrder
      );
      setValidationResult(valRes);
      setQueryResult(valRes.userResult);

      if (valRes.passed) {
        const isClean = !viewedHints[activeChallenge.id] && !solutionRevealed;
        const pts = getSqlChallengePoints(activeChallenge.difficulty, isClean);

        const updated = solvedChallenges.includes(activeChallenge.id)
          ? solvedChallenges
          : [...solvedChallenges, activeChallenge.id];

        setSolvedChallenges(updated);
        try {
          localStorage.setItem('msc_sql_solved', JSON.stringify(updated));
        } catch (_) {}

        // Record solved details
        const existingDetail = solvedDetails[activeChallenge.id];
        const nextDetails = {
          ...solvedDetails,
          [activeChallenge.id]: {
            difficulty: activeChallenge.difficulty || 'Easy',
            isClean: existingDetail?.isClean ? true : isClean,
            points: Math.max(existingDetail?.points || 0, pts.totalPoints),
            solvedAt: new Date().toISOString()
          }
        };
        setSolvedDetails(nextDetails);
        try {
          localStorage.setItem('msc_sql_solved_details', JSON.stringify(nextDetails));
        } catch (_) {}

        const nextTotal = Object.values(nextDetails).reduce(
          (acc, c) => acc + (Number(c.points) || 0), 0
        );
        setSqlPoints(nextTotal);
        try {
          localStorage.setItem('msc_sql_points', nextTotal.toString());
        } catch (_) {}

        // Sync with backend SQL Leaderboard
        const userEmail = studentAccount?.email || user?.email;
        const userName = studentAccount?.name || user?.name || (userEmail ? userEmail.split('@')[0] : 'Learner');
        const userUsername = studentAccount?.username || user?.username || (userEmail ? userEmail.split('@')[0] : 'learner');

        if (userEmail) {
          api.post('/api/analytics/sql/record-solve', {
            studentEmail: userEmail,
            studentName: userName,
            studentUsername: userUsername,
            challengeId: activeChallenge.id,
            difficulty: activeChallenge.difficulty,
            cleanSolve: isClean,
            points: pts.totalPoints
          }).then(res => {
            if (res.data?.rank) setLeaderboardRank(res.data.rank);
            if (res.data?.totalPoints) setSqlPoints(res.data.totalPoints);
          }).catch(() => {});

          // Record course completion eligibility
          if (updated.length >= 10) {
            api.post('/api/student/record-course-completion', {
              email: userEmail,
              name: userName,
              username: userUsername,
              courseTitle: 'SQL Mastery & Advanced Relational Database Systems',
              score: Math.min(100, Math.round((updated.length / allChallenges.length) * 100)),
              challengesSolved: updated.length
            }).catch(() => {});
          }
        }
      }
      // Zero server cost: Validation runs 100% locally in browser WebAssembly
    } catch (err) {
      setValidationResult({
        passed: false,
        message: err.message
      });
    } finally {
      setEvaluating(false);
    }
  };

  // Format SQL keywords to uppercase
  const handleFormatSql = () => {
    if (!userQuery) return;
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN',
      'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'DISTINCT',
      'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'LIKE', 'BETWEEN', 'UNION',
      'ALL', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];
    let formatted = userQuery;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    setUserQuery(formatted);
  };

  // Reset to starter query
  const handleResetQuery = () => {
    if (!activeChallenge) return;
    setUserQuery(activeChallenge.starterSql || '');
    setQueryResult(null);
    setValidationResult(null);
  };

  const handleNextChallenge = () => {
    if (nextChallenge) {
      navigate(`/practice/sql/${getChallengeSlug(nextChallenge)}`);
    }
  };

  const handlePrevChallenge = () => {
    if (prevChallenge) {
      navigate(`/practice/sql/${getChallengeSlug(prevChallenge)}`);
    }
  };

  // Handle Admin Custom Challenge saved
  const handleCustomChallengeSaved = (savedCh) => {
    const updated = getStoredCustomChallenges();
    setCustomChallenges(updated);
    if (savedCh) {
      navigate(`/practice/sql/${getChallengeSlug(savedCh)}`);
    }
  };

  // Handle Admin Challenge Delete
  const handleDeleteCustomChallenge = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom SQL challenge?')) {
      const updated = deleteCustomChallenge(id);
      setCustomChallenges(updated);
      const remaining = [...SQL_CHALLENGES, ...updated];
      if (remaining.length > 0) {
        navigate(`/practice/sql/${getChallengeSlug(remaining[0])}`);
      }
    }
  };

  return (
    <div className={`h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col font-segoe select-text overflow-hidden transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* Top Utility Header Bar */}
      <header className={`h-11 sm:h-12 border-b px-2.5 sm:px-4 md:px-6 flex items-center justify-between z-20 shrink-0 backdrop-blur-md transition-colors ${
        isDarkMode 
          ? 'bg-slate-950/90 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-hidden min-w-0">
          <button
            onClick={() => navigate('/courses')}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Back to Courses"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={`h-4 w-px shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          {/* Problem Selector (Clean Unboxed Title) */}
          <button
            onClick={() => setShowDrawer(true)}
            className={`flex items-center space-x-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer truncate max-w-[125px] xs:max-w-[170px] sm:max-w-xs md:max-w-md py-1 ${
              isDarkMode 
                ? 'text-slate-200 hover:text-blue-400' 
                : 'text-slate-900 hover:text-blue-600'
            }`}
            title="Browse all SQL questions"
          >
            <span className="truncate">
              {selectedChallengeIndex + 1}. {activeChallenge?.title}
            </span>
            <ChevronDown size={13} className="text-slate-400 shrink-0" />
          </button>

          {/* Difficulty (Clean Unboxed without dot) */}
          {(() => {
            const diffTheme = getDifficultyTheme(activeChallenge?.difficulty);
            return (
              <div className="hidden md:flex items-center text-xs font-semibold shrink-0">
                <span className={diffTheme.text}>{diffTheme.label}</span>
              </div>
            );
          })()}

          {/* Solved Status (Clean Unboxed) */}
          {isCurrentSolved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="hidden sm:inline">Solved</span>
            </span>
          )}

            {/* Custom Admin Added Badge (Clean Unboxed) */}
            {activeChallenge?.isAdminCustom && (
              <span className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-purple-600 shrink-0">
                <ShieldCheck size={12} />
                <span>Admin</span>
              </span>
            )}
          </div>

          {/* Right Header Navigation & Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Admin "+ Add Question" Button - strictly for Admins */}
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingChallenge(null);
                  setShowAdminModal(true);
                }}
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                title="Admin: Create Custom SQL Question & Answer"
              >
                <Plus size={13} />
                <span className="hidden sm:inline">Add Question</span>
              </button>
            )}

          {/* Solved Stats Counter (Clean Unboxed Typography) */}
          <div className={`hidden lg:flex items-center space-x-1.5 text-xs font-medium ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <Trophy size={13} className="text-amber-500" />
            <span>Progress:</span>
            <span className={`font-mono font-bold ${isDarkMode ? 'text-blue-400' : 'text-slate-900'}`}>{solvedChallenges.length}</span>
            <span className="text-slate-400">/</span>
            <span className="font-mono">{allChallenges.length}</span>
          </div>

          {/* Mode Switcher to DBMS Theory Quiz (Unboxed ghost button) */}
          <button
            onClick={() => navigate('/practice/dbms')}
            className={`hidden sm:flex items-center space-x-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Switch to 10-Minute DBMS Theory MCQ Exam"
          >
            <BookOpen size={13} className="text-indigo-500" />
            <span>Theory Quiz</span>
          </button>

          {/* Light / Dark Theme Switcher (Ghost button) */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDarkMode 
                ? 'text-amber-400 hover:bg-slate-800' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Lab Settings (Hide hints, tags, explanations, etc.) */}
          <LabSettingsDropdown
            settings={labSettings}
            onSettingsChange={setLabSettings}
            isDarkMode={isDarkMode}
          />

          <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          {/* Prev / Next Buttons (Ghost buttons) */}
          <div className="flex items-center space-x-0.5">
            <button
              onClick={handlePrevChallenge}
              disabled={!prevChallenge}
              className={`p-1.5 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={prevChallenge ? `Previous: ${prevChallenge.title}` : 'First Question'}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextChallenge}
              disabled={!nextChallenge}
              className={`p-1.5 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={nextChallenge ? `Next: ${nextChallenge.title}` : 'Last Question'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile View Switcher (Only visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-2 py-1.5 shrink-0 select-none">
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold w-full">
          <button
            onClick={() => setMobileView('problem')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap ${
              mobileView === 'problem'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <BookOpen size={13} />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap ${
              mobileView === 'editor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Code2 size={13} />
            <span>SQL Editor</span>
          </button>
          <button
            onClick={() => setMobileView('console')}
            className={`flex-1 h-8 px-2 rounded-md transition-all inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap relative ${
              mobileView === 'console'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Table size={13} />
            <span>Console</span>
            {validationResult ? (
              <span className={`w-2 h-2 rounded-full ${validationResult.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            ) : queryResult ? (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            ) : null}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Two-Pane Split with Draggable Divider) */}
      <div 
        ref={workspaceRef} 
        className={`flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative w-full h-full ${
          isDraggingHorizontal || isDraggingVertical ? 'select-none' : ''
        }`}
      >
        
        {/* Left Pane: Problem Context, Schema Explorer, Hints, Explanation */}
        <div 
          style={{ width: isDesktop ? `${leftWidthPercent}%` : '100%' }}
          className={`${
            !isDesktop && mobileView !== 'problem' ? 'hidden' : 'flex'
          } w-full flex-col border-r overflow-hidden shrink-0 transition-colors h-full rounded-none ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          
          {/* Left Panel Tabs */}
          <div className={`flex items-center border-b px-4 pt-2 gap-2 text-xs font-extrabold shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <button
              onClick={() => setActiveTab('problem')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'problem'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen size={13} />
              <span>Problem</span>
            </button>

            <button
              onClick={() => setActiveTab('schema')}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'schema'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table size={13} />
              <span>Database Schema ({schemaPreviews.length})</span>
            </button>

            {labSettings.showCheatSheet && (
              <button
                onClick={() => setActiveTab('solution')}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeTab === 'solution'
                    ? 'border-blue-600 text-blue-600'
                    : isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lightbulb size={13} />
                <span>Explanation</span>
              </button>
            )}
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 text-sm">
            
            {/* Tab: Problem Description */}
            {activeTab === 'problem' && (
              <div className="space-y-6">
                {/* Rich Structured Problem Statement Component */}
                <ProblemStatementView challenge={activeChallenge} isDarkMode={isDarkMode} showTags={labSettings.showTags} />

                {/* Interactive Schema Quick Preview */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <Layers size={13} className="text-blue-600" />
                      <span>Available Tables</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('schema')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Inspect Full Tables &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {schemaPreviews.map((table, idx) => (
                      <div key={idx} className={`border rounded-xl p-3 space-y-1.5 ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/90'
                      }`}>
                        <div className="flex items-center space-x-1.5 font-mono font-bold text-xs text-blue-700">
                          <Table size={12} className="text-blue-600" />
                          <span>{table.tableName}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {table.columns.map((col, cIdx) => (
                            <span key={cIdx} className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white border border-slate-200 text-slate-600'
                            }`}>
                              {col.name} {col.isPk && '🔑'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progressive Hints Accordion */}
                {labSettings.showHints && activeChallenge?.hints && activeChallenge.hints.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <Lightbulb size={13} className="text-amber-500" />
                        <span>Hints ({activeChallenge.hints.length})</span>
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        viewedHints[activeChallenge.id]
                          ? isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                          : isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {viewedHints[activeChallenge.id] ? 'Hints Used (0 Leaderboard Pts)' : `No-Hint Mode (+${getSqlChallengePoints(activeChallenge?.difficulty, true).basePoints} pt)`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeChallenge.hints.map((hint, idx) => {
                        const isRevealed = revealedHints[idx];
                        return (
                          <div key={idx} className={`border rounded-xl overflow-hidden ${
                            isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
                          }`}>
                            <button
                              onClick={() => {
                                setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }));
                                markHintViewed(activeChallenge.id);
                              }}
                              className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-colors text-left cursor-pointer ${
                                isDarkMode ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-mono font-bold">
                                  {idx + 1}
                                </span>
                                <span>Hint #{idx + 1}</span>
                              </span>
                              <span className="text-[11px] text-blue-600 font-semibold">
                                {isRevealed ? 'Hide' : 'Reveal'}
                              </span>
                            </button>
                            {isRevealed && (
                              <div className={`p-3 border-t text-xs leading-relaxed font-mono ${
                                isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}>
                                {hint}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Schema Explorer */}
            {activeTab === 'schema' && (
              <div className="space-y-6">
                <div>
                  <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    <Database size={16} className="text-blue-600" />
                    <span>Relational Database Schema</span>
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Inspect table definitions, column types, and sample data for this challenge.
                  </p>
                </div>

                {loadingSchema ? (
                  <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
                    Loading database tables...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {schemaPreviews.map((table, idx) => (
                      <div key={idx} className={`border rounded-2xl overflow-hidden shadow-2xs ${
                        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
                          isDarkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-100/80 border-slate-200'
                        }`}>
                          <span className="font-mono font-bold text-xs text-blue-700 flex items-center gap-1.5">
                            <Table size={13} className="text-blue-600" />
                            <span>{table.tableName}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {table.sampleRows.length} sample rows shown
                          </span>
                        </div>

                        {/* Columns Schema */}
                        <div className={`p-3 border-b ${
                          isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/60'
                        }`}>
                          <div className="text-[10px] uppercase font-bold text-slate-500 mb-1.5">Column Definitions:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {table.columns.map((col, cIdx) => (
                              <span key={cIdx} className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                                isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
                              }`}>
                                <span className="font-bold">{col.name}</span>
                                <span className="text-slate-400 ml-1">({col.type || 'TEXT'})</span>
                                {col.isPk && <span className="text-amber-600 ml-1 font-sans text-[10px]">🔑 PK</span>}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Sample Rows Data Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className={`text-[10px] uppercase border-b ${
                              isDarkMode ? 'bg-slate-950/60 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              <tr>
                                {table.columns.map((col, cIdx) => (
                                  <th key={cIdx} className="px-3 py-2 whitespace-nowrap">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                              {table.sampleRows.map((row, rIdx) => (
                                <tr key={rIdx} className={isDarkMode ? 'hover:bg-slate-800/40 text-slate-300' : 'hover:bg-slate-50 text-slate-800'}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="px-3 py-1.5 whitespace-nowrap">
                                      {cell === null ? <span className="text-slate-400 italic">NULL</span> : String(cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Solution & Educational Breakdown */}
            {activeTab === 'solution' && (
              <div className="space-y-5">
                <div>
                  <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                    isDarkMode ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    <Lightbulb size={16} className="text-amber-500" />
                    <span>Optimal Query & Explanation</span>
                  </h3>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Study the query architecture and why this approach is ideal for technical interviews.
                  </p>
                </div>

                {!solutionRevealed && !isCurrentSolved ? (
                  <div className={`border rounded-2xl p-6 text-center space-y-3 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Try solving the query independently first! If you get stuck, you can reveal the official solution.
                    </p>
                    <button
                      onClick={() => {
                        setSolutionRevealed(true);
                        markHintViewed(activeChallenge.id);
                      }}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                    >
                      Reveal Solution Query
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`border rounded-2xl p-4 space-y-2 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Canonical SQL Solution:</div>
                      <pre className={`p-3 rounded-xl font-mono text-xs overflow-x-auto border ${
                        isDarkMode ? 'bg-slate-950 text-emerald-400 border-slate-800' : 'bg-white text-emerald-700 border-slate-200'
                      }`}>
                        {activeChallenge?.expectedSql?.trim()}
                      </pre>
                    </div>

                    <div className={`border rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <div className="font-bold">How it works:</div>
                      <p>{activeChallenge?.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Open Editor Quick Action */}
            {!isDesktop && (
              <div className="pt-2 pb-6">
                <button
                  onClick={() => setMobileView('editor')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Code2 size={14} />
                  <span>Open SQL Editor & Run Query →</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP DRAGGABLE VERTICAL DIVIDER (Resizes Left vs Right Width) ── */}
        <div
          onMouseDown={() => setIsDraggingHorizontal(true)}
          className={`hidden lg:flex w-1.5 hover:w-2 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 active:bg-blue-600 cursor-col-resize select-none transition-all relative items-center justify-center shrink-0 z-20 group ${
            isDraggingHorizontal ? 'bg-blue-600 w-2' : ''
          }`}
          title="Drag left or right to adjust pane widths"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
        </div>

        {/* Right Pane: Code Editor + Execution Console */}
        <div 
          ref={rightPaneRef}
          style={{ width: isDesktop ? `${100 - leftWidthPercent}%` : '100%' }}
          className={`${
            !isDesktop && mobileView === 'problem' ? 'hidden' : 'flex'
          } flex-1 flex-col overflow-hidden min-w-0 h-full rounded-none transition-colors ${
            isDarkMode ? 'bg-slate-950' : 'bg-white'
          }`}
        >
          
          {/* Top: Editor Section (Header + Textarea + Action Bar) */}
          <div 
            style={{ 
              height: isDesktop ? `${editorHeightPercent}%` : undefined 
            }}
            className={`${
              !isDesktop && mobileView !== 'editor' ? 'hidden' : 'flex'
            } flex-col min-h-0 overflow-hidden shrink-0 ${
              isDesktop ? '' : 'flex-1 w-full h-full'
            }`}
          >
            {/* Editor Header Bar */}
            <div className={`h-10 border-b px-4 flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100/90 text-slate-700'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold font-mono">
                <Code2 size={14} className="text-blue-600" />
                <span>query.sql</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleFormatSql}
                  className={`h-7 px-2.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer inline-flex items-center justify-center leading-none whitespace-nowrap ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="Capitalize SQL Keywords"
                >
                  Format SQL
                </button>

                <button
                  onClick={handleResetQuery}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Reset to starter query"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Code Editor Area with Line Numbers */}
            <div className={`flex-1 min-h-0 flex relative overflow-hidden ${
              isDarkMode ? 'bg-slate-950' : 'bg-white'
            }`}>
              {/* Gutter */}
              <div className={`select-none py-4 px-2.5 text-right font-mono text-xs border-r shrink-0 leading-relaxed overflow-hidden ${
                isDarkMode ? 'bg-slate-900/40 text-slate-600 border-slate-800' : 'bg-slate-50/80 text-slate-400 border-slate-200'
              }`}>
                {(userQuery || '').split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                placeholder="-- Write your SQL query here..."
                className={`flex-1 w-full font-mono text-xs sm:text-sm p-4 resize-none focus:outline-none border-none leading-relaxed ${
                  isDarkMode 
                    ? 'bg-slate-950 text-slate-100 placeholder:text-slate-600 selection:bg-blue-900' 
                    : 'bg-white text-slate-900 placeholder:text-slate-400 selection:bg-blue-100'
                }`}
              />
              <div className={`absolute bottom-2 right-3 text-[10px] font-mono pointer-events-none hidden sm:block ${
                isDarkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Press <kbd className={`px-1 py-0.5 rounded border ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>Ctrl + Enter</kbd> to Run
              </div>
            </div>

            {/* Action Bar (Run & Submit) */}
            <div className={`h-12 border-t px-3 sm:px-4 flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
            }`}>
              <div className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {!isDesktop ? (
                  <button
                    onClick={() => setMobileView('console')}
                    className="h-7 text-[11px] font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2.5 rounded-lg border border-blue-200 dark:border-blue-900 leading-none shrink-0 whitespace-nowrap"
                  >
                    <Table size={12} />
                    <span>Console {queryResult?.rowCount !== undefined ? `(${queryResult.rowCount}r)` : ''}</span>
                  </button>
                ) : (
                  <>
                    <Code2 size={13} className="text-blue-600" />
                    <span>Interactive SQL Console</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {/* Run Query Button */}
                <button
                  onClick={handleRunQuery}
                  disabled={running || evaluating}
                  className={`h-8 px-3 text-xs font-bold rounded-xl shadow-2xs transition-all inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 active:scale-95 border leading-none shrink-0 whitespace-nowrap ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <Play size={12} className={running ? 'animate-spin' : 'text-blue-600'} />
                  <span>{running ? 'Running...' : 'Run Query'}</span>
                </button>

                {/* Submit Solution Button */}
                <button
                  onClick={handleValidateSolution}
                  disabled={running || evaluating}
                  className="h-8 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 leading-none shrink-0 whitespace-nowrap"
                >
                  <CheckCircle2 size={13} className={evaluating ? 'animate-spin' : ''} />
                  <span>{evaluating ? 'Validating...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── DRAGGABLE HORIZONTAL DIVIDER (Desktop only) ── */}
          <div
            onMouseDown={() => setIsDraggingVertical(true)}
            className={`hidden lg:flex w-full h-1.5 hover:h-2 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 active:bg-blue-600 cursor-row-resize select-none transition-all items-center justify-center shrink-0 z-10 group ${
              isDraggingVertical ? 'bg-blue-600 h-2' : ''
            }`}
            title="Drag up or down to adjust console and editor height"
          >
            <div className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
          </div>

          {/* Bottom Execution Console & Results */}
          <div 
            className={`${
              !isDesktop && mobileView !== 'console' ? 'hidden' : 'flex'
            } flex-1 min-h-0 flex-col border-t lg:border-t-0 overflow-hidden w-full h-full ${
              isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            
            {/* Console Tabs & Execution Metrics */}
            <div className={`h-9 border-b px-4 flex items-center justify-between text-xs shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100/80'
            }`}>
              <div className="flex items-center space-x-2 font-bold">
                <button
                  onClick={() => setActiveConsoleTab('output')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeConsoleTab === 'output' 
                      ? isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Your Output
                </button>

                <button
                  onClick={() => setActiveConsoleTab('expected')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeConsoleTab === 'expected' 
                      ? isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-700 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Expected Output
                </button>
              </div>

              {/* Execution Time */}
              {queryResult?.executionTimeMs !== undefined && (
                <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono font-medium">
                  <Clock size={11} className="text-slate-400" />
                  <span>{queryResult.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {/* Console Body */}
            <div className="flex-1 min-h-0 overflow-auto p-4">
              
              {/* Validation Banner if submitted */}
              {validationResult && (
                <div className="space-y-3 mb-3">
                  {validationResult.passed && (
                    <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between shadow-xs ${
                      !viewedHints[activeChallenge.id] && !solutionRevealed
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950'
                        : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          !viewedHints[activeChallenge.id] && !solutionRevealed ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                        }`}>
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-black flex items-center space-x-2">
                            <span>Accepted!</span>
                            {!viewedHints[activeChallenge.id] && !solutionRevealed ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-black shadow-2xs">
                                +{getSqlChallengePoints(activeChallenge.difficulty, true).totalPoints} {getSqlChallengePoints(activeChallenge.difficulty, true).totalPoints === 1 ? 'Point' : 'Points'} Added
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-200 text-slate-600 font-bold">
                                0 Points (Hint Used)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-600 font-medium pt-0.5">
                            {!viewedHints[activeChallenge.id] && !solutionRevealed
                              ? `All test cases passed cleanly! +${getSqlChallengePoints(activeChallenge.difficulty, true).totalPoints} pt added to your Leaderboard score.`
                              : 'All test cases passed! (Hints were viewed, so 0 points were added to the leaderboard).'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                          !viewedHints[activeChallenge.id] && !solutionRevealed
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-black'
                            : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200 font-bold'
                        }`}>
                          {!viewedHints[activeChallenge.id] && !solutionRevealed ? `+${getSqlChallengePoints(activeChallenge.difficulty, true).totalPoints} pt` : '0 pt'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`p-3.5 rounded-2xl border flex items-start space-x-2.5 text-xs ${
                    validationResult.passed
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50 border-rose-300 text-rose-950'
                  }`}>
                    {validationResult.passed ? (
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-extrabold text-sm">
                        {validationResult.passed ? 'Accepted 🎉' : 'Wrong Answer'}
                      </div>
                      <div className="font-normal text-[11px] leading-relaxed">
                        {validationResult.message}
                      </div>
                      {validationResult.passed && nextChallenge && (
                        <button
                          onClick={handleNextChallenge}
                          className="mt-2 inline-flex items-center space-x-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          <span>Next Challenge</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Console Tab: User Output */}
              {activeConsoleTab === 'output' && (
                <div>
                  {!queryResult && !validationResult ? (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
                      <Play size={20} className="text-slate-300 mb-1" />
                      <span>Click "Run Query" or "Submit Solution" to inspect results</span>
                    </div>
                  ) : queryResult?.error ? (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 font-mono text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1 text-rose-700">
                        <AlertTriangle size={13} />
                        <span>Query Execution Error:</span>
                      </div>
                      <div className="whitespace-pre-wrap text-[11px]">{queryResult.error}</div>
                    </div>
                  ) : queryResult?.columns?.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-500 font-mono">
                        {queryResult.rowCount} row(s) returned
                      </div>
                      <div className={`overflow-x-auto border rounded-xl ${
                        isDarkMode ? 'border-slate-800' : 'border-slate-200 shadow-2xs'
                      }`}>
                        <table className="w-full text-left text-xs font-mono">
                          <thead className={`uppercase text-[10px] border-b font-black ${
                            isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            <tr>
                              {queryResult.columns.map((col, idx) => (
                                <th key={idx} className="px-3 py-2 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 bg-slate-900/70' : 'divide-slate-100 bg-white'}`}>
                            {queryResult.values.map((row, rIdx) => (
                              <tr key={rIdx} className={isDarkMode ? 'hover:bg-slate-800/50 text-slate-200' : 'hover:bg-slate-50 text-slate-800'}>
                                {row.map((val, cIdx) => (
                                  <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                    {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono p-2">
                      Query executed successfully with 0 rows returned.
                    </div>
                  )}
                </div>
              )}

              {/* Console Tab: Expected Output Preview */}
              {activeConsoleTab === 'expected' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between">
                    <span>Expected Result Structure:</span>
                    <span className="text-[10px] text-blue-600 font-mono font-bold">Target Solution Output</span>
                  </div>
                  {validationResult?.expectedResult ? (
                    <div className={`overflow-x-auto border rounded-xl ${
                      isDarkMode ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                      <table className="w-full text-left text-xs font-mono">
                        <thead className={`uppercase text-[10px] border-b font-black ${
                          isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <tr>
                            {validationResult.expectedResult.columns.map((col, idx) => (
                              <th key={idx} className="px-3 py-2 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800 bg-slate-900/70' : 'divide-slate-100 bg-white'}`}>
                          {validationResult.expectedResult.values.map((row, rIdx) => (
                            <tr key={rIdx} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50 text-emerald-800'}>
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                                  {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl text-center text-xs border ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      Click "Submit Solution" to compute and compare with canonical expected output.
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Quick Action to return to Editor */}
              {!isDesktop && (
                <div className="pt-4 pb-2">
                  <button
                    onClick={() => setMobileView('editor')}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Code2 size={13} />
                    <span>Back to SQL Editor →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Problem List Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setShowDrawer(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className={`relative w-full max-w-md border-r flex flex-col h-full shadow-2xl z-10 animate-slide-in ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Drawer Header */}
            <div className={`p-4 border-b space-y-3 shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold text-sm">
                  <ListOrdered size={16} className="text-blue-600" />
                  <span>SQL Questions</span>
                  <span className="text-xs text-slate-400 font-mono">({filteredChallenges.length}/{allChallenges.length})</span>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search questions by name, keyword..."
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
              </div>

              {/* Track Filter Pills */}
              <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: `All (${allChallenges.length})` },
                  { id: 'insert', label: `INSERT & Bulk (${insertCount})` },
                  { id: 'filtering', label: `Filtering (${filteringCount})` },
                  { id: 'ddl', label: `DDL (${ddlCount})` },
                  { id: 'dml', label: `DML (${dmlCount})` },
                  { id: 'solved', label: `Solved (${solvedChallenges.length})` }
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => setDrawerTrack(track.id)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      drawerTrack === track.id
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : isDarkMode
                        ? 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem List */}
            <div className={`flex-1 overflow-y-auto divide-y ${
              isDarkMode ? 'divide-slate-800 bg-slate-950' : 'divide-slate-100 bg-white'
            }`}>
              {filteredChallenges.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No questions match your filter.
                </div>
              ) : (
                filteredChallenges.map((ch, idx) => {
                const isSelected = ch.id === activeChallenge?.id;
                const isSolved = solvedChallenges.includes(ch.id);
                const diffTheme = getDifficultyTheme(ch.difficulty, isSelected);

                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      navigate(`/practice/sql/${getChallengeSlug(ch)}`);
                      setShowDrawer(false);
                    }}
                    className={`px-4 py-3.5 transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : isDarkMode 
                          ? 'hover:bg-slate-900 text-slate-300' 
                          : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate flex-1 pr-2">
                      {/* Tick mark before completed questions; extra spacing placeholder for non-completed */}
                      {isSolved ? (
                        <Check
                          size={14}
                          strokeWidth={2.5}
                          className={`shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}
                        />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}

                      <span className={`text-xs font-mono font-bold w-5 shrink-0 ${
                        isSelected
                          ? 'text-slate-400'
                          : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {idx + 1}.
                      </span>
                      <div className="truncate">
                        <span className={`text-xs block truncate ${
                          isSelected 
                            ? 'font-bold text-white' 
                            : 'font-medium'
                        }`}>
                          {ch.title}
                        </span>
                      </div>
                      {ch.isAdminCustom && (
                        <span className={`text-[10px] font-medium shrink-0 ${
                          isSelected ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="flex items-center shrink-0">
                      <span className={`text-[11px] font-semibold ${diffTheme.text}`}>
                        {diffTheme.label}
                      </span>
                      {isAdmin && ch.isAdminCustom && (
                        <button
                          onClick={(e) => handleDeleteCustomChallenge(ch.id, e)}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer ml-1"
                          title="Delete Custom Challenge"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Challenge Modal - strictly for Admins */}
      {isAdmin && (
        <AdminSqlModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onChallengeSaved={handleCustomChallengeSaved}
          editingChallenge={editingChallenge}
          isDarkMode={isDarkMode}
        />
      )}

      {/* SQL Leaderboard & Standings Modal */}
      <SqlLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        currentUserEmail={studentAccount?.email || user?.email || ''}
        currentUserName={studentAccount?.name || user?.name || (studentAccount?.email || user?.email || '').split('@')[0]}
        currentUserPoints={sqlPoints}
        cleanSolvesCount={Object.values(solvedDetails).filter(d => d.isClean).length}
      />

    </div>
  );
}
