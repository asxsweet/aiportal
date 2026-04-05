import { Search, Mail, TrendingUp, TrendingDown, Filter, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';

type Row = {
  user: { id: string; name: string; email: string };
  stats: { completedAssignments: number; totalAssignments: number; avgScore: number | null };
};

type ScoreFilter = 'all' | 'high' | 'mid' | 'low';

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Students() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(h);
  }, [searchTerm]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ data: Row[]; totalPages: number }>('/api/users/students', {
        params: { page, pageSize: 10, search: debounced || undefined },
      });
      setRows(data.data);
      setTotalPages(data.totalPages);
      if (data.data.length === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch (e) {
      setError(getErrorMessage(e, t('students.loadError')));
    } finally {
      setLoading(false);
    }
  }, [page, debounced, t]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const avg = row.stats.avgScore;
      if (scoreFilter === 'high') return avg != null && avg >= 80;
      if (scoreFilter === 'low') return avg == null || avg < 60;
      if (scoreFilter === 'mid') return avg != null && avg >= 60 && avg < 80;
      return true;
    });
  }, [rows, scoreFilter]);

  const exportCsv = () => {
    const header = ['Name', 'Email', 'AvgScore', 'Completed', 'Total', 'CompletionPct'];
    const lines = filteredRows.map((r) => {
      const total = r.stats.totalAssignments || 1;
      const pct = Math.min(100, Math.round((r.stats.completedAssignments / total) * 100));
      const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
      return [
        esc(r.user.name),
        esc(r.user.email),
        r.stats.avgScore ?? '',
        r.stats.completedAssignments,
        r.stats.totalAssignments,
        pct,
      ].join(',');
    });
    const csv = `\uFEFF${header.join(',')}\n${lines.join('\n')}`;
    downloadFile(csv, `students-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportJson = () => {
    const payload = filteredRows.map((r) => {
      const total = r.stats.totalAssignments || 1;
      const pct = Math.min(100, Math.round((r.stats.completedAssignments / total) * 100));
      return {
        name: r.user.name,
        email: r.user.email,
        avgScore: r.stats.avgScore,
        completedAssignments: r.stats.completedAssignments,
        totalAssignments: r.stats.totalAssignments,
        completionPct: pct,
      };
    });
    downloadFile(
      JSON.stringify(payload, null, 2),
      `students-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.user.id;
    setDeletePending(true);
    try {
      await api.delete(`/api/users/students/${id}`);
      toast.success(t('students.deleteSuccess'));
      setDeleteTarget(null);
      try {
        const { data } = await api.get<{ data: Row[]; totalPages: number }>('/api/users/students', {
          params: { page, pageSize: 10, search: debounced || undefined },
        });
        setRows(data.data);
        setTotalPages(data.totalPages);
        if (data.data.length === 0 && page > 1) {
          setPage((p) => Math.max(1, p - 1));
        }
      } catch {
        try {
          const { data } = await api.get<{ data: Row[]; totalPages: number }>('/api/users/students', {
            params: { page, pageSize: 10, search: debounced || undefined },
          });
          setRows(data.data);
          setTotalPages(data.totalPages);
        } catch {
          /* list may be stale; avoid full-page spinner */
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e, t('students.deleteError')));
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <SidebarLayout role="teacher">
      <div className="p-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-50">{t('students.title')}</h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('students.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 mb-6 transition-colors">
            <div className="flex flex-col lg:flex-row gap-4 flex-wrap items-stretch lg:items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('students.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[200px]">
                <Filter className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" aria-hidden />
                <select
                  value={scoreFilter}
                  onChange={(e) => {
                    setScoreFilter(e.target.value as ScoreFilter);
                    setPage(1);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <option value="all">{t('students.filterAll')}</option>
                  <option value="high">{t('students.filterScoreHigh')}</option>
                  <option value="mid">{t('students.filterScoreMid')}</option>
                  <option value="low">{t('students.filterScoreLow')}</option>
                </select>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={loading || filteredRows.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('students.exportCsv')}
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  disabled={loading || filteredRows.length === 0}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('students.exportJson')}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : (
            <div className="grid gap-6">
              {filteredRows.map((row) => {
                const { user, stats } = row;
                const total = stats.totalAssignments || 1;
                const pct = Math.min(100, Math.round((stats.completedAssignments / total) * 100));
                const trendUp = (stats.avgScore ?? 0) >= 80;
                return (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-[240px]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">{user.name}</h3>
                            {trendUp ? (
                              <TrendingUp className="w-5 h-5 text-green-500 shrink-0" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 mb-4">
                            <Mail className="w-4 h-4 shrink-0" />
                            {user.email}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">{t('students.avgScore')}</p>
                              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.avgScore != null ? `${stats.avgScore}%` : t('students.na')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">{t('students.completion')}</p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {stats.completedAssignments}/{stats.totalAssignments || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">{t('students.lastActive')}</p>
                              <p className="text-lg font-semibold text-gray-700 dark:text-zinc-300">{t('students.na')}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600 dark:text-zinc-400">{t('students.overallProgress')}</span>
                              <span className="font-semibold text-gray-900 dark:text-zinc-100">{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 w-full sm:w-auto flex justify-end sm:justify-start">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-950/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                          {t('students.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredRows.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-12 text-center transition-colors">
              <p className="text-gray-500 dark:text-zinc-400 text-lg">{t('students.noStudents')}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-800 dark:text-zinc-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('back')}
              </button>
              <span className="self-center text-sm text-gray-600 dark:text-zinc-400">
                {t('pagination', { page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-gray-800 dark:text-zinc-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletePending) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-student-title"
            className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-student-title" className="text-lg font-bold text-gray-900 dark:text-zinc-50">
              {t('students.deleteConfirmTitle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">
              {t('students.deleteConfirmMessage')}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 mt-3 truncate" title={deleteTarget.user.email}>
              {deleteTarget.user.name} · {deleteTarget.user.email}
            </p>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                disabled={deletePending}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-600 py-2.5 text-sm font-medium text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={deletePending}
                onClick={() => void handleConfirmDelete()}
                className="flex-1 rounded-xl bg-red-600 text-white py-2.5 text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {deletePending ? t('loading') : t('students.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
