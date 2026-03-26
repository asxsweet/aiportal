import { Search, Mail, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';

type Row = {
  user: { id: string; name: string; email: string };
  stats: { completedAssignments: number; totalAssignments: number; avgScore: number | null };
};

export default function Students() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const h = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(h);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ data: Row[]; totalPages: number }>('/api/users/students', {
          params: { page, pageSize: 10, search: debounced || undefined },
        });
        if (!cancelled) {
          setRows(data.data);
          setTotalPages(data.totalPages);
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('students.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debounced, t]);

  return (
    <SidebarLayout role="teacher">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('students.title')}</h1>
            <p className="text-gray-600">{t('students.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('students.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-medium opacity-60 cursor-not-allowed"
                disabled
              >
                {t('students.filter')}
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium opacity-60 cursor-not-allowed"
                disabled
              >
                {t('students.export')}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">{t('loading')}</div>
          ) : (
            <div className="grid gap-6">
              {rows.map((row) => {
                const { user, stats } = row;
                const total = stats.totalAssignments || 1;
                const pct = Math.min(100, Math.round((stats.completedAssignments / total) * 100));
                const trendUp = (stats.avgScore ?? 0) >= 80;
                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-[240px]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-semibold">{user.name}</h3>
                            {trendUp ? (
                              <TrendingUp className="w-5 h-5 text-green-500" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{t('students.avgScore')}</p>
                              <p className="text-2xl font-bold text-green-600">
                                {stats.avgScore != null ? `${stats.avgScore}%` : t('students.na')}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{t('students.completion')}</p>
                              <p className="text-2xl font-bold text-blue-600">
                                {stats.completedAssignments}/{stats.totalAssignments || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">{t('students.lastActive')}</p>
                              <p className="text-lg font-semibold text-gray-700">{t('students.na')}</p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-600">{t('students.overallProgress')}</span>
                              <span className="font-semibold">{pct}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && rows.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500 text-lg">{t('students.noStudents')}</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                {t('back')}
              </button>
              <span className="self-center text-sm text-gray-600">
                {t('pagination', { page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
