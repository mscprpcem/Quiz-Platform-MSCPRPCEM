import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCw,
  Maximize2,
  Minimize2,
  X,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Database,
  Table,
  Check,
  Terminal,
  Code,
  ShieldCheck,
  Key,
  BarChart3,
  FileText,
  Lock,
  ExternalLink,
  Sparkles,
  Layers,
  BookOpen,
  Clock,
  AlertTriangle,
  Server,
  Zap,
  CheckCircle2,
  Link as LinkIcon
} from 'lucide-react';
import './SqlIntroPresentation.css';

// Slide catalog specification
const SLIDES = [
  { id: 'welcome', title: 'MSC PRPCEM · Think SQL', steps: 1 },
  { id: 'why-databases', title: 'Why Databases? Flat Files vs RDBMS', steps: 3 },
  { id: 'relational-model', title: 'The Relational Architecture & Keys', steps: 3 },
  { id: 'command-families', title: 'The 5 SQL Command Families', steps: 5 },
  { id: 'acid-pillars', title: 'The 4 ACID Pillars of Reliability', steps: 4 },
  { id: 'sql-workspace', title: 'The Developer SQL Workspace', steps: 3 },
  { id: 'ready-to-master', title: 'Ready? Learn. Experiment. Master.', steps: 3 }
];

