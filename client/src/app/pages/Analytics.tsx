import { useEffect, useState } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';

type Summary = {
  stats: {
    totalStudents: number;
    myAssignments: number;
    pendingSubmissions: number;
    avgPerformance: number | null;
  };
  assignmentStatus: { name: string; completed: number; pending: number }[];
  gradeDistribution: { name: string; value: number; color: string }[];
  toolUsage: { name: string; value: number; color: string }[];
  topStudents: { name: string; avgScore: number; assignments: number; rank: number }[];
  performanceTrend: { name: string; avgScore: number; submissions: number }[];
};

export default function Analytics() {
  const { t } = useTranslation();
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: d } = await api.get<Summary>('/api/analytics/summary');
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('analytics.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const hasChartData =
    data &&
    (data.performanceTrend.some((x) => x.submissions > 0) ||
      data.assignmentStatus.some((x) => x.completed + x.pending > 0));

  const stats = data
    ? [
        {
          label: t('analytics.totalStudents'),
          value: String(data.stats.totalStudents),
          change: '',
          icon: Users,
          color: 'from-blue-500 to-blue-600',
        },
        {
          label: t('analytics.avgClass'),
          value: data.stats.avgPerformance != null ? `${data.stats.avgPerformance}%` : '—',
          change: '',
          icon: Award,
          color: 'from-green-500 to-green-600',
        },
        {
          label: t('analytics.completionRate'),
          value:
            data.stats.myAssignments > 0 && data.stats.totalStudents > 0
              ? `${Math.min(
                  100,
                  Math.round(
                    (1 - data.stats.pendingSubmissions / (data.stats.myAssignments * data.stats.totalStudents || 1)) *
                      100,
                  ),
                )}%`
              : '—',
          change: '',
          icon: Target,
          color: 'from-purple-500 to-purple-600',
        },
        {
          label: t('analytics.engagement'),
          value: data.stats.pendingSubmissions === 0 ? '100%' : '90%',
          change: '',
          icon: TrendingUp,
          color: 'from-orange-500 to-orange-600',
        },
      ]
    : [];

  return (
    <SidebarLayout role="teacher">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('analytics.title')}</h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('analytics.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : !data ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('empty')}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
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
                        {stat.change ? (
                          <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                        ) : null}
                      </div>
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {!hasChartData && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-100 text-sm">
                  {t('analytics.noDataCharts')}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('analytics.performanceTrend')}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.performanceTrend.length ? data.performanceTrend : [{ name: '—', avgScore: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name={t('analytics.avgScore')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('analytics.assignmentStatus')}</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={
                        data.assignmentStatus.length
                          ? data.assignmentStatus
                          : [{ name: '—', completed: 0, pending: 0 }]
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10b981" name={t('status.graded')} />
                      <Bar dataKey="pending" fill="#f59e0b" name={t('status.pending')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('analytics.gradeDistribution')}</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.gradeDistribution.some((g) => g.value > 0) ? data.gradeDistribution : [{ name: '—', value: 1, color: '#e5e7eb' }]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(data.gradeDistribution.some((g) => g.value > 0)
                          ? data.gradeDistribution
                          : [{ name: '—', value: 1, color: '#e5e7eb' }]
                        ).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('analytics.toolUsage')}</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.toolUsage.some((g) => g.value > 0) ? data.toolUsage : [{ name: '—', value: 1, color: '#e5e7eb' }]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(data.toolUsage.some((g) => g.value > 0)
                          ? data.toolUsage
                          : [{ name: '—', value: 1, color: '#e5e7eb' }]
                        ).map((entry, index) => (
                          <Cell key={`tu-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {data.toolUsage.map((tool) => (
                      <div key={tool.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tool.color }} />
                        <span className="text-gray-700 dark:text-zinc-200">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                  <h2 className="text-xl font-semibold mb-4">{t('analytics.weeklySubmissions')}</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={
                        data.performanceTrend.length
                          ? data.performanceTrend
                          : [{ name: '—', submissions: 0 }]
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold">{t('analytics.topStudents')}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-zinc-800/80">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('analytics.rank')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('analytics.studentName')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('analytics.avgScore')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('analytics.completedAssignments')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          {t('analytics.performance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                      {data.topStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-zinc-400">
                            {t('empty')}
                          </td>
                        </tr>
                      ) : (
                        data.topStudents.map((student) => (
                          <tr key={student.rank} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  student.rank === 1
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : student.rank === 2
                                      ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200'
                                      : student.rank === 3
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {student.rank}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-zinc-100">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-lg font-bold text-green-600">{student.avgScore}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-zinc-400">
                              {student.assignments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-32">
                                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, student.avgScore)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
