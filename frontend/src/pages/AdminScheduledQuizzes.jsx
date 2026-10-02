import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { formatToISTDateTimeString } from '../utils/dateUtils';
import { downloadBrandedQRCard, fetchBrandingConfig, getLogoUrl } from '../utils/qrCardGenerator';
import {
  Calendar, Plus, Search, Clock, Users, Eye, Play, Pause, Edit2, ExternalLink, Trash2,
  QrCode, Copy, Check, X, Download, AlertTriangle, BarChart2, Award
} from 'lucide-react';
import IssueBadgeModal from '../components/IssueBadgeModal';
import './AdminScheduledQuizzes.css';

export default function AdminScheduledQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [qrModalQuiz, setQrModalQuiz] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [branding, setBranding] = useState(null);
  const [badgeModalQuiz, setBadgeModalQuiz] = useState(null);

  // Prevent background page scrolling while the QR modal is open
  useEffect(() => {
    if (qrModalQuiz) {
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
  }, [qrModalQuiz]);

  const fetchScheduledQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/scheduled-quizzes');
      setQuizzes(res.data || []);
    } catch (err) {
      console.error('Fetch scheduled quizzes error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranding = async () => {
    try {
      const brand = await fetchBrandingConfig();
      setBranding(brand);
    } catch (err) {
      console.error('Failed to load branding in AdminScheduledQuizzes:', err);
    }
  };

  useEffect(() => {
    fetchScheduledQuizzes();
    loadBranding();
  }, []);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadModalQR = async (quiz) => {
    if (!quiz) return;
    const code = quiz.join_code || quiz.custom_slug || 'QUIZ';
    const slug = quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code);
    const joinUrl = `${window.location.origin}/join/${quiz.join_code || slug}`;
    await downloadBrandedQRCard({
      svgElementId: 'admin-scheduled-quiz-qr-svg',
      quizData: {
        title: quiz.title,
        subtitle: quiz.category || (quiz.schedule_type ? `${quiz.schedule_type} ASSESSMENT` : 'SCHEDULED ASSESSMENT'),
        custom_slug: quiz.custom_slug,
        join_code: quiz.join_code,
        join_url: joinUrl
      },
      brandData: branding,
      fileName: `quiz-${code}.png`
    });
  };

  const handlePauseSchedule = async (quizId) => {
    try {
      await api.post(`/api/scheduled-quizzes/${quizId}/pause`);
      fetchScheduledQuizzes();
    } catch (err) {
      alert('Failed to pause schedule.');
    }
  };

  const handleDeleteQuiz = async (quizId, quizTitle) => {
    if (!window.confirm(`Are you sure you want to delete '${quizTitle}'?\nAll occurrences, questions, and participant attempts will be permanently deleted.`)) {
      return;
    }
    try {
      await api.delete(`/api/scheduled-quizzes/${quizId}`);
      fetchScheduledQuizzes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete scheduled quiz.');
    }
  };

  // Calculate live counts per filter tab
  const filterCounts = useMemo(() => {
    let all = 0, active = 0, scheduled = 0, completed = 0, expired = 0;
    quizzes.forEach(q => {
      all++;
      const isEnded = !q.activeOccurrence && !q.nextOccurrence;
      const hasParticipants = (q.participantCount || 0) > 0;
      if (q.activeOccurrence) active++;
      else if (q.nextOccurrence) scheduled++;
      else if (q.status === 'completed' || (isEnded && hasParticipants)) completed++;
      else if (q.status === 'expired' || (isEnded && !hasParticipants)) expired++;
    });
    return { All: all, Active: active, Scheduled: scheduled, Completed: completed, Expired: expired };
  }, [quizzes]);

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;

    const isEnded = !q.activeOccurrence && !q.nextOccurrence;
    const hasParticipants = (q.participantCount || 0) > 0;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return Boolean(q.activeOccurrence);
    if (statusFilter === 'Scheduled' || statusFilter === 'Upcoming') return Boolean(q.nextOccurrence);
    if (statusFilter === 'Completed') return q.status === 'completed' || (isEnded && hasParticipants);
    if (statusFilter === 'Expired') return q.status === 'expired' || (isEnded && !hasParticipants);
    return true;
  });

  return (
    <div className="space-y-6 text-left font-segoe pb-12">
      
      {/* ════════ HEADER ROW ════════ */}
      <div className="scheduled-header-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              Scheduled Quizzes
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure recurring schedules, exam windows, and independent participant attempts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Quick Metrics Strip */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="scheduled-metric-pill">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              <span className="text-xs font-black text-slate-900">{quizzes.length}</span>
            </div>
            <div className="scheduled-metric-pill">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Active</span>
              <span className="text-xs font-black text-emerald-700">{filterCounts.Active}</span>
            </div>
            <div className="scheduled-metric-pill">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Upcoming</span>
              <span className="text-xs font-black text-blue-700">{filterCounts.Scheduled}</span>
            </div>
            <div className="scheduled-metric-pill">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Attempts</span>
              <span className="text-xs font-black text-purple-700">
                {quizzes.reduce((sum, q) => sum + (q.participantCount || 0), 0)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/scheduled-quizzes/create')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Create Scheduled Quiz</span>
          </button>
        </div>
      </div>

      {/* ════════ SEARCH & SEGMENTED FILTER BAR ════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scheduled quizzes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="scheduled-tabs-track overflow-x-auto">
          {['All', 'Active', 'Scheduled', 'Completed', 'Expired'].map((status) => {
            const count = filterCounts[status] !== undefined ? filterCounts[status] : 0;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`scheduled-tab-btn ${isActive ? 'scheduled-tab-btn-active' : ''}`}
              >
                <span>{status === 'Scheduled' ? 'Upcoming' : status}</span>
                <span className="scheduled-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════ SCHEDULED QUIZZES LIST GRID ════════ */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading scheduled quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Calendar size={36} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">No Scheduled Quizzes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a One-Time, Daily, Weekly, or Custom scheduled quiz to get started.</p>
          <button
            onClick={() => navigate('/admin/scheduled-quizzes/create')}
            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs hover:bg-blue-700 transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create First Scheduled Quiz</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const slug = quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code);
            const studentUrl = `${window.location.origin}/q/${slug}`;

            return (
              <div key={quiz.id} className="scheduled-card">
                <div className="space-y-3.5">
                  {/* Top row: Type chip & Status */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        {quiz.schedule_type ? quiz.schedule_type.replace('_', ' ') : 'ONE TIME'}
                      </span>
                      {quiz.badge_issued_at ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Award size={10} className="text-emerald-600" />
                          <span>Badge Issued</span>
                        </span>
                      ) : (quiz.badge_sys_id || quiz.badge_title) ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Award size={10} className="text-amber-600" />
                          <span>Badge Ready</span>
                        </span>
                      ) : null}
                    </div>
                    
                    {quiz.activeOccurrence ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white animate-pulse">
                        ACTIVE NOW
                      </span>
                    ) : quiz.nextOccurrence ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        UPCOMING
                      </span>
                    ) : (quiz.participantCount || 0) > 0 ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 ${
                        (quiz.violationCount || 0) > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        <AlertTriangle size={10} className={(quiz.violationCount || 0) > 0 ? "text-rose-600" : "text-slate-400"} />
                        <span>{quiz.violationCount || 0} Violations</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        EXPIRED
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      onClick={() => navigate(`/admin/scheduled-quizzes/${quiz.id}`)}
                      className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug hover:text-blue-600 transition-colors cursor-pointer truncate"
                      title={quiz.title}
                    >
                      {quiz.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                      {quiz.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-2">
                    {/* Dates */}
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar size={11} className="text-blue-600" /> Start:
                        </span>
                        <span className="font-bold text-slate-800 truncate max-w-[170px]">
                          {quiz.scheduled_start ? `${formatToISTDateTimeString(quiz.scheduled_start)} IST` : 'Flexible'}
                        </span>
                      </div>
                      {quiz.scheduled_end && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            <Clock size={11} className="text-emerald-600" /> End:
                          </span>
                          <span className="font-bold text-emerald-700 truncate max-w-[170px]">
                            {formatToISTDateTimeString(quiz.scheduled_end)} IST
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Telemetry 4-Col Grid */}
                    <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-slate-200/60 text-center text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                        <span className="font-extrabold text-slate-800 text-[11px] mt-0.5 block">{quiz.time_limit || 15}m</span>
                      </div>
                      <div className="border-l border-slate-200/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
                        <span className="font-extrabold text-slate-800 text-[11px] mt-0.5 block">{quiz.questionCount || 0}</span>
                      </div>
                      <div className="border-l border-slate-200/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Attempts</span>
                        <span className="font-extrabold text-slate-800 text-[11px] mt-0.5 block">{quiz.participantCount || 0}</span>
                      </div>
                      <div className="border-l border-slate-200/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Violations</span>
                        <span className={`font-extrabold text-[11px] mt-0.5 block ${(quiz.violationCount || 0) > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                          {quiz.violationCount || 0}
                        </span>
                      </div>
                    </div>

                    {/* Direct Slug Pill */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400 font-semibold">Direct Link:</span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={studentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-blue-600 hover:underline truncate max-w-[150px]"
                          title="Open student exam URL"
                        >
                          /q/{slug}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(studentUrl)}
                          className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Action Buttons Footer */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                  {/* Row 1: Core navigation */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/admin/scheduled-quizzes/${quiz.id}`)}
                      className="scheduled-btn-action-primary"
                      title="View Details & Manage Attempts"
                    >
                      <Eye size={12} />
                      <span>View Details</span>
                    </button>

                    <button
                      onClick={() => navigate(`/admin/scheduled-quizzes/edit/${quiz.id}`)}
                      className="scheduled-btn-action"
                      title="Edit Assessment Settings"
                    >
                      <Edit2 size={12} />
                      <span>Edit Settings</span>
                    </button>
                  </div>

                  {/* Row 2: Utility toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/admin/analytics/${quiz.id}`)}
                      className="scheduled-btn-action flex-1"
                      title="View Assessment Analytics & Reports"
                    >
                      <BarChart2 size={12} />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => setQrModalQuiz(quiz)}
                      className="scheduled-btn-action px-2.5"
                      title="View & Download Direct QR Poster"
                    >
                      <QrCode size={13} />
                    </button>

                    <button
                      onClick={() => setBadgeModalQuiz(quiz)}
                      className={`scheduled-btn-action px-2.5 ${quiz.badge_issued_at ? 'text-emerald-750 bg-emerald-50 border-emerald-300' : quiz.badge_sys_id ? 'text-amber-750 bg-amber-50 border-amber-300' : ''}`}
                      title={quiz.badge_issued_at ? 'Badge Issued (Click to manage credentials)' : quiz.badge_sys_id ? 'Badge Configured (Click to issue credentials)' : 'Issue Verification Platform Badge'}
                    >
                      <Award size={13} />
                    </button>

                    <button
                      onClick={() => window.open(studentUrl, '_blank')}
                      className="scheduled-btn-action px-2.5"
                      title="Open Student Exam Link (/q/slug)"
                    >
                      <ExternalLink size={13} />
                    </button>

                    <button
                      onClick={() => handlePauseSchedule(quiz.id)}
                      className="scheduled-btn-action px-2.5"
                      title="Pause / Resume Schedule"
                    >
                      <Pause size={13} />
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                      className="scheduled-btn-action-danger px-2.5"
                      title="Delete Scheduled Quiz"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════ QUICK QR CODE & BRANDED CARD MODAL ════════ */}
      {qrModalQuiz && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100 text-center relative my-auto max-h-[92vh] overflow-y-auto animate-scale-in">
            <button
              onClick={() => setQrModalQuiz(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-1 text-center pt-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-black uppercase">
                <QrCode size={12} />
                <span>Scheduled Quiz QR Card</span>
              </div>
              <h3 className="text-base font-black text-slate-900 line-clamp-1 px-4">{qrModalQuiz.title}</h3>
              <p className="text-xs text-slate-500 font-medium">Scan with camera or share short join link</p>
            </div>

            {/* QR Card Container */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
              {(() => {
                const slug = qrModalQuiz.custom_slug || (qrModalQuiz.title ? qrModalQuiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : qrModalQuiz.join_code);
                const fullUrl = `${window.location.origin}/q/${slug}`;
                return (
                  <>
                    <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
                      <QRCodeSVG
                        id="admin-scheduled-quiz-qr-svg"
                        value={fullUrl}
                        size={140}
                        bgColor="#FFFFFF"
                        fgColor="#0F172A"
                        level="H"
                        imageSettings={{
                          src: getLogoUrl(branding?.logo_path),
                          x: undefined,
                          y: undefined,
                          height: branding?.qr_logo_size || 28,
                          width: branding?.qr_logo_size || 28,
                          excavate: true,
                        }}
                      />
                    </div>

                    <div className="w-full flex items-center space-x-1.5">
                      <input
                        type="text"
                        readOnly
                        value={fullUrl}
                        className="bg-white border border-slate-200 text-blue-700 font-mono font-bold text-[11px] px-2.5 py-1.5 rounded-lg w-full truncate"
                      />
                      <button
                        onClick={() => handleCopyLink(fullUrl)}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer shrink-0"
                        title="Copy direct join link"
                      >
                        {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownloadModalQR(qrModalQuiz)}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Download QR Card</span>
              </button>
              <button
                onClick={() => setQrModalQuiz(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── ISSUE BADGE MODAL ── */}
      {badgeModalQuiz && (
        <IssueBadgeModal
          quiz={badgeModalQuiz}
          isOpen={Boolean(badgeModalQuiz)}
          onClose={() => setBadgeModalQuiz(null)}
          onSuccess={() => {
            setBadgeModalQuiz(null);
            fetchScheduledQuizzes();
          }}
        />
      )}

    </div>
  );
}
