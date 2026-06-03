import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import ToolBadge from '../components/ToolBadge';
import { Link } from 'react-router';
import { Clock, CheckCircle, AlertCircle, TrendingUp, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';

type Row = {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    tools: ('ev3' | 'tinkercad')[];
  };
  projectId: string | null;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  finalScore: number | null;
  teacherScore: number | null;
  aiScore: number | null;
};

type FilterKey = 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';

export default function StudentAssignments() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ data: Row[] }>('/api/student/dashboard', {
          params: { page: 1, pageSize: 100 },
        });
        if (!cancelled) setRows(data.data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('studentAssignments.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const stats = useMemo(() => {
    const all = rows.length;
    const completed = rows.filter((r) => r.status === 'graded').length;
    const pending = rows.filter((r) => r.status === 'pending' || r.status === 'submitted').length;
    const overdue = rows.filter((r) => r.status === 'overdue').length;
    const gradedWithScore = rows.filter((r) => r.finalScore != null);
    const avg =
      gradedWithScore.length > 0
        ? Math.round(gradedWithScore.reduce((s, r) => s + (r.finalScore ?? 0), 0) / gradedWithScore.length)
        : null;
    return { all, completed, pending, overdue, avg };
  }, [rows]);

  const filterButtons: { key: FilterKey; label: string; count: number }[] = [
    { key: 'all', label: t('studentAssignments.filterAll'), count: stats.all },
    { key: 'pending', label: t('studentAssignments.filterPending'), count: stats.pending },
    { key: 'submitted', label: t('studentAssignments.filterSubmitted'), count: rows.filter((r) => r.status === 'submitted').length },
    { key: 'graded', label: t('studentAssignments.filterGraded'), count: stats.completed },
    { key: 'overdue', label: t('studentAssignments.filterOverdue'), count: stats.overdue },
  ];

  return (
    <SidebarLayout role="student">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-50">{t('studentAssignments.title')}</h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('studentAssignments.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{t('studentAssignments.filterPending')}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{t('studentAssignments.filterGraded')}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{t('studentAssignments.filterOverdue')}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{t('studentDash.avgGrade')}</span>
                  </div>
                  <p className="text-2xl font-bold">{stats.avg != null ? `${stats.avg}%` : '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <Filter className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
                {filterButtons.map((fb) => (
                  <button
                    key={fb.key}
                    onClick={() => setFilter(fb.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === fb.key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {fb.label} ({fb.count})
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                {filteredRows.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 dark:text-zinc-400">{t('studentAssignments.noResults')}</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredRows.map((row) => {
                      const { assignment, status, finalScore, projectId } = row;
                      return (
                        <div
                          key={assignment.id}
                          className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                <StatusBadge status={status} />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3 line-clamp-2">
                                {assignment.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                <span className="flex items-center gap-1 text-gray-600 dark:text-zinc-400">
                                  <Clock className="w-4 h-4" />
                                  {t('studentAssignments.due')}: {new Date(assignment.dueDate).toLocaleDateString()}
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                  {assignment.tools.map((tool) => (
                                    <ToolBadge key={tool} tool={tool} size="sm" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="ml-0 sm:ml-6 text-right">
                              {finalScore != null && (
                                <div className="mb-3">
                                  <span className="text-3xl font-bold text-green-600">
                                    {Math.round(finalScore)}
                                  </span>
                                  <span className="text-gray-500 dark:text-zinc-500">/100</span>
                                </div>
                              )}
                              <Link
                                to={
                                  projectId && (status === 'submitted' || status === 'graded')
                                    ? `/project/${projectId}`
                                    : `/assignment/${assignment.id}`
                                }
                                className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                              >
                                {!projectId || status === 'pending' || status === 'overdue'
                                  ? t('studentAssignments.startAssignment')
                                  : t('studentAssignments.viewSubmission')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}