import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, Copy, Check, Table, CheckCircle2, ChevronRight,
  ChevronUp, ChevronDown, ArrowRight, ArrowLeft, Lightbulb, Code2, Menu, X, Maximize2,
  Server, Layers, ShieldCheck, Database, AlertTriangle, Shield, Zap, FileText,
  Download, ExternalLink, Laptop, Clock, Sparkles
} from 'lucide-react';
import { TOTAL_TOPICS_COUNT } from '../data/sqlCurriculumData';
import { 
  CHAPTER_CATALOG, 
  ALL_TOPIC_DETAILS, 
  getChapterMetadata, 
  isChapterAvailable 
} from '../data/chapters';
import ChapterComingSoon from '../components/learn/ChapterComingSoon';
import ComparisonTable from '../components/learn/ComparisonTable';
import DdlQuestionsBank from '../components/learn/DdlQuestionsBank';
import DmlQuestionsBank from '../components/learn/DmlQuestionsBank';
import FilteringQuestionsBank from '../components/learn/FilteringQuestionsBank';
import InsertQuestionsBank from '../components/learn/InsertQuestionsBank';
import NullLogicGuide from '../components/learn/NullLogicGuide';

/**
 * Clean, Concise Short Names for Sidebar & Navigation (Chapter & Subchapter format)
 */
export const SQL_TOPIC_SHORT_NAMES = {
  // Chapter 1: SQL Fundamentals
  'top-01-01': 'Subchapter 1.1: DBMS vs RDBMS',
  'top-01-02': 'Subchapter 1.2: Tables, Rows & Schema',
  'top-01-03': 'Subchapter 1.3: SQL Command Types',
  'top-01-04': 'Subchapter 1.4: Install MySQL & Workbench',

  // Chapter 2: Keywords, Data Types & Operators
  'top-02-01': 'Subchapter 2.1: Keywords & Reserved Words',
  'top-02-02': 'Subchapter 2.2: Data Types Deep Dive',
  'top-02-03': 'Subchapter 2.3: Operators & Precedence',

  // Chapter 3: Data Definition Language (DDL)
  'top-create-table': 'Subchapter 3.1: CREATE Table',
  'top-alter-table': 'Subchapter 3.2: ALTER Table',
  'top-rename-table': 'Subchapter 3.3: RENAME Operations',
  'top-truncate-table': 'Subchapter 3.4: TRUNCATE Table',
  'top-drop-table': 'Subchapter 3.5: DROP Database & Table',
  'top-ddl-50-questions': 'Subchapter 3.6: 50 DDL Practice Questions',

  // Chapter 4: Data Manipulation Language (DML)
  'top-04-01': 'Subchapter 4.1: DML Characteristics',
  'top-04-02': 'Subchapter 4.2: INSERT Ingestion',
  'top-04-03': 'Subchapter 4.3: UPDATE & Safe WHERE',
  'top-04-04': 'Subchapter 4.4: DELETE vs TRUNCATE',
  'top-04-05': 'Subchapter 4.5: SELECT Retrieval',
  'top-04-06': 'Subchapter 4.6: 50 DML Practice Questions',

  // Chapter 5: Advanced Filtering
  'top-05-01': 'Subchapter 5.1: LIKE & Wildcards',
  'top-05-02': 'Subchapter 5.2: IN Operator vs OR',
  'top-05-03': 'Subchapter 5.3: BETWEEN Range Queries',
  'top-05-04': 'Subchapter 5.4: Three-Valued NULL Logic',
  'top-05-05': 'Subchapter 5.5: Compound Expressions',
  'top-05-06': 'Subchapter 5.6: Top 5 Interview Questions',
  'top-05-07': 'Subchapter 5.7: 40 Practice Questions',

  // Chapter 6: INSERT and Bulk Data Ingestion
  'top-day5-01': 'Subchapter 6.1: Ingestion Architecture',
  'top-day5-02': 'Subchapter 6.2: Lab schema.sql Setup',
  'top-day5-03': 'Subchapter 6.3: seed.sql Bulk Batching',
  'top-day5-04': 'Subchapter 6.4: Constraint Traps & Errors',
  'top-day5-05': 'Subchapter 6.5: Practice Sequence Checks',
  'top-day5-questions-bank': 'Subchapter 6.6: 50 INSERT Practice Questions'
};

/**
 * Clean Light-Grey SQL Code Block (Identical to Git learning view)
 */
