import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { formatToISTDateTimeString } from '../utils/dateUtils';
import { downloadBrandedQRCard, fetchBrandingConfig, getLogoUrl } from '../utils/qrCardGenerator';
import {
  Calendar, Plus, Search, Clock, Users, Eye, Play, Pause, Edit2, ExternalLink, Trash2,
  QrCode, Copy, Check, X, Download, AlertTriangle, BarChart2
} from 'lucide-react';

export default function AdminScheduledQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [qrModalQuiz, setQrModalQuiz] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [branding, setBranding] = useState(null);

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
    <div className="space-y-8 text-left font-segoe">
      
      {/* ════════ HEADER ROW ════════ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Scheduled Quizzes</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Configure recurring schedules, time-window availability, and independent participant attempts.</p>
        </div>

        <button
          onClick={() => navigate('/admin/scheduled-quizzes/create')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Scheduled Quiz</span>
        </button>
      </div>

      {/* ════════ STAT CARDS ════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar size={20} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block">Total Scheduled Quizzes</span>
          <div className="text-2xl font-black text-slate-900">{quizzes.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Play size={20} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block">Active Now</span>
          <div className="text-2xl font-black text-slate-900">
            {quizzes.filter(q => q.activeOccurrence).length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block">Upcoming Occurrences</span>
          <div className="text-2xl font-black text-slate-900">
            {quizzes.filter(q => q.nextOccurrence).length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block">Total Participant Attempts</span>
          <div className="text-2xl font-black text-slate-900">
            {quizzes.reduce((sum, q) => sum + (q.participantCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* ════════ SEARCH & FILTER BAR ════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search scheduled quizzes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Active', 'Scheduled', 'Completed', 'Expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ════════ SCHEDULED QUIZZES LIST GRID ════════ */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading scheduled quizzes...</div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <Calendar size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-black text-slate-800">No Scheduled Quizzes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a One-Time, Daily, Weekly, Biweekly, Monthly, or Custom scheduled quiz to get started.</p>
          <button
            onClick={() => navigate('/admin/scheduled-quizzes/create')}
            className="px-5 py-2.5 bg-blue-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm"
          >
            Create First Scheduled Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                    {quiz.schedule_type || 'ONE_TIME'}
                  </span>
                  
                  {quiz.activeOccurrence ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white animate-pulse">
                      ACTIVE NOW
                    </span>
                  ) : quiz.nextOccurrence ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      UPCOMING
                    </span>
                  ) : (quiz.participantCount || 0) > 0 ? (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                      (quiz.violationCount || 0) > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-zinc-100 text-zinc-650 border border-zinc-200'
                    }`}>
                      <AlertTriangle size={11} className={(quiz.violationCount || 0) > 0 ? "text-rose-600" : "text-zinc-500"} />
                      <span>{quiz.violationCount || 0} {(quiz.violationCount || 0) === 1 ? 'Violation' : 'Violations'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200" title="Concluded with 0 attempts">
                      EXPIRED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 leading-snug">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">{quiz.description || 'No description provided.'}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Start:</span>
                    <span className="font-extrabold text-slate-800">
                      {quiz.scheduled_start ? formatToISTDateTimeString(quiz.scheduled_start) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">End:</span>
                    <span className="font-extrabold text-emerald-600">
                      {quiz.scheduled_end ? formatToISTDateTimeString(quiz.scheduled_end) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Direct Slug Link:</span>
                    <span 
                      onClick={() => {
                        const slug = quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code);
                        const url = `${window.location.origin}/q/${slug}`;
                        window.open(url, '_blank');
                      }}
                      className="font-mono font-bold text-blue-600 hover:underline cursor-pointer truncate max-w-[140px]"
                      title="Open Quiz Link in New Page (/q/slug)"
                    >
                      /q/{quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Time Limit:</span>
                    <span className="font-extrabold text-slate-800">{quiz.time_limit} Mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Questions:</span>
                    <span className="font-extrabold text-blue-600">{quiz.questionCount || 0} Questions</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Attempts:</span>
                    <span className="font-extrabold text-slate-800">{quiz.participantCount || 0} Total</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-semibold">Violations:</span>
                    <span className={`font-extrabold flex items-center gap-1 ${(quiz.violationCount || 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                      <AlertTriangle size={12} className={(quiz.violationCount || 0) > 0 ? 'text-rose-500' : 'text-slate-400'} />
                      <span>{quiz.violationCount || 0} Recorded</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 sm:flex items-center gap-1.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/admin/scheduled-quizzes/${quiz.id}`)}
                  className="col-span-2 sm:flex-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Eye size={13} />
                  <span>View</span>
                </button>

                <button
                  onClick={() => navigate(`/admin/scheduled-quizzes/edit/${quiz.id}`)}
                  className="col-span-2 sm:flex-1 py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                  title="Edit Scheduled Quiz"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => navigate(`/admin/analytics/${quiz.id}`)}
                  className="p-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="View Assessment Analytics & Reports"
                >
                  <BarChart2 size={13} />
                </button>

                <button
                  onClick={() => setQrModalQuiz(quiz)}
                  className="p-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="View & Download Direct QR Card"
                >
                  <QrCode size={13} />
                </button>

                <button
                  onClick={() => {
                    const slug = quiz.custom_slug || (quiz.title ? quiz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : quiz.join_code);
                    const url = `${window.location.origin}/q/${slug}`;
                    window.open(url, '_blank');
                  }}
                  className="p-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="Open Quiz Link in New Page (/q/slug)"
                >
                  <ExternalLink size={13} />
                </button>

                <button
                  onClick={() => handlePauseSchedule(quiz.id)}
                  className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="Pause Schedule"
                >
                  <Pause size={13} />
                </button>

                <button
                  onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                  className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center"
                  title="Delete Scheduled Quiz"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>
          ))}
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

    </div>
  );
}
