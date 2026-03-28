import { useState, useEffect, useCallback } from 'react';
import { Send, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';

export type ApiComment = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
};

export default function CommentSection({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ data: ApiComment[] }>('/api/comments', {
        params: { projectId, pageSize: 100 },
      });
      setComments(data.data);
    } catch (e) {
      setError(getErrorMessage(e, t('comments.loadError')));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/comments', { projectId, text: newComment.trim() });
      setNewComment('');
      await load();
    } catch (err) {
      setError(getErrorMessage(err, t('comments.loadError')));
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = (r: string) =>
    r === 'teacher' ? t('comments.roleTeacher') : t('comments.roleStudent');

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 transition-colors">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-50">{t('comments.title')}</h3>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">{t('loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100">{comment.authorName}</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-500">{roleLabel(comment.authorRole)}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">
                    • {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-zinc-300">{comment.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('comments.placeholder')}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-60"
        >
          <Send className="w-4 h-4" />
          {t('comments.send')}
        </button>
      </form>
    </div>
  );
}