function HighlightedSql({ code }) {
  if (!code) return null;

  const lines = code.split('\n');

  return (
    <div className="font-mono text-xs sm:text-[13px] leading-relaxed select-text">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        // Comment
        if (trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.startsWith('#')) {
          return (
            <div key={lineIdx} className="text-slate-400 italic font-mono">
              {line}
            </div>
          );
        }

        const tokens = line.split(/(\b(?:CREATE\s+TABLE|CREATE\s+DATABASE|ALTER\s+TABLE|DROP\s+TABLE|TRUNCATE\s+TABLE|RENAME\s+TABLE|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|NOT\s+NULL|UNIQUE|DEFAULT|CHECK|TRUE|FALSE|SELECT|FROM|WHERE|ORDER\s+BY|GROUP\s+BY|HAVING|LIMIT|OFFSET|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|DESC|ASC|ADD\s+COLUMN|DROP\s+COLUMN|RENAME\s+COLUMN|RENAME\s+TO|MODIFY\s+COLUMN|CHANGE\s+COLUMN|INSERT\s+INTO|UPDATE|DELETE|SET|VALUES|COMMIT|ROLLBACK|SAVEPOINT|START\s+TRANSACTION|GRANT|REVOKE|SHOW\s+DATABASES|SHOW\s+TABLES|DESCRIBE|USE|VERSION|CURRENT_TIMESTAMP|USER|DATABASE|LIKE|NOT\s+LIKE|IN|NOT\s+IN|BETWEEN|NOT\s+BETWEEN|IS\s+NULL|IS\s+NOT\s+NULL|AND|OR|REGEXP|ESCAPE|INT|INTEGER|VARCHAR|DECIMAL|DATE|BOOLEAN|TEXT|FLOAT|DOUBLE|BIGINT|TIMESTAMP)\b|'[^']*'|\d+(?:\.\d+)?|[(),;]|\[constraints\]|\bdatatype\b|\btable_name\b|\bcolumn\d+\b|\bdatabase_name\b)/gi);

        return (
          <div key={lineIdx}>
            {tokens.map((token, tIdx) => {
              if (!token) return null;
              const upper = token.toUpperCase();

              // Keywords
              if (
                ['CREATE TABLE', 'CREATE DATABASE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE', 'RENAME TABLE',
                 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'NOT NULL', 'UNIQUE', 'DEFAULT', 'CHECK', 'TRUE', 'FALSE',
                 'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
                 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'DESC', 'ASC',
                 'ADD COLUMN', 'DROP COLUMN', 'RENAME COLUMN', 'RENAME TO', 'MODIFY COLUMN', 'CHANGE COLUMN',
                 'INSERT INTO', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'COMMIT', 'ROLLBACK', 'SAVEPOINT',
                 'START TRANSACTION', 'GRANT', 'REVOKE', 'SHOW DATABASES', 'SHOW TABLES', 'DESCRIBE', 'USE',
                 'VERSION', 'CURRENT_TIMESTAMP', 'USER', 'DATABASE',
                 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN', 'NOT BETWEEN', 'IS NULL', 'IS NOT NULL',
                 'AND', 'OR', 'REGEXP', 'ESCAPE'].includes(upper)
              ) {
                return (
                  <span key={tIdx} className="text-blue-700 font-bold">
                    {token}
                  </span>
                );
              }

              // Data types
              if (['INT', 'INTEGER', 'VARCHAR', 'DECIMAL', 'DATE', 'BOOLEAN', 'TEXT', 'FLOAT', 'DOUBLE', 'BIGINT', 'TIMESTAMP'].includes(upper)) {
                return (
                  <span key={tIdx} className="text-purple-700 font-bold">
                    {token}
                  </span>
                );
              }

              // Placeholders
              if (token.toLowerCase() === 'datatype') {
                return <span key={tIdx} className="text-teal-600 font-semibold">{token}</span>;
              }
              if (token.toLowerCase() === '[constraints]') {
                return <span key={tIdx} className="text-slate-400 font-medium">{token}</span>;
              }

              // Strings
              if (token.startsWith("'") && token.endsWith("'")) {
                return <span key={tIdx} className="text-emerald-700 font-medium">{token}</span>;
              }

              // Numbers
              if (/^\d+(?:\.\d+)?$/.test(token)) {
                return <span key={tIdx} className="text-amber-700 font-bold">{token}</span>;
              }

              // Punctuation
              if (['(', ')', ',', ';'].includes(token)) {
                return <span key={tIdx} className="text-slate-500 font-bold">{token}</span>;
              }

              return <span key={tIdx} className="text-slate-800">{token}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ code, title = 'SQL', language = 'sql', onCopy, isCopied }) {
  if (!code) return null;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50/90 shadow-2xs my-4">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-100/90 border-b border-slate-200 select-none">
        <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
          {language || title || 'sql'}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center space-x-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-white hover:bg-slate-200/70 border border-slate-200/90 transition-colors cursor-pointer"
        >
          {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto selection:bg-blue-100 custom-scrollbar">
        <HighlightedSql code={code} />
      </div>
    </div>
  );
}

export default function SqlLearningView({
  selectedModuleId = 'mod-01',
  setSelectedModuleId,
  selectedTopicId = 'top-01-01',
  setSelectedTopicId,
  completedTopics = [],
  onToggleCompleted,
  onJumpToPractice,
  onBackToOverview
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedSection, setCopiedSection] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedZoomImage, setSelectedZoomImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedZoomImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Flatten all available lessons across Chapters 1 to 6
  const allTopicsFlat = useMemo(() => {
    const list = [];
    CHAPTER_CATALOG.forEach((mod) => {
      if (mod.status === 'available' && mod.topics) {
        mod.topics.forEach((t) => {
          const details = ALL_TOPIC_DETAILS[t.id] || {};
          list.push({
            ...t,
            ...details,
            id: t.id,
            moduleId: mod.id,
            chapterNumber: mod.number,
            chapterTitle: mod.title,
            chapterShortTitle: mod.shortTitle || mod.title,
            lessonCode: t.lessonCode || `${mod.number}.${t.lessonNumber || ''}`,
            globalIndex: list.length + 1
          });
        });
      }
    });
    return list;
  }, []);

  const totalTopicsCount = allTopicsFlat.length || 32;

  // 2. Active topic state
  const [currentActiveTopicId, setCurrentActiveTopicId] = useState(selectedTopicId || 'top-01-01');

  // Synchronized completed topics
  const [localCompletedTopics, setLocalCompletedTopics] = useState(() => {
    if (completedTopics && completedTopics.length > 0) return completedTopics;
    try {
      const saved = localStorage.getItem('msc_sql_completed_topics');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (completedTopics && completedTopics.length > 0) {
      setLocalCompletedTopics(completedTopics);
    }
  }, [completedTopics]);

  useEffect(() => {
    if (selectedTopicId) {
      setCurrentActiveTopicId(selectedTopicId);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    if (selectedModuleId) {
      setExpandedModules((prev) => ({ ...prev, [selectedModuleId]: true }));
    }
  }, [selectedModuleId]);

  // Accordion state for modules (All 6 available chapters open by default)
  const [expandedModules, setExpandedModules] = useState({
    'mod-01': true,
    'mod-02': true,
    'mod-03': true,
    'mod-04': true,
    'mod-05': true,
    'mod-day5': true
  });

  useEffect(() => {
    const paramTopic = searchParams.get('topic');
    const paramChapter = searchParams.get('chapter');
    if (paramChapter) {
      if (setSelectedModuleId) setSelectedModuleId(paramChapter);
      setExpandedModules(prev => ({ ...prev, [paramChapter]: true }));
      const chTopic = allTopicsFlat.find(t => t.moduleId === paramChapter);
      if (chTopic) {
        setCurrentActiveTopicId(chTopic.id);
        if (setSelectedTopicId) setSelectedTopicId(chTopic.id);
      }
    } else if (paramTopic) {
      const found = allTopicsFlat.find(t => t.id === paramTopic);
      if (found) {
        if (setSelectedModuleId) setSelectedModuleId(found.moduleId || 'mod-01');
        setCurrentActiveTopicId(found.id);
        if (setSelectedTopicId) setSelectedTopicId(found.id);
        setExpandedModules(prev => ({ ...prev, [found.moduleId || 'mod-01']: true }));
      }
    }
  }, [searchParams, allTopicsFlat]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  const handleSelectTopic = (topId, modId) => {
    const targetModId = modId || allTopicsFlat.find(t => t.id === topId)?.moduleId || selectedModuleId || 'mod-01';
    setCurrentActiveTopicId(topId);
    if (setSelectedTopicId) setSelectedTopicId(topId);
    if (setSelectedModuleId) setSelectedModuleId(targetModId);
    setExpandedModules(prev => ({ ...prev, [targetModId]: true }));
    setSearchParams({ topic: topId, chapter: targetModId }, { replace: true });
    setMobileMenuOpen(false);

    const readerEl = document.getElementById('sql-lesson-article-container');
    if (readerEl) readerEl.scrollTop = 0;
  };

  const handleToggleRead = (topId) => {
    const targetId = topId || currentActiveTopicId;
    if (onToggleCompleted) {
      onToggleCompleted(targetId);
    }
    setLocalCompletedTopics((prev) => {
      const next = prev.includes(targetId) ? prev.filter(t => t !== targetId) : [...prev, targetId];
      try {
        localStorage.setItem('msc_sql_completed_topics', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Active chapter metadata and live status
  const activeChapter = useMemo(() => {
    return getChapterMetadata(selectedModuleId || 'mod-01');
  }, [selectedModuleId]);

  const isChapterLive = activeChapter.status === 'available';

  // Active topic data
  const topicData = useMemo(() => {
    if (ALL_TOPIC_DETAILS[currentActiveTopicId]) {
      return ALL_TOPIC_DETAILS[currentActiveTopicId];
    }
    if (activeChapter.topics && activeChapter.topics.length > 0) {
      const firstId = activeChapter.topics[0].id;
      if (ALL_TOPIC_DETAILS[firstId]) return ALL_TOPIC_DETAILS[firstId];
    }
    return ALL_TOPIC_DETAILS['top-01-01'] || ALL_TOPIC_DETAILS['top-create-table'];
  }, [currentActiveTopicId, activeChapter]);

  const isCurrentTopicRead = localCompletedTopics.includes(topicData.id);
  const progressPercent = totalTopicsCount > 0 ? Math.min(100, Math.round((localCompletedTopics.length / totalTopicsCount) * 100)) : 0;

  // Previous & Next navigation controls
  const currentGlobalIndex = useMemo(() => {
    const foundIdx = allTopicsFlat.findIndex(t => t.id === currentActiveTopicId);
    return foundIdx !== -1 ? foundIdx + 1 : 1;
  }, [allTopicsFlat, currentActiveTopicId]);

  const previousTopic = currentGlobalIndex > 1 ? allTopicsFlat[currentGlobalIndex - 2] : null;
  const nextTopic = currentGlobalIndex < allTopicsFlat.length ? allTopicsFlat[currentGlobalIndex] : null;

  const handlePreviousLesson = () => {
    if (previousTopic) {
      handleSelectTopic(previousTopic.id, previousTopic.moduleId);
    }
  };

  const handleNextLesson = () => {
    if (nextTopic) {
      handleSelectTopic(nextTopic.id, nextTopic.moduleId);
    }
  };

  const handleCompleteAndNext = () => {
    if (!isCurrentTopicRead) {
      handleToggleRead(currentActiveTopicId);
    }
    if (nextTopic) {
      handleSelectTopic(nextTopic.id, nextTopic.moduleId);
    }
  };

  const handleCopyCode = (code, sectionKey) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Prevent duplicate window scrollbar while in full-height learning view
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
      className="w-full h-[calc(100vh-64px)] flex font-segoe text-slate-800 bg-white overflow-hidden relative selection:bg-blue-100 selection:text-blue-900"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR: ALL 30 CHAPTERS (COMPACT, SHORT NAMES, w-64 xl:w-72)
      ═══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-64 xl:w-72 border-r border-slate-100 bg-white flex flex-col shrink-0 h-full p-3 space-y-3 overflow-y-auto select-none custom-scrollbar hidden lg:flex">
        
        {/* Title & Counter */}
        <div className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToOverview || (() => navigate('/courses/sql'))}
              className="text-sm font-extrabold text-slate-900 tracking-tight hover:text-blue-600 transition-colors text-left cursor-pointer"
            >
              SQL Mastery
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10.5px] font-medium text-slate-400">
              {localCompletedTopics.length} / {totalTopicsCount} lessons completed
            </div>
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(3, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters 1 through 30 (Clean, compact, short names) */}
        <div className="space-y-1 flex-1">
          {CHAPTER_CATALOG.map((mod) => {
            const isAvailable = mod.status === 'available';
            const isExpanded = expandedModules[mod.id] !== false;
            const isSelected = selectedModuleId === mod.id;

            if (isAvailable) {
              const topics = mod.topics || [];

              return (
                <div key={mod.id} className="space-y-0.5">
                  {/* Chapter Accordion Header */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleModule(mod.id);
                      if (selectedModuleId !== mod.id && topics[0]) {
                        handleSelectTopic(topics[0].id, mod.id);
                      }
                    }}
                    className={`w-full text-left py-1.5 px-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer rounded-lg ${
                      isSelected
                        ? 'text-slate-900 bg-slate-100/90'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    title={mod.title}
                  >
                    <span className="truncate">
                      Chapter {mod.number}: {mod.shortTitle || mod.title}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-slate-400 shrink-0 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Subchapters List */}
                  {isExpanded && (
                    <div className="space-y-0.5 pl-2.5 pt-0.5">
                      {topics.map((t) => {
                        const isTopicSelected = currentActiveTopicId === t.id && isSelected;
                        const isCompleted = localCompletedTopics.includes(t.id);
                        const label = SQL_TOPIC_SHORT_NAMES[t.id] || (t.lessonCode ? `Subchapter ${t.lessonCode}: ${t.title}` : t.title);

                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTopic(t.id, mod.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isTopicSelected
                                ? 'bg-blue-50 text-blue-600 font-bold'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal'
                            }`}
                            title={label}
                          >
                            <div className="flex items-center space-x-1.5 truncate pr-1">
                              {isCompleted ? (
                                <CheckCircle2 size={11} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isTopicSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              )}
                              <span className="truncate">{label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Chapters 7 through 30: Coming Soon items
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setSelectedModuleId && setSelectedModuleId(mod.id);
                  setSearchParams({ chapter: mod.id }, { replace: true });
                }}
                className={`w-full text-left py-1.5 px-2.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer rounded-lg ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={mod.title}
              >
                <div className="flex items-center space-x-2 truncate pr-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  <span className="truncate">
                    Chapter {mod.number}: {mod.shortTitle || mod.title}
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded shrink-0">
                  Coming Soon
                </span>
              </button>
            );
          })}
        </div>

        {/* Practice Playground Shortcut */}
        {onJumpToPractice && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onJumpToPractice(topicData)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Code2 size={13} className="text-blue-600" />
              <span>Open SQL Practice Lab</span>
            </button>
          </div>
        )}

      </aside>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT MAIN CONTENT: SCROLLABLE WORKSPACE
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-white">
        
        {/* Mobile top bar (<1024px) */}
        <header className="lg:hidden h-12 border-b border-slate-100 bg-white px-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Menu size={15} />
            <span>Chapters ({CHAPTER_CATALOG.length})</span>
          </button>

          <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
            {!isChapterLive ? activeChapter.shortTitle || activeChapter.title : (topicData.lessonCode ? `Subchapter ${topicData.lessonCode}: ${topicData.title}` : topicData.title)}
          </span>
        </header>

        {/* Scrollable Article Area with Proper Full Space */}
        <div
          id="sql-lesson-article-container"
          className="flex-1 overflow-y-auto px-6 sm:px-12 lg:px-16 xl:px-20 py-8 custom-scrollbar"
        >
          {!isChapterLive ? (
            <div className="w-full max-w-4xl mx-auto py-10 space-y-6">
              <ChapterComingSoon
                chapter={activeChapter}
                onSelectChapter={(modId) => {
                  setSelectedModuleId && setSelectedModuleId(modId);
                  const targetMod = CHAPTER_CATALOG.find(m => m.id === modId);
                  if (targetMod?.topics?.[0]) {
                    handleSelectTopic(targetMod.topics[0].id, modId);
                  }
                }}
                onJumpToPractice={onJumpToPractice}
              />
            </div>
          ) : topicData.isQuestionsBankTopic ? (
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a192f] tracking-tight leading-snug">
                {topicData.title}
              </h1>
              {topicData.subtitle && (
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal pt-0.5">
                  {topicData.subtitle}
                </p>
              )}
              <hr className="border-slate-100 my-5" />

              {topicData.questionBankType === 'insert' ? (
                <InsertQuestionsBank onJumpToPractice={onJumpToPractice} />
              ) : topicData.questionBankType === 'dml' ? (
                <DmlQuestionsBank onJumpToPractice={onJumpToPractice} />
              ) : topicData.questionBankType === 'filtering' ? (
                <FilteringQuestionsBank onJumpToPractice={onJumpToPractice} />
              ) : (
                <DdlQuestionsBank onJumpToPractice={onJumpToPractice} />
              )}

              {/* Bottom Navigation */}
              <footer className="pt-8 pb-14 border-t border-slate-100 mt-10 flex items-center justify-between">
                {previousTopic ? (
                  <button
                    type="button"
                    onClick={handlePreviousLesson}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-xs sm:text-[13px] transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg border border-slate-200/60 text-slate-300 font-medium text-xs sm:text-[13px] cursor-not-allowed"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                )}

                {nextTopic ? (
                  <button
                    type="button"
                    onClick={handleCompleteAndNext}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-[13px] shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <span>›</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModuleId && setSelectedModuleId('mod-06');
                    }}
                    className="px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs sm:text-[13px] border border-blue-200 flex items-center space-x-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <span>Chapter 7 (Coming Soon)</span>
                    <span>›</span>
                  </button>
                )}
              </footer>
            </div>
          ) : (
            <div className="w-full max-w-5xl xl:max-w-6xl mx-auto space-y-4 animate-fadeIn text-slate-900">

              {/* Main Lesson Title (H1: Used only once per lesson) */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a192f] tracking-tight leading-snug">
                {topicData.title ? topicData.title.replace(/^(?:Day\s*\d+:|\d+\.)\s*/, '') : 'SQL Lesson'}
              </h1>

              {/* Short Introductory Summary */}
              {(topicData.subtitle || topicData.intro) && (
                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal pt-0.5">
                  {topicData.subtitle || topicData.intro}
                </p>
              )}

              {/* Horizontal Line Divider */}
              <hr className="border-slate-100 my-5" />

              {/* 2. INFOGRAPHIC IMAGE (Visual Guide) */}
              {topicData.infographicImage && (
                <figure className="space-y-3 my-6">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        {topicData.infographicTitle || 'Visual Architecture & Flow Diagram'}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedZoomImage(topicData.infographicImage)}
                        className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                        title="Click to view full screen"
                      >
                        <Maximize2 size={12} />
                        <span>Zoom</span>
                      </button>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSelectedZoomImage(topicData.infographicImage)}
                    className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-2xs bg-white relative group cursor-zoom-in transition-all duration-300 hover:border-blue-300"
                  >
                    <img
                      src={topicData.infographicImage}
                      alt={topicData.infographicTitle || 'Visual Architecture & Flow Diagram'}
                      className="w-full h-auto block rounded-lg transition-transform duration-300 group-hover:scale-[1.006]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none rounded-lg flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/85 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl backdrop-blur-xs flex items-center space-x-1.5 shadow-lg">
                        <Maximize2 size={13} />
                        <span>Click to expand full size</span>
                      </span>
                    </div>
                  </div>

                  {topicData.infographicCaption && (
                    <figcaption className="text-xs text-slate-500 font-medium italic pt-1 text-center sm:text-left">
                      {topicData.infographicCaption}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* 2.5 CUSTOM INTERACTIVE CODE COMPONENT (e.g. NullLogicGuide) */}
              {(topicData.customComponent === 'NullLogicGuide' || topicData.id === 'top-05-04') && (
                <section className="my-6 animate-fadeIn">
                  <NullLogicGuide />
                </section>
              )}

              {/* 2.6 DEVELOPER MENTAL MODEL */}
              {topicData.beginnerMentalModel && (
                <section className="my-6 rounded-lg p-5 border border-slate-200 bg-slate-50/80 shadow-2xs">
                  <div className="flex items-baseline gap-2.5 pb-3 border-b border-slate-200">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#0a192f] flex items-center gap-2">
                        {topicData.beginnerMentalModel.title || "Developer's Mental Model"}
                      </h3>
                      <p className="text-xs text-slate-500 font-normal pt-0.5">
                        Intuitive conceptual model for writing real-world queries and technical interviews
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
                    {topicData.beginnerMentalModel.analogy && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                          <span>💡</span> Real-World Analogy
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                          {topicData.beginnerMentalModel.analogy}
                        </p>
                      </div>
                    )}
                    {topicData.beginnerMentalModel.keyTrick && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                          <span>🎯</span> Essential Rule
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                          {topicData.beginnerMentalModel.keyTrick}
                        </p>
                      </div>
                    )}
                    {topicData.beginnerMentalModel.gotcha && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-1.5 shadow-2xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                          <span>⚠️</span> Common Trap
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
                          {topicData.beginnerMentalModel.gotcha}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 3. ARCHITECTURAL COMPARISON MATRIX (Generic & Dynamic) */}
              {topicData.comparisonTable && (
                <section className="pt-6 border-t border-slate-100">
                  <ComparisonTable comparison={topicData.comparisonTable} />
                </section>
              )}

              {/* 4. WHY DO WE NEED AN RDBMS (ACID Properties) */}
              {topicData.whyWeNeedItSection && (
                <section className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        {topicData.whyWeNeedItSection.title}
                      </h2>
                      {topicData.whyWeNeedItSection.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                          {topicData.whyWeNeedItSection.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {topicData.whyWeNeedItSection.intro && (
                    <p className="text-slate-700 text-[14.5px] leading-relaxed font-normal">
                      {topicData.whyWeNeedItSection.intro}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-1">
                    {topicData.whyWeNeedItSection.acidPillars.map((pillar) => {
                      const isA = pillar.letter === 'A';
                      const isC = pillar.letter === 'C';
                      const isI = pillar.letter === 'I';

                      const borderCol = isA ? 'border-blue-200 hover:border-blue-300' :
                                        isC ? 'border-emerald-200 hover:border-emerald-300' :
                                        isI ? 'border-indigo-200 hover:border-indigo-300' :
                                        'border-purple-200 hover:border-purple-300';

                      const topBarCol = isA ? 'bg-blue-600' :
                                        isC ? 'bg-emerald-600' :
                                        isI ? 'bg-indigo-600' :
                                        'bg-purple-600';

                      const badgeBg = isA ? 'bg-blue-600 text-white' :
                                      isC ? 'bg-emerald-600 text-white' :
                                      isI ? 'bg-indigo-600 text-white' :
                                      'bg-purple-600 text-white';

                      const mottoBg = isA ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      isC ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      isI ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                      'bg-purple-50 text-purple-700 border-purple-200';

                      return (
                        <div
                          key={pillar.letter}
                          className={`bg-white border ${borderCol} rounded-lg p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative overflow-hidden`}
                        >
                          <div className={`absolute top-0 left-0 right-0 h-1 ${topBarCol}`} />

                          <div className="space-y-2.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${badgeBg}`}>
                                {pillar.letter}
                              </span>

                              {pillar.motto && (
                                <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap ${mottoBg}`}>
                                  {pillar.motto}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-[#0a192f] leading-tight">
                              {pillar.name}
                            </h3>

                            <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal min-h-[56px]">
                              {pillar.desc}
                            </p>
                          </div>

                          {pillar.example && (
                            <div className="pt-2.5 border-t border-slate-100 mt-3 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Production Example:
                              </span>
                              <div className="text-[11px] text-slate-700 font-medium leading-relaxed bg-slate-50 border-l-2 border-slate-300 rounded-r p-2 min-h-[64px] flex items-center">
                                {pillar.example}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 5. STRUCTURAL HIERARCHY DEFINITIONS (Table, Row, Column, Cell) */}
              {topicData.structuralDefinitions && (
                <section className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        The 6 Core Structural Layers
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                        From physical database container down to an atomic data cell
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {topicData.structuralDefinitions.map((t) => (
                      <div
                        key={t.term}
                        className="bg-white border border-slate-200 rounded-lg p-4 space-y-1.5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                      >
                        <span className="text-sm font-bold text-[#0a192f] block">
                          {t.term}
                        </span>
                        <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                          {t.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. SQL COMMAND TYPES GRID (DDL, DML, DQL, DCL, TCL) */}
              {topicData.commandTypesGrid && (
                <section className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        The 5 SQL Command Families (DDL, DML, DQL, DCL, TCL)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                        Comprehensive classification, operational scope, and transaction behavior
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {topicData.commandTypesGrid.map((cmd) => (
                      <div
                        key={cmd.category}
                        className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold tracking-wide ${
                                cmd.category === 'DDL'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : cmd.category === 'DML'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : cmd.category === 'DQL'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : cmd.category === 'DCL'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {cmd.category}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {cmd.target}
                            </span>
                          </div>

                          <div>
                            <div className="text-xs sm:text-[13px] font-bold text-slate-900">
                              {cmd.fullForm}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal mt-1">
                              {cmd.purpose}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {cmd.commands.map((c) => (
                              <span
                                key={c}
                                className="font-mono text-[11px] font-semibold px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 rounded"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-500">Rollback via TCL:</span>
                            <span
                              className={`font-bold ${
                                cmd.category === 'DML' ? 'text-emerald-600' : 'text-slate-600'
                              }`}
                            >
                              {cmd.rollback}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-800 p-2.5 rounded-md overflow-x-auto whitespace-pre">
                            {cmd.example}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 7. OS DOWNLOAD PANELS (Windows & macOS) */}
              {topicData.osDownloadPanels && (
                <section className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        Official Downloads Matrix (Windows & macOS)
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                        Direct official Oracle links for MySQL Server 8.0 & MySQL Workbench
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* WINDOWS CARD */}
                    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                            {topicData.osDownloadPanels.windows.osName}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {topicData.osDownloadPanels.windows.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0a192f]">
                          {topicData.osDownloadPanels.windows.packageTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {topicData.osDownloadPanels.windows.stepsOverview}
                        </p>
                      </div>

                      <a
                        href={topicData.osDownloadPanels.windows.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors text-center cursor-pointer"
                      >
                        <Download size={14} />
                        <span>Download Windows Installer (MSI)</span>
                        <ExternalLink size={12} className="opacity-80" />
                      </a>
                    </div>

                    {/* MACOS CARD */}
                    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-4 shadow-2xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {topicData.osDownloadPanels.macos.osName}
                          </span>
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {topicData.osDownloadPanels.macos.badge}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[#0a192f]">
                          {topicData.osDownloadPanels.macos.packageTitle}
                        </h3>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Or via Terminal (Homebrew):
                          </span>
                          <div className="bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-semibold p-2.5 rounded-lg overflow-x-auto whitespace-pre">
                            {topicData.osDownloadPanels.macos.brewCommand}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <a
                          href={topicData.osDownloadPanels.macos.serverLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors text-center"
                        >
                          <Download size={13} />
                          <span>Server DMG</span>
                          <ExternalLink size={11} />
                        </a>
                        <a
                          href={topicData.osDownloadPanels.macos.workbenchLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors text-center"
                        >
                          <Download size={13} />
                          <span>Workbench</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* 8. STEP-BY-STEP SETUP GUIDE */}
              {topicData.setupGuide && (
                <section className="pt-6 border-t border-slate-100 space-y-5">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        Step-by-Step Installation Walkthrough
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                        Follow these steps to get MySQL Server and Workbench running locally
                      </p>
                    </div>
                  </div>

                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 ml-3 pt-1">
                    {topicData.setupGuide.map((stepItem) => (
                      <div key={stepItem.step} className="relative space-y-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center absolute -left-[31px] top-0 shadow-2xs ring-4 ring-white">
                          {stepItem.step}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-[#0a192f] pt-0.5">
                          {stepItem.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {stepItem.description}
                        </p>

                        {stepItem.code && (
                          <CodeBlock
                            code={stepItem.code}
                            title={`Step ${stepItem.step} SQL Script`}
                            onCopy={() => handleCopyCode(stepItem.code, `step-${stepItem.step}`)}
                            isCopied={copiedSection === `step-${stepItem.step}`}
                          />
                        )}

                        {stepItem.tip && (
                          <aside className="my-3 rounded-r-lg p-3 border-l-4 border-amber-500 bg-amber-50/70 text-slate-800 text-[13px] leading-relaxed">
                            <span className="font-semibold text-slate-900">Pro Tip: </span>
                            <span>{stepItem.tip}</span>
                          </aside>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 9. UNDER THE HOOD DATABASE ENGINE INTERNALS */}
              {topicData.underTheHood && (
                <section className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        {topicData.underTheHood.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                        What physically happens inside MySQL Engine, System Catalog, and Disk Storage
                      </p>
                    </div>
                  </div>

                  {topicData.underTheHood.summary && (
                    <p className="text-slate-700 text-[14.5px] leading-relaxed font-normal">
                      {topicData.underTheHood.summary}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {topicData.underTheHood.steps.map((st) => (
                      <div
                        key={st.step}
                        className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs hover:border-blue-300 transition-colors flex flex-col justify-between space-y-2.5"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start space-x-2.5">
                            <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {st.step}
                            </span>
                            <h3 className="text-sm font-bold text-[#0a192f] leading-snug">
                              {st.title}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal pt-1">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 10. STEP-BY-STEP SQL QUERIES & ARCHITECTURE */}
              {topicData.sqlSteps && topicData.sqlSteps.length > 0 ? (
                <section className="pt-6 border-t border-slate-100 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                      <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                          Step-by-Step SQL Queries & Execution Guide
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 font-normal pt-0.5">
                          Each query is broken down into an isolated step with execution rationale and syntax breakdown
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 hidden sm:inline-block">
                      {topicData.sqlSteps.length} Steps
                    </span>
                  </div>

                  <div className="space-y-4">
                    {topicData.sqlSteps.map((st) => (
                      <div
                        key={st.step}
                        className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3"
                      >
                        {/* Step Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center space-x-2.5">
                            <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {st.step}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-[#0a192f]">
                              {st.title}
                            </h3>
                          </div>
                          {st.badge && (
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 shrink-0">
                              {st.badge}
                            </span>
                          )}
                        </div>

                        {st.explanation && (
                          <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed font-normal">
                            {st.explanation}
                          </p>
                        )}

                        {(st.code || st.sql) && (
                          <CodeBlock
                            code={st.code || st.sql}
                            title={`Step ${st.step || st.stepNumber}: SQL Implementation`}
                            onCopy={() => handleCopyCode(st.code || st.sql, `step-sql-${st.step || st.stepNumber}`)}
                            isCopied={copiedSection === `step-sql-${st.step || st.stepNumber}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                /* Fallback if topic only has syntax or example */
                <>
                  {topicData.syntax && (
                    <section className="pt-6 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                        <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                          Syntax Specification
                        </h2>
                      </div>
                      <CodeBlock
                        code={topicData.syntax}
                        title="SQL Syntax Definition"
                        onCopy={() => handleCopyCode(topicData.syntax, 'syntax')}
                        isCopied={copiedSection === 'syntax'}
                      />
                    </section>
                  )}

                  {topicData.example && (
                    <section className="pt-6 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                        <span className="w-1.5 h-4.5 bg-blue-600 rounded-xs inline-block shrink-0 translate-y-0.5" />
                        <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                          Practical Working Example
                        </h2>
                      </div>
                      <CodeBlock
                        code={topicData.example}
                        title="Production Example"
                        onCopy={() => handleCopyCode(topicData.example, 'example')}
                        isCopied={copiedSection === 'example'}
                      />
                    </section>
                  )}
                </>
              )}

              {/* 11. ARCHITECTURAL NOTE */}
              {topicData.note && (
                <aside className="my-4 rounded-r-lg p-3.5 border-l-4 border-blue-600 bg-blue-50/60 text-slate-800 text-[13.5px] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-1">
                    <Lightbulb size={14} className="shrink-0 text-blue-600" />
                    <span>Architectural Note</span>
                  </div>
                  <div className="font-normal text-slate-700">{topicData.note}</div>
                </aside>
              )}

              {/* 12. COMMON BEGINNER MISTAKES */}
              {topicData.mistakes && topicData.mistakes.length > 0 && (
                <section className="pt-6 border-t border-slate-100 space-y-3.5">
                  <div className="flex items-baseline gap-2.5 pt-2 pb-1">
                    <span className="w-1.5 h-4.5 bg-amber-500 rounded-xs inline-block shrink-0 translate-y-0.5" />
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#0a192f] tracking-tight">
                        Common Beginner Mistakes to Avoid
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {topicData.mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-rose-200/80 rounded-lg p-4 space-y-2 shadow-2xs"
                      >
                        <span className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
                          <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                            ✕
                          </span>
                          <span>{m.title}</span>
                        </span>
                        <div className="bg-rose-50/60 border border-rose-200/60 text-rose-950 font-mono text-xs p-2.5 rounded-md overflow-x-auto">
                          {m.badCode}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {m.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 13. KEY TAKEAWAYS */}
              {topicData.keyPoints && topicData.keyPoints.length > 0 && (
                <section className="pt-6">
                  <aside className="my-4 rounded-r-lg p-3.5 border-l-4 border-emerald-600 bg-emerald-50/70 text-slate-800 text-[13.5px] leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                      <span>Key Architectural Takeaways</span>
                    </div>
                    <ul className="space-y-1.5 pl-2">
                      {topicData.keyPoints.map((kp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start space-x-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span>{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                </section>
              )}


              {/* Bottom Navigation: Previous and Next lesson controls */}
              <footer className="pt-8 pb-14 border-t border-slate-100 mt-10 flex items-center justify-between">
                {/* Previous Button */}
                {previousTopic ? (
                  <button
                    type="button"
                    onClick={handlePreviousLesson}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium text-xs sm:text-[13px] transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg border border-slate-200/60 text-slate-300 font-medium text-xs sm:text-[13px] cursor-not-allowed"
                  >
                    <span>‹</span>
                    <span>Previous</span>
                  </button>
                )}

                {/* Next Button */}
                {nextTopic ? (
                  <button
                    type="button"
                    onClick={handleCompleteAndNext}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-[13px] shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <span>›</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModuleId && setSelectedModuleId('mod-06');
                    }}
                    className="px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs sm:text-[13px] border border-blue-200 flex items-center space-x-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    <span>Chapter 7 (Coming Soon)</span>
                    <span>›</span>
                  </button>
                )}
              </footer>

            </div>
          )}
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

          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-900">SQL Chapters ({CHAPTER_CATALOG.length})</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">
                {localCompletedTopics.length} / {totalTopicsCount} lessons completed
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(3, progressPercent)}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pt-1">
              {CHAPTER_CATALOG.map((mod) => {
                const isAvailable = mod.status === 'available';
                const isSel = selectedModuleId === mod.id;

                if (isAvailable) {
                  const topics = mod.topics || [];

                  return (
                    <div key={mod.id} className="space-y-0.5">
                      <div className="text-[11px] font-bold text-slate-800 px-2 py-0.5">
                        Chapter {mod.number}: {mod.shortTitle || mod.title}
                      </div>
                      <div className="space-y-0.5 pl-2">
                        {topics.map((t) => {
                          const isTopicSel = currentActiveTopicId === t.id && isSel;
                          const label = SQL_TOPIC_SHORT_NAMES[t.id] || (t.lessonCode ? `Subchapter ${t.lessonCode}: ${t.title}` : t.title);

                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                handleSelectTopic(t.id, mod.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1 rounded-lg text-xs truncate block cursor-pointer ${
                                isTopicSel
                                  ? 'bg-blue-50 text-blue-600 font-bold'
                                  : 'text-slate-600 hover:bg-slate-50 font-normal'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setSelectedModuleId && setSelectedModuleId(mod.id);
                      setSearchParams({ chapter: mod.id }, { replace: true });
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold truncate flex items-center justify-between cursor-pointer ${
                      isSel
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      Chapter {mod.number}: {mod.shortTitle || mod.title}
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                      Coming Soon
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {selectedZoomImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setSelectedZoomImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedZoomImage(null)}
              className="absolute -top-11 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer shadow-lg"
              title="Close (ESC)"
            >
              <X size={20} />
            </button>
            <div className="rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 w-full max-h-[85vh] flex items-center justify-center p-1">
              <img
                src={selectedZoomImage}
                alt="Enlarged Visual Guide"
                className="max-w-full max-h-[83vh] w-auto h-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-slate-400 text-xs font-medium mt-3">
              Click anywhere outside or press ESC to close
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
