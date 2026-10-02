import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Check,
  Calendar,
  Lock,
  Clock
} from 'lucide-react';

export default function IssueBadgeModal({ quiz, isOpen = true, onClose, onSuccess }) {
  const [badgeSysId, setBadgeSysId] = useState('');
  const [badgeTitle, setBadgeTitle] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [savingOnly, setSavingOnly] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAttendees, setShowAttendees] = useState(false);

  // Background scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Load badge status and eligible attendees when modal opens
  useEffect(() => {
    if (!isOpen || !quiz?.id) return;

    setBadgeSysId(quiz.badge_sys_id || quiz.verification_event_id || '');
    setBadgeTitle(quiz.badge_title || `${quiz.title || 'MSC Quiz'} Certified Master`);
    setError('');
    setSuccessMsg('');
    setShowAttendees(false);

    const fetchBadgeStatus = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/quizzes/${quiz.id}/badge-status`);
        if (res.data?.success) {
          setStatusData(res.data);
          if (res.data.quiz?.badge_sys_id) {
            setBadgeSysId(res.data.quiz.badge_sys_id);
          }
          if (res.data.quiz?.badge_title) {
            setBadgeTitle(res.data.quiz.badge_title);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch quiz badge status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeStatus();
  }, [isOpen, quiz?.id]);

  if (!isOpen || !quiz) return null;

  const handleSaveOnly = async () => {
    if (!badgeSysId.trim()) {
      setError('Please provide a Badge Sys ID.');
      return;
    }
    try {
      setSavingOnly(true);
      setError('');
      const res = await api.post(`/api/quizzes/${quiz.id}/issue-badges`, {
        badge_sys_id: badgeSysId.trim(),
        badge_title: badgeTitle.trim(),
        action: 'save_only'
      });
      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Badge settings saved successfully.');
        if (onSuccess) onSuccess({ ...quiz, badge_sys_id: badgeSysId.trim(), badge_title: badgeTitle.trim() });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save badge settings.');
    } finally {
      setSavingOnly(false);
    }
  };

  const handleIssueNow = async () => {
    if (!badgeSysId.trim()) {
      setError('Badge Sys ID is required to issue digital badges.');
      return;
    }
    const eligibleCount = (statusData?.attendees || []).filter(a => (a.score || 0) >= minScore).length;
    if (eligibleCount === 0) {
      setError(`No participants have scored >= ${minScore}% to receive this badge.`);
      return;
    }

    const confirmIssue = window.confirm(
      `Issue Official Digital Badge "${badgeTitle || badgeSysId}" to ${eligibleCount} participant(s) now?\n\nThis will synchronize credentials directly with the Verification Platform (verify.mscprpcem.tech).`
    );
    if (!confirmIssue) return;

    try {
      setIssuing(true);
      setError('');
      const res = await api.post(`/api/quizzes/${quiz.id}/issue-badges`, {
        badge_sys_id: badgeSysId.trim(),
        badge_title: badgeTitle.trim(),
        action: 'issue_now',
        min_score: minScore
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Badges successfully issued!');
        if (onSuccess) {
          onSuccess({
            ...quiz,
            badge_sys_id: badgeSysId.trim(),
            badge_title: badgeTitle.trim(),
            badge_issued_at: res.data.badge_issued_at
          });
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue badges.');
    } finally {
      setIssuing(false);
    }
  };

  const attendeesList = statusData?.attendees || [];
  const filteredAttendees = attendeesList.filter(a => (a.score || 0) >= minScore);
  const isAlreadyIssued = Boolean(quiz.badge_issued_at || statusData?.quiz?.badge_issued_at);
  const issuedDateStr = (quiz.badge_issued_at || statusData?.quiz?.badge_issued_at)
    ? new Date(quiz.badge_issued_at || statusData?.quiz?.badge_issued_at).toLocaleDateString([], { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-500 shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Digital Credential Issuer
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {quiz.mode === 'SCHEDULED' ? 'Scheduled Quiz' : 'Live Quiz'}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug mt-0.5 truncate max-w-sm sm:max-w-md">
                {quiz.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-4">
          {/* Status Alert Banner */}
          {isAlreadyIssued ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Credential Officially Issued</strong>
                <span>Badges were issued on <strong>{issuedDateStr}</strong> using Sys ID <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono text-emerald-800 font-bold">{badgeSysId || 'standard'}</code>. You can re-issue or update credentials below.</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2 text-xs text-blue-900">
              <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Admin Permission Required</strong>
                <span className="text-blue-700 text-[11px]">Badges are controlled manually. Save settings to issue after the event completes, or issue immediately to all completed participants.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3.5">
            {/* Badge Sys ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  Badge Sys ID <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Matches Verification Platform ID
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. azure-cloud-specialist, dbms-sql-architect"
                  value={badgeSysId}
                  onChange={(e) => setBadgeSysId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium mt-1">
                Linked directly to <strong className="text-slate-700 font-mono">verify.mscprpcem.tech</strong>. Students can verify their credential with this ID.
              </p>
            </div>



            {/* Badge Title Field */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Badge Credential Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Certified Cloud Practitioner Master"
                value={badgeTitle}
                onChange={(e) => setBadgeTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Eligibility Minimum Passing Score */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Passing Score Filter
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'All Completers', score: 0 },
                  { label: 'Score ≥ 50%', score: 50 },
                  { label: 'Score ≥ 70%', score: 70 }
                ].map((tier) => (
                  <button
                    key={tier.score}
                    type="button"
                    onClick={() => setMinScore(tier.score)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      minScore === tier.score
                        ? 'bg-white border-blue-600 text-blue-700 shadow-2xs font-extrabold ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eligible Attendees Summary */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-500" />
                  <span className="text-xs font-extrabold text-slate-900">
                    {loading ? 'Counting eligible participants...' : `${filteredAttendees.length} Eligible Participant${filteredAttendees.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                {filteredAttendees.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAttendees(prev => !prev)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAttendees ? 'Hide List' : 'View List'}</span>
                    {showAttendees ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                )}
              </div>

              {showAttendees && (
                <div className="mt-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto space-y-1 pr-1">
                  {filteredAttendees.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-slate-900 block truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{att.email}</span>
                      </div>
                      <span className="font-black text-emerald-700 shrink-0 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        {att.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Permission Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-2xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              disabled={savingOnly || issuing || loading}
              className="px-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 text-blue-700 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {savingOnly ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Clock size={13} />
                  <span>Save for Later</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleIssueNow}
              disabled={issuing || savingOnly || loading || filteredAttendees.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs hover:shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {issuing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Issuing Badges...</span>
                </>
              ) : (
                <>
                  <Award size={14} />
                  <span>Issue Badges Now ({filteredAttendees.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
