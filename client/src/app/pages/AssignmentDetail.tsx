import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import ToolBadge from '../components/ToolBadge';
import { Calendar, FileDown, Upload, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { downloadBlob } from '@/lib/download';
import SidebarLayout from '../components/SidebarLayout';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'active' | 'expired' | 'archived';
  tools: ('ev3' | 'tinkercad')[];
  attachmentOriginalName?: string | null;
  originalFileName?: string | null;
  storedName?: string | null;
  instructorName?: string | null;
  createdAt?: string;
};

type ProjectRow = {
  id: string;
  title: string;
  studentName?: string;
  status: string;
  submittedAt: string;
  commentsCount?: number;
  rating?: {
    aiOverall?: number | null;
    teacherScore?: number | null;
  } | null;
};

export default function AssignmentDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role ?? 'student';
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ assignment: Assignment }>(`/api/assignments/${id}`);
        if (cancelled) return;
        setAssignment(data.assignment);
        if (user?.role === 'teacher') {
          const pRes = await api.get<{ data: ProjectRow[]; totalPages: number }>(
            '/api/projects',
            { params: { assignmentId: id, page, pageSize: 10 } },
          );
          if (!cancelled) {
            setSubmissions(pRes.data.data);
            setTotalPages(pRes.data.totalPages);
          }
        }
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e, t('assignmentDetail.loadError')));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user?.role, page, t]);

  if (loading) {
    return (
      <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
        <div className="p-8 flex items-center justify-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
      </SidebarLayout>
    );
  }

  if (!assignment) {
    return (
      <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
        <div className="p-8 text-red-600 dark:text-red-400">{error ?? t('assignmentDetail.loadError')}</div>
      </SidebarLayout>
    );
  }
  const isExpired = assignment.status === 'expired';

  const attachmentName = assignment.originalFileName || assignment.attachmentOriginalName || assignment.storedName || 'file';

  return (
    <SidebarLayout role={role === 'teacher' ? 'teacher' : 'student'}>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm border border-red-100 dark:border-red-900/50">{error}</div>
          )}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 transition-colors mb-6">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-zinc-50">{assignment.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {assignment.instructorName ?? t('assignmentDetail.instructor')}
                  </span>
                  {assignment.createdAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('assignmentDetail.posted')}:{' '}
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg flex-wrap border border-gray-100/80 dark:border-zinc-700/50">
              <div>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">{t('assignmentDetail.dueDate')}</p>
                <p className="font-semibold text-lg text-gray-900 dark:text-zinc-100">
                  {new Date(assignment.dueDate).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-300 dark:bg-zinc-600 hidden sm:block" />
              <div>
                <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2">{t('assignmentDetail.requiredTools')}</p>
                <div className="flex gap-2 flex-wrap">
                  {assignment.tools.map((tool) => (
                    <ToolBadge key={tool} tool={tool} size="md" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {role === 'student' && isExpired && (
            <div className="mb-6 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-red-700 dark:text-red-300 text-sm font-medium">
              {t('assignmentDetail.deadlineExpired')}
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 transition-colors mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('assignmentDetail.description')}</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-gray-700 dark:text-zinc-300 leading-relaxed">
                {assignment.description}
              </p>
            </div>
          </div>

          {(assignment.originalFileName || assignment.attachmentOriginalName || assignment.storedName) && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 transition-colors mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('assignmentDetail.attachments')}</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-transparent dark:border-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
                      <FileDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-zinc-100">{attachmentName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void downloadBlob(
                        `/api/assignments/${assignment.id}/attachment`,
                        attachmentName,
                      )
                    }
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors font-medium text-sm"
                  >
                    {t('download')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {role === 'teacher' && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 transition-colors mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('assignmentDetail.submissions')}</h2>
              {submissions.length === 0 ? (
                <p className="text-gray-500 dark:text-zinc-400">{t('assignmentDetail.noSubmissions')}</p>
              ) : (
                <>
                  <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {submissions.map((s) => (
                      <li
                        key={s.id}
                        className="py-4 flex items-center justify-between flex-wrap gap-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-zinc-100">{s.title}</p>
                          <p className="text-sm text-gray-600 dark:text-zinc-400">
                            {t('assignmentDetail.student')}: {s.studentName}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                              {t('status.submitted')}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300">
                              AI: {s.rating?.aiOverall ?? '—'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                              Teacher: {s.rating?.teacherScore ?? '—'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                              {t('comments.title')}: {s.commentsCount ?? 0}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-zinc-500">
                            {new Date(s.submittedAt).toLocaleString()}
                          </p>
                        </div>
                        <Link
                          to={`/project/${s.id}`}
                          className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-medium text-sm transition-colors"
                        >
                          {t('assignmentDetail.gradeProject')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {totalPages > 1 && (
                    <div className="flex gap-2 mt-4">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm text-gray-800 dark:text-zinc-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        {t('back')}
                      </button>
                      <span className="text-sm text-gray-600 dark:text-zinc-400 self-center">
                        {t('pagination', { page, total: totalPages })}
                      </span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm text-gray-800 dark:text-zinc-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex gap-4 flex-wrap">
            {role === 'student' && (
              <Link
                to={`/assignment/${id}/submit`}
                aria-disabled={isExpired}
                className={`flex-1 min-w-[200px] py-4 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                  isExpired
                    ? 'bg-gray-400 pointer-events-none'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                }`}
              >
                <Upload className="w-5 h-5" />
                {t('assignmentDetail.submitProject')}
              </Link>
            )}
            <Link
              to={role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
              className="px-8 py-4 border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-200 rounded-lg hover:border-gray-400 dark:hover:border-zinc-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all font-semibold"
            >
              {t('assignmentDetail.backDashboard')}
            </Link>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
