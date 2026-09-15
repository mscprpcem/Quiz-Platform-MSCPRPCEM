import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * RequireAuth Guard
 * Ensures only authenticated users (Student Account or Admin) can access Learn & Practice routes.
 * Preserves the target URL for seamless post-login redirection.
 */
export default function RequireAuth({ children }) {
  const { user, studentAccount, loading } = useAuth();
  const location = useLocation();

  // If AuthContext is still verifying tokens or SSO
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 font-segoe space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
          <Loader2 size={24} className="animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-xs font-black text-slate-800 tracking-wide uppercase">Verifying Student Session</p>
          <p className="text-[11px] text-slate-400 font-medium">Securing access to learning & practice modules...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = Boolean(studentAccount || user);

  if (!isAuthenticated) {
    const returnUrl = location.pathname + location.search;
    try {
      sessionStorage.setItem('msc_quiz_return_url', returnUrl);
    } catch (_) {}

    return (
      <Navigate 
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} 
        state={{ from: returnUrl }} 
        replace 
      />
    );
  }

  return children;
}
