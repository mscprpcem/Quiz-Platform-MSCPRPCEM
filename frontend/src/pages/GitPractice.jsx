import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  GitBranch, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight, 
  Lightbulb, ShieldCheck, Terminal, Award, HelpCircle, ChevronRight, BookOpen, Layers
} from 'lucide-react';
import { GIT_CHALLENGES } from '../data/gitChallenges';
import { VirtualGitEngine } from '../services/gitEngine';
import GitTerminal from '../components/GitTerminal';
import GitVisualizer from '../components/GitVisualizer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function GitPractice() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Find active challenge or default to first
  const activeChallenge = useMemo(() => {
    if (challengeId) {
      const found = GIT_CHALLENGES.find(c => c.id === challengeId);
      if (found) return found;
    }
    return GIT_CHALLENGES[0];
  }, [challengeId]);

  // State
  const [engine, setEngine] = useState(null);
  const [engineVersion, setEngineVersion] = useState(0); // For forcing re-renders of visualizer
  const [validationResult, setValidationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem('msc_git_solved_challenges');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHints, setShowHints] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize virtual engine on challenge change
  useEffect(() => {
    if (activeChallenge) {
      const newEngine = new VirtualGitEngine(activeChallenge.initialState || {});
      setEngine(newEngine);
      setEngineVersion(prev => prev + 1);
      setValidationResult(null);
      setShowCelebration(false);
      setShowHints(false);
      setActiveHintIndex(0);
    }
  }, [activeChallenge]);

  // Load user progress from backend if logged in
  useEffect(() => {
    if (user?.email) {
      api.get(`/git/progress?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data?.success && res.data?.progress?.completed_challenges) {
            setSolvedChallenges(res.data.progress.completed_challenges);
            localStorage.setItem('msc_git_solved_challenges', JSON.stringify(res.data.progress.completed_challenges));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Handle terminal command execution
  const handleCommandExecuted = (cmd, result) => {
    setEngineVersion(prev => prev + 1);
    // Clear validation result on new actions
    if (validationResult && !validationResult.passed) {
      setValidationResult(null);
    }
  };

  // Reset sandbox
  const handleResetSandbox = () => {
    if (window.confirm('Reset this challenge sandbox to its initial state? All in-progress virtual work will be cleared.')) {
      const newEngine = new VirtualGitEngine(activeChallenge.initialState || {});
      setEngine(newEngine);
      setEngineVersion(prev => prev + 1);
      setValidationResult(null);
      addToast('Sandbox reset to initial state', 'info');
    }
  };

  // Verify challenge
  const handleVerifySolution = async () => {
    if (!engine || !activeChallenge) return;
    setIsVerifying(true);

    try {
      // Execute state validator predicate
      const result = activeChallenge.validation(engine);
      setValidationResult(result);

      if (result.passed) {
        setShowCelebration(true);
        const updated = Array.from(new Set([...solvedChallenges, activeChallenge.id]));
        setSolvedChallenges(updated);
        localStorage.setItem('msc_git_solved_challenges', JSON.stringify(updated));

        // Sync with backend API
        if (user?.email) {
          try {
            await api.post('/git/progress/challenge', {
              challengeId: activeChallenge.id,
              email: user.email
            });
          } catch (syncErr) {
            console.warn('Could not sync git progress to server, saved locally:', syncErr.message);
          }
        }

        addToast('🎉 Challenge Solved Successfully!', 'success');
      } else {
        addToast(result.message || 'Solution did not pass validation.', 'error');
      }
    } catch (e) {
      setValidationResult({ passed: false, message: `Validator error: ${e.message}` });
    } finally {
      setIsVerifying(false);
    }
  };

  // Navigation to next challenge
  const currentIndex = GIT_CHALLENGES.findIndex(c => c.id === activeChallenge.id);
  const nextChallenge = GIT_CHALLENGES[currentIndex + 1] || null;
  const prevChallenge = GIT_CHALLENGES[currentIndex - 1] || null;

  const isSolved = solvedChallenges.includes(activeChallenge.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-segoe pb-12">
      {/* Top Navbar Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              to="/courses/git"
              className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back to Git Hub</span>
            </Link>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-slate-100">{activeChallenge.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                activeChallenge.difficulty === 'Beginner'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : activeChallenge.difficulty === 'Intermediate'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {activeChallenge.difficulty}
              </span>
              {isSolved && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Solved
                </span>
              )}
            </div>
          </div>

          {/* Quick Challenge Selector Dropdown & Actions */}
          <div className="flex items-center space-x-2">
            <select
              value={activeChallenge.id}
              onChange={(e) => navigate(`/practice/git/${e.target.value}`)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-bold"
            >
              {GIT_CHALLENGES.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {idx + 1}. {c.title} {solvedChallenges.includes(c.id) ? '✓' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={handleResetSandbox}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Reset Sandbox"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Pane Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Challenge Brief, Objectives & Hints (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Scenario Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                  {activeChallenge.category} Lab
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Challenge {currentIndex + 1} of {GIT_CHALLENGES.length}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-slate-100">{activeChallenge.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed mt-2 font-medium">
                  {activeChallenge.scenario}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2.5">
                <button
                  onClick={handleVerifySolution}
                  disabled={isVerifying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <ShieldCheck size={14} />
                  <span>{isVerifying ? 'Verifying State...' : 'Verify Solution'}</span>
                </button>

                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                    showHints
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="View step-by-step hints"
                >
                  <Lightbulb size={13} className={showHints ? 'text-amber-400 fill-amber-400' : ''} />
                  <span>Hints ({activeChallenge.hints?.length || 0})</span>
                </button>
              </div>

              {/* Validation Result Box */}
              {validationResult && (
                <div className={`p-4 rounded-xl border text-xs leading-relaxed animate-fade-in flex items-start space-x-2.5 ${
                  validationResult.passed
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  {validationResult.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{validationResult.passed ? 'Success!' : 'Verification Notice'}</span>
                    <p className="mt-0.5 text-[11px] text-slate-300">{validationResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Step-by-Step Hints Accordion */}
            {showHints && activeChallenge.hints && (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Lightbulb size={14} className="fill-amber-400" />
                    Recommended Solution Steps
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Step {activeHintIndex + 1} of {activeChallenge.hints.length}
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
                  {activeChallenge.hints[activeHintIndex]}
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <button
                    disabled={activeHintIndex === 0}
                    onClick={() => setActiveHintIndex(prev => Math.max(0, prev - 1))}
                    className="text-slate-400 hover:text-slate-200 disabled:opacity-30 cursor-pointer font-bold"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={activeHintIndex === activeChallenge.hints.length - 1}
                    onClick={() => setActiveHintIndex(prev => Math.min(activeChallenge.hints.length - 1, prev + 1))}
                    className="text-amber-400 hover:text-amber-300 disabled:opacity-30 cursor-pointer font-bold"
                  >
                    Next Hint →
                  </button>
                </div>
              </div>
            )}

            {/* Navigation to Next / Previous Challenges */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
              {prevChallenge ? (
                <button
                  onClick={() => navigate(`/practice/git/${prevChallenge.id}`)}
                  className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Previous: {prevChallenge.title.slice(0, 20)}...</span>
                </button>
              ) : <div />}

              {nextChallenge && (
                <button
                  onClick={() => navigate(`/practice/git/${nextChallenge.id}`)}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer text-slate-200"
                >
                  <span>Next: {nextChallenge.title.slice(0, 20)}...</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Visualizer (Top) & Interactive Terminal (Bottom) (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Real-Time Commit & 3-Trees Visualizer */}
            <GitVisualizer engine={engine} key={`vis-${engineVersion}`} />

            {/* Interactive Terminal */}
            <GitTerminal
              engine={engine}
              onCommandExecuted={handleCommandExecuted}
              key={`term-${activeChallenge.id}`}
              initialMessage={`MSC Virtual Git Sandbox [${activeChallenge.title}]\nType 'help' for available commands. Your prompt shows current branch.`}
            />
          </div>
        </div>
      </div>

      {/* Celebration Modal on Solved */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20 animate-bounce">
              🏆
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Challenge Solved
              </span>
              <h3 className="text-xl font-black text-slate-100">{activeChallenge.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {validationResult?.message || "Great work! You achieved the correct repository state."}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Keep Experimenting
              </button>

              {nextChallenge && (
                <button
                  onClick={() => {
                    setShowCelebration(false);
                    navigate(`/practice/git/${nextChallenge.id}`);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Next Challenge</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
