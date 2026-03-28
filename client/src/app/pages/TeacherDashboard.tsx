import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Plus, Users, FileText, TrendingUp, Clock, UserCircle, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import ToolBadge from '../components/ToolBadge';
import SidebarLayout from '../components/SidebarLayout';

type AssignmentRow = {
  id: string;
  title: string;
  dueDate: string;
  status: 'active' | 'expired' | 'archived';
  tools: ('ev3' | 'tinkercad')[];
  submissionCount: number;
  studentTotal?: number;
};

type AnalyticsStats = {
  totalStudents: number;
  myAssignments: number;
  pendingSubmissions: number;
  avgPerformance: number | null;
};

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [aRes, sRes] = await Promise.all([
          api.get<{ data: AssignmentRow[]; studentTotal?: number }>('/api/assignments', {
            params: { page: 1, pageSize: 5 },
          }),
          api.get<{ stats: AnalyticsStats }>('/api/analytics/summary'),
        ]);
        if (cancelled) return;
        const rows = aRes.data.data.map((x) => ({
          ...x,
          studentTotal: aRes.data.studentTotal ?? x.studentTotal,
        }));
        setAssignments(rows);
        setStats(sRes.data.stats);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('teacherDash.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const statCards = stats
    ? [
        {
          label: t('teacherDash.totalStudents'),
          value: String(stats.totalStudents),
          icon: Users,
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: t('teacherDash.activeAssignments'),
          value: String(stats.myAssignments),
          icon: FileText,
          color: 'from-purple-500 to-purple-600',
        },
        {
          label: t('teacherDash.pendingSubmissions'),
          value: String(stats.pendingSubmissions),
          icon: Clock,
          color: 'from-orange-500 to-orange-600',
        },
        {
          label: t('teacherDash.avgPerformance'),
          value: stats.avgPerformance != null ? `${stats.avgPerformance}%` : '—',
          icon: TrendingUp,
          color: 'from-green-500 to-green-600',
        },
      ]
    : [];

  return (
    <SidebarLayout role="teacher">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('teacherDash.title')}</h1>
              <p className="text-gray-600 dark:text-zinc-400">{t('teacherDash.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/profile"
                className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <UserCircle className="w-4 h-4" />
                {t('nav.profile')}
              </Link>
              <Link
                to="/settings"
                className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Link>
              <Link
                to="/teacher/assignments"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                {t('teacherDash.createAssignment')}
              </Link>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{t('teacherDash.recentAssignments')}</h2>
                    <Link to="/teacher/assignments" className="text-sm text-blue-600 hover:underline">
                      {t('teacherDash.viewAll')}
                    </Link>
                  </div>
                </div>
                {assignments.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 dark:text-zinc-400">{t('empty')}</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {assignments.map((assignment) => {
                      const total = assignment.studentTotal ?? 0;
                      const pct =
                        total > 0
                          ? Math.round((assignment.submissionCount / total) * 100)
                          : 0;
                      return (
                        <div
                          key={assignment.id}
                          className="p-6 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                              <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {t('teacherDash.due')}:{' '}
                                  {new Date(assignment.dueDate).toLocaleString([], {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                                <span>
                                  {t('teacherDash.submissions')}: {assignment.submissionCount}/
                                  {total || '—'}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    assignment.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : assignment.status === 'expired'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200'
                                  }`}
                                >
                                  {assignment.status === 'active'
                                    ? t('assignments.statusActive')
                                    : assignment.status === 'expired'
                                      ? t('assignments.statusExpired')
                                      : t('assignments.statusArchived')}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {assignment.tools.map((tool) => (
                                  <ToolBadge key={tool} tool={tool} size="sm" />
                                ))}
                              </div>
                            </div>
                            <div className="ml-0 sm:ml-6 w-full sm:w-40">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-zinc-400">{t('teacherDash.progress')}</span>
                                <span className="font-semibold">{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <Link
                                to={`/assignment/${assignment.id}`}
                                className="mt-4 block text-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                              >
                                {t('viewDetails')}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <Link
                  to="/teacher/students"
                  className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all group"
                >
                  <Users className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{t('teacherDash.manageStudents')}</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{t('teacherDash.manageStudentsDesc')}</p>
                </Link>

                <Link
                  to="/teacher/analytics"
                  className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all group"
                >
                  <TrendingUp className="w-10 h-10 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{t('teacherDash.viewAnalytics')}</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{t('teacherDash.viewAnalyticsDesc')}</p>
                </Link>

                <Link
                  to="/tools"
                  className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-md transition-all group"
                >
                  <FileText className="w-10 h-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{t('teacherDash.roboticsTools')}</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400">{t('teacherDash.roboticsToolsDesc')}</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
