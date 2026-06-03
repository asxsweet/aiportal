import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

type ScoreRow = {
  projectId: string;
  projectTitle: string;
  assignmentTitle: string;
  createdAt: string;
  aiIdea: number | null;
  aiAlgorithm: number | null;
  aiTechnical: number | null;
  aiTools: number | null;
  aiPresentation: number | null;
  aiProblemSolving: number | null;
  aiInnovation: number | null;
  aiSafety: number | null;
  aiScore: number;
  finalScore: number | null;
  teacherScore: number | null;
};

const CRITERIA_KEYS = [
  'aiIdea',
  'aiAlgorithm',
  'aiTechnical',
  'aiTools',
  'aiPresentation',
  'aiProblemSolving',
  'aiInnovation',
  'aiSafety',
] as const;

const CRITERIA_I18N: Record<string, string> = {
  aiIdea: 'projectView.criteria.idea',
  aiAlgorithm: 'projectView.criteria.algorithm',
  aiTechnical: 'projectView.criteria.technical',
  aiTools: 'projectView.criteria.tools',
  aiPresentation: 'projectView.criteria.presentation',
  aiProblemSolving: 'projectView.criteria.problemSolving',
  aiInnovation: 'projectView.criteria.innovation',
  aiSafety: 'projectView.criteria.safety',
};

const CRITERIA_COLORS: Record<string, string> = {
  aiIdea: '#8b5cf6',
  aiAlgorithm: '#3b82f6',
  aiTechnical: '#06b6d4',
  aiTools: '#10b981',
  aiPresentation: '#f59e0b',
  aiProblemSolving: '#ef4444',
  aiInnovation: '#ec4899',
  aiSafety: '#6366f1',
};

export default function StudentScoreChart() {
  const { t } = useTranslation();
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'all' | 'avg'>('avg');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ scores: ScoreRow[] }>('/api/student/scores');
        if (!cancelled) setScores(data.scores);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('scoreChart.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  const chartData = scores.map((s) => {
    const avg = Math.round(
      CRITERIA_KEYS.reduce((sum, k) => sum + (s[k] ?? 0), 0) / CRITERIA_KEYS.length,
    );
    return {
      name: s.assignmentTitle || s.projectTitle,
      avg,
      ...Object.fromEntries(CRITERIA_KEYS.map((k) => [k, s[k] ?? 0])),
      finalScore: s.finalScore,
      teacherScore: s.teacherScore,
    };
  });

  return (
    <SidebarLayout role="student">
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-50">
              {t('scoreChart.title')}
            </h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('scoreChart.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">{error}</div>
          )}

          {loading ? (
            <div className="py-20 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : scores.length === 0 ? (
            <div className="py-20 text-center">
              <TrendingUp className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-600 mb-4" />
              <p className="text-gray-500 dark:text-zinc-400">{t('scoreChart.noData')}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setView('avg')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'avg'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t('scoreChart.average')}
                </button>
                <button
                  onClick={() => setView('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t('scoreChart.allCriteria')}
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-4">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Legend />
                    {view === 'avg' ? (
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name={t('scoreChart.average')}
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    ) : (
                      CRITERIA_KEYS.map((key) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={t(CRITERIA_I18N[key])}
                          stroke={CRITERIA_COLORS[key]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                    {t('scoreChart.tableTitle')}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-zinc-800">
                        <th className="text-left p-3 text-gray-600 dark:text-zinc-400">{t('scoreChart.assignment')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-zinc-400">{t('scoreChart.avgScore')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-zinc-400">{t('scoreChart.finalScore')}</th>
                        <th className="text-center p-3 text-gray-600 dark:text-zinc-400">{t('scoreChart.teacherScore')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((s) => {
                        const avg = Math.round(
                          CRITERIA_KEYS.reduce((sum, k) => sum + (s[k] ?? 0), 0) / CRITERIA_KEYS.length,
                        );
                        return (
                          <tr
                            key={s.projectId}
                            className="border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                          >
                            <td className="p-3 text-gray-900 dark:text-zinc-100">
                              {s.assignmentTitle || s.projectTitle}
                            </td>
                            <td className="p-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                              {avg}
                            </td>
                            <td className="p-3 text-center font-semibold text-green-600 dark:text-green-400">
                              {s.finalScore != null ? Math.round(s.finalScore) : '—'}
                            </td>
                            <td className="p-3 text-center text-gray-700 dark:text-zinc-300">
                              {s.teacherScore != null ? Math.round(s.teacherScore) : '—'}
                            </td>
                          </tr>
                        );
                      })}
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