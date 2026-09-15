import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Database, Play, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft,
  BookOpen, Code2, Trophy, ListOrdered, Table, Layers, Clock, Eye,
  HelpCircle, Share2, Award, Check, ExternalLink, Zap, Sun, Moon,
  Plus, Edit, Trash2, ShieldCheck, UserCheck, Search
} from 'lucide-react';
import { SQL_CHALLENGES, getStoredCustomChallenges, deleteCustomChallenge } from '../data/sqlChallenges';
import { executeSqlQuery, validateSqlQuery, getTablesPreview } from '../services/sqlEngine';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminSqlModal from '../components/AdminSqlModal';
import ProblemStatementView from '../components/ProblemStatementView';

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
    <div className={`min-h-[calc(100vh-4rem)] flex flex-col font-segoe select-text transition-colors duration-200 ${
      isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
    }`}>
      
      {/* Top Utility Header Bar */}
      <header className={`h-14 border-b px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 backdrop-blur-md transition-colors ${
        isDarkMode 
          ? 'bg-slate-950/90 border-slate-800 text-slate-100' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-2xs'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/courses')}
            className={`flex items-center space-x-1 text-xs font-bold transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Courses</span>
          </button>

          <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

          {/* Problem Selector Drawer Trigger */}
          <button
            onClick={() => setShowDrawer(true)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 border ${
              isDarkMode 
                ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200' 
                : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-800'
            }`}
          >
            <ListOrdered size={14} className="text-blue-600" />
            <span className="font-extrabold truncate max-w-[140px] sm:max-w-[220px]">
              {selectedChallengeIndex + 1}. {activeChallenge?.title}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {selectedChallengeIndex + 1}/{allChallenges.length}
            </span>
          </button>

          {/* Solved Status Pill */}
          {isCurrentSolved ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[11px] font-bold">
              <CheckCircle2 size={12} className="text-emerald-600" />
              <span className="hidden md:inline">Solved</span>
            </span>
          ) : (
            <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              Unsolved
            </span>
          )}

          {/* Difficulty Badge */}
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
            activeChallenge?.difficulty === 'Easy'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : activeChallenge?.difficulty === 'Medium'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-rose-50 text-rose-700 border-rose-300'
          }`}>
            {activeChallenge?.difficulty}
          </span>

          {/* Custom Admin Added Badge */}
          {activeChallenge?.isAdminCustom && (
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck size={11} />
              <span>Admin Added</span>
            </span>
          )}
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Admin "+ Add Question" Button - strictly for Admins */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingChallenge(null);
                setShowAdminModal(true);
              }}
              className="flex items-center space-x-1.5 text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Admin: Create Custom SQL Question & Answer"
            >
              <Plus size={14} className="text-blue-600" />
              <span className="hidden sm:inline">Add Question</span>
            </button>
          )}

          {/* Solved Stats Counter */}
          <div className={`hidden lg:flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
            isDarkMode 
              ? 'bg-slate-800/60 border-slate-700 text-slate-300' 
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <Trophy size={14} className="text-amber-500" />
            <span>Progress:</span>
            <span className="text-blue-600 font-mono font-black">{solvedChallenges.length}</span>
            <span className="text-slate-400">/</span>
            <span className="font-mono">{allChallenges.length}</span>
          </div>

          {/* Mode Switcher to DBMS Theory Quiz */}
          <button
            onClick={() => navigate('/practice/dbms')}
            className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title="Switch to 10-Minute DBMS Theory MCQ Exam"
          >
            <BookOpen size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">Theory Quiz</span>
          </button>

          {/* Light / Dark Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Prev / Next Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevChallenge}
              disabled={selectedChallengeIndex === 0}
              className={`p-1.5 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Previous Question"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextChallenge}
              disabled={selectedChallengeIndex === allChallenges.length - 1}
              className={`p-1.5 rounded-xl border disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Next Question"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Two-Pane Split) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Pane: Problem Context, Schema Explorer, Hints, Explanation */}
        <div className={`w-full lg:w-[46%] xl:w-[42%] flex flex-col border-r overflow-hidden shrink-0 transition-colors ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          
          {/* Left Panel Tabs */}
          <div className={`flex items-center border-b px-4 pt-2 gap-2 text-xs font-extrabold ${
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
          </div>

          {/* Left Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
            
            {/* Tab: Problem Description */}
            {activeTab === 'problem' && (
              <div className="space-y-6">
                {/* Rich Structured Problem Statement Component */}
                <ProblemStatementView challenge={activeChallenge} isDarkMode={isDarkMode} />

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
                {activeChallenge?.hints && activeChallenge.hints.length > 0 && (
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
          </div>
        </div>

        {/* Right Pane: Code Editor + Execution Console */}
        <div className={`w-full lg:w-[54%] xl:w-[58%] flex flex-col overflow-hidden transition-colors ${
          isDarkMode ? 'bg-slate-950' : 'bg-white'
        }`}>
          
          {/* Editor Header Bar */}
          <div className={`h-10 border-b px-4 flex items-center justify-between shrink-0 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100/90 text-slate-700'
          }`}>
            <div className="flex items-center space-x-2 text-xs font-bold font-mono">
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
          <div className={`flex-1 min-h-[180px] sm:min-h-[220px] max-h-[45vh] lg:max-h-none flex relative overflow-hidden ${
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
          <div className={`h-12 border-t border-b px-4 flex items-center justify-between shrink-0 ${
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

          {/* Bottom Execution Console & Results */}
          <div className={`h-64 sm:h-72 lg:h-80 flex flex-col border-t overflow-hidden shrink-0 ${
            isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
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
            <div className="flex-1 overflow-auto p-4">
              
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
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-2 font-black text-sm">
                <ListOrdered size={16} className="text-blue-600" />
                <span>Interview SQL Challenge Track</span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Overall Progress in Drawer */}
            <div className={`p-4 border-b space-y-3 ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/60 border-slate-200'
            }`}>
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Total Solved:</span>
                <span className="text-blue-600 font-mono">
                  {solvedChallenges.length} / {allChallenges.length} ({Math.round((solvedChallenges.length / allChallenges.length) * 100)}%)
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
              }`}>
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${(solvedChallenges.length / allChallenges.length) * 100}%` }}
                />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search 66+ questions (e.g. JOIN, ALTER, students)..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                  }`}
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    &times;
                  </button>
                )}
              </div>

              {/* Track Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                <button
                  onClick={() => setDrawerTrack('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerTrack === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  All ({allChallenges.length})
                </button>
                <button
                  onClick={() => setDrawerTrack('filtering')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerTrack === 'filtering'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Filtering ({filteringCount})
                </button>
                <button
                  onClick={() => setDrawerTrack('ddl')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerTrack === 'ddl'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  DDL ({ddlCount})
                </button>
                <button
                  onClick={() => setDrawerTrack('dml')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerTrack === 'dml'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  DML ({dmlCount})
                </button>
                <button
                  onClick={() => setDrawerTrack('solved')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    drawerTrack === 'solved'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Solved ({solvedChallenges.length})
                </button>
              </div>

              {/* Admin Button inside drawer - strictly for Admins */}
              {isAdmin && (
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setEditingChallenge(null);
                      setShowAdminModal(true);
                      setShowDrawer(false);
                    }}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Admin: Add New Challenge</span>
                  </button>
                </div>
              )}
            </div>

            {/* Problem List by Category */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredChallenges.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-1">
                  <div>No questions match your filter.</div>
                  <button
                    onClick={() => { setDrawerSearch(''); setDrawerTrack('all'); }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredChallenges.map((ch) => {
                  const globalIdx = allChallenges.findIndex(c => c.id === ch.id);
                  const isSelected = globalIdx === selectedChallengeIndex;
                  const isSolved = solvedChallenges.includes(ch.id);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        setSelectedChallengeIndex(globalIdx >= 0 ? globalIdx : 0);
                        setShowDrawer(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? isDarkMode ? 'bg-blue-600/15 border-blue-500 text-white' : 'bg-blue-50/90 border-blue-500 text-blue-950 shadow-2xs font-bold'
                          : isDarkMode ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-1 flex-1 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-400">
                            {globalIdx + 1}.
                          </span>
                          <span className="text-xs font-extrabold line-clamp-1">
                            {ch.title}
                          </span>
                          {ch.isAdminCustom && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">
                          {ch.moduleTitle}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          ch.difficulty === 'Easy'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : ch.difficulty === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {ch.difficulty}
                        </span>
                        {isSolved && (
                          <CheckCircle2 size={15} className="text-emerald-600" />
                        )}
                        {isAdmin && ch.isAdminCustom && (
                          <button
                            onClick={(e) => handleDeleteCustomChallenge(ch.id, e)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Delete Custom Challenge"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
