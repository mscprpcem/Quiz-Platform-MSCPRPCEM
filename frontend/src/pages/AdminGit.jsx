import React, { useState, useEffect } from 'react';
import { GitBranch, Users, Award, Code2, RefreshCw, Search, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { GIT_CHALLENGES } from '../data/gitChallenges';
import { useToast } from '../context/ToastContext';

export default function AdminGit() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [resetting, setResetting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/git/admin/stats');
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load admin git stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetStudent = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    if (!window.confirm(`Are you sure you want to reset all Git progress for ${resetEmail}?`)) {
      return;
    }

    try {
      setResetting(true);
      const res = await api.post('/git/admin/reset-student', { email: resetEmail });
      if (res.data?.success) {
        addToast(res.data.message || 'Student Git progress reset', 'success');
        setResetEmail('');
        fetchStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset progress', 'error');
    } finally {
      setResetting(false);
    }
  };

  const filteredChallenges = GIT_CHALLENGES.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-widest">
              Course Administration
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Git & GitHub Module Manager</h1>
          <p className="text-xs text-slate-500 font-semibold">
            Monitor real-time student adoption, challenge completion metrics, and manage practice labs.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Learners</span>
            <span className="text-xl font-black text-slate-900">{stats?.totalLearners || 0}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Enrolled Students</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Code2 size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Solves</span>
            <span className="text-xl font-black text-slate-900">{stats?.totalChallengesSolved || 0}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Labs Verified</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mastery Ninjas</span>
            <span className="text-xl font-black text-slate-900">
              {(stats?.tierDistribution?.['Git Ninja'] || 0) + (stats?.tierDistribution?.['Open Source Lead'] || 0)}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">Level 4+ Achievers</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <GitBranch size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Challenges</span>
            <span className="text-xl font-black text-slate-900">{GIT_CHALLENGES.length}</span>
            <span className="text-[10px] text-slate-500 font-semibold block">Active in Bank</span>
          </div>
        </div>
      </div>

      {/* Student Progress Reset Utility */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Student Progress Reset Tool</h3>
          <p className="text-xs text-slate-500 font-medium">
            Reset a student's Git challenges, lessons, and quiz scores for retakes or testing.
          </p>
        </div>

        <form onSubmit={handleResetStudent} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="email"
            required
            placeholder="Enter student email (e.g. student@prpcem.ac.in)"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={resetting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
          >
            {resetting ? 'Resetting...' : 'Reset Progress'}
          </button>
        </form>
      </div>

      {/* Challenge Catalog */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Configured Challenge Directory</h3>
            <p className="text-xs text-slate-500">20+ state-validated Git interactive sandbox challenges.</p>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Challenge ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Track</th>
                <th className="py-2.5 px-3">Difficulty</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredChallenges.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-[11px]">{c.id}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{c.title}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {c.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.difficulty === 'Beginner'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : c.difficulty === 'Intermediate'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={`/practice/git/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 font-bold text-[11px]"
                    >
                      Test in Sandbox →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
