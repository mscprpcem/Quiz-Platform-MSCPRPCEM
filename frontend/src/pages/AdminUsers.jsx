import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import ThemeDropdown from '../components/ThemeDropdown';
import {
  Users,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Shield,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  X,
  Eye,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  BarChart2,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'student', label: 'Students Only', dotColor: 'bg-indigo-500', description: 'Enrolled students' },
  { value: 'admin', label: 'Administrators Only', dotColor: 'bg-purple-600', description: 'Platform admins' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified Only', dotColor: 'bg-emerald-500', description: 'Verified accounts' },
  { value: 'pending', label: 'Pending Only', dotColor: 'bg-amber-500', description: 'Unverified / OTP pending' }
];

const LIMIT_OPTIONS = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVerified: 0,
    totalStudents: 0,
    totalPending: 0
  });

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false
  });

  // Read-Only User Details Modal
  const [viewDetailUser, setViewDetailUser] = useState(null);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState(null);

  // Alert Feedback State
  const [alertMsg, setAlertMsg] = useState(null);

  // Auto-dismiss alert banner after 5 seconds
  useEffect(() => {
    if (alertMsg) {
      const timer = setTimeout(() => setAlertMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMsg]);

  // Lock background scroll when Details Modal is open
  useEffect(() => {
    if (viewDetailUser) {
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';
      if (mainEl) mainEl.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        if (mainEl) mainEl.style.overflow = prevMainOverflow;
      };
    }
  }, [viewDetailUser]);

  // Copy handle or email to clipboard
  const handleCopy = (text, id) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load Users from Backend Directory
  const fetchUsers = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await api.get('/api/users-directory', {
        params: {
          page,
          limit,
          search: search.trim() || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sortBy,
          sortOrder
        }
      });

      if (res.data?.success) {
        setUsers(res.data.users || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to load user directory.'
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers for search & filters
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  // Export Users as CSV
  const exportUsersCSV = () => {
    if (users.length === 0) {
      setAlertMsg({ type: 'error', text: 'No users available to export.' });
      return;
    }

    const headers = ['ID', 'Subject ID', 'Name', 'Handle', 'Email', 'College', 'Role', 'Status', 'Created At'];
    const rows = users.map((u) => [
      `"${u.id || ''}"`,
      `"${u.subject_id || ''}"`,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"@${u.username || u.email?.split('@')[0] || ''}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.college || 'PRPCEM Amravati').replace(/"/g, '""')}"`,
      `"${u.role || 'student'}"`,
      `"${u.is_verified ? 'Verified' : 'Pending'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `msc_users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real-time Computed Analytics
  const verificationRate = stats.totalUsers > 0
    ? Math.round((stats.totalVerified / stats.totalUsers) * 100)
    : 0;

  const studentRate = stats.totalUsers > 0
    ? Math.round((stats.totalStudents / stats.totalUsers) * 100)
    : 0;

  // Status & Role Distribution Data for Analytics Chart
  const statusRoleDistribution = useMemo(() => {
    return [
      { category: 'Verified', count: stats.totalVerified, fill: '#10b981' },
      { category: 'Pending', count: stats.totalPending, fill: '#f59e0b' },
      { category: 'Students', count: stats.totalStudents, fill: '#6366f1' },
      { category: 'Admins', count: Math.max(0, stats.totalUsers - stats.totalStudents), fill: '#a855f7' }
    ];
  }, [stats]);

  // Signups Trend by Date
  const signupTrendData = useMemo(() => {
    if (!users || users.length === 0) return [];
    const dateMap = {};
    users.forEach((u) => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[label] = (dateMap[label] || 0) + 1;
    });
    const result = Object.entries(dateMap).map(([date, signups]) => ({ date, signups }));
    return result.length > 0 ? result.slice(-8) : [{ date: 'Recent', signups: users.length }];
  }, [users]);

  // College Representation Count
  const uniqueCollegesCount = useMemo(() => {
    const colSet = new Set();
    users.forEach((u) => {
      if (u.college) colSet.add(u.college.trim());
    });
    return colSet.size > 0 ? colSet.size : 1;
  }, [users]);

  const startRecord = (page - 1) * limit + (users.length > 0 ? 1 : 0);
  const endRecord = Math.min(page * limit, pagination.total);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-segoe text-slate-800 text-left">
      
      {/* Toast Alert Banner */}
      {alertMsg && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold transition-all animate-fade-in ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-100'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg(null)}
            className="ml-2 hover:opacity-75 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ════════ TOP HEADER ════════ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <span>Admin Console</span>
            <span>•</span>
            <span className="text-blue-600 font-extrabold">User Directory & Analytics</span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Users size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  User Directory & Analytics
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {stats.totalUsers} {stats.totalUsers === 1 ? 'Registered User' : 'Registered Users'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Comprehensive directory details, verification analytics, enrollment statistics, and student profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={exportUsersCSV}
            disabled={users.length === 0}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed hover:-translate-y-0.5"
            title="Download user directory as CSV"
          >
            <Download size={15} className="text-slate-500" />
            <span>Export CSV</span>
            {users.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => fetchUsers(false)}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer hover:-translate-y-0.5"
            title="Refresh user directory"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          </button>
        </div>
      </div>

      {/* ════════ COUNT METRICS CARDS (CLICKABLE FILTERS) ════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users Card */}
        {(() => {
          const isAllActive = roleFilter === 'all' && statusFilter === 'all';
          return (
            <button
              type="button"
              onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group overflow-hidden ${
                isAllActive
                  ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border-blue-400 ring-2 ring-blue-500/20 shadow-md shadow-blue-500/10'
                  : 'bg-white border-slate-200/90 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-1.5 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Users</span>
                  {isAllActive && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">Active</span>
                  )}
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.totalUsers}</p>
                <p className="text-[11px] text-slate-400 font-medium">All registered accounts</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                isAllActive
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                  : 'bg-blue-50 text-blue-600 border border-blue-100'
              }`}>
                <Users size={22} />
              </div>
            </button>
          );
        })()}

        {/* Verified Users Card */}
        {(() => {
          const isVerifiedActive = statusFilter === 'verified';
          return (
            <button
              type="button"
              onClick={() => { setStatusFilter(statusFilter === 'verified' ? 'all' : 'verified'); setPage(1); }}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group overflow-hidden ${
                isVerifiedActive
                  ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                  : 'bg-white border-slate-200/90 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-1.5 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                    {verificationRate}%
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-600 tracking-tight">{stats.totalVerified}</p>
                <p className="text-[11px] text-slate-400 font-medium">Identity confirmed</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                isVerifiedActive
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>
                <ShieldCheck size={22} />
              </div>
            </button>
          );
        })()}

        {/* Students Card */}
        {(() => {
          const isStudentActive = roleFilter === 'student';
          return (
            <button
              type="button"
              onClick={() => { setRoleFilter(roleFilter === 'student' ? 'all' : 'student'); setPage(1); }}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group overflow-hidden ${
                isStudentActive
                  ? 'bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white border-indigo-400 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10'
                  : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-1.5 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">
                    {studentRate}%
                  </span>
                </div>
                <p className="text-3xl font-black text-indigo-600 tracking-tight">{stats.totalStudents}</p>
                <p className="text-[11px] text-slate-400 font-medium">Student enrollments</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                isStudentActive
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              }`}>
                <GraduationCap size={22} />
              </div>
            </button>
          );
        })()}

        {/* Unverified / Pending Card */}
        {(() => {
          const isPendingActive = statusFilter === 'pending';
          return (
            <button
              type="button"
              onClick={() => { setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending'); setPage(1); }}
              className={`relative text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group overflow-hidden ${
                isPendingActive
                  ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border-amber-400 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/10'
                  : 'bg-white border-slate-200/90 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-1.5 z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
                  {isPendingActive && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">Active</span>
                  )}
                </div>
                <p className="text-3xl font-black text-amber-600 tracking-tight">{stats.totalPending}</p>
                <p className="text-[11px] text-slate-400 font-medium">Awaiting OTP / email</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm ${
                isPendingActive
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/30'
                  : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <Clock size={22} />
              </div>
            </button>
          );
        })()}
      </div>

      {/* ════════ ANALYTICS SECTION: DISTRIBUTION & ACTIVITY ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status & Role Distribution Chart */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <BarChart2 size={16} className="text-blue-600" />
              <span>User Base & Role Distribution</span>
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Telemetry</span>
          </div>

          <div className="h-52 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusRoleDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [value, 'Accounts']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Verification Rate:</span>
              <span className="font-extrabold text-emerald-600">{verificationRate}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Student Share:</span>
              <span className="font-extrabold text-indigo-600">{studentRate}%</span>
            </div>
          </div>
        </div>

        {/* Registration Activity Trend */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
              <TrendingUp size={16} className="text-indigo-600" />
              <span>Recent Signups & Registrations</span>
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Onboarding Activity</span>
          </div>

          <div className="h-52 text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signupTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userSignupGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [value, 'Signups']}
                />
                <Area type="monotone" dataKey="signups" stroke="#6366f1" fillOpacity={1} fill="url(#userSignupGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Total Institutions:</span>
              <span className="font-extrabold text-slate-900">{uniqueCollegesCount}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
              <span className="text-slate-400">Directory Status:</span>
              <span className="font-extrabold text-blue-600">Active Sync</span>
            </div>
          </div>
        </div>

      </div>

      {/* ════════ FILTER & SEARCH BAR ════════ */}
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Search users by name, @username, email address, college..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-xs font-bold text-slate-800 outline-none transition-all placeholder-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md hover:bg-slate-200/60 transition-all"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls: Role, Status, Items per page */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Role Filter */}
            <ThemeDropdown
              value={roleFilter}
              onChange={(val) => { setRoleFilter(val); setPage(1); }}
              options={ROLE_OPTIONS}
              icon={<Shield size={14} />}
            />

            {/* Status Filter */}
            <ThemeDropdown
              value={statusFilter}
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              options={STATUS_OPTIONS}
              icon={<CheckCircle2 size={14} />}
            />

            {/* Items Per Page */}
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Show:</span>
              <ThemeDropdown
                value={limit}
                onChange={(val) => handleLimitChange(val)}
                options={LIMIT_OPTIONS}
                size="sm"
                buttonClassName="bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 border-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs flex-wrap">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Active Filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-xs">
                <span>Search: &ldquo;{search}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); }}
                  className="hover:text-blue-900 cursor-pointer p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-xs">
                <span>Role: {roleFilter}</span>
                <button
                  type="button"
                  onClick={() => { setRoleFilter('all'); setPage(1); }}
                  className="hover:text-indigo-900 cursor-pointer p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                <span>Status: {statusFilter}</span>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setPage(1); }}
                  className="hover:text-emerald-900 cursor-pointer p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer ml-auto transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* ════════ USERS DETAILS DIRECTORY TABLE ════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/90 backdrop-blur-sm text-slate-600 font-extrabold uppercase text-[11px] tracking-wider border-b border-slate-200 select-none">
                <th
                  onClick={() => handleSort('name')}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/70 hover:text-slate-900 transition-colors min-w-[220px] ${
                    sortBy === 'name' ? 'text-blue-600 font-black bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>User</span>
                    {sortBy === 'name' ? (
                      sortOrder === 'ASC' ? <ArrowUp size={13} className="text-blue-600" /> : <ArrowDown size={13} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="p-3.5 min-w-[170px]">Username Handle</th>
                <th
                  onClick={() => handleSort('email')}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/70 hover:text-slate-900 transition-colors min-w-[220px] ${
                    sortBy === 'email' ? 'text-blue-600 font-black bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email Address</span>
                    {sortBy === 'email' ? (
                      sortOrder === 'ASC' ? <ArrowUp size={13} className="text-blue-600" /> : <ArrowDown size={13} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="p-3.5 min-w-[200px]">College / Institution</th>
                <th
                  onClick={() => handleSort('role')}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/70 hover:text-slate-900 transition-colors min-w-[110px] ${
                    sortBy === 'role' ? 'text-blue-600 font-black bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {sortBy === 'role' ? (
                      sortOrder === 'ASC' ? <ArrowUp size={13} className="text-blue-600" /> : <ArrowDown size={13} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('is_verified')}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/70 hover:text-slate-900 transition-colors min-w-[120px] ${
                    sortBy === 'is_verified' ? 'text-blue-600 font-black bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortBy === 'is_verified' ? (
                      sortOrder === 'ASC' ? <ArrowUp size={13} className="text-blue-600" /> : <ArrowDown size={13} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className={`p-3.5 cursor-pointer hover:bg-slate-100/70 hover:text-slate-900 transition-colors min-w-[130px] ${
                    sortBy === 'createdAt' ? 'text-blue-600 font-black bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined Date</span>
                    {sortBy === 'createdAt' ? (
                      sortOrder === 'ASC' ? <ArrowUp size={13} className="text-blue-600" /> : <ArrowDown size={13} className="text-blue-600" />
                    ) : (
                      <ArrowUpDown size={12} className="text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="p-3.5 text-right min-w-[100px]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-16 text-center text-slate-400 font-bold">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                        <RefreshCw size={22} className="animate-spin text-blue-600" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-700">Loading user directory...</span>
                      <span className="text-xs text-slate-400 font-medium">Fetching accounts from database</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3.5 py-6 animate-fade-in">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-xs">
                        <Users size={26} />
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="text-sm font-extrabold text-slate-800">No Users Found</h3>
                        <p className="text-xs text-slate-500 max-w-xs">
                          {search
                            ? `No user records match query "${search}".`
                            : 'No user accounts match the current filters.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setPage(1); }}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs hover:-translate-y-0.5"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = (u.name || 'Student')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name & Initials */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 block truncate max-w-[190px]">
                              {u.name || 'Unnamed Student'}
                            </span>
                            {u.subject_id && (
                              <span className="text-[9px] font-mono text-slate-400 block truncate">
                                {u.subject_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username Handle */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg text-xs font-bold border border-blue-100 truncate max-w-[140px]">
                            @{u.username || u.email?.split('@')[0]}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(`@${u.username || u.email?.split('@')[0]}`, u.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0 p-0.5"
                            title="Copy handle"
                          >
                            {copiedId === u.id ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="p-3.5">
                        <span className="text-slate-600 font-semibold block truncate max-w-[210px]" title={u.email}>
                          {u.email}
                        </span>
                      </td>

                      {/* College / Institution */}
                      <td className="p-3.5">
                        <span className="text-slate-700 font-bold block truncate max-w-[200px]" title={u.college || 'PRPCEM Amravati'}>
                          {u.college || 'PRPCEM Amravati'}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role || 'student'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-black border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-black border border-amber-200">
                            <Clock size={11} />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Actions Column: View Details */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setViewDetailUser(u)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs hover:-translate-y-0.5 active:scale-95"
                          title="View user profile details"
                        >
                          <Eye size={13} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ════════ PAGINATION BAR ════════ */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          {/* Range text */}
          <div className="text-slate-500 font-bold">
            Showing <span className="text-slate-900 font-extrabold">{startRecord}</span> to{' '}
            <span className="text-slate-900 font-extrabold">{endRecord}</span> of{' '}
            <span className="text-slate-900 font-extrabold">{pagination.total}</span> users
          </div>

          {/* Paginator Controls */}
          <div className="flex items-center gap-2">
            
            {/* Previous Page */}
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrev || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 font-mono font-black">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((pNum) => {
                  return (
                    pNum === 1 ||
                    pNum === pagination.totalPages ||
                    Math.abs(pNum - page) <= 1
                  );
                })
                .map((pNum, idx, arr) => {
                  const prevPNum = arr[idx - 1];
                  const showEllipsis = prevPNum && pNum - prevPNum > 1;

                  return (
                    <React.Fragment key={pNum}>
                      {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer ${
                          page === pNum
                            ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════ READ-ONLY USER DETAILS MODAL ════════ */}
      {viewDetailUser && createPortal(
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-[10000] animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-left space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                  {(viewDetailUser.name || 'S').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{viewDetailUser.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      @{viewDetailUser.username || viewDetailUser.email?.split('@')[0]}
                    </span>
                    {viewDetailUser.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={10} />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock size={10} />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Grid Details */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="font-mono text-slate-800 font-bold">{viewDetailUser.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">College / Institution</span>
                <span className="text-slate-800 font-bold">{viewDetailUser.college || 'PRPCEM Amravati'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Subject ID</span>
                <span className="font-mono text-slate-600 font-bold">{viewDetailUser.subject_id || viewDetailUser.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">System Role</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  viewDetailUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {viewDetailUser.role || 'student'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Account Registered</span>
                <span className="font-mono text-slate-600">
                  {viewDetailUser.createdAt ? new Date(viewDetailUser.createdAt).toLocaleString() : '—'}
                </span>
              </div>
            </div>

            {/* Verification Portal Link */}
            <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">Verification Platform Profile:</span>
              <a
                href={`https://verify.mscprpcem.tech/u/${encodeURIComponent(viewDetailUser.username || viewDetailUser.email?.split('@')[0])}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-black inline-flex items-center gap-1 hover:underline"
              >
                <span>View Public Card</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Modal Close Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewDetailUser(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