export default function SqlIntroPresentation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);

  // Scale transform state for responsive 16:9 canvas
  const [scale, setScale] = useState(1);

  // Presentation State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState(null);

  // Playback & Timing State
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideDuration, setSlideDuration] = useState(2500); // 2.5s default
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [customSeconds, setCustomSeconds] = useState("2.5");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isHoveringControls, setIsHoveringControls] = useState(false);

  const idleTimeoutRef = useRef(null);
  const popoverIdleRef = useRef(null);
  const timerInputRef = useRef(null);

  // Responsive scale calculations
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Idle Timer Helper (2.5s auto-hide)
  const resetIdleTimer = useCallback(() => {
    setIsUiVisible(true);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setIsUiVisible(false);
    }, 2500);
  }, []);

  // Popover Idle Timer Helper (4.5s auto-close)
  const resetPopoverIdle = useCallback(() => {
    if (popoverIdleRef.current) {
      clearTimeout(popoverIdleRef.current);
    }
    popoverIdleRef.current = setTimeout(() => {
      setIsEditingTimer(false);
      resetIdleTimer();
    }, 4500);
  }, [resetIdleTimer]);

  // Advance step / slide
  const nextStep = useCallback(() => {
    const totalStepsInSlide = SLIDES[currentSlideIndex].steps;
    if (currentStep < totalStepsInSlide - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Advance to next slide or wrap to beginning
      setPrevSlideIndex(currentSlideIndex);
      setTimeout(() => setPrevSlideIndex(null), 400);

      if (currentSlideIndex < SLIDES.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
        setCurrentStep(0);
      } else {
        // Continuous infinite loop back to Slide 1
        setCurrentSlideIndex(0);
        setCurrentStep(0);
      }
    }
  }, [currentSlideIndex, currentStep]);

  // Previous step / slide
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (currentSlideIndex > 0) {
      setPrevSlideIndex(currentSlideIndex);
      setTimeout(() => setPrevSlideIndex(null), 400);
      const prevIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIdx);
      setCurrentStep(SLIDES[prevIdx].steps - 1);
    }
  }, [currentSlideIndex, currentStep]);

  // Jump to specific slide
  const goToSlide = (idx) => {
    if (idx >= 0 && idx < SLIDES.length) {
      setPrevSlideIndex(currentSlideIndex);
      setTimeout(() => setPrevSlideIndex(null), 400);
      setCurrentSlideIndex(idx);
      setCurrentStep(0);
      resetIdleTimer();
    }
  };

  // Continuous auto-play loop timer
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        nextStep();
      }, slideDuration);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slideDuration, nextStep]);

  // User activity listeners
  useEffect(() => {
    const onUserActivity = () => {
      resetIdleTimer();
      if (isEditingTimer) resetPopoverIdle();
    };

    window.addEventListener('mousemove', onUserActivity, { passive: true });
    window.addEventListener('pointermove', onUserActivity, { passive: true });
    window.addEventListener('mousedown', onUserActivity, { passive: true });
    window.addEventListener('touchstart', onUserActivity, { passive: true });

    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('pointermove', onUserActivity);
      window.removeEventListener('mousedown', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (popoverIdleRef.current) clearTimeout(popoverIdleRef.current);
    };
  }, [resetIdleTimer, isEditingTimer, resetPopoverIdle]);

  // Autoplay query parameter check on mount
  useEffect(() => {
    const auto = searchParams.get('autoplay') || searchParams.get('play');
    if (auto === 'true' || auto === '1') {
      const timer = setTimeout(() => {
        setIsPlaying(true);
        resetIdleTimer();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [searchParams, resetIdleTimer]);

  // Fullscreen listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Open / Close Timer Editor
  const openTimerEditor = useCallback(() => {
    setCustomSeconds((slideDuration / 1000).toString());
    setIsEditingTimer(true);
    setIsUiVisible(true);
    resetPopoverIdle();
  }, [slideDuration, resetPopoverIdle]);

  const closeTimerEditor = useCallback(() => {
    setIsEditingTimer(false);
    if (popoverIdleRef.current) clearTimeout(popoverIdleRef.current);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const toggleTimerEditor = useCallback((e) => {
    if (e) e.stopPropagation();
    if (isEditingTimer) {
      closeTimerEditor();
    } else {
      openTimerEditor();
    }
  }, [isEditingTimer, closeTimerEditor, openTimerEditor]);

  const handleApplyTimer = (secVal) => {
    const parsed = parseFloat(secVal);
    if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 120) {
      setSlideDuration(Math.round(parsed * 1000));
    }
    closeTimerEditor();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      resetIdleTimer();
      if (isEditingTimer) resetPopoverIdle();

      if (e.key === 'p' || e.key === 'P' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        resetIdleTimer();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTimerEditor();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isEditingTimer) {
          closeTimerEditor();
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(SLIDES.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, resetIdleTimer, isEditingTimer, resetPopoverIdle, toggleTimerEditor, closeTimerEditor]);

  const isControlsHidden = !isUiVisible && !isEditingTimer && !isHoveringControls;

  return (
    <div
      ref={containerRef}
      className={`sql-pres-page ${isFullscreen ? 'is-fullscreen' : ''} ${
        isControlsHidden ? 'sql-pres-ui-hidden' : ''
      }`}
    >
      {/* 🖥️ 16:9 SCALED MAIN PRESENTATION VIEWPORT */}
      <main className="sql-pres-viewport" onClick={nextStep}>
        <div
          className="sql-pres-canvas"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`
          }}
        >
          {/* Active Slide Presentation */}
          <div className="sql-slide-wrapper slide-in">
            {currentSlideIndex === 0 && <Slide1Welcome step={currentStep} />}
            {currentSlideIndex === 1 && <Slide2WhyDatabases step={currentStep} />}
            {currentSlideIndex === 2 && <Slide3RelationalModel step={currentStep} />}
            {currentSlideIndex === 3 && <Slide4CommandFamilies step={currentStep} />}
            {currentSlideIndex === 4 && <Slide5AcidPillars step={currentStep} />}
            {currentSlideIndex === 5 && <Slide6SqlWorkspace step={currentStep} />}
            {currentSlideIndex === 6 && <Slide7ReadyToMaster step={currentStep} />}
          </div>
        </div>
      </main>

      {/* 🧭 NAVIGATION PILLS (BOTTOM LEFT) */}
      <div className="sql-slide-nav-wrap" onClick={e => e.stopPropagation()}>
        <div className="sql-nav-pills">
          <button
            type="button"
            onClick={prevStep}
            className="sql-nav-arrow-btn"
            title="Previous Step / Slide (ArrowLeft)"
            aria-label="Previous Slide"
          >
            <ArrowLeft size={13} />
          </button>

          <span className="sql-nav-counter">
            {String(currentSlideIndex + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={nextStep}
            className="sql-nav-arrow-btn"
            title="Next Step / Slide (Space or ArrowRight)"
            aria-label="Next Slide"
          >
            <ArrowRight size={13} />
          </button>
        </div>

        <Link
          to="/courses/sql"
          className="sql-exit-btn"
          title="Exit Presentation and return to SQL Course Hub"
        >
          <BookOpen size={12} />
          <span>Course Hub</span>
        </Link>
      </div>

      {/* 🎛️ SYSTEM CONTROLS TOOLBAR (BOTTOM RIGHT: LOOP, TIMER, FULLSCREEN, AUTO-HIDE) */}
      <div
        className="sql-system-controls-wrap"
        onClick={e => e.stopPropagation()}
        onMouseEnter={() => {
          setIsHoveringControls(true);
          setIsUiVisible(true);
        }}
        onMouseLeave={() => {
          setIsHoveringControls(false);
          if (!isEditingTimer) resetIdleTimer();
        }}
      >
        {/* Sleek inline popover window to edit loop interval */}
        <AnimatePresence>
          {isEditingTimer && (
            <motion.div
              className="sql-timer-popover"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              onClick={e => {
                e.stopPropagation();
                resetPopoverIdle();
              }}
              onMouseMove={resetPopoverIdle}
            >
              <div className="sql-timer-popover-header">
                <div className="sql-timer-title-group">
                  <span className="sql-timer-popover-title">Loop Interval</span>
                  <span className="sql-timer-popover-hint">Auto-hides in 4s</span>
                </div>
                <button
                  type="button"
                  onClick={closeTimerEditor}
                  className="sql-timer-close-btn"
                  title="Close (Esc)"
                  aria-label="Close loop settings"
                >
                  <X size={11} />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleApplyTimer(customSeconds);
                }}
              >
                <div className="sql-timer-input-row">
                  <input
                    ref={timerInputRef}
                    type="number"
                    min="0.5"
                    max="60"
                    step="0.5"
                    value={customSeconds}
                    onChange={e => {
                      setCustomSeconds(e.target.value);
                      resetPopoverIdle();
                    }}
                    className="sql-timer-input"
                    aria-label="Loop duration in seconds"
                  />
                  <span className="sql-timer-unit">sec</span>
                  <button type="submit" className="sql-timer-set-btn">
                    Set
                  </button>
                </div>
              </form>

              <div className="sql-timer-presets">
                {[1, 1.5, 2, 2.5, 3, 5, 10].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      setCustomSeconds(sec.toString());
                      handleApplyTimer(sec);
                    }}
                    className={`sql-timer-preset-chip ${
                      slideDuration === sec * 1000 ? 'active' : ''
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              <div className="sql-timer-footer-action">
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(prev => !prev);
                    resetPopoverIdle();
                  }}
                  className={`sql-timer-playback-toggle ${isPlaying ? 'is-playing' : ''}`}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={11} />
                      <span>Looping Active</span>
                    </>
                  ) : (
                    <>
                      <Play size={10} />
                      <span>Start Continuous Loop</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sql-system-bar" role="toolbar" aria-label="Presentation controls">
          {/* Instant Loop Play/Pause button */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setIsPlaying(prev => !prev);
              resetIdleTimer();
            }}
            className={`sql-system-btn sql-system-btn-loop ${isPlaying ? 'is-active' : ''}`}
            title={`Click: ${isPlaying ? 'Pause Loop (L or P)' : 'Play Loop (L or P)'}`}
            aria-label={isPlaying ? 'Pause Loop' : 'Play Loop'}
          >
            {isPlaying ? (
              <RotateCw size={12} className="sql-icon-spin" />
            ) : (
              <Play size={10} />
            )}
            <span>{isPlaying ? 'Looping' : 'Loop'}</span>
          </button>

          {/* Dedicated clickable timer tag button */}
          <button
            type="button"
            onClick={toggleTimerEditor}
            className={`sql-system-timer-tag-btn ${isEditingTimer ? 'is-open' : ''}`}
            title={`Set Loop Duration (${slideDuration / 1000}s) · Shortcut: T`}
            aria-label="Set loop timer interval"
          >
            <span>{slideDuration / 1000}s</span>
            <ChevronDown size={9} className={`sql-chevron-icon ${isEditingTimer ? 'is-rotated' : ''}`} />
          </button>

          <div className="sql-system-divider" />

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => {
              toggleFullscreen();
              resetIdleTimer();
            }}
            className="sql-system-btn"
            title={isFullscreen ? 'Exit Fullscreen (Shortcut: F)' : 'Fullscreen (Shortcut: F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 1: WELCOME & OPENING KEYNOTE (MSC PRPCEM · THINK SQL)
   ========================================================================== */
function Slide1Welcome({ step }) {
  return (
    <div className="relative w-full h-full flex items-center justify-between px-32 py-20 bg-white">
      {/* LEFT BRANDED CARD */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-[660px] h-[820px] rounded-3xl bg-slate-950 p-14 flex flex-col justify-between shadow-2xl relative overflow-hidden text-white border border-slate-800"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/40">
              <Database size={22} />
            </div>
            <div>
              <span className="font-mono text-xs text-blue-400 font-bold tracking-widest uppercase block">Official Curriculum</span>
              <span className="text-base font-extrabold text-white">Think SQL · MSC PRPCEM</span>
            </div>
          </div>
          <span className="font-mono text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            2026 EDITION
          </span>
        </div>

        {/* Center Illustration */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Layers size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
            The Foundation of All Modern Software.
          </h2>
          <p className="text-base text-slate-400 leading-relaxed font-normal">
            Before code compiles, before APIs route, before AI completes — data must be stored, guarded, and retrieved with mathematical precision.
          </p>
        </div>

        {/* Footer Card Info */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 relative z-10 font-mono">
          <span>Microsoft Student Club PRPCEM</span>
          <span className="text-emerald-400 font-bold">quiz.mscprpcem.tech</span>
        </div>
      </motion.div>

      {/* RIGHT HERO INTRO */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="w-[960px] flex flex-col justify-center space-y-8"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-sm font-bold w-fit">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>SQL CORE CURRICULUM · ARCHITECTURAL DECK</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[120px] font-extrabold tracking-[-0.05em] leading-[0.98] text-slate-900">
            Mastering <br />
            <span className="text-blue-600">Relational</span> <br />
            Databases<span className="text-emerald-500">.</span>
          </h1>
        </div>

        <p className="text-[26px] font-medium text-slate-600 leading-[1.35] max-w-2xl">
          From flat operating system files to ACID-compliant relational query engines, enterprise normalization, and production indexing.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 max-w-2xl">
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-mono text-xs font-bold text-blue-600 block">DIMENSION 01</span>
            <strong className="text-base font-bold text-slate-900 block">E.F. Codd Relational Model</strong>
            <span className="text-xs text-slate-500">Mathematical tables with primary &amp; foreign key constraints.</span>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
            <span className="font-mono text-xs font-bold text-emerald-600 block">DIMENSION 02</span>
            <strong className="text-base font-bold text-slate-900 block">ACID Transaction Guarantees</strong>
            <span className="text-xs text-slate-500">Zero partial writes, strict isolation, and durable storage.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 2: WHY DATABASES? (FLAT FILES VS RDBMS)
   ========================================================================== */
function Slide2WhyDatabases({ step }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      {/* Top Header */}
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-blue-600 uppercase tracking-widest block">CHAPTER 1.1 · DATA EVOLUTION</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">Before we write queries, why do databases exist?</h2>
        <p className="text-[24px] font-medium text-slate-600">The historical transition from brittle operating system text files to relational tables.</p>
      </div>

      {/* Center Comparison Showcase */}
      <div className="grid grid-cols-2 gap-10 items-stretch my-auto">
        {/* Left: Flat Files Era */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border-2 border-rose-100 bg-rose-50/30 p-10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 font-mono text-xs font-bold">
                1960s – 1970s: FLAT FILES
              </span>
              <AlertTriangle size={20} className="text-rose-500" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">Operating System Files (CSV, JSON)</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Applications saved data directly to disk blocks inside text or binary files without an intermediary manager.
            </p>

            {/* Mock CSV file */}
            <div className="font-mono text-xs bg-slate-950 text-slate-300 rounded-xl p-5 space-y-1.5 shadow-md">
              <div className="text-slate-500 pb-1 border-b border-slate-800 flex items-center justify-between">
                <span>$ cat users.csv</span>
                <span className="text-rose-400">Lock: None</span>
              </div>
              <div className="text-emerald-400">id,name,department,salary</div>
              <div>101,Aarav Sharma,Engineering,85000</div>
              <div>102,Priya Patel,Data Analytics,92000</div>
              <div className="text-rose-400 font-bold">103,Rohan Verma,null,CORRUPT_EOF</div>
            </div>
          </div>

          {/* Faults List */}
          <div className="pt-6 border-t border-rose-100 space-y-2 text-xs font-medium text-rose-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Concurrent writes overwrite and obliterate each other.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Sudden server power failure leaves files half-written &amp; corrupted.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>No relational keys: duplicate customer data copied across 50 files.</span>
            </div>
          </div>
        </motion.div>

        {/* Right: RDBMS Era */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/30 p-10 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-mono text-xs font-bold">
                1979 – PRESENT: RDBMS
              </span>
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-900">Relational Database Engine (SQL)</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              An intelligent server daemon (MySQL, PostgreSQL) manages memory buffer pools, indexes, lock managers, and write-ahead logs.
            </p>

            {/* Mock SQL Table */}
            <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-700 font-bold pb-2 border-b border-slate-100">
                <span>TABLE: users (Clustered B+ Tree)</span>
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">ACID OK</span>
              </div>
              <div className="grid grid-cols-4 text-xs font-mono font-bold text-slate-800 bg-slate-50 p-2 rounded">
                <span>emp_id [PK]</span>
                <span>name [VARCHAR]</span>
                <span>dept_id [FK]</span>
                <span>salary [DECIMAL]</span>
              </div>
              <div className="grid grid-cols-4 text-xs font-mono text-slate-600 px-2 py-1">
                <span className="font-bold text-blue-600">101</span>
                <span>Aarav Sharma</span>
                <span className="text-purple-600">D01</span>
                <span>85,000.00</span>
              </div>
              <div className="grid grid-cols-4 text-xs font-mono text-slate-600 px-2 py-1">
                <span className="font-bold text-blue-600">102</span>
                <span>Priya Patel</span>
                <span className="text-purple-600">D02</span>
                <span>92,000.00</span>
              </div>
            </div>
          </div>

          {/* Guarantees List */}
          <div className="pt-6 border-t border-emerald-100 space-y-2 text-xs font-medium text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Granular row-level locking handles 10,000+ simultaneous transactions.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Write-Ahead Logging (WAL) guarantees zero data loss on abrupt power cuts.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Primary &amp; Foreign Keys prevent phantom records and guarantee integrity.</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Hint */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-100">
        <span>Step {step + 1} of 3 · Click or press Space to advance</span>
        <span>RDBMS guarantees transactional truth</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 3: THE RELATIONAL MODEL & KEYS
   ========================================================================== */
function Slide3RelationalModel({ step }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-emerald-600 uppercase tracking-widest block">CHAPTER 1.2 · RELATIONAL ARCHITECTURE</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">2D Relations connected by Key Constraints.</h2>
        <p className="text-[24px] font-medium text-slate-600">How tables communicate without data duplication through Primary &amp; Foreign Keys.</p>
      </div>

      {/* Interactive Two-Table Diagram with animated SVG connector */}
      <div className="relative my-auto bg-slate-50 border border-slate-200 rounded-3xl p-12 flex items-center justify-between shadow-sm">
        
        {/* Left Table: EMPLOYEES */}
        <div className="w-[520px] bg-white rounded-2xl border-2 border-blue-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Table size={20} className="text-blue-600" />
              <strong className="text-lg font-black text-slate-900">employees</strong>
            </div>
            <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold">Child Relation</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
              <span className="font-bold text-blue-700 flex items-center gap-1.5">
                <Key size={13} className="text-amber-500" /> emp_id
              </span>
              <span className="text-slate-500">INT [PRIMARY KEY]</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-800 font-semibold">name</span>
              <span className="text-slate-500">VARCHAR(100) NOT NULL</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/80 border border-purple-200">
              <span className="font-bold text-purple-700 flex items-center gap-1.5">
                <LinkIcon size={13} className="text-purple-600" /> dept_id
              </span>
              <span className="text-purple-600 font-bold">INT [FOREIGN KEY] ➔</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-800 font-semibold">salary</span>
              <span className="text-slate-500">DECIMAL(10,2) CHECK(&gt;=0)</span>
            </div>
          </div>
        </div>

        {/* Center Connection Indicator */}
        <div className="flex flex-col items-center justify-center space-y-2 px-6">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            REFERENTIAL INTEGRITY
          </span>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full" />
          <span className="text-xs text-slate-400 font-medium">Prevents orphan child rows</span>
        </div>

        {/* Right Table: DEPARTMENTS */}
        <div className="w-[520px] bg-white rounded-2xl border-2 border-emerald-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Table size={20} className="text-emerald-600" />
              <strong className="text-lg font-black text-slate-900">departments</strong>
            </div>
            <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold">Parent Relation</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <Key size={13} className="text-amber-500" /> dept_id
              </span>
              <span className="text-emerald-700 font-bold">INT [PRIMARY KEY]</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-800 font-semibold">dept_name</span>
              <span className="text-slate-500">VARCHAR(50) UNIQUE</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-800 font-semibold">location</span>
              <span className="text-slate-500">VARCHAR(100) DEFAULT 'Amravati'</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-800 font-semibold">budget</span>
              <span className="text-slate-500">DECIMAL(12,2)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4 Structural Units Breakdown */}
      <div className="grid grid-cols-4 gap-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <strong className="text-sm font-bold text-slate-900 block">1. Relation (Table)</strong>
          <span className="text-xs text-slate-500">A structured 2D matrix consisting of rows &amp; columns.</span>
        </div>
        <div className="space-y-1">
          <strong className="text-sm font-bold text-slate-900 block">2. Tuple (Row / Record)</strong>
          <span className="text-xs text-slate-500">A single horizontal real-world entity instance.</span>
        </div>
        <div className="space-y-1">
          <strong className="text-sm font-bold text-slate-900 block">3. Attribute (Column)</strong>
          <span className="text-xs text-slate-500">A typed vertical data property (e.g. salary, name).</span>
        </div>
        <div className="space-y-1">
          <strong className="text-sm font-bold text-slate-900 block">4. Cell (Atomic Value)</strong>
          <span className="text-xs text-slate-500">The intersection of one row and column holding one scalar datum.</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 4: THE 5 SQL COMMAND FAMILIES
   ========================================================================== */
function Slide4CommandFamilies({ step }) {
  const families = [
    {
      code: 'DDL',
      name: 'Data Definition Language',
      desc: 'Defines, evolves, or destroys structural schemas and physical disk tablespaces.',
      commands: ['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME']
    },
    {
      code: 'DML',
      name: 'Data Manipulation Language',
      desc: 'Mutates, populates, and deletes individual row records inside existing schemas.',
      commands: ['INSERT', 'UPDATE', 'DELETE']
    },
    {
      code: 'DQL',
      name: 'Data Query Language',
      desc: 'Declarative queries that filter, project, join, group, and sort record sets.',
      commands: ['SELECT']
    },
    {
      code: 'DCL',
      name: 'Data Control Language',
      desc: 'Manages fine-grained database privileges, user roles, and security access.',
      commands: ['GRANT', 'REVOKE']
    },
    {
      code: 'TCL',
      name: 'Transaction Control Language',
      desc: 'Guarantees ACID boundaries by committing or rolling back atomic operations.',
      commands: ['COMMIT', 'ROLLBACK', 'SAVEPOINT']
    }
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-purple-600 uppercase tracking-widest block">CHAPTER 1.3 · COMMAND TAXONOMY</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">SQL is not one language. It is 5 specialized command families.</h2>
        <p className="text-[24px] font-medium text-slate-600">Understanding taxonomy prevents catastrophic production mistakes (like TRUNCATE vs DELETE).</p>
      </div>

      {/* 5 Distinct Cards Grid */}
      <div className="grid grid-cols-5 gap-5 my-auto">
        {families.map((fam, idx) => {
          const isActive = step >= idx;
          const isCurrent = step === idx;

          return (
            <motion.div
              key={fam.code}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isActive ? 1 : 0.35, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-6 flex flex-col justify-between border-2 transition-all ${
                isCurrent
                  ? 'border-blue-500 bg-white shadow-xl -translate-y-1'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-slate-900">{fam.code}</span>
                  <span className="font-mono text-[11px] font-bold text-slate-400">0{idx + 1}</span>
                </div>

                <strong className="text-sm font-extrabold text-slate-800 block leading-tight">
                  {fam.name}
                </strong>

                <p className="text-xs text-slate-500 leading-relaxed font-normal min-h-[54px]">
                  {fam.desc}
                </p>
              </div>

              {/* Commands Pill List */}
              <div className="pt-4 border-t border-slate-200/80 mt-4 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Core Commands:
                </span>
                <div className="flex flex-wrap gap-1">
                  {fam.commands.map(cmd => (
                    <span
                      key={cmd}
                      className="font-mono text-[11px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800"
                    >
                      {cmd}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-100">
        <span>Step {step + 1} of 5 · Every SQL query belongs to one of these 5 pillars</span>
        <span>ANSI SQL Standard Taxonomy</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 5: THE 4 ACID PILLARS
   ========================================================================== */
function Slide5AcidPillars({ step }) {
  const pillars = [
    {
      letter: 'A',
      name: 'Atomicity',
      motto: 'All or Nothing',
      desc: 'Transactions are indivisible units of work. If a 5-step bank transfer fails on step 4, the entire operation is rolled back with 0% partial write.',
      example: 'Bank transfer: Deduct $500 from Account A ➔ Add $500 to Account B. If power fails mid-way, money reverts 100%.'
    },
    {
      letter: 'C',
      name: 'Consistency',
      motto: 'Zero Corruption',
      desc: 'The database must move only from one valid state to another. Every constraint (Primary Key, Foreign Key, CHECK, NOT NULL) is strictly enforced.',
      example: 'Check constraint: Balance cannot be negative. If a withdrawal exceeds balance, the engine immediately aborts the query.'
    },
    {
      letter: 'I',
      name: 'Isolation',
      motto: 'No Dirty Reads',
      desc: 'Concurrent transactions execute independently without mutual interference. Multi-Version Concurrency Control (MVCC) prevents dirty or phantom reads.',
      example: 'Two users buying the last ticket simultaneously: Lock manager queues them sequentially so it cannot be double-sold.'
    },
    {
      letter: 'D',
      name: 'Durability',
      motto: 'Survives Crashes',
      desc: 'Once a transaction commits, its writes are permanent and guaranteed to survive sudden operating system crashes, server power loss, or reboots.',
      example: 'Write-Ahead Log (WAL / InnoDB Redo Log) writes changes to non-volatile disk before returning success to the user.'
    }
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-emerald-600 uppercase tracking-widest block">CHAPTER 1.4 · TRANSACTIONAL GUARANTEES</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">Why enterprises bet their financial systems on SQL: ACID.</h2>
        <p className="text-[24px] font-medium text-slate-600">The 4 mathematical pillars guaranteeing 100% transactional reliability under failure.</p>
      </div>

      <div className="grid grid-cols-4 gap-6 my-auto">
        {pillars.map((pillar, idx) => {
          const isActive = step >= idx;
          const isCurrent = step === idx;

          return (
            <motion.div
              key={pillar.letter}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: isActive ? 1 : 0.35, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`rounded-3xl p-8 flex flex-col justify-between border-2 bg-white transition-all ${
                isCurrent
                  ? 'border-emerald-500 shadow-2xl -translate-y-2'
                  : 'border-slate-200/90 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-mono text-2xl font-black flex items-center justify-center shadow-md">
                    {pillar.letter}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {pillar.motto}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">{pillar.name}</h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal min-h-[72px]">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-1.5 bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Production Case:
                </span>
                <span className="text-xs text-slate-700 leading-relaxed block font-medium">
                  {pillar.example}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-100">
        <span>Step {step + 1} of 4 · ACID forms the foundation of banking &amp; mission-critical software</span>
        <span>Guaranteed by RDBMS Engines</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 6: THE DEVELOPER WORKSPACE (LIVE QUERY SIMULATOR)
   ========================================================================== */
function Slide6SqlWorkspace({ step }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-blue-600 uppercase tracking-widest block">CHAPTER 1.5 · DECLARATIVE QUERY EXECUTION</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">Declarative query power in the developer's hands.</h2>
        <p className="text-[24px] font-medium text-slate-600">You tell SQL WHAT data you want; the engine optimizer calculates the optimal execution plan.</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch my-auto">
        {/* Left: Code Terminal */}
        <div className="col-span-7 bg-slate-950 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col justify-between font-mono">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-slate-300 font-bold">~/mscprpcem-sql/analytics.sql</span>
            </div>
            <span className="text-emerald-400 font-bold">MySQL 8.4 Server</span>
          </div>

          {/* SQL Query */}
          <div className="text-base leading-relaxed py-6 space-y-1 select-text">
            <div>
              <span className="text-sky-400 font-black">SELECT</span>{' '}
              <span className="text-slate-300">department,</span>
            </div>
            <div>
              {'       '}
              <span className="text-purple-400 font-bold">COUNT</span>
              <span className="text-slate-400">(*)</span>{' '}
              <span className="text-sky-400 font-bold">AS</span>{' '}
              <span className="text-slate-200">total_staff,</span>
            </div>
            <div>
              {'       '}
              <span className="text-purple-400 font-bold">ROUND</span>
              <span className="text-slate-400">(</span>
              <span className="text-purple-400 font-bold">AVG</span>
              <span className="text-slate-400">(salary),</span>{' '}
              <span className="text-amber-400">2</span>
              <span className="text-slate-400">)</span>{' '}
              <span className="text-sky-400 font-bold">AS</span>{' '}
              <span className="text-slate-200">avg_salary</span>
            </div>
            <div>
              <span className="text-sky-400 font-black">FROM</span>{' '}
              <span className="text-slate-200">employees</span>
            </div>
            <div>
              <span className="text-sky-400 font-black">WHERE</span>{' '}
              <span className="text-slate-300">is_active =</span>{' '}
              <span className="text-emerald-400 font-bold">TRUE</span>
            </div>
            <div>
              <span className="text-sky-400 font-black">GROUP BY</span>{' '}
              <span className="text-slate-300">department</span>
            </div>
            <div>
              <span className="text-sky-400 font-black">HAVING</span>{' '}
              <span className="text-purple-400 font-bold">COUNT</span>
              <span className="text-slate-400">(*) &gt;=</span>{' '}
              <span className="text-amber-400">3</span>
            </div>
            <div>
              <span className="text-sky-400 font-black">ORDER BY</span>{' '}
              <span className="text-slate-300">avg_salary</span>{' '}
              <span className="text-sky-400 font-bold">DESC;</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Execution Plan: Index Scan (dept_idx)</span>
            <span className="text-emerald-400">Query OK, 3 rows (0.001 sec)</span>
          </div>
        </div>

        {/* Right: Real Execution Result & Order Breakdown */}
        <div className="col-span-5 flex flex-col justify-between space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <strong className="text-sm font-black text-slate-900">Query Result Table (Live Projection)</strong>
              <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">3 Rows</span>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs font-mono text-xs">
              <div className="grid grid-cols-3 bg-slate-100 p-2.5 font-bold text-slate-800 border-b border-slate-200">
                <span>department</span>
                <span>total_staff</span>
                <span>avg_salary</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 text-slate-700 border-b border-slate-100">
                <span className="font-bold text-blue-600">Engineering</span>
                <span>12</span>
                <span className="font-bold text-emerald-600">$94,500.00</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 text-slate-700 border-b border-slate-100">
                <span className="font-bold text-blue-600">Product</span>
                <span>8</span>
                <span className="font-bold text-emerald-600">$88,250.00</span>
              </div>
              <div className="grid grid-cols-3 p-2.5 text-slate-700">
                <span className="font-bold text-blue-600">Data Analytics</span>
                <span>6</span>
                <span className="font-bold text-emerald-600">$86,100.00</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider block">
              Execution Sequence Order:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-bold">1. FROM</span>
              <span>➔</span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-bold">2. WHERE</span>
              <span>➔</span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-bold">3. GROUP BY</span>
              <span>➔</span>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded font-bold">4. HAVING</span>
              <span>➔</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-bold">5. SELECT</span>
              <span>➔</span>
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded font-bold">6. ORDER BY</span>
            </div>
            <p className="text-xs text-slate-500 leading-normal font-normal">
              Notice: The database engine executes FROM and WHERE before SELECT! This is why column aliases cannot be used inside WHERE clauses.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-100">
        <span>Step {step + 1} of 3 · Declarative SQL optimizes the scan path automatically</span>
        <span>Interactive Sandbox</span>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 7: READY? LEARN. PRACTICE. MASTER.
   ========================================================================== */
function Slide7ReadyToMaster({ step }) {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-32 py-20 bg-white">
      <div className="space-y-3">
        <span className="font-mono text-sm font-bold text-emerald-600 uppercase tracking-widest block">CURRICULUM PORTAL · THINK SQL</span>
        <h2 className="text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight">Ready to master production databases?</h2>
        <p className="text-[24px] font-medium text-slate-600">Learn theory, solve 66+ challenges in SQLite, and follow our 30-day interview roadmap.</p>
      </div>

      {/* 3 Call to Action Pillars */}
      <div className="grid grid-cols-3 gap-8 my-auto">
        {/* Pillar 1: Learn */}
        <div
          onClick={e => {
            e.stopPropagation();
            navigate('/courses/sql/learn');
          }}
          className="rounded-3xl border-2 border-blue-200 bg-white hover:bg-blue-50/30 p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <BookOpen size={30} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Interactive Lessons</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Structured chapters from DBMS basics, DDL, DML, Advanced Filtering, NULL 3-Valued Logic, Joins to Subqueries.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 mt-6"
          >
            <span>Start Learning</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Pillar 2: Practice */}
        <div
          onClick={e => {
            e.stopPropagation();
            navigate('/courses/sql/practice');
          }}
          className="rounded-3xl border-2 border-emerald-200 bg-white hover:bg-emerald-50/30 p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Terminal size={30} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">66+ Coding Lab</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Execute live queries in in-browser SQLite with instant grading, query diffing, test cases, and LeetCode-style tags.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 mt-6"
          >
            <span>Solve Challenges</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Pillar 3: Roadmap */}
        <div
          onClick={e => {
            e.stopPropagation();
            navigate('/courses/sql/roadmap');
          }}
          className="rounded-3xl border-2 border-purple-200 bg-white hover:bg-purple-50/30 p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Sparkles size={30} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">30-Day Roadmap</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Structured daily milestones designed to take student developers from scratch to cracking FAANG technical interviews.
            </p>
          </div>

          <button
            type="button"
            className="w-full py-3.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 mt-6"
          >
            <span>View Roadmap</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-4 border-t border-slate-100">
        <span>Microsoft Student Club PRPCEM · Official Quiz &amp; Learning Platform</span>
        <span>quiz.mscprpcem.tech/sql</span>
      </div>
    </div>
  );
}
