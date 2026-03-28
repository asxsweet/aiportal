import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import ToolBadge from '../components/ToolBadge';
import CommentSection from '../components/CommentSection';
import AiAssistantPanel from '../components/AiAssistantPanel';
import SidebarLayout from '../components/SidebarLayout';
import { FileDown, Users, Calendar, Bot, User, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { downloadBlob } from '@/lib/download';

type Rating = {
  aiIdea: number;
  aiAlgorithm: number;
  aiTechnical: number;
  aiTools: number;
  aiFeedback: string;
  aiOverall: number | null;
  teacherScore: number | null;
  teacherFeedback: string | null;
  finalScore: number | null;
  gradedAt: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string;
  assignmentTitle?: string;
  submittedAt: string;
  tools: ('ev3' | 'tinkercad')[];
  teamMembers?: string[];
  originalFilename?: string;
  originalFileName?: string;
  storedName?: string;
  studentName?: string;
  rating: Rating | null;
};

export default function ProjectView() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherScore, setTeacherScore] = useState(90);
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [gradePending, setGradePending] = useState(false);
  const [gradeMsg, setGradeMsg] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ project: Project }>(`/api/projects/${id}`);
      setProject(data.project);
      if (data.project.rating?.teacherScore != null) {
        setTeacherScore(data.project.rating.teacherScore);
      }
      if (data.project.rating?.teacherFeedback) {
        setTeacherFeedback(data.project.rating.teacherFeedback);
      }
    } catch (e) {
      setError(getErrorMessage(e, t('projectView.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setGradePending(true);
    setGradeMsg(null);
    try {
      await api.patch(`/api/ratings/${id}`, {
        teacherScore,
        teacherFeedback: teacherFeedback.trim() || t('projectView.teacherFeedback'),
      });
      setGradeMsg(t('projectView.gradeSaved'));
      await load();
    } catch (err) {
      setGradeMsg(getErrorMessage(err, t('error')));
    } finally {
      setGradePending(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
        <div className="p-8 flex items-center justify-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
      </SidebarLayout>
    );
  }

  if (!project || !project.rating) {
    return (
      <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
        <div className="p-8 text-red-600 dark:text-red-400">{error ?? t('projectView.loadError')}</div>
      </SidebarLayout>
    );
  }

  const r = project.rating;
  const criteria = [
    { key: 'idea', score: r.aiIdea },
    { key: 'algorithm', score: r.aiAlgorithm },
    { key: 'technical', score: r.aiTechnical },
    { key: 'tools', score: r.aiTools },
  ] as const;

  const displayFinal =
    r.finalScore != null
      ? Math.round(r.finalScore)
      : r.aiOverall != null
        ? Math.round(r.aiOverall)
        : '—';

  const displayFileName = project.originalFileName || project.originalFilename || project.storedName || 'file';

  return (
    <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm border border-red-100 dark:border-red-900/50">{error}</div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 mb-6 transition-colors">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-zinc-50">{project.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {t('projectView.submitted')}: {new Date(project.submittedAt).toLocaleDateString()}
                  </span>
                  {project.studentName && role === 'teacher' && (
                    <span className="text-gray-500 dark:text-zinc-500">{project.studentName}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.teamMembers?.length
                      ? `${t('projectView.team')}: ${project.teamMembers.join(', ')}`
                      : t('projectView.solo')}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-white">{displayFinal}</span>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">{t('projectView.finalScore')}</p>
                {r.teacherScore == null && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('projectView.pendingTeacher')}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg flex-wrap border border-gray-100/80 dark:border-zinc-700/50">
              <p className="text-sm text-gray-600 dark:text-zinc-400 font-medium">{t('projectView.toolsUsed')}:</p>
              <div className="flex gap-2 flex-wrap">
                {project.tools.map((tool) => (
                  <ToolBadge key={tool} tool={tool} size="md" />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 mb-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('projectView.description')}</h2>
            <p className="whitespace-pre-line text-gray-700 dark:text-zinc-300 leading-relaxed">{project.description}</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 mb-6 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('projectView.files')}</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-transparent dark:border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-zinc-100">{displayFileName}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void downloadBlob(`/api/projects/${project.id}/file`, displayFileName)
                }
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors font-medium text-sm"
              >
                {t('download')}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-900 rounded-xl shadow-sm border border-blue-100 dark:border-zinc-800 p-8 mb-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">{t('projectView.aiTitle')}</h2>
                <p className="text-sm text-gray-600 dark:text-zinc-400">{t('projectView.aiSubtitle')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {criteria.map((c) => (
                <div key={c.key} className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{t(`projectView.criteria.${c.key}`)}</h3>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{c.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-zinc-50">{t('projectView.overallAi')}</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">{r.aiFeedback}</p>
              {r.aiOverall != null && (
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mt-2">
                  AI: {r.aiOverall}/100
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <AiAssistantPanel
              projectText={project.description}
              assignmentText={project.assignmentTitle || ''}
              selectedTools={project.tools}
            />
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-900 rounded-xl shadow-sm border border-green-100 dark:border-zinc-800 p-8 mb-6 transition-colors">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <User className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">{t('projectView.teacherTitle')}</h2>
                {r.gradedAt && (
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    {t('projectView.gradedOn')} {new Date(r.gradedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {r.teacherScore != null && (
                <div className="ml-auto flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">{r.teacherScore}/100</span>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-lg p-4 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-zinc-50">{t('projectView.teacherFeedback')}</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">
                {r.teacherFeedback ?? t('projectView.pendingTeacher')}
              </p>
            </div>
          </div>

          {role === 'teacher' && (
            <form
              onSubmit={handleGrade}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 mb-6 transition-colors space-y-4"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">{t('projectView.teacherGradeForm')}</h2>
              {gradeMsg && <p className="text-sm text-green-700 dark:text-green-400">{gradeMsg}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t('projectView.teacherScore')}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={teacherScore}
                  onChange={(e) => setTeacherScore(Number(e.target.value))}
                  className="w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  {t('projectView.teacherNotes')}
                </label>
                <textarea
                  value={teacherFeedback}
                  onChange={(e) => setTeacherFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={gradePending}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-60"
              >
                {gradePending ? t('loading') : t('projectView.saveGrade')}
              </button>
            </form>
          )}

          <div className="mb-8">
            <CommentSection projectId={project.id} />
          </div>

          <Link
            to={role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
            className="inline-block px-8 py-4 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-200 rounded-lg hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all font-semibold"
          >
            {t('assignmentDetail.backDashboard')}
          </Link>
        </div>
      </div>
    </SidebarLayout>
  );
}
