import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Trophy, RefreshCw } from 'lucide-react';

export default function TournamentStandings() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 25;

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setInitialLoading(true);
      const res = await api.get('/api/analytics/public/cumulative-leaderboard');
      if (res.data && Array.isArray(res.data.leaderboard)) {
        setLeaderboardData(res.data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  // Pagination calculations: 25 students per page
  const totalItems = leaderboardData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLeaderboard = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
    return leaderboardData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [leaderboardData, validCurrentPage]);

  // Pagination page numbers with ellipsis
  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  }, [totalPages, validCurrentPage]);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Trophy size={24} className="text-amber-500" />
            Leaderboard
          </h1>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {initialLoading ? (
            <div className="py-16 text-center text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin text-purple-600" />
              Loading leaderboard...
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 font-medium">
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-xs bg-slate-50/80">
                    <th className="py-3 px-4 w-16 text-center">Rank</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeaderboard.map((student) => {
                    const isTop1 = student.rank === 1;
                    const isTop2 = student.rank === 2;
                    const isTop3 = student.rank === 3;
                    const score = student.totalScore !== undefined ? student.totalScore : (student.score || 0);

                    return (
                      <tr
                        key={student.key || student.id || student.name}
                        className={`transition hover:bg-slate-50/80 ${
                          isTop1 ? 'bg-amber-50/30' : isTop2 ? 'bg-slate-50/50' : isTop3 ? 'bg-orange-50/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                              🥇
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-xs">
                              🥈
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-950 font-black text-xs shadow-xs">
                              🥉
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold text-xs">
                              #{student.rank}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {student.name}
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-purple-700 text-sm whitespace-nowrap">
                          {score} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Normal Centered Page Numbers (No boxes) */}
          {!initialLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 px-4 border-t border-slate-100 bg-slate-50/30 text-sm font-medium">
              <button
                type="button"
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:hover:text-slate-600 cursor-pointer transition font-medium"
              >
                Prev
              </button>

              <div className="flex items-center gap-2.5">
                {paginationItems.map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`dots-${idx}`} className="text-slate-400 select-none">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(item);
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`cursor-pointer transition px-1 ${
                        isActive
                          ? 'font-black text-purple-700 underline underline-offset-4'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={validCurrentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:hover:text-slate-600 cursor-pointer transition font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
