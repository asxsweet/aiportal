import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import ToolBadge from '../components/ToolBadge';
import { Link } from 'react-router';
import { Clock, CheckCircle, AlertCircle, TrendingUp, UserCircle, Settings } from 'lucide-react';
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

export default function StudentDashboard() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancelled) setError(getErrorMessage(e, t('studentDash.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const stats = useMemo(() => {
    const active = rows.length;
    const completed = rows.filter((r) => r.status === 'graded').length;
    const pending = rows.filter((r) => r.status === 'pending' || r.status === 'submitted').length;
    const gradedWithScore = rows.filter((r) => r.finalScore != null);
    const avg =
      gradedWithScore.length > 0
        ? Math.round(
            gradedWithScore.reduce((s, r) => s + (r.finalScore ?? 0), 0) / gradedWithScore.length,
          )
        : null;
    return { active, completed, pending, avg };
  }, [rows]);

  const statCards = [
    {
      label: t('studentDash.activeAssignments'),
      value: String(stats.active),
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: t('studentDash.completed'),
      value: String(stats.completed),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
    },
    {
      label: t('studentDash.pending'),
      value: String(stats.pending),
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: t('studentDash.avgGrade'),
      value: stats.avg != null ? `${stats.avg}%` : '—',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <SidebarLayout role="student">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('studentDash.title')}</h1>
              <p className="text-gray-600">{t('studentDash.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                to="/profile"
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                {t('nav.profile')}
              </Link>
              <Link
                to="/settings"
                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-500">{t('loading')}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold">{t('studentDash.myAssignments')}</h2>
                </div>
                {rows.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">{t('empty')}</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {rows.map((row) => {
                      const { assignment, status, finalScore, projectId } = row;
                      const progress =
                        status === 'graded' ? 100 : status === 'submitted' ? 80 : row.status === 'overdue' ? 40 : 0;
                      return (
                        <div
                          key={assignment.id}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3 flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-lg font-semibold">{assignment.title}</h3>
                                <StatusBadge status={status} />
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                                {assignment.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {t('studentDash.due')}:{' '}
                                  {new Date(assignment.dueDate).toLocaleDateString()}
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
                                  <span className="text-gray-500">/100</span>
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
                                  ? t('studentDash.startAssignment')
                                  : t('viewDetails')}
                              </Link>
                            </div>
                          </div>

                          {progress > 0 && status !== 'graded' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">{t('teacherDash.progress')}</span>
                                <span className="font-semibold">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <Link
                  to="/tools"
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <span className="text-3xl">🛠️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{t('nav.tools')}</h3>
                      <p className="text-sm text-gray-600">{t('teacherDash.roboticsToolsDesc')}</p>
                    </div>
                  </div>
                </Link>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                  <h3 className="text-xl font-semibold mb-2">{t('studentDash.needHelp')}</h3>
                  <p className="text-sm opacity-90 mb-4">{t('studentDash.needHelpDesc')}</p>
                  <Link
                    to="/tools"
                    className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                  >
                    {t('studentDash.viewResources')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
