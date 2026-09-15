import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Database, Play, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  RotateCcw, Sparkles, ChevronRight, ChevronLeft, ChevronDown, ArrowRight, ArrowLeft,
  BookOpen, Code2, Trophy, ListOrdered, Table, Layers, Clock, Eye,
  HelpCircle, Copy, Check, Terminal, Search, Filter, ShieldCheck, CheckSquare,
  ArrowUpRight, Flame, BarChart3, RefreshCw, X, GripVertical, GripHorizontal,
  Send, FileText, CheckCircle, Settings, Sliders, AlignLeft, EyeOff, LayoutGrid,
  Columns, GitCompare, CheckCheck, CircleAlert, Monitor, Smartphone, Tablet, Target,
  Shuffle, Gauge
} from 'lucide-react';
import { SQL_CHALLENGES } from '../data/sqlChallenges';
import { executeSqlQuery, validateChallengeWithTestcases, getTablesPreview } from '../services/sqlEngine';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Clean & Short Category Name Helper
 * Strips leading numbering (e.g., "1. Basic Filtering" -> "Filtering & Sorting")
 */
function getCleanCategoryName(title) {
  if (!title) return 'General';
  const cleaned = title.replace(/^(\d+\.|\d+\)|\bModule\s*\d+:?)\s*/i, '').trim();
  
  if (cleaned.toLowerCase().includes('day 4') || cleaned.toLowerCase().includes('advanced filtering')) {
    return 'Day 4: Advanced Filtering';
  }
  if (cleaned.toLowerCase().includes('drop')) {
    return 'DROP Operations';
  }
  if (cleaned.toLowerCase().includes('alter') || cleaned.toLowerCase().includes('modify') || cleaned.toLowerCase().includes('add column') || cleaned.toLowerCase().includes('rename')) {
    return 'Table Schema';
  }
  if (cleaned.toLowerCase().includes('truncate')) {
    return 'Table Cleanup';
  }
  if (cleaned.toLowerCase().includes('create table')) {
    return 'Table Creation';
  }
  if (cleaned.toLowerCase().includes('filtering') || cleaned.toLowerCase().includes('sorting')) {
    return 'Filtering & Sorting';
  }
  if (cleaned.toLowerCase().includes('join')) {
    return 'JOIN Operations';
  }
  if (cleaned.toLowerCase().includes('aggregate') || cleaned.toLowerCase().includes('group')) {
    return 'Aggregations';
  }
  if (cleaned.toLowerCase().includes('subquer') || cleaned.toLowerCase().includes('cte')) {
    return 'Subqueries & CTEs';
  }
  if (cleaned.toLowerCase().includes('window')) {
    return 'Window Functions';
  }
  if (cleaned.toLowerCase().includes('database') || cleaned.toLowerCase().includes('drop db') || cleaned.toLowerCase().includes('create db')) {
    return 'Database Lifecycle';
  }
  if (cleaned.toLowerCase().includes('ddl') || cleaned.toLowerCase().includes('data definition')) {
    return 'DDL Operations';
  }
  if (cleaned.toLowerCase().includes('dml') || cleaned.toLowerCase().includes('manipulation')) {
    return 'DML Operations';
  }
  if (cleaned.toLowerCase().includes('index') || cleaned.toLowerCase().includes('optimi')) {
    return 'Optimization';
  }
  if (cleaned.toLowerCase().includes('interview') || cleaned.toLowerCase().includes('leetcode') || cleaned.toLowerCase().includes('faang')) {
    return 'Interview Challenges';
  }
  if (cleaned.toLowerCase().startsWith('section ')) {
    return cleaned.replace(/^section\s+[a-z]:\s*/i, '').replace(/^(ALTER|CREATE|DROP|TRUNCATE)\s*–?\s*/i, '');
  }
  return cleaned;
}

/**
 * SQL Formatter Utility
 * Formats SQL keywords to uppercase with proper spacing
 */
function formatSql(sql) {
  if (!sql) return '';
  
  const keywords = [
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
    'INSERT INTO', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE',
    'UNION ALL', 'GROUP BY', 'ORDER BY', 'PARTITION BY', 'PRIMARY KEY', 'FOREIGN KEY',
    'NOT NULL', 'IS NOT NULL', 'IS NULL',
    'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'JOIN', 'ON',
    'HAVING', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'UNION', 'CASE', 'WHEN', 'THEN',
    'ELSE', 'END', 'OVER', 'VALUES', 'UPDATE', 'SET', 'REFERENCES', 'UNIQUE',
    'DEFAULT', 'AS', 'IN', 'BETWEEN', 'LIKE', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'
  ];

  let formatted = sql;
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, kw);
  });

  return formatted;
}

/**
 * Generates a clean empty starter SQL so users write the query themselves from a clean slate
 */
function getCleanStarterSql(challenge = null) {
  return '';
}

/**
 * Rock-Solid Cross-Browser Pixel-Perfect Toggle Switch
 */
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      aria-label={label}
      style={{
        width: '44px',
        height: '24px',
        minWidth: '44px',
        minHeight: '24px',
        maxWidth: '44px',
        maxHeight: '24px',
        borderRadius: '9999px',
        padding: '2px',
        backgroundColor: checked ? '#2563eb' : '#cbd5e1',
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          minWidth: '20px',
          minHeight: '20px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'block',
          flexShrink: 0
        }}
      />
    </button>
  );
}

/**
 * Conceptual Tag Sanitizer
 * Replaces exact SQL solution commands with conceptual topic names to avoid giving away solutions.
 */
function cleanTagForDisplay(rawTag) {
  if (!rawTag) return '';
  const tag = String(rawTag).trim();
  const lower = tag.toLowerCase();

  // Pattern Matching
  if (lower === 'like' || lower === 'not like' || lower.includes('wildcard') || lower.includes('prefix')) return 'Pattern';

  // Range & Membership
  if (lower === 'in' || lower === 'not in') return 'Set';
  if (lower === 'between' || lower === 'not between') return 'Range';

  // Nulls
  if (lower === 'is null' || lower === 'is not null' || lower.includes('null')) return 'Null';

  // DDL Commands
  if (lower.includes('alter') || lower.includes('modify')) return 'Alter';
  if (lower.includes('rename')) return 'Rename';
  if (lower.includes('drop')) return 'Drop';
  if (lower.includes('create')) return 'Create';
  if (lower.includes('truncate')) return 'Truncate';

  // DML Commands
  if (lower === 'insert') return 'Insert';
  if (lower === 'update') return 'Update';
  if (lower === 'delete') return 'Delete';
  if (lower === 'select') return 'Select';

  // Joins & Aggregations
  if (lower.includes('join')) return 'Join';
  if (lower === 'group by' || lower === 'having') return 'Group';
  if (lower === 'order by') return 'Sort';
  if (lower.includes('count') || lower.includes('sum') || lower.includes('avg') || lower.includes('agg')) return 'Agg';

  // Clean abbreviations
  if (lower === 'ddl' || lower === 'dml') return tag.toUpperCase();

  // Shorten multi-word tags to max 1-2 words
  const words = tag.split(/[\s_-]+/);
  if (words.length > 2) {
    return words.slice(0, 2).join(' ');
  }
  return tag;
}

/**
 * Modern Custom Theme Dropdown
 * Replaces native browser select with sleek themed dropdown menu
 */
function CustomDropdown({ value, onChange, options, icon: Icon, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3 py-2 bg-slate-50 hover:bg-white border rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-2xs flex items-center justify-between gap-2.5 transition-all cursor-pointer min-w-[135px] ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={13} className="text-slate-400 shrink-0" />}
          {selectedOption?.badgeColor && (
            <span className={`w-2 h-2 rounded-full ${selectedOption.badgeColor} shrink-0`} />
          )}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown
          size={12}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-black'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {opt.badgeColor && <span className={`w-2 h-2 rounded-full ${opt.badgeColor}`} />}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check size={13} className="text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline Markdown Tokenizer & Formatter
 * Eliminates stray ** and renders code/bold tags properly
 */
function parseInline(text) {
  if (!text) return null;

  const parts = [];
  const regex = /(\*\*(?:`[^`]+`|[^*]+)\*\*|`[^`]+`|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index).replace(/\*\*/g, '');
      parts.push(plain);
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      if (inner.startsWith('`') && inner.endsWith('`')) {
        parts.push(
          <code key={match.index} className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded mx-0.5">
            {inner.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900 bg-slate-100/90 px-1 py-0.5 rounded text-inherit">
            {inner}
          </strong>
        );
      }
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded mx-0.5">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).replace(/\*\*/g, '');
    parts.push(remaining);
  }
  return parts;
}

/**
 * Rich Markdown Component
 * Accurately parses tables, horizontal dividers, bullet lists, and section callouts.
 */
function RichMarkdown({ content, className = '' }) {
  if (!content) return null;

  const rawLines = content.trim().split('\n');
  const blocks = [];
  let currentTable = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Markdown table detection
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!currentTable) {
        currentTable = [];
      }
      currentTable.push(line);
      continue;
    } else if (currentTable) {
      blocks.push({ type: 'table', lines: currentTable });
      currentTable = null;
    }

    if (!line) {
      continue;
    }

    if (line === '---' || line === '***' || line === '___') {
      blocks.push({ type: 'divider' });
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      blocks.push({ type: 'bullet', text: line.slice(2) });
    } else if (
      line.startsWith('Example ') ||
      line.startsWith('**Example') ||
      line.startsWith('Input:') ||
      line.startsWith('Output:') ||
      line.startsWith('Explanation:')
    ) {
      blocks.push({ type: 'header_para', text: line });
    } else {
      blocks.push({ type: 'para', text: line });
    }
  }

  if (currentTable) {
    blocks.push({ type: 'table', lines: currentTable });
  }

  return (
    <div className={`space-y-3 text-slate-700 leading-relaxed text-xs sm:text-[13px] ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'divider') {
          return <hr key={idx} className="border-slate-200/80 my-4" />;
        }

        if (block.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-blue-600 font-black mt-0.5 text-xs">•</span>
              <span className="flex-1">{parseInline(block.text)}</span>
            </div>
          );
        }

        if (block.type === 'header_para') {
          return (
            <div key={idx} className="font-extrabold text-slate-900 pt-2 text-xs sm:text-[13px]">
              {parseInline(block.text)}
            </div>
          );
        }

        if (block.type === 'table') {
          const rows = block.lines
            .map(l => l.split('|').map(c => c.trim()).filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1))
            .filter(r => r.length > 0 && !r.every(c => /^:?-+:?$/.test(c)));

          if (rows.length === 0) return null;
          const headerRow = rows[0];
          const bodyRows = rows.slice(1);

          return (
            <div key={idx} className="my-3 overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 font-black text-slate-800">
                  <tr>
                    {headerRow.map((h, i) => (
                      <th key={i} className="px-3.5 py-2.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 border-r border-slate-100 last:border-r-0 whitespace-nowrap text-xs font-medium">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={idx}>
            {parseInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

export default function SqlPracticeView({
  onJumpToLearn,
  initialChallengeIndex = null
}) {
  const { studentAccount, user } = useAuth();
  // View mode: 'list' (LeetCode Problemset with Progress Card) | 'solve' (Solve Workspace)
  const [viewMode, setViewMode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('challenge') || urlParams.get('id') || urlParams.get('challengeId')) {
        return 'solve';
      }
    } catch (_) {}
    return initialChallengeIndex !== null ? 'solve' : 'list';
  });
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(() => (initialChallengeIndex !== null && initialChallengeIndex >= 0 ? initialChallengeIndex : 0));

  // Filters for Problemset List
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all' | 'basic' | 'medium' | 'hard'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'solved' | 'unsolved'
  const [jumpInput, setJumpInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // LeetCode Resizable Splitter State (for Desktop viewports >= 1024px)
  const [leftWidthPercent, setLeftWidthPercent] = useState(46); // Default 46% left pane, 54% right pane
  const [isDraggingHorizontal, setIsDraggingHorizontal] = useState(false);
  const containerRef = useRef(null);

  // Vertical Resizer for Code Editor vs Output Console
  const [editorHeightPercent, setEditorHeightPercent] = useState(54); // Default 54% editor, 46% console
  const [isDraggingVertical, setIsDraggingVertical] = useState(false);
  const rightPaneRef = useRef(null);

  // Mobile / Tablet Active View Pane (< 1024px)
  // 'problem' | 'editor' | 'console'
  const [mobileActivePane, setMobileActivePane] = useState('problem');

  // Quick Problem List Drawer in Solve Workspace
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerDifficulty, setDrawerDifficulty] = useState('all');
  const [drawerTrack, setDrawerTrack] = useState('all'); // 'all' | 'ddl' | 'dml' | 'core'
  const [drawerTrackFilter, setDrawerTrackFilter] = useState('all'); // 'all' | 'eq_ddl' | 'neq_ddl' | 'eq_dml' | 'neq_dml' | 'eq_core' | 'neq_core'
  const [drawerLevelFilter, setDrawerLevelFilter] = useState('all'); // 'all' | 'eq_basic' | 'neq_basic' | 'eq_easy' | 'neq_easy' | 'eq_medium' | 'neq_medium' | 'eq_hard' | 'neq_hard'
  const [drawerDdlFilter, setDrawerDdlFilter] = useState('all'); // 'all' | 'create' | 'use' | 'alter' | 'rename' | 'truncate' | 'drop'
  const [drawerDmlFilter, setDrawerDmlFilter] = useState('all'); // 'all' | 'insert' | 'update' | 'delete' | 'select'

  // Sync initialChallengeIndex from parent prop or URL search param (?challenge=dml-01)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get('challenge') || urlParams.get('id') || urlParams.get('challengeId');
      if (targetId) {
        const foundIdx = SQL_CHALLENGES.findIndex(c => c.id.toLowerCase() === targetId.toLowerCase());
        if (foundIdx !== -1) {
          setSelectedChallengeIndex(foundIdx);
          setViewMode('solve');
          if (targetId.toLowerCase().startsWith('dml-')) {
            setDrawerTrack('dml');
            setDrawerTrackFilter('eq_dml');
          } else if (targetId.toLowerCase().startsWith('ddl-')) {
            setDrawerTrack('ddl');
            setDrawerTrackFilter('eq_ddl');
          } else if (targetId.toLowerCase().startsWith('filt-')) {
            setDrawerTrack('filtering');
            setDrawerTrackFilter('eq_filtering');
          }
          return;
        }
      }
    } catch (_) {}

    if (initialChallengeIndex !== null && initialChallengeIndex >= 0 && initialChallengeIndex < SQL_CHALLENGES.length) {
      setSelectedChallengeIndex(initialChallengeIndex);
      setViewMode('solve');
    }
  }, [initialChallengeIndex]);

  // Settings Modal & Preferences with Tabbed Interface
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsActiveTab, setSettingsActiveTab] = useState('practice'); // 'practice' | 'editor' | 'engine'
  const [resetConfirm, setResetConfirm] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_practice_settings');
      return saved ? JSON.parse(saved) : {
        schemaOnlyMode: false, // Hide sample data rows, show only table structure
        hideHints: false,       // Hide problem hints
        hideTags: false,        // Hide problem tags (anti-spoiler)
        hideDifficulty: false,  // Hide difficulty indicators
        compactView: false,     // Compact table row view
        itemsPerPage: 50,       // 50, 100, or All
        fontSize: '13',         // 12, 13, 14, 16
        autoUppercase: true     // Auto format keywords
      };
    } catch {
      return {
        schemaOnlyMode: false,
        hideHints: false,
        hideTags: false,
        hideDifficulty: false,
        compactView: false,
        itemsPerPage: 50,
        fontSize: '13',
        autoUppercase: true
      };
    }
  });

  const updateSetting = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('msc_sql_practice_settings', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Solve Workspace tabs
  const [solveTab, setSolveTab] = useState('description'); // 'description' | 'schema' | 'hints'
  const [schemaViewTab, setSchemaViewTab] = useState(() => (settings.schemaOnlyMode ? 'structure' : 'data'));
  const [copiedCode, setCopiedCode] = useState(false);

  // Console Execution State
  // mode: 'idle' | 'run' | 'submit'
  const [consoleMode, setConsoleMode] = useState('idle');
  const [activeConsoleSubTab, setActiveConsoleSubTab] = useState('your_output'); // 'your_output' | 'expected_output'
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0); // 0 or 1 for Submit test cases

  const [rawExecutionResult, setRawExecutionResult] = useState(null); // Result from "Run"
  const [rawExpectedResult, setRawExpectedResult] = useState(null);   // Expected from "Run"
  const [submissionResult, setSubmissionResult] = useState(null);     // Result from "Submit" (Testcases)
  const [runningAction, setRunningAction] = useState(false);          // Spinner indicator

  // Solved challenges stored in localStorage
  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_sql_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Extract unique short category names from challenges
  const categories = useMemo(() => {
    const set = new Set();
    SQL_CHALLENGES.forEach((c) => {
      const clean = getCleanCategoryName(c.moduleTitle);
      if (clean) set.add(clean);
    });
    return Array.from(set);
  }, []);

  const activeChallenge = SQL_CHALLENGES[selectedChallengeIndex] || SQL_CHALLENGES[0];

  // User query state (Start with clean blank scaffold rather than giving the solution away)
  const [userSql, setUserSql] = useState(() => getCleanStarterSql(activeChallenge));
  const [tableSchemas, setTableSchemas] = useState([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);

  // Sync starter scaffold & schemas when active challenge changes
  useEffect(() => {
    if (!activeChallenge) return;
    setUserSql(getCleanStarterSql(activeChallenge));
    setConsoleMode('idle');
    setRawExecutionResult(null);
    setRawExpectedResult(null);
    setSubmissionResult(null);

    let isMounted = true;
    setLoadingSchemas(true);
    getTablesPreview(activeChallenge.setupSql)
      .then((tables) => {
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

    return () => {
      isMounted = false;
    };
  }, [selectedChallengeIndex, activeChallenge]);

  // Handle Horizontal Splitter Dragging (Left vs Right Panes on Desktop)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingHorizontal || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 25 && newPercent <= 75) {
        setLeftWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHorizontal(false);
    };

    if (isDraggingHorizontal) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHorizontal]);

  // Handle Vertical Splitter Dragging (Code Editor vs Console on Desktop)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingVertical || !rightPaneRef.current) return;
      const rect = rightPaneRef.current.getBoundingClientRect();
      const newPercent = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPercent >= 25 && newPercent <= 80) {
        setEditorHeightPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingVertical(false);
    };

    if (isDraggingVertical) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingVertical]);

  const handleOpenChallenge = (index) => {
    setSelectedChallengeIndex(index);
    setViewMode('solve');
    setShowDrawer(false);
    // On mobile, start on the problem description
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileActivePane('problem');
    }
  };

  // Format code action
  const handleFormatCode = () => {
    setUserSql(prev => formatSql(prev));
  };

  // Reset code action
  const handleResetCode = () => {
    setUserSql(getCleanStarterSql(activeChallenge));
  };

  // 1. RUN QUERY (Instant raw execution on current SQLite DB)
  const handleRunQuery = async () => {
    if (runningAction || !activeChallenge) return;
    setRunningAction(true);
    setConsoleMode('run');
    setActiveConsoleSubTab('your_output');

    // On mobile / tablet, auto-switch to console tab so user sees output immediately
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileActivePane('console');
    }

    try {
      const userRes = await executeSqlQuery(activeChallenge.setupSql, userSql);
      setRawExecutionResult(userRes);

      if (activeChallenge.expectedSql) {
        const expRes = await executeSqlQuery(activeChallenge.setupSql, activeChallenge.expectedSql);
        setRawExpectedResult(expRes);
      } else {
        setRawExpectedResult(null);
      }
      // Zero server cost: Execution runs 100% locally in browser WebAssembly
    } catch (err) {
      setRawExecutionResult({
        success: false,
        columns: [],
        values: [],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message || 'Error executing query.'
      });
    } finally {
      setRunningAction(false);
    }
  };

  // 2. SUBMIT SOLUTION (Multi-dataset test cases validation)
  const handleSubmitSolution = async () => {
    if (runningAction || !activeChallenge) return;
    setRunningAction(true);
    setConsoleMode('submit');
    setActiveTestCaseIndex(0);

    // On mobile / tablet, auto-switch to console tab so user sees output immediately
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileActivePane('console');
    }

    try {
      const result = await validateChallengeWithTestcases(activeChallenge, userSql);
      setSubmissionResult(result);

      if (result.passed && !solvedChallenges.includes(activeChallenge.id)) {
        const updated = [...solvedChallenges, activeChallenge.id];
        setSolvedChallenges(updated);
        try {
          localStorage.setItem('msc_sql_solved_challenges', JSON.stringify(updated));
        } catch (_) {}

        // Track course completion eligibility if solving challenges
        if (studentAccount?.email && updated.length >= 10) {
          api.post('/api/student/record-course-completion', {
            email: studentAccount.email,
            name: studentAccount.name,
            username: studentAccount.username,
            courseTitle: 'SQL Mastery & Advanced Relational Database Systems',
            score: Math.min(100, Math.round((updated.length / SQL_CHALLENGES.length) * 100)),
            challengesSolved: updated.length
          }).catch(() => {});
        }
      }
      // Zero server cost: Validation runs 100% locally in browser WebAssembly
    } catch (err) {
      setSubmissionResult({
        passed: false,
        totalCases: 1,
        passedCases: 0,
        message: err.message || 'Error evaluating test cases.',
        testcases: [
          {
            caseIndex: 1,
            name: 'Case 1: Primary Dataset',
            passed: false,
            userResult: { success: false, columns: [], values: [], rowCount: 0, executionTimeMs: 0, error: err.message },
            expectedResult: null,
            missingInUserIndices: [],
            extraInUserIndices: [],
            message: err.message
          }
        ]
      });
    } finally {
      setRunningAction(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userSql);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isCurrentSolved = solvedChallenges.includes(activeChallenge?.id);
  const totalCount = SQL_CHALLENGES.length;

  // Filtered drawer challenges
  const drawerChallenges = useMemo(() => {
    return SQL_CHALLENGES.map((c, i) => ({ ...c, originalIndex: i })).filter((c) => {
      const isFiltering = c.id.startsWith('filt-') || c.moduleId?.startsWith('filt-');
      const isDdl = c.id.startsWith('ddl-') || c.moduleId?.startsWith('ddl-');
      const isDml = c.id.startsWith('dml-') || c.moduleId?.startsWith('dml-');
      const isCore = !isDdl && !isDml && !isFiltering;

      // 1. Operator-based Track / Type Filter (= and not =)
      if (drawerTrackFilter === 'eq_filtering' && !isFiltering) return false;
      if (drawerTrackFilter === 'neq_filtering' && isFiltering) return false;
      if (drawerTrackFilter === 'eq_ddl' && !isDdl) return false;
      if (drawerTrackFilter === 'neq_ddl' && isDdl) return false;
      if (drawerTrackFilter === 'eq_dml' && !isDml) return false;
      if (drawerTrackFilter === 'neq_dml' && isDml) return false;
      if (drawerTrackFilter === 'eq_core' && !isCore) return false;
      if (drawerTrackFilter === 'neq_core' && isCore) return false;

      // Granular sub-filter for DDL (when DDL is active)
      if (drawerTrackFilter === 'eq_ddl' && drawerDdlFilter !== 'all') {
        const matchString = (c.title + ' ' + (c.tags || []).join(' ') + ' ' + (c.moduleTitle || '')).toLowerCase();
        if (drawerDdlFilter === 'create' && !matchString.includes('create')) return false;
        if (drawerDdlFilter === 'use' && !matchString.includes('use')) return false;
        if (drawerDdlFilter === 'alter' && !matchString.includes('alter') && !matchString.includes('add') && !matchString.includes('modify')) return false;
        if (drawerDdlFilter === 'rename' && !matchString.includes('rename')) return false;
        if (drawerDdlFilter === 'truncate' && !matchString.includes('truncate')) return false;
        if (drawerDdlFilter === 'drop' && !matchString.includes('drop')) return false;
      }

      // Granular sub-filter for DML (when DML is active)
      if (drawerTrackFilter === 'eq_dml' && drawerDmlFilter !== 'all') {
        const matchString = (c.title + ' ' + (c.tags || []).join(' ') + ' ' + (c.moduleTitle || '')).toLowerCase();
        if (drawerDmlFilter === 'insert' && !matchString.includes('insert')) return false;
        if (drawerDmlFilter === 'update' && !matchString.includes('update')) return false;
        if (drawerDmlFilter === 'delete' && !matchString.includes('delete')) return false;
        if (drawerDmlFilter === 'select' && !matchString.includes('select')) return false;
      }

      // 2. Operator-based Level / Difficulty Filter (= and not =)
      if (drawerLevelFilter !== 'all') {
        const diff = (c.difficulty || '').toLowerCase();
        if (drawerLevelFilter === 'eq_basic' && diff !== 'basic') return false;
        if (drawerLevelFilter === 'neq_basic' && diff === 'basic') return false;
        if (drawerLevelFilter === 'eq_easy' && diff !== 'easy') return false;
        if (drawerLevelFilter === 'neq_easy' && diff === 'easy') return false;
        if (drawerLevelFilter === 'eq_medium' && diff !== 'medium') return false;
        if (drawerLevelFilter === 'neq_medium' && diff === 'medium') return false;
        if (drawerLevelFilter === 'eq_hard' && diff !== 'hard') return false;
        if (drawerLevelFilter === 'neq_hard' && diff === 'hard') return false;
      }

      // 3. Search Query Filter
      if (drawerSearch.trim()) {
        const q = drawerSearch.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.moduleTitle?.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [drawerSearch, drawerTrackFilter, drawerLevelFilter, drawerDdlFilter, drawerDmlFilter]);

  // ── LEETCODE PROGRESS DASHBOARD COMPUTATIONS ──
  const solvedCount = solvedChallenges.length;
  const overallPercent = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const basicEasyChallenges = useMemo(() =>
    SQL_CHALLENGES.filter(c => ['basic', 'easy'].includes((c.difficulty || '').toLowerCase())),
    []
  );
  const mediumChallenges = useMemo(() =>
    SQL_CHALLENGES.filter(c => ['medium', 'intermediate'].includes((c.difficulty || '').toLowerCase())),
    []
  );
  const hardChallenges = useMemo(() =>
    SQL_CHALLENGES.filter(c => ['hard', 'expert', 'extreme'].includes((c.difficulty || '').toLowerCase())),
    []
  );

  const solvedEasy = useMemo(() =>
    basicEasyChallenges.filter(c => solvedChallenges.includes(c.id)).length,
    [basicEasyChallenges, solvedChallenges]
  );
  const solvedMedium = useMemo(() =>
    mediumChallenges.filter(c => solvedChallenges.includes(c.id)).length,
    [mediumChallenges, solvedChallenges]
  );
  const solvedHard = useMemo(() =>
    hardChallenges.filter(c => solvedChallenges.includes(c.id)).length,
    [hardChallenges, solvedChallenges]
  );

  const easyPercent = basicEasyChallenges.length > 0 ? Math.round((solvedEasy / basicEasyChallenges.length) * 100) : 0;
  const mediumPercent = mediumChallenges.length > 0 ? Math.round((solvedMedium / mediumChallenges.length) * 100) : 0;
  const hardPercent = hardChallenges.length > 0 ? Math.round((solvedHard / hardChallenges.length) * 100) : 0;


  const handlePickRandom = () => {
    const unsolved = SQL_CHALLENGES.map((c, i) => ({ ...c, originalIndex: i })).filter(c => !solvedChallenges.includes(c.id));
    const pool = unsolved.length > 0 ? unsolved : SQL_CHALLENGES.map((c, i) => ({ ...c, originalIndex: i }));
    const randomCh = pool[Math.floor(Math.random() * pool.length)];
    handleOpenChallenge(randomCh.originalIndex);
  };

  const problemsetList = useMemo(() => {
    return SQL_CHALLENGES.map((c, i) => ({ ...c, originalIndex: i })).filter((c) => {
      // Category Filter
      if (selectedCategory !== 'all') {
        const cleanCat = getCleanCategoryName(c.moduleTitle);
        if (selectedCategory === 'DROP Operations') {
          const isDrop = cleanCat === 'DROP Operations' ||
            (c.title || '').toLowerCase().includes('drop') ||
            (c.expectedSql || '').toLowerCase().includes('drop') ||
            (c.tags || []).some(t => t.toLowerCase().includes('drop'));
          if (!isDrop) return false;
        } else if (cleanCat !== selectedCategory) {
          return false;
        }
      }

      // Difficulty Filter
      if (selectedDifficulty !== 'all') {
        const diff = (c.difficulty || 'Easy').toLowerCase();
        if (selectedDifficulty === 'basic') {
          if (diff !== 'basic') return false;
        } else if (selectedDifficulty === 'easy') {
          if (diff !== 'easy') return false;
        } else if (selectedDifficulty === 'medium') {
          if (!['medium', 'intermediate'].includes(diff) && !diff.includes('med')) return false;
        } else if (selectedDifficulty === 'hard') {
          if (!['hard', 'expert', 'extreme', 'advanced'].includes(diff) && !diff.includes('hard') && !diff.includes('adv')) return false;
        }
      }

      // Status Filter
      const isSolved = solvedChallenges.includes(c.id);
      if (selectedStatus === 'solved' && !isSolved) return false;
      if (selectedStatus === 'unsolved' && isSolved) return false;

      // Search Filter (supports title, module, tags, ID, description, SQL, and question number e.g. "1", "117", "#117")
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const qNum = String(c.originalIndex + 1);
        const cleanedQ = q.replace(/^#|^q\s*/i, '').trim();
        if (cleanedQ && qNum === cleanedQ) return true;

        const matchTitle = c.title.toLowerCase().includes(q);
        const matchModule = c.moduleTitle?.toLowerCase().includes(q);
        const matchTag = (c.tags || []).some(t => t.toLowerCase().includes(q));
        const matchId = c.id.toLowerCase().includes(q);
        const matchDesc = (c.description || '').toLowerCase().includes(q);
        const matchSql = (c.expectedSql || '').toLowerCase().includes(q);
        return matchTitle || matchModule || matchTag || matchId || matchDesc || matchSql;
      }

      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, solvedChallenges]);

  // Pagination Computations (strictly 50 questions per page)
  const itemsPerPage = 50;
  const totalPages = Math.max(1, Math.ceil(problemsetList.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery]);

  const paginatedProblems = useMemo(() => {
    if (itemsPerPage >= problemsetList.length) return problemsetList;
    const start = (validCurrentPage - 1) * itemsPerPage;
    return problemsetList.slice(start, start + itemsPerPage);
  }, [problemsetList, validCurrentPage]);

  // Dynamic pagination numbers: < 1 2 3 if 4 present then 4 or .. last and keep showing 3 only
  const paginationItems = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // If more than 4 pages: keep showing 3 pages, then '...', then the last page
    if (validCurrentPage <= 2) {
      return [1, 2, 3, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 1) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  }, [totalPages, validCurrentPage]);

  // ── SETTINGS MODAL COMPONENT (RENDERABLE IN BOTH VIEWS) ──
  const renderSettingsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setShowSettingsModal(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">Preferences & Settings</h3>
              <p className="text-[11.5px] text-slate-500 font-medium">Configure practice rules, anti-spoiler tags, and display</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Segmented Tabs Navigation Bar */}
        <div className="px-5 pt-3 pb-1 bg-white shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setSettingsActiveTab('practice')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settingsActiveTab === 'practice'
                  ? 'bg-white text-blue-600 font-black shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Target size={13} className={settingsActiveTab === 'practice' ? 'text-blue-600' : 'text-slate-400'} />
              <span>Practice</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsActiveTab('editor')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settingsActiveTab === 'editor'
                  ? 'bg-white text-blue-600 font-black shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Code2 size={13} className={settingsActiveTab === 'editor' ? 'text-blue-600' : 'text-slate-400'} />
              <span>Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsActiveTab('engine')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                settingsActiveTab === 'engine'
                  ? 'bg-white text-blue-600 font-black shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Database size={13} className={settingsActiveTab === 'engine' ? 'text-blue-600' : 'text-slate-400'} />
              <span>Engine</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-xs">
          
          {/* TAB 1: PRACTICE RULES & ANTI-SPOILER */}
          {settingsActiveTab === 'practice' && (
            <div className="space-y-3">
              
              {/* Hide Tags (Anti-Spoiler Mode) */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-1.5 font-black text-slate-900 text-xs">
                    <EyeOff size={14} className="text-amber-600" />
                    <span>Hide Problem Tags (Anti-Spoiler)</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Hides topic tags and query clauses so you think through query syntax on your own.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.hideTags}
                  onChange={() => updateSetting('hideTags', !settings.hideTags)}
                  label="Toggle Hide Tags"
                />
              </div>

              {/* Hide Difficulty (Mock Interview Mode) */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-1.5 font-black text-slate-900 text-xs">
                    <Target size={14} className="text-purple-600" />
                    <span>Hide Difficulty Ratings</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Masks Easy, Medium, and Hard badges for real-world blind coding assessments.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.hideDifficulty}
                  onChange={() => updateSetting('hideDifficulty', !settings.hideDifficulty)}
                  label="Toggle Hide Difficulty"
                />
              </div>

              {/* Compact Row Density */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-1.5 font-black text-slate-900 text-xs">
                    <AlignLeft size={14} className="text-slate-600" />
                    <span>Compact Table Row Density</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Reduces vertical padding in the problemset list to view more questions per screen.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.compactView}
                  onChange={() => updateSetting('compactView', !settings.compactView)}
                  label="Toggle Compact View"
                />
              </div>



              {/* Schema-Only Mode */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-1.5 font-black text-slate-900 text-xs">
                    <EyeOff size={14} className="text-blue-600" />
                    <span>Schema-Only Mode (Hide Data)</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Hides sample data rows and displays only column definitions and data types.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.schemaOnlyMode}
                  onChange={() => updateSetting('schemaOnlyMode', !settings.schemaOnlyMode)}
                  label="Toggle Schema-Only Mode"
                />
              </div>

              {/* Hide Hints */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-1.5 font-black text-slate-900 text-xs">
                    <Lightbulb size={14} className="text-amber-500" />
                    <span>Hide Hints (Strict Mode)</span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Hides the hints tab to simulate timed interview conditions.
                  </p>
                </div>
                <ToggleSwitch
                  checked={settings.hideHints}
                  onChange={() => updateSetting('hideHints', !settings.hideHints)}
                  label="Toggle Hide Hints"
                />
              </div>

            </div>
          )}

          {/* TAB 2: CODE EDITOR */}
          {settingsActiveTab === 'editor' && (
            <div className="space-y-3.5">
              
              {/* Font Size Selector */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Editor Font Size</span>
                  <span className="font-mono text-xs font-bold text-blue-600">{settings.fontSize || '13'}px</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {['12', '13', '14', '16'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => updateSetting('fontSize', size)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        settings.fontSize === size
                          ? 'bg-blue-600 text-white font-black shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Uppercase Keywords */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 text-xs">SQL Keyword Capitalization</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Formats SELECT, FROM, WHERE, JOIN to uppercase</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10.5px] font-bold">Enabled</span>
              </div>

              {/* Live Syntax Preview */}
              <div className="space-y-1">
                <span className="font-bold text-slate-500 text-[10.5px] uppercase tracking-wider">Live Preview</span>
                <div
                  style={{ fontSize: `${settings.fontSize || '13'}px` }}
                  className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-xl border border-slate-800 shadow-inner leading-relaxed"
                >
                  <span className="text-blue-400">SELECT</span> id, first_name, salary<br />
                  <span className="text-blue-400">FROM</span> employees<br />
                  <span className="text-blue-400">WHERE</span> salary &gt; 90000;
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SQL ENGINE */}
          {settingsActiveTab === 'engine' && (
            <div className="space-y-3">
              
              {/* Engine Specs */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">Runtime Engine</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10.5px] font-mono font-bold">
                    SQLite 3 WASM (Active)
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Zero latency in-browser execution with support for 20+ custom functions (CONCAT, IFNULL, NVL, NOW, DATEDIFF, LEN).
                </p>
              </div>

              {/* Dialects */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-800 text-xs">Supported SQL Dialects</span>
                <div className="flex flex-wrap gap-1.5">
                  {['ANSI SQL', 'MySQL', 'PostgreSQL', 'Oracle', 'MS SQL (T-SQL)'].map((dl) => (
                    <span key={dl} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10.5px] font-bold text-slate-700">
                      ✓ {dl}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reset Progress */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/70 flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-900 text-xs">Solved Challenges</div>
                  <div className="text-[11px] text-rose-700 font-medium">{solvedChallenges.length} challenges marked solved</div>
                </div>
                {resetConfirm ? (
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSolvedChallenges([]);
                        try {
                          localStorage.removeItem('msc_sql_solved_challenges');
                        } catch (_) {}
                        setResetConfirm(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[11px] rounded-lg cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
                  >
                    Reset History
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">Auto-saved to local browser storage</span>
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );

  // =========================================================================
  // VIEW 1: LEETCODE PROBLEMSET VIEW (PROGRESS CARDS & FULL QUESTIONS TABLE)
  // =========================================================================
  if (viewMode === 'list') {
    return (
      <div className="w-full h-full flex-1 overflow-y-auto bg-slate-50/70 font-segoe text-slate-800 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* ── TOP HERO BANNER & ACTIONS ── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-2xs">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Database size={19} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      SQL Practice Problemset
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-100">
                      {totalCount} Challenges
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium pt-0.5">
                Solve real database interview challenges. Track your progress across Easy, Medium, and Hard FAANG problems.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {onJumpToLearn && (
                <button
                  type="button"
                  onClick={onJumpToLearn}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <BookOpen size={14} />
                  <span>Curriculum</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                title="Practice Settings"
              >
                <Settings size={14} />
                <span className="hidden sm:inline">Settings</span>
              </button>
              <button
                type="button"
                onClick={handlePickRandom}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Shuffle size={14} />
                <span>Pick Random</span>
              </button>
            </div>
          </div>

          {/* ── LEETCODE PROGRESS CARDS DASHBOARD ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">

            {/* CARD 1: OVERALL PROGRESS SPEEDOMETER GAUGE */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge size={13} className="text-blue-600" />
                  Overall Progress
                </span>
                <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {solvedCount}/{totalCount} Solved
                </span>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                {/* Speedometer SVG Gauge (Large & Prominent) */}
                <div className="relative w-44 sm:w-48 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 140 82">
                    <defs>
                      <linearGradient id="speedoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    {/* Outer Gauge Arc Track */}
                    <path
                      d="M 12 70 A 58 58 0 0 1 128 70"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                    {/* Active Speedometer Progress Arc */}
                    <path
                      d="M 12 70 A 58 58 0 0 1 128 70"
                      fill="none"
                      stroke="url(#speedoGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="182.2"
                      strokeDashoffset={182.2 - (Math.min(100, Math.max(0, overallPercent)) / 100) * 182.2}
                      className="transition-all duration-700 ease-out"
                    />
                    {/* Gauge Pointer Needle */}
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
                    {/* Central Pivot Hub */}
                    <circle cx="70" cy="70" r="6.5" fill="#0f172a" />
                    <circle cx="70" cy="70" r="2.5" fill="#ffffff" />
                    {/* Speedometer Min/Max Bounds */}
                    <text x="12" y="80" fontSize="8.5" fontWeight="800" fill="#94a3b8" textAnchor="middle">0</text>
                    <text x="128" y="80" fontSize="8.5" fontWeight="800" fill="#94a3b8" textAnchor="middle">{totalCount}</text>
                    {/* Speedometer Centered Solved Metric */}
                    <text x="70" y="55" fontSize="16" fontWeight="900" fill="#0f172a" textAnchor="middle">{overallPercent}%</text>
                  </svg>
                </div>

                {/* Metrics on the Right */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div>
                    <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Solved</div>
                    <div className="font-mono text-base font-black text-slate-900 leading-tight">
                      {solvedCount} <span className="text-xs text-slate-400 font-bold">/ {totalCount}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                    <div className="font-mono text-xs font-bold text-slate-600">
                      {totalCount - solvedCount} Problems
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                      {solvedCount > 0 ? `${solvedCount} Completed` : 'Speedometer Gauge'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: DIFFICULTY BREAKDOWN (LeetCode Style Bars) */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-center space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Difficulty Breakdown</span>
                <span className="text-[11px] font-bold text-slate-400">Target 100%</span>
              </div>

              {/* Easy / Basic */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Easy / Basic
                  </span>
                  <span className="font-mono text-slate-700">{solvedEasy}/{basicEasyChallenges.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${easyPercent}%` }} />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium
                  </span>
                  <span className="font-mono text-slate-700">{solvedMedium}/{mediumChallenges.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${mediumPercent}%` }} />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Hard / FAANG
                  </span>
                  <span className="font-mono text-slate-700">{solvedHard}/{hardChallenges.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${hardPercent}%` }} />
                </div>
              </div>
            </div>

            {/* CARD 3: TECHNICAL INTERVIEW READINESS & TARGET TRACK */}
            <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/60 border border-blue-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100/80 text-indigo-800 text-[10px] font-black uppercase tracking-wide flex items-center space-x-1">
                    <Trophy size={11} className="text-indigo-600 inline" />
                    <span>FAANG & INTERVIEW PREP</span>
                  </span>
                  <span className="font-mono text-xs font-black text-indigo-700">
                    {totalCount - solvedCount} Remaining
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Technical Interview Readiness
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Master production database schemas, query optimizations, edge cases, and high-frequency company interview challenges.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus('unsolved');
                      setSelectedCategory('all');
                      setSelectedDifficulty('all');
                    }}
                    className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Practice Unsolved ({totalCount - solvedCount})</span>
                    <ArrowRight size={13} />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {overallPercent}% Ready
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ── FILTER & SEARCH TOOLBAR ── */}
          <div className="space-y-3 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            {/* Top row: Search input & Status/Difficulty dropdowns */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions by name, ID (e.g. filt-01), or tags..."
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

              {/* Question # Quick Jump */}
              <div className="relative flex items-center shrink-0">
                <input
                  type="text"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const raw = jumpInput.replace(/^#|^q\s*/i, '').trim();
                      const num = parseInt(raw, 10);
                      if (!isNaN(num) && num >= 1 && num <= totalCount) {
                        handleOpenChallenge(num - 1);
                      }
                    }
                  }}
                  placeholder="Go to #..."
                  className="w-24 pl-7 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                  title="Type question number (e.g. 117) and press Enter"
                />
                <Target size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Difficulty Custom Themed Dropdown */}
              <CustomDropdown
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                options={[
                  { value: 'all', label: 'All Difficulties' },
                  { value: 'basic', label: 'Basic', badgeColor: 'bg-sky-500' },
                  { value: 'easy', label: 'Easy', badgeColor: 'bg-emerald-500' },
                  { value: 'medium', label: 'Medium', badgeColor: 'bg-amber-500' },
                  { value: 'hard', label: 'Hard (FAANG)', badgeColor: 'bg-rose-500' }
                ]}
                icon={Filter}
              />

              {/* Status Custom Themed Dropdown */}
              <CustomDropdown
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'solved', label: 'Solved', badgeColor: 'bg-emerald-500' },
                  { value: 'unsolved', label: 'Unsolved', badgeColor: 'bg-slate-400' }
                ]}
                icon={CheckCircle2}
              />

              {/* Anti-Spoiler Quick Toggle */}
              <button
                type="button"
                onClick={() => updateSetting('hideTags', !settings.hideTags)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs shrink-0 ${
                  settings.hideTags
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-black'
                    : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title={settings.hideTags ? 'Tags are hidden (Anti-Spoiler Mode). Click to reveal.' : 'Click to hide tags to prevent spoilers.'}
              >
                {settings.hideTags ? <EyeOff size={13} className="text-amber-600" /> : <Eye size={13} className="text-slate-400" />}
                <span className="hidden md:inline">{settings.hideTags ? 'Spoilers Hidden' : 'Hide Tags'}</span>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Practice Settings"
              >
                <Settings size={15} />
              </button>
            </div>

            {/* Category Track Filter Pills (Hidden when hideTags Anti-Spoiler mode is active) */}
            {!settings.hideTags && (
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  All Topics ({totalCount})
                </button>

                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const isDay4 = cat.toLowerCase().includes('day 4');
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isActive
                          ? isDay4
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-900 text-white shadow-xs'
                          : isDay4
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {isDay4 && <Flame size={12} className={isActive ? 'text-amber-300' : 'text-amber-500'} />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── LEETCODE QUESTIONS TABLE ── */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50/80 font-black text-xs text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 w-12 text-center">Status</th>
                    <th scope="col" className="px-3 py-3.5 w-12 text-center">#</th>
                    <th scope="col" className="px-4 py-3.5 min-w-[280px]">Title</th>
                    <th scope="col" className="px-4 py-3.5">Category</th>
                    {!settings.hideTags && <th scope="col" className="px-4 py-3.5">Tags</th>}
                    <th scope="col" className="px-4 py-3.5">Difficulty</th>
                    <th scope="col" className="px-4 py-3.5 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {problemsetList.length === 0 ? (
                    <tr>
                      <td colSpan={settings.hideTags ? 6 : 7} className="px-6 py-12 text-center text-slate-500">
                        <div className="space-y-3 max-w-md mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                            <AlertTriangle size={22} />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">No problems match your current filters</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {selectedCategory !== 'all' && selectedDifficulty !== 'all'
                                ? `Category "${selectedCategory}" may have questions under another difficulty level.`
                                : 'Try adjusting your search query or resetting filters.'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            {selectedDifficulty !== 'all' && selectedCategory !== 'all' && (
                              <button
                                type="button"
                                onClick={() => setSelectedDifficulty('all')}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs"
                              >
                                Show All in {selectedCategory}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory('all');
                                setSelectedDifficulty('all');
                                setSelectedStatus('all');
                                setSearchQuery('');
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs"
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
                      const diff = (ch.difficulty || 'Easy').toLowerCase();
                      const isBasic = diff === 'basic';
                      const isEasy = diff === 'easy';
                      const isMedium = diff === 'medium' || diff === 'intermediate';
                      const diffColor = isBasic
                        ? 'text-sky-600'
                        : isEasy
                        ? 'text-emerald-600'
                        : isMedium
                        ? 'text-amber-500'
                        : 'text-rose-600';
                      const rowPadding = settings.compactView ? 'py-1.5' : 'py-3';

                      return (
                        <tr
                          key={ch.id}
                          className={`hover:bg-slate-50/80 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                        >
                          {/* Status */}
                          <td className={`px-4 ${rowPadding} text-center`}>
                            {isSolved ? (
                              <CheckCircle2 size={16} className="text-emerald-500 inline-block" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block group-hover:border-slate-400" />
                            )}
                          </td>

                          {/* Canonical Question Number # */}
                          <td className={`px-3 ${rowPadding} text-center font-mono`}>
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-black text-slate-600 border border-slate-200/70 font-mono inline-block shadow-2xs">
                              #{ch.originalIndex + 1}
                            </span>
                          </td>

                          {/* Title */}
                          <td className={`px-4 ${rowPadding}`}>
                            <button
                              type="button"
                              onClick={() => handleOpenChallenge(ch.originalIndex)}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left text-xs sm:text-sm transition-colors cursor-pointer block leading-snug"
                            >
                              {ch.title}
                            </button>
                          </td>

                          {/* Category */}
                          <td className={`px-4 ${rowPadding} whitespace-nowrap text-slate-600 font-medium`}>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-700 border border-slate-200/50">
                              {getCleanCategoryName(ch.moduleTitle)}
                            </span>
                          </td>

                          {/* Conceptual Tags with Anti-Spoiler Protection (max 1 or 2 small tags) */}
                          {!settings.hideTags && (
                            <td className={`px-4 ${rowPadding}`}>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(ch.tags || []).slice(0, 2).map((rawTag, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-1.5 py-0.5 bg-slate-100/90 border border-slate-200/80 rounded text-[10.5px] font-mono text-slate-600 font-bold"
                                  >
                                    {cleanTagForDisplay(rawTag)}
                                  </span>
                                ))}
                              </div>
                            </td>
                          )}

                          {/* Difficulty (Text Only in Color, Distinct Basic and Easy) */}
                          <td className={`px-4 ${rowPadding} whitespace-nowrap`}>
                            {!settings.hideDifficulty && (
                              <span className={`text-xs font-bold ${diffColor}`}>
                                {ch.difficulty || 'Easy'}
                              </span>
                            )}
                          </td>

                          {/* Action */}
                          <td className={`px-4 ${rowPadding} text-right whitespace-nowrap`}>
                            <button
                              type="button"
                              onClick={() => handleOpenChallenge(ch.originalIndex)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-transparent rounded-xl text-xs font-black transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs active:scale-95"
                            >
                              <Play size={11} fill="currentColor" />
                              <span>Solve</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── PAGINATION CONTROLS (STRICTLY 50 QUESTIONS PER PAGE) ── */}
            {problemsetList.length > 50 && (
              <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-center text-xs">
                {/* Compact Page Navigation: < 1 2 3 if 4 present then 4 or .. last > */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                    title="Previous Page"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {paginationItems.map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`dots-${idx}`} className="w-7 h-8 flex items-center justify-center text-slate-400 font-black select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center shadow-2xs"
                    title="Next Page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Modal (Accessible in List View) */}
          {showSettingsModal && renderSettingsModal()}

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: SOLVE WORKSPACE (MONACO EDITOR + CONSOLE + TESTCASES)
  // =========================================================================
  return (
    <div
      style={{ height: 'calc(100vh - 63px)', overflow: 'hidden' }}
      className="w-full flex flex-col font-segoe text-slate-800 bg-slate-50/40 relative"
    >
      {/* =========================================================================
          TOP LEETCODE WORKSPACE NAVIGATION BAR (RESPONSIVE FOR ALL SCREENS)
         ========================================================================= */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 shadow-2xs z-20 gap-2">
        
        {/* Left Group: Back to Problemset + Problems Drawer Button & Prev/Next & Title */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          
          {/* Back to All Problems / Progress Dashboard Button */}
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200/90 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs active:scale-95 shrink-0"
            title="Back to All Problems & Progress Dashboard"
          >
            <ArrowLeft size={13} className="text-slate-600 shrink-0" />
            <span className="hidden xs:inline">Problemset</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden xs:block" />

          {/* Quick Problem List Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setShowDrawer(true)}
            className="px-2.5 sm:px-3 py-1.5 bg-slate-100/90 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 shadow-2xs active:scale-95 shrink-0"
            title="Open Problem Selector Drawer"
          >
            <LayoutGrid size={14} className="text-blue-600 shrink-0" />
            <span className="font-extrabold text-slate-800 hidden xs:inline">Problems</span>
            <span className="font-mono text-[10px] sm:text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200/80 text-slate-600 font-bold">
              {selectedChallengeIndex + 1}/{totalCount}
            </span>
            <ChevronRight size={12} className="text-slate-400 rotate-90 shrink-0" />
          </button>

          <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden sm:block" />

          {/* Quick Prev / Next problem navigation */}
          <div className="flex items-center space-x-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              disabled={selectedChallengeIndex === 0}
              onClick={() => setSelectedChallengeIndex((prev) => Math.max(0, prev - 1))}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              title="Previous Problem"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              disabled={selectedChallengeIndex === SQL_CHALLENGES.length - 1}
              onClick={() => setSelectedChallengeIndex((prev) => Math.min(SQL_CHALLENGES.length - 1, prev + 1))}
              className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all"
              title="Next Problem"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Title & Metadata */}
          <div className="flex items-center space-x-2 min-w-0 truncate pl-0.5">
            <span className="font-mono text-xs font-black text-slate-400 shrink-0 hidden sm:inline">
              #{selectedChallengeIndex + 1}.
            </span>
            <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
              {activeChallenge?.title}
            </span>
            <span
              className={`text-[11px] sm:text-xs font-bold capitalize shrink-0 ${
                activeChallenge?.difficulty?.toLowerCase() === 'basic'
                  ? 'text-sky-600'
                  : activeChallenge?.difficulty?.toLowerCase() === 'easy'
                  ? 'text-emerald-600'
                  : activeChallenge?.difficulty?.toLowerCase() === 'medium'
                  ? 'text-amber-500'
                  : 'text-rose-600'
              }`}
            >
              {activeChallenge?.difficulty}
            </span>
            {isCurrentSolved && (
              <span className="text-xs font-bold text-emerald-600 hidden md:flex items-center gap-0.5 shrink-0">
                <Check size={12} strokeWidth={3} /> Solved
              </span>
            )}
          </div>
        </div>

        {/* Right Group: Action Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer"
            title="Practice Settings (Schema-only, Hide hints)"
          >
            <Settings size={14} />
          </button>

          {/* Format Code */}
          <button
            type="button"
            onClick={handleFormatCode}
            className="px-2 sm:px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
            title="Format SQL query"
          >
            <AlignLeft size={12} />
            <span className="hidden md:inline">Format</span>
          </button>

          {/* Reset Code */}
          <button
            type="button"
            onClick={handleResetCode}
            className="px-2 sm:px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
            title="Reset to blank template"
          >
            <RotateCcw size={12} />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2 sm:px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs transition-all cursor-pointer"
            title="Copy SQL code"
          >
            {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span className="hidden lg:inline">{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>

          {/* RUN QUERY BUTTON */}
          <button
            type="button"
            onClick={handleRunQuery}
            disabled={runningAction}
            className="px-2.5 sm:px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Play size={12} className="fill-slate-800" />
            <span>Run</span>
          </button>

          {/* SUBMIT SOLUTION BUTTON */}
          <button
            type="button"
            onClick={handleSubmitSolution}
            disabled={runningAction}
            className="px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg flex items-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Send size={12} />
            <span className="hidden sm:inline">{runningAction && consoleMode === 'submit' ? 'Running...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE & TABLET PANE SWITCHER (< 1024px)
         ========================================================================= */}
      <div className="lg:hidden flex items-center justify-around bg-slate-100/90 border-b border-slate-200 p-1 shrink-0 text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setMobileActivePane('problem')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileActivePane === 'problem'
              ? 'bg-white text-blue-700 shadow-2xs font-extrabold border border-slate-200/80'
              : 'hover:bg-slate-200/60 text-slate-600'
          }`}
        >
          <FileText size={13} />
          <span>Problem</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActivePane('editor')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileActivePane === 'editor'
              ? 'bg-white text-blue-700 shadow-2xs font-extrabold border border-slate-200/80'
              : 'hover:bg-slate-200/60 text-slate-600'
          }`}
        >
          <Terminal size={13} />
          <span>Code Editor</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActivePane('console')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
            mobileActivePane === 'console'
              ? 'bg-white text-blue-700 shadow-2xs font-extrabold border border-slate-200/80'
              : 'hover:bg-slate-200/60 text-slate-600'
          }`}
        >
          <Sparkles size={13} />
          <span>Output / Testcases</span>
          {consoleMode !== 'idle' && (
            <span
              className={`w-2 h-2 rounded-full ${
                submissionResult ? (submissionResult.passed ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-blue-500'
              }`}
            />
          )}
        </button>
      </div>

      {/* =========================================================================
          MAIN WORKSPACE BODY
          - Desktop (>=1024px): 2-pane resizable split view
          - Mobile / Tablet (<1024px): Full-width tabbed view based on mobileActivePane
         ========================================================================= */}
      <div
        ref={containerRef}
        style={{
          userSelect: isDraggingHorizontal || isDraggingVertical ? 'none' : 'auto'
        }}
        className="flex-1 flex w-full overflow-hidden relative"
      >
        
        {/* ── LEFT PANE: Problem Statement & Schema (Independently Scrollable) ── */}
        <div
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${leftWidthPercent}%` : '100%' }}
          className={`h-full flex-col bg-white border-r border-slate-200 overflow-hidden shrink-0 ${
            typeof window !== 'undefined' && window.innerWidth < 1024
              ? mobileActivePane === 'problem' ? 'flex w-full' : 'hidden'
              : 'flex'
          }`}
        >
          {/* Problem Tabs Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-1 flex items-center space-x-1 shrink-0 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setSolveTab('description')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                solveTab === 'description'
                  ? 'bg-white text-blue-700 font-black shadow-2xs border border-slate-200/80'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <FileText size={13} />
              <span>Description</span>
            </button>

            <button
              type="button"
              onClick={() => setSolveTab('schema')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                solveTab === 'schema'
                  ? 'bg-white text-blue-700 font-black shadow-2xs border border-slate-200/80'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Database size={13} />
              <span>{settings.schemaOnlyMode ? 'Table Schema' : 'Database Tables'}</span>
            </button>

            {!settings.hideHints && activeChallenge?.hints && activeChallenge.hints.length > 0 && (
              <button
                type="button"
                onClick={() => setSolveTab('hints')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${
                  solveTab === 'hints'
                    ? 'bg-white text-amber-700 font-black shadow-2xs border border-slate-200/80'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Lightbulb size={13} className="text-amber-500" />
                <span>Hints</span>
              </button>
            )}
          </div>

          {/* Left Pane Body (Independently Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
            
            {solveTab === 'description' && (
              <div className="space-y-4">
                {/* Header Title & Badges */}
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {selectedChallengeIndex + 1}. {activeChallenge?.title?.replace(/:\s*(CREATE|DROP|ALTER|TRUNCATE|RENAME)\b.*/i, '').trim()}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {!settings.hideDifficulty && (
                      <>
                        <span
                          className={`font-bold capitalize ${
                            activeChallenge?.difficulty?.toLowerCase() === 'basic'
                              ? 'text-sky-600'
                              : activeChallenge?.difficulty?.toLowerCase() === 'easy'
                              ? 'text-emerald-600'
                              : activeChallenge?.difficulty?.toLowerCase() === 'medium'
                              ? 'text-amber-500'
                              : 'text-rose-600'
                          }`}
                        >
                          {activeChallenge?.difficulty}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                      {getCleanCategoryName(activeChallenge?.moduleTitle)}
                    </span>
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                      SQL
                    </span>
                  </div>
                </div>

                {/* Rich Formatted Problem Description */}
                <RichMarkdown content={activeChallenge?.description} />
              </div>
            )}

            {solveTab === 'schema' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="text-xs font-black text-slate-900 flex items-center space-x-1.5 uppercase tracking-wider">
                    <Database size={14} className="text-blue-600" />
                    <span>{settings.schemaOnlyMode ? 'Table Columns & Types (Schema Only)' : 'Database Schemas & Data'}</span>
                  </div>

                  {!settings.schemaOnlyMode && (
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSchemaViewTab('data')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          schemaViewTab === 'data' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Sample Records
                      </button>
                      <button
                        type="button"
                        onClick={() => setSchemaViewTab('structure')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          schemaViewTab === 'structure' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Columns & Types
                      </button>
                    </div>
                  )}
                </div>

                {loadingSchemas ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading database tables...</div>
                ) : tableSchemas.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">No tables defined for this challenge.</div>
                ) : (
                  <div className="space-y-4">
                    {tableSchemas.map((tbl, tIdx) => {
                      const tableName = tbl.tableName || tbl.name || `Table ${tIdx + 1}`;
                      const columnObjects = Array.isArray(tbl.columns) ? tbl.columns : [];
                      const dataRows = tbl.sampleRows || tbl.rows || tbl.values || [];

                      return (
                        <div key={tIdx} className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs font-mono font-black text-blue-900 flex items-center space-x-1.5">
                              <Table size={13} className="text-blue-600" />
                              <span>Table: {tableName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              {columnObjects.length} columns {settings.schemaOnlyMode ? '' : `• ${dataRows.length} rows`}
                            </span>
                          </div>

                          {(settings.schemaOnlyMode || schemaViewTab === 'structure') ? (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                <thead className="bg-slate-50 font-black text-slate-700 text-[11px]">
                                  <tr>
                                    <th className="px-3 py-1.5">Column Name</th>
                                    <th className="px-3 py-1.5">Data Type</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-xs">
                                  {columnObjects.map((c, cIdx) => (
                                    <tr key={cIdx} className="hover:bg-slate-50/70">
                                      <td className="px-3 py-1.5 font-bold text-slate-900">{typeof c === 'object' ? (c.name || c.column_name) : c}</td>
                                      <td className="px-3 py-1.5 text-blue-600 font-bold">{typeof c === 'object' ? (c.type || 'TEXT') : 'TEXT'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                <thead className="bg-slate-50 font-black text-slate-700 text-[11px]">
                                  <tr>
                                    <th className="px-2.5 py-1 text-slate-400 font-mono text-[10px] border-r border-slate-100">#</th>
                                    {columnObjects.map((c, cIdx) => (
                                      <th key={cIdx} className="px-2.5 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                        {typeof c === 'object' ? (c.name || c.column_name) : c}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono text-slate-700 text-xs">
                                  {dataRows.map((r, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50/70">
                                      <td className="px-2.5 py-1.5 text-slate-400 text-[10px] border-r border-slate-100">{rIdx + 1}</td>
                                      {Array.isArray(r) ? (
                                        r.map((val, vIdx) => (
                                          <td key={vIdx} className="px-2.5 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-medium">
                                            {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                          </td>
                                        ))
                                      ) : (
                                        <td className="px-2.5 py-1">{String(r)}</td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!settings.hideHints && solveTab === 'hints' && (
              <div className="space-y-3">
                <div className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-1.5">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span>Challenge Hints</span>
                </div>
                {activeChallenge?.hints?.map((h, i) => (
                  <div key={i} className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-950 font-medium flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 leading-relaxed">{parseInline(h)}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── DESKTOP DRAGGABLE VERTICAL DIVIDER LINE (>=1024px) ── */}
        <div
          onMouseDown={() => setIsDraggingHorizontal(true)}
          className="hidden lg:flex w-1.5 hover:w-2 bg-slate-200 hover:bg-blue-500 active:bg-blue-600 cursor-col-resize select-none transition-colors relative items-center justify-center shrink-0 z-30 group"
          title="Drag to resize panel widths"
        >
          <div className="w-1 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
        </div>

        {/* ── RIGHT PANE: Code Editor & Console ── */}
        <div
          ref={rightPaneRef}
          style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? `${100 - leftWidthPercent}%` : '100%' }}
          className={`h-full flex-col bg-white overflow-hidden shrink-0 ${
            typeof window !== 'undefined' && window.innerWidth < 1024
              ? mobileActivePane !== 'problem' ? 'flex w-full' : 'hidden'
              : 'flex'
          }`}
        >
          
          {/* (1) TOP SUB-PANE: SQL SOLUTION CODE EDITOR */}
          <div
            style={{
              height: typeof window !== 'undefined' && window.innerWidth < 1024
                ? mobileActivePane === 'editor' ? '100%' : '0%'
                : `${editorHeightPercent}%`
            }}
            className={`flex-col bg-white overflow-hidden shrink-0 ${
              typeof window !== 'undefined' && window.innerWidth < 1024 && mobileActivePane !== 'editor' ? 'hidden' : 'flex'
            }`}
          >
            {/* Editor Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-1.5 flex items-center justify-between shrink-0 text-xs font-bold text-slate-700">
              <div className="flex items-center space-x-2">
                <Terminal size={13} className="text-slate-500" />
                <span className="font-mono text-xs font-black text-slate-800">SQL Solution Editor</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleFormatCode}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Format SQL
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-mono text-slate-400">Ctrl+Enter to Run</span>
              </div>
            </div>

            {/* Editor Textarea with Line Numbers effect */}
            <div className="flex-1 relative overflow-hidden bg-white">
              <textarea
                value={userSql}
                onChange={(e) => setUserSql(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                style={{ fontSize: `${settings.fontSize || '13'}px` }}
                className="w-full h-full p-4 font-mono text-slate-900 bg-white focus:outline-none focus:ring-0 leading-relaxed font-semibold resize-none overflow-y-auto"
                placeholder="Type your SQL statement here..."
                spellCheck="false"
              />
            </div>
          </div>

          {/* (2) DESKTOP DRAGGABLE HORIZONTAL DIVIDER LINE (>=1024px) */}
          <div
            onMouseDown={() => setIsDraggingVertical(true)}
            className="hidden lg:flex h-1.5 hover:h-2 bg-slate-200 hover:bg-blue-500 active:bg-blue-600 cursor-row-resize select-none transition-colors relative items-center justify-center shrink-0 z-20 group"
            title="Drag to resize editor vs console"
          >
            <div className="h-1 w-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
          </div>

          {/* (3) BOTTOM SUB-PANE: OUTPUT & TESTCASE CONSOLE */}
          <div
            style={{
              height: typeof window !== 'undefined' && window.innerWidth < 1024
                ? mobileActivePane === 'console' ? '100%' : '0%'
                : `${100 - editorHeightPercent}%`
            }}
            className={`flex-col bg-white overflow-hidden shrink-0 ${
              typeof window !== 'undefined' && window.innerWidth < 1024 && mobileActivePane !== 'console' ? 'hidden' : 'flex'
            }`}
          >
            {/* Console Header Tabs */}
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-1 flex items-center justify-between shrink-0 text-xs font-bold">
              <div className="flex items-center space-x-1">
                {/* RUN MODE TABS */}
                {consoleMode === 'run' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveConsoleSubTab('your_output')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        activeConsoleSubTab === 'your_output'
                          ? 'bg-white text-blue-700 shadow-2xs font-black border border-slate-200/80'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>Your Output</span>
                    </button>
                    {rawExpectedResult && (
                      <button
                        type="button"
                        onClick={() => setActiveConsoleSubTab('expected_output')}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                          activeConsoleSubTab === 'expected_output'
                            ? 'bg-white text-blue-700 shadow-2xs font-black border border-slate-200/80'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>Expected Output</span>
                      </button>
                    )}
                  </>
                )}

                {/* SUBMIT MODE TABS (Testcases) */}
                {consoleMode === 'submit' && submissionResult && (
                  <>
                    {submissionResult.testcases.map((tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveTestCaseIndex(idx)}
                        className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                          activeTestCaseIndex === idx
                            ? 'bg-white text-blue-700 shadow-2xs font-black border border-slate-200/80'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>Case {idx + 1}</span>
                        {tc.passed ? (
                          <CheckCircle2 size={13} className="text-emerald-500" strokeWidth={2.5} />
                        ) : (
                          <XCircle size={13} className="text-rose-500" strokeWidth={2.5} />
                        )}
                      </button>
                    ))}
                  </>
                )}

                {consoleMode === 'idle' && (
                  <span className="text-slate-500 text-[11px] font-bold">Console Results</span>
                )}
              </div>

              {/* Execution Metrics Pill */}
              {consoleMode === 'run' && rawExecutionResult && (
                <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                  {rawExecutionResult.rowCount} row(s) • {rawExecutionResult.executionTimeMs} ms
                </span>
              )}
              {consoleMode === 'submit' && submissionResult && (
                <span
                  className={`text-[10.5px] font-bold px-2 py-0.5 rounded ${
                    submissionResult.passed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {submissionResult.passed ? 'Accepted' : 'Wrong Answer'} ({submissionResult.passedCases}/{submissionResult.totalCases})
                </span>
              )}
            </div>

            {/* Console Body Area (Independently Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              
              {/* RUN RESULTS VIEW */}
              {consoleMode === 'run' && rawExecutionResult && (
                <div className="space-y-3">
                  {/* Error Alert */}
                  {rawExecutionResult.error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start space-x-2">
                      <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <div className="font-black">SQL Syntax / Runtime Error:</div>
                        <div className="text-[11.5px] font-mono mt-0.5">{rawExecutionResult.error}</div>
                      </div>
                    </div>
                  )}

                  {/* Tab 1: Your Output */}
                  {activeConsoleSubTab === 'your_output' && rawExecutionResult.success && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700">
                        <span>Your Query Result:</span>
                        <span className="font-mono text-[11px] text-slate-400 font-semibold">{rawExecutionResult.rowCount} rows</span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-800">
                            <tr>
                              <th className="px-2.5 py-1.5 text-slate-400 font-mono text-[10px] border-r border-slate-100">#</th>
                              {(rawExecutionResult.columns || []).map((col, idx) => (
                                <th key={idx} className="px-3 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {(rawExecutionResult.values || []).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70">
                                <td className="px-2.5 py-1.5 text-slate-400 text-[10px] border-r border-slate-100">{rIdx + 1}</td>
                                {Array.isArray(row) ? (
                                  row.map((val, cIdx) => (
                                    <td key={cIdx} className="px-3 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-medium">
                                      {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                    </td>
                                  ))
                                ) : (
                                  <td className="px-3 py-1.5">{String(row)}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Expected Output */}
                  {activeConsoleSubTab === 'expected_output' && rawExpectedResult?.success && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black text-slate-700">
                        <span>Expected Output (Canonical Solution):</span>
                        <span className="font-mono text-[11px] text-slate-400 font-semibold">{rawExpectedResult.rowCount} rows</span>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                          <thead className="bg-slate-50 font-black text-slate-800">
                            <tr>
                              <th className="px-2.5 py-1.5 text-slate-400 font-mono text-[10px] border-r border-slate-100">#</th>
                              {(rawExpectedResult.columns || []).map((col, idx) => (
                                <th key={idx} className="px-3 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                            {(rawExpectedResult.values || []).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/70">
                                <td className="px-2.5 py-1.5 text-slate-400 text-[10px] border-r border-slate-100">{rIdx + 1}</td>
                                {Array.isArray(row) ? (
                                  row.map((val, cIdx) => (
                                    <td key={cIdx} className="px-3 py-1.5 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-medium text-emerald-800">
                                      {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                    </td>
                                  ))
                                ) : (
                                  <td className="px-3 py-1.5 text-emerald-800">{String(row)}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBMIT RESULTS VIEW (TESTCASES & RED HIGHLIGHTING) */}
              {consoleMode === 'submit' && submissionResult && (
                <div className="space-y-4">
                  {(() => {
                    const activeCase = submissionResult.testcases[activeTestCaseIndex] || submissionResult.testcases[0];
                    if (!activeCase) return null;

                    const userRes = activeCase.userResult;
                    const expRes = activeCase.expectedResult;
                    const missingIndices = activeCase.missingInUserIndices || [];
                    const extraIndices = activeCase.extraInUserIndices || [];

                    return (
                      <div className="space-y-3">
                        {/* Pass / Fail Banner */}
                        <div
                          className={`p-3 rounded-xl border flex items-start space-x-2 text-xs font-semibold ${
                            activeCase.passed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : userRes?.error
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-rose-50/90 text-rose-900 border-rose-200'
                          }`}
                        >
                          {activeCase.passed ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                          ) : (
                            <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                          )}
                          <div className="flex-1">
                            <div className="font-black text-xs mb-0.5">
                              {activeCase.passed
                                ? `Test Case ${activeCase.caseIndex}: Accepted`
                                : userRes?.error
                                ? `Test Case ${activeCase.caseIndex}: Execution Error`
                                : `Test Case ${activeCase.caseIndex}: Wrong Answer`}
                            </div>
                            <div className="text-[11.5px] leading-relaxed">
                              {activeCase.message}
                            </div>
                          </div>
                        </div>

                        {/* Side-by-Side Comparison Tables with Red Highlight on discrepancies */}
                        {userRes?.success && expRes?.success && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            
                            {/* User Output Column */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                                <span>Your Output:</span>
                                <span className="text-[10px] font-mono text-slate-400">{userRes.rowCount} row(s)</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs max-h-60">
                                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                  <thead className="bg-slate-50 font-black text-slate-800">
                                    <tr>
                                      <th className="px-2 py-1 text-slate-400 font-mono text-[10px] border-r border-slate-100">#</th>
                                      {(userRes.columns || []).map((col, cIdx) => (
                                        <th key={cIdx} className="px-2.5 py-1 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                                    {(userRes.values || []).map((row, rIdx) => {
                                      const isExtra = extraIndices.includes(rIdx);
                                      return (
                                        <tr
                                          key={rIdx}
                                          className={isExtra ? 'bg-rose-50 text-rose-800 font-bold' : 'hover:bg-slate-50/70'}
                                        >
                                          <td className="px-2 py-1 text-slate-400 text-[10px] border-r border-slate-100">{rIdx + 1}</td>
                                          {Array.isArray(row) ? (
                                            row.map((val, cIdx) => (
                                              <td key={cIdx} className="px-2.5 py-1 border-r border-slate-100 last:border-r-0 whitespace-nowrap font-medium">
                                                {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                              </td>
                                            ))
                                          ) : (
                                            <td className="px-2.5 py-1">{String(row)}</td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {extraIndices.length > 0 && (
                                <div className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1 pt-0.5">
                                  <CircleAlert size={12} />
                                  <span>Highlighted in red: {extraIndices.length} incorrect row(s) returned by your query.</span>
                                </div>
                              )}
                            </div>

                            {/* Expected Output Column */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-black text-slate-700">
                                <span>Expected Output:</span>
                                <span className="text-[10px] font-mono text-slate-400">{expRes.rowCount} row(s)</span>
                              </div>
                              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs max-h-60">
                                <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                                  <thead className="bg-slate-50 font-black text-slate-800">
                                    <tr>
                                      <th className="px-2 py-1 text-slate-400 font-mono text-[10px] border-r border-slate-100">#</th>
                                      {(expRes.columns || []).map((col, cIdx) => (
                                        <th key={cIdx} className="px-2.5 py-1 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                                    {(expRes.values || []).map((row, rIdx) => {
                                      const isMissing = missingIndices.includes(rIdx);
                                      return (
                                        <tr
                                          key={rIdx}
                                          className={isMissing ? 'bg-amber-50/90 text-rose-700 font-bold' : 'hover:bg-slate-50/70 text-emerald-800 font-medium'}
                                        >
                                          <td className="px-2 py-1 text-slate-400 text-[10px] border-r border-slate-100">{rIdx + 1}</td>
                                          {Array.isArray(row) ? (
                                            row.map((val, cIdx) => (
                                              <td key={cIdx} className="px-2.5 py-1 border-r border-slate-100 last:border-r-0 whitespace-nowrap">
                                                {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                                              </td>
                                            ))
                                          ) : (
                                            <td className="px-2.5 py-1">{String(row)}</td>
                                          )}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              {missingIndices.length > 0 && (
                                <div className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1 pt-0.5">
                                  <CircleAlert size={12} />
                                  <span>Highlighted in red: {missingIndices.length} expected row(s) missing from your query result.</span>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* IDLE PLACEHOLDER */}
              {consoleMode === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Terminal size={22} className="text-slate-300 mb-2" />
                  <div className="text-xs font-bold text-slate-600">Run code to see results</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Click <strong className="text-slate-600">Run</strong> to inspect your query or <strong className="text-emerald-600">Submit</strong> to validate testcases.
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* =========================================================================
          QUICK PROBLEM LIST DRAWER / SIDEBAR POPUP (RESPONSIVE FULL-SCREEN ON PHONES)
         ========================================================================= */}
      {showDrawer && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setShowDrawer(false)}
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out Drawer Panel */}
          <div className="relative w-full sm:w-96 h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <LayoutGrid size={16} className="text-blue-600" />
                <span className="text-sm font-black text-slate-900">Problem List ({totalCount})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Filters: Search + Difficulty Pills */}
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Search questions & topics..."
                  style={{ paddingLeft: '34px', paddingRight: '28px' }}
                  className="w-full py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
                {drawerSearch && (
                  <button
                    type="button"
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Track Quick Tabs (Compact labels: All, DDL, DML, Core to save space) */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerTrack('all');
                    setDrawerTrackFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    drawerTrackFilter === 'all'
                      ? 'bg-slate-900 text-white font-extrabold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerTrack('filtering');
                    setDrawerTrackFilter(drawerTrackFilter === 'eq_filtering' ? 'all' : 'eq_filtering');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                    drawerTrackFilter === 'eq_filtering'
                      ? 'bg-blue-600 text-white font-extrabold shadow-2xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
                  }`}
                >
                  <span>Filtering</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    drawerTrackFilter === 'eq_filtering' ? 'bg-blue-700 text-white' : 'bg-blue-200/80 text-blue-900'
                  }`}>
                    40
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerTrack('ddl');
                    setDrawerTrackFilter(drawerTrackFilter === 'eq_ddl' ? 'all' : 'eq_ddl');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                    drawerTrackFilter === 'eq_ddl'
                      ? 'bg-blue-600 text-white font-extrabold shadow-2xs'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
                  }`}
                >
                  <span>DDL</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    drawerTrackFilter === 'eq_ddl' ? 'bg-blue-700 text-white' : 'bg-blue-200/80 text-blue-900'
                  }`}>
                    50
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerTrack('dml');
                    setDrawerTrackFilter(drawerTrackFilter === 'eq_dml' ? 'all' : 'eq_dml');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                    drawerTrackFilter === 'eq_dml'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
                  }`}
                >
                  <span>DML</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    drawerTrackFilter === 'eq_dml' ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-900'
                  }`}>
                    50
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerTrack('core');
                    setDrawerTrackFilter(drawerTrackFilter === 'eq_core' ? 'all' : 'eq_core');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                    drawerTrackFilter === 'eq_core'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-2xs'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
                  }`}
                >
                  <span>Core</span>
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-black ${
                    drawerTrackFilter === 'eq_core' ? 'bg-indigo-700 text-white' : 'bg-indigo-200/80 text-indigo-900'
                  }`}>
                    16
                  </span>
                </button>
              </div>

              {/* Operator-Based Filter Controls Bar (= and not =) for Type & Level */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {/* Type Filter Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <select
                    value={drawerTrackFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDrawerTrackFilter(val);
                      if (val === 'eq_ddl') setDrawerTrack('ddl');
                      else if (val === 'eq_dml') setDrawerTrack('dml');
                      else if (val === 'eq_core') setDrawerTrack('core');
                      else setDrawerTrack('all');
                    }}
                    className={`w-full py-1.5 pl-2.5 pr-6 text-[11px] font-bold rounded-xl border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      drawerTrackFilter !== 'all'
                        ? 'bg-blue-50/90 border-blue-300 text-blue-900 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <option value="all">Type: All</option>
                    <optgroup label="Equal (=)">
                      <option value="eq_filtering">= Filtering (40)</option>
                      <option value="eq_ddl">= DDL (50)</option>
                      <option value="eq_dml">= DML (50)</option>
                      <option value="eq_core">= Core (16)</option>
                    </optgroup>
                    <optgroup label="Not Equal (not =)">
                      <option value="neq_filtering">not = Filtering (116)</option>
                      <option value="neq_ddl">not = DDL (106)</option>
                      <option value="neq_dml">not = DML (106)</option>
                      <option value="neq_core">not = Core (140)</option>
                    </optgroup>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Level Filter Dropdown */}
                <div className="relative flex-1 min-w-0">
                  <select
                    value={drawerLevelFilter}
                    onChange={(e) => setDrawerLevelFilter(e.target.value)}
                    className={`w-full py-1.5 pl-2.5 pr-6 text-[11px] font-bold rounded-xl border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                      drawerLevelFilter !== 'all'
                        ? 'bg-amber-50/90 border-amber-300 text-amber-900 font-extrabold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <option value="all">Level: All</option>
                    <optgroup label="Equal (=)">
                      <option value="eq_basic">= Basic</option>
                      <option value="eq_easy">= Easy</option>
                      <option value="eq_medium">= Medium</option>
                      <option value="eq_hard">= Hard</option>
                    </optgroup>
                    <optgroup label="Not Equal (not =)">
                      <option value="neq_basic">not = Basic</option>
                      <option value="neq_easy">not = Easy</option>
                      <option value="neq_medium">not = Medium</option>
                      <option value="neq_hard">not = Hard</option>
                    </optgroup>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {/* Clear / Reset Filter Button */}
                {(drawerTrackFilter !== 'all' || drawerLevelFilter !== 'all' || drawerDdlFilter !== 'all' || drawerDmlFilter !== 'all' || drawerSearch !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerTrack('all');
                      setDrawerTrackFilter('all');
                      setDrawerLevelFilter('all');
                      setDrawerDdlFilter('all');
                      setDrawerDmlFilter('all');
                      setDrawerSearch('');
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer shrink-0"
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>

              {/* DDL Operational Granular Filters (CREATE, USE, ALTER, RENAME, TRUNCATE, DROP) */}
              {drawerTrackFilter === 'eq_ddl' && (
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  {[
                    { id: 'all', label: 'All DDL' },
                    { id: 'create', label: 'CREATE' },
                    { id: 'use', label: 'USE' },
                    { id: 'alter', label: 'ALTER' },
                    { id: 'rename', label: 'RENAME' },
                    { id: 'truncate', label: 'TRUNCATE' },
                    { id: 'drop', label: 'DROP' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setDrawerDdlFilter(sub.id)}
                      className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer shrink-0 ${
                        drawerDdlFilter === sub.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* DML Operational Granular Filters (INSERT, UPDATE, DELETE, SELECT) */}
              {drawerTrackFilter === 'eq_dml' && (
                <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                  {[
                    { id: 'all', label: 'All DML (50)' },
                    { id: 'insert', label: 'INSERT (12)' },
                    { id: 'update', label: 'UPDATE (16)' },
                    { id: 'delete', label: 'DELETE (10)' },
                    { id: 'select', label: 'SELECT (12)' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setDrawerDmlFilter(sub.id)}
                      className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer shrink-0 ${
                        drawerDmlFilter === sub.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Problem List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50">
              {drawerChallenges.map((ch) => {
                const isSelected = ch.originalIndex === selectedChallengeIndex;
                const isSolved = solvedChallenges.includes(ch.id);

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleOpenChallenge(ch.originalIndex)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-extrabold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-slate-400 font-bold shrink-0">
                        #{ch.originalIndex + 1}
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span
                        className={`text-[10.5px] font-bold capitalize ${
                          ch.difficulty?.toLowerCase() === 'basic'
                            ? 'text-sky-600'
                            : ch.difficulty?.toLowerCase() === 'easy'
                            ? 'text-emerald-600'
                            : ch.difficulty?.toLowerCase() === 'medium'
                            ? 'text-amber-500'
                            : 'text-rose-600'
                        }`}
                      >
                        {ch.difficulty}
                      </span>
                      {isSolved && <CheckCircle2 size={13} className="text-emerald-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TABBED PRACTICE SETTINGS MODAL (PREMIUM & BALANCED UI)
         ========================================================================= */}
      {showSettingsModal && renderSettingsModal()}

    </div>
  );
}
