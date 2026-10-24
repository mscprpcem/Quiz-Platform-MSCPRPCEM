import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Database, Play, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft,
  BookOpen, Code2, Trophy, ListOrdered, Table, Layers, Clock, Eye,
  HelpCircle, Share2, Award, Check, ExternalLink, Zap, Sun, Moon,
  Plus, Edit, Trash2, ShieldCheck, UserCheck, Search, ChevronDown, X
} from 'lucide-react';
import { SQL_CHALLENGES, getStoredCustomChallenges, deleteCustomChallenge } from '../data/sqlChallenges';
import { executeSqlQuery, validateSqlQuery, getTablesPreview } from '../services/sqlEngine';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminSqlModal from '../components/AdminSqlModal';
import ProblemStatementView from '../components/ProblemStatementView';
import { getDifficultyTheme } from '../utils/difficulty';
import LabSettingsDropdown, { getSavedSettings } from '../components/LabSettingsDropdown';

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

  // Find active challenge or default to first
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(() => {
    if (challengeId) {
      const idx = allChallenges.findIndex(c => c.id === challengeId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const activeChallenge = allChallenges[selectedChallengeIndex] || allChallenges[0];

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

  // Filtered challenges for drawer
  const filteredChallenges = useMemo(() => {
    return allChallenges.filter(ch => {
      const isFilt = ch.id?.startsWith('filt-') || ch.moduleId?.startsWith('filt-');
      const isDdl = ch.id?.startsWith('ddl-') || ch.moduleId?.startsWith('ddl-');
      const isDml = ch.id?.startsWith('dml-') || ch.moduleId?.startsWith('dml-');

      if (drawerTrack === 'filtering' && !isFilt) return false;
      if (drawerTrack === 'ddl' && !isDdl) return false;
      if (drawerTrack === 'dml' && !isDml) return false;
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
        if (!solvedChallenges.includes(activeChallenge.id)) {
          const updated = [...solvedChallenges, activeChallenge.id];
          setSolvedChallenges(updated);
          localStorage.setItem('msc_sql_solved', JSON.stringify(updated));

          // Record course completion eligibility
          if (studentAccount?.email && updated.length >= 10) {
            api.post('/api/student/record-course-completion', {
              email: studentAccount.email,
              name: studentAccount.name,
              username: studentAccount.username,
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
    if (selectedChallengeIndex < allChallenges.length - 1) {
      setSelectedChallengeIndex(prev => prev + 1);
    }
  };

  const handlePrevChallenge = () => {
    if (selectedChallengeIndex > 0) {
      setSelectedChallengeIndex(prev => prev - 1);
    }
  };

  // Handle Admin Custom Challenge saved
  const handleCustomChallengeSaved = (savedCh) => {
    const updated = getStoredCustomChallenges();
    setCustomChallenges(updated);
    // Find index of newly created/updated challenge
    const newIdx = allChallenges.findIndex(c => c.id === savedCh.id);
    if (newIdx !== -1) {
      setSelectedChallengeIndex(newIdx);
    } else {
      setSelectedChallengeIndex(allChallenges.length); // will be the last item
    }
  };

  // Handle Admin Challenge Delete
  const handleDeleteCustomChallenge = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom SQL challenge?')) {
      const updated = deleteCustomChallenge(id);
      setCustomChallenges(updated);
      setSelectedChallengeIndex(0);
    }
  };

  return (
    <div className={`h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex flex-col font-segoe select-text overflow-hidden transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* Top Utility Header Bar */}
      <header className={`h-12 border-b px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 backdrop-blur-md transition-colors ${
        isDarkMode 
          ? 'bg-slate-950/90 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            onClick={() => navigate('/courses')}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Back to Courses"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          {/* Problem Selector (Clean Unboxed Title) */}
          <button
            onClick={() => setShowDrawer(true)}
            className={`flex items-center space-x-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer truncate max-w-[160px] sm:max-w-md py-1 ${
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
            <span className="hidden lg:inline-flex items-center gap-1 text-xs font-medium text-purple-600">
              <ShieldCheck size={12} />
              <span>Admin</span>
            </span>
          )}
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center space-x-3">
          
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
              disabled={selectedChallengeIndex === 0}
              className={`p-1.5 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Previous Question"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextChallenge}
              disabled={selectedChallengeIndex === allChallenges.length - 1}
              className={`p-1.5 rounded-lg disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Next Question"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile View Switcher (Only visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 shrink-0 select-none">
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold w-full">
          <button
            onClick={() => setMobileView('problem')}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'problem'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <BookOpen size={13} />
            <span>Problem & Schema</span>
          </button>
          <button
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-1.5 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'editor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Code2 size={13} />
            <span>SQL Editor & Console</span>
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
                    <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <Lightbulb size={13} className="text-amber-500" />
                      <span>Hints ({activeChallenge.hints.length})</span>
                    </h3>

                    <div className="space-y-2">
                      {activeChallenge.hints.map((hint, idx) => {
                        const isRevealed = revealedHints[idx];
                        return (
                          <div key={idx} className={`border rounded-xl overflow-hidden ${
                            isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
                          }`}>
                            <button
                              onClick={() => setRevealedHints(prev => ({ ...prev, [idx]: !prev[idx] }))}
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
                      onClick={() => setSolutionRevealed(true)}
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
            !isDesktop && mobileView !== 'editor' ? 'hidden' : 'flex'
          } flex-1 flex-col overflow-hidden min-w-0 h-full rounded-none transition-colors ${
            isDarkMode ? 'bg-slate-950' : 'bg-white'
          }`}
        >
          
          {/* Top: Editor Section (Header + Textarea + Action Bar) */}
          <div 
            style={{ 
              height: isDesktop ? `${editorHeightPercent}%` : undefined 
            }}
            className={`flex flex-col min-h-0 overflow-hidden shrink-0 ${
              !isDesktop ? 'h-1/2 min-h-[260px]' : ''
            }`}
          >
            {/* Editor Header Bar */}
            <div className={`h-10 border-b px-4 flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100/90 text-slate-700'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold font-mono">
                {!isDesktop && (
                  <button
                    onClick={() => setMobileView('problem')}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 flex items-center gap-1 mr-1"
                  >
                    ← Problem
                  </button>
                )}
                <Code2 size={14} className="text-blue-600" />
                <span>query.sql</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFormatSql}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
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
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
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
            <div className={`h-12 border-t px-4 flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/90'
            }`}>
              <div className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                <Code2 size={13} className="text-blue-600" />
                <span>Interactive SQL Console</span>
              </div>

              <div className="flex items-center space-x-2.5">
                {/* Run Query Button */}
                <button
                  onClick={handleRunQuery}
                  disabled={running || evaluating}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 active:scale-95 border ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' 
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <Play size={12} className={running ? 'animate-spin' : 'text-blue-600'} />
                  <span>{running ? 'Executing...' : 'Run Query'}</span>
                </button>

                {/* Submit Solution Button */}
                <button
                  onClick={handleValidateSolution}
                  disabled={running || evaluating}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 size={13} className={evaluating ? 'animate-spin' : ''} />
                  <span>{evaluating ? 'Validating...' : 'Submit Solution'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── DRAGGABLE HORIZONTAL DIVIDER (Resizes Console vs Editor) ── */}
          <div
            onMouseDown={() => setIsDraggingVertical(true)}
            className={`w-full h-1.5 hover:h-2 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 active:bg-blue-600 cursor-row-resize select-none transition-all flex items-center justify-center shrink-0 z-10 group ${
              isDraggingVertical ? 'bg-blue-600 h-2' : ''
            }`}
            title="Drag up or down to adjust console and editor height"
          >
            <div className="h-0.5 w-8 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
          </div>

          {/* Bottom Execution Console & Results */}
          <div 
            className={`flex-1 min-h-0 flex flex-col border-t overflow-hidden ${
              !isDesktop ? 'h-1/2 min-h-[240px]' : ''
            } ${
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
                <div className={`mb-3 p-3.5 rounded-2xl border flex items-start space-x-2.5 text-xs ${
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
                    {validationResult.passed && selectedChallengeIndex < allChallenges.length - 1 && (
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
            <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-slate-800 bg-slate-950 text-slate-100' : 'border-slate-200 bg-white text-slate-900'
            }`}>
              <div className="flex items-center space-x-2 font-bold text-sm">
                <ListOrdered size={16} className="text-blue-600" />
                <span>SQL Questions</span>
                <span className="text-xs text-slate-400 font-mono">({allChallenges.length})</span>
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

            {/* Problem List (Clean, No Curves) */}
            <div className={`flex-1 overflow-y-auto divide-y ${
              isDarkMode ? 'divide-slate-800 bg-slate-950' : 'divide-slate-100 bg-white'
            }`}>
              {allChallenges.map((ch, idx) => {
                const isSelected = idx === selectedChallengeIndex;
                const isSolved = solvedChallenges.includes(ch.id);
                const diffTheme = getDifficultyTheme(ch.difficulty, isSelected);

                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setSelectedChallengeIndex(idx);
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
              })}
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

    </div>
  );
}
