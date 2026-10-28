import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Zap, 
  Target, 
  Lightbulb, 
  EyeOff, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Medal, 
  Flame, 
  ShieldCheck, 
  User,
  HelpCircle
} from 'lucide-react';
import api from '../services/api';

export default function SqlLeaderboardModal({ 
  isOpen, 
  onClose, 
  currentUserEmail = '',
  currentUserName = '',
  currentUserPoints = 0,
  cleanSolvesCount = 0
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'clean' | 'rules'
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserStats, setCurrentUserStats] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, activeTab, currentUserEmail]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParam = activeTab === 'clean' ? 'clean' : 'all';
      const res = await api.get('/api/analytics/sql/leaderboard', {
        params: {
          filter: filterParam,
          limit: 100,
          currentEmail: currentUserEmail || ''
        }
      });

      if (res.data && res.data.success) {
        setLeaderboard(res.data.leaderboard || []);
        setTotalParticipants(res.data.totalParticipants || 0);
        if (res.data.currentUserStats) {
          setCurrentUserStats(res.data.currentUserStats);
        }
      }
    } catch (err) {
      console.error('Failed to load SQL leaderboard:', err);
      setError('Could not connect to leaderboard service. Displaying local data.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-sky-500/5 to-purple-500/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Trophy size={20} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  SQL Mastery Leaderboard
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {totalParticipants} active learners • Ranked by points & clean solves
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Leaderboard"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Trophy size={13} className="text-amber-500" />
              <span>Global Standings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clean')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'clean'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Target size={13} className="text-emerald-600" />
              <span>Clean Solvers</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-black">
                No Hints
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'rules'
                  ? 'bg-white text-blue-800 shadow-2xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Zap size={13} className="text-blue-600" />
              <span>Scoring Rules</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-1 text-[11px] text-slate-400 font-semibold">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Anti-Cheat Verified</span>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center space-x-2">
              <HelpCircle size={15} className="shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1 & 2: LEADERBOARD VIEW */}
          {(activeTab === 'all' || activeTab === 'clean') && (
            <>
              {/* TOP 3 PODIUM */}
              {top3.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 pb-1">
                  {/* 2nd Place */}
                  {top3[1] && (
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center relative shadow-2xs order-1">
                      <span className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-slate-800 border-2 border-white flex items-center justify-center font-black text-xs shadow-xs">
                        2
                      </span>
                      <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center mb-1.5 mt-1 border border-slate-300">
                        {top3[1].studentName?.charAt(0) || '2'}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-full">
                        {top3[1].studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-full font-mono mb-2">
                        {top3[1].studentEmail}
                      </div>
                      <div className="text-sm font-black text-slate-800 mt-auto">
                        {top3[1].totalPoints.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">pts</span>
                      </div>
                      <span className="mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                        <Target size={9} /> {top3[1].cleanSolvesCount} Clean
                      </span>
                    </div>
                  )}

                  {/* 1st Place (Gold Center) */}
                  {top3[0] && (
                    <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center relative shadow-sm order-2 scale-102">
                      <span className="absolute -top-3.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 border-2 border-white flex items-center justify-center font-black text-xs shadow-xs">
                        🥇
                      </span>
                      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-amber-200 text-amber-900 font-black text-base flex items-center justify-center mb-1.5 mt-1 border border-amber-300 shadow-2xs">
                        {top3[0].studentName?.charAt(0) || '1'}
                      </div>
                      <div className="text-xs sm:text-sm font-black text-amber-950 truncate max-w-full">
                        {top3[0].studentName}
                      </div>
                      <div className="text-[10px] text-amber-700 truncate max-w-full font-mono mb-2">
                        {top3[0].studentEmail}
                      </div>
                      <div className="text-base font-black text-amber-600 mt-auto">
                        {top3[0].totalPoints.toLocaleString()} <span className="text-[10px] text-amber-700 font-bold">pts</span>
                      </div>
                      <span className="mt-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 flex items-center gap-0.5 shadow-2xs">
                        <Target size={9} /> {top3[0].cleanSolvesCount} Clean
                      </span>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {top3[2] && (
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center relative shadow-2xs order-3">
                      <span className="absolute -top-3 w-6 h-6 rounded-full bg-amber-700/80 text-white border-2 border-white flex items-center justify-center font-black text-xs shadow-xs">
                        3
                      </span>
                      <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-full bg-amber-100/70 text-amber-900 font-black text-sm flex items-center justify-center mb-1.5 mt-1 border border-amber-200">
                        {top3[2].studentName?.charAt(0) || '3'}
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate max-w-full">
                        {top3[2].studentName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-full font-mono mb-2">
                        {top3[2].studentEmail}
                      </div>
                      <div className="text-sm font-black text-slate-800 mt-auto">
                        {top3[2].totalPoints.toLocaleString()} <span className="text-[10px] text-slate-500 font-bold">pts</span>
                      </div>
                      <span className="mt-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                        <Target size={9} /> {top3[2].cleanSolvesCount} Clean
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* REMAINING LEADERBOARD TABLE */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="grid grid-cols-12 px-3 sm:px-4 py-2.5 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <span className="col-span-2 sm:col-span-1">Rank</span>
                  <span className="col-span-6 sm:col-span-6">Student</span>
                  <span className="col-span-2 sm:col-span-3 text-center sm:text-left">Solves</span>
                  <span className="col-span-2 sm:col-span-2 text-right">Points</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {remaining.length === 0 && top3.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No participants ranked yet. Start solving questions to claim rank #1!
                    </div>
                  ) : remaining.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-medium">
                      All top participants shown on the podium above.
                    </div>
                  ) : (
                    remaining.map((player) => {
                      const isMe = player.isCurrentUser || (currentUserEmail && player.studentEmail.toLowerCase() === currentUserEmail.toLowerCase());
                      return (
                        <div
                          key={player.rank}
                          className={`grid grid-cols-12 px-3 sm:px-4 py-2.5 items-center text-xs transition-colors ${
                            isMe ? 'bg-amber-50/60 font-bold' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <span className="col-span-2 sm:col-span-1 font-mono font-bold text-slate-600">
                            #{player.rank}
                          </span>
                          <div className="col-span-6 sm:col-span-6 flex items-center space-x-2 truncate">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">
                              {player.studentName?.charAt(0) || 'U'}
                            </span>
                            <div className="truncate">
                              <span className="text-slate-900 font-bold truncate block">
                                {player.studentName} {isMe && <span className="text-[10px] text-amber-600 font-black ml-1">(You)</span>}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                {player.studentEmail}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2 sm:col-span-3 flex items-center space-x-1.5 text-center sm:text-left">
                            <span className="text-slate-700 font-semibold">{player.totalSolved}</span>
                            <span className="hidden sm:inline text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                              🎯 {player.cleanSolvesCount} clean
                            </span>
                          </div>
                          <span className="col-span-2 sm:col-span-2 text-right font-black text-slate-900">
                            {player.totalPoints.toLocaleString()} <span className="text-[10px] text-slate-400">pts</span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: SCORING RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-4 text-left">
              <div className="bg-gradient-to-r from-amber-50 to-blue-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center space-x-2">
                  <Zap size={18} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-sm font-black text-slate-900">
                    The No-Hint Clean Solve Bonus System
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  We reward deep analytical thinking and authentic problem solving. Every question has a base point value, plus a <strong className="text-emerald-700 font-bold">+50% Clean Solve Bonus</strong> when solved without revealing or reading any hints!
                </p>
              </div>

              {/* Point Values Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Basic / Easy */}
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      Basic & Easy
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">1 Point</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-2xl font-black text-emerald-900">
                      +1 <span className="text-xs font-bold text-emerald-700">Pt Max</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      <div>• Clean Solve: <strong className="text-emerald-700">+1 pt</strong></div>
                      <div className="text-slate-400">• With hints: 0 pts</div>
                      <div className="text-slate-400">• Solved cleanly without hints</div>
                    </div>
                  </div>
                </div>

                {/* Medium */}
                <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                      Medium Challenge
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-700">2 Points</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-2xl font-black text-amber-900">
                      +2 <span className="text-xs font-bold text-amber-700">Pts Max</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      <div>• Clean Solve: <strong className="text-amber-700">+2 pts</strong></div>
                      <div className="text-slate-400">• With hints: 0 pts</div>
                      <div className="text-slate-400">• Joins, Group By, Subqueries</div>
                    </div>
                  </div>
                </div>

                {/* Hard */}
                <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                      Hard Challenge
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700">3 Points</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-2xl font-black text-rose-900">
                      +3 <span className="text-xs font-bold text-rose-700">Pts Max</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 space-y-0.5">
                      <div>• Clean Solve: <strong className="text-rose-700">+3 pts</strong></div>
                      <div className="text-slate-400">• With hints: 0 pts</div>
                      <div className="text-slate-400">• Complex DDL, CTEs, Windowing</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strict Mode Guide */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5 bg-slate-50/60">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <EyeOff size={15} className="text-slate-700" />
                  <span>Pro-Tip: Enable "Hide Hints (Strict Mode)"</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Go to <strong>Settings ⚙️</strong> in the SQL Practice header and switch ON <strong>Hide Hints (Strict Mode)</strong>. This removes the Hints tab completely, prevents accidental clicks, and guarantees you always target the full clean-solve bonus on every question!
                </p>
                <div className="text-xs text-slate-500 font-medium">
                  💡 <em>Already solved a challenge with hints? You can re-solve it cleanly anytime to claim the missing bonus points upgrade!</em>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CURRENT USER STICKY FOOTER */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-t border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-xs shrink-0">
              #{currentUserStats?.rank || (leaderboard.length + 1)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                <span>{currentUserName || currentUserStats?.studentName || 'Your Standing'}</span>
                <span className="text-[10px] text-emerald-400 font-mono font-normal">
                  ({currentUserStats?.cleanSolvesCount ?? cleanSolvesCount} Clean Solves 🎯)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUserEmail || 'Signed in as student'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm sm:text-base font-black text-amber-400">
                {(currentUserStats?.totalPoints ?? currentUserPoints).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pts</span>
              </div>
              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                Total Score
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Back to Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
