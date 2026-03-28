import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Plus, Pencil, Archive, RotateCcw, Trash2, X, Upload, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import SidebarLayout from '../components/SidebarLayout';
import { api, getErrorMessage } from '@/lib/api';

type Tool = 'ev3' | 'tinkercad';
type AssignmentStatus = 'active' | 'expired' | 'archived';

type AssignmentRow = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: AssignmentStatus;
  tools: Tool[];
  submissionCount: number;
};

function statusTone(status: AssignmentStatus) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
  if (status === 'expired') return 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300';
  return 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200';
}

function statusLabel(status: AssignmentStatus, t: (k: string) => string) {
  if (status === 'active') return t('assignments.statusActive');
  if (status === 'expired') return t('assignments.statusExpired');
  return t('assignments.statusArchived');
}

export default function TeacherAssignments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<AssignmentRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ data: AssignmentRow[] }>('/api/assignments', {
        params: { page: 1, pageSize: 100 },
      });
      setRows(data.data);
    } catch (e) {
      setError(getErrorMessage(e, t('assignments.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setTools([]);
    setFile(null);
  };

  const onToggleTool = (tool: Tool) => {
    setTools((prev) => (prev.includes(tool) ? prev.filter((x) => x !== tool) : [...prev, tool]));
  };

  const onCreate = async () => {
    if (!title.trim() || !description.trim() || !deadline || tools.length === 0) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('deadline', new Date(deadline).toISOString());
      fd.append('tools', JSON.stringify(tools));
      if (file) fd.append('file', file);
      await api.post('/api/assignments', fd);
      setOpenCreate(false);
      resetForm();
      await load();
    } catch (e) {
      setError(getErrorMessage(e, t('assignments.createError')));
    } finally {
      setBusy(false);
    }
  };

  const onUpdateDeadline = async () => {
    if (!editTarget || !deadline) return;
    setBusy(true);
    try {
      await api.patch(`/api/assignments/${editTarget.id}`, { deadline: new Date(deadline).toISOString() });
      setEditTarget(null);
      setDeadline('');
      await load();
    } catch (e) {
      setError(getErrorMessage(e, t('assignments.updateError')));
    } finally {
      setBusy(false);
    }
  };

  const onArchiveToggle = async (row: AssignmentRow) => {
    setBusy(true);
    try {
      if (row.status === 'archived') await api.patch(`/api/assignments/${row.id}/restore`);
      else await api.patch(`/api/assignments/${row.id}/archive`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, t('assignments.updateError')));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (row: AssignmentRow) => {
    const ok = window.confirm(t('assignments.deleteConfirm'));
    if (!ok) return;
    setBusy(true);
    try {
      await api.delete(`/api/assignments/${row.id}`);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, t('assignments.deleteError')));
    } finally {
      setBusy(false);
    }
  };

  const sorted = useMemo(
    () => [...rows].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    [rows],
  );

  return (
    <SidebarLayout role="teacher">
      <div className="p-6 md:p-8 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50">{t('assignments.title')}</h1>
              <p className="text-gray-600 dark:text-zinc-400 mt-1">{t('assignments.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setOpenCreate(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('assignments.add')}
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-3 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="py-16 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
          ) : sorted.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center text-gray-500 dark:text-zinc-400">{t('empty')}</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sorted.map((row) => (
                <article
                  key={row.id}
                  onClick={() => navigate(`/assignment/${row.id}`)}
                  className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold leading-tight text-gray-900 dark:text-zinc-50">{row.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone(row.status)}`}>
                      {statusLabel(row.status, t)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 line-clamp-2">{row.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <Clock className="w-4 h-4" />
                    {new Date(row.dueDate).toLocaleString([], {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/assignment/${row.id}`);
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {t('viewDetails')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTarget(row);
                        setDeadline(row.dueDate.slice(0, 16));
                      }}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      {t('assignments.editDeadline')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onArchiveToggle(row);
                      }}
                      disabled={busy}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors"
                    >
                      {row.status === 'archived' ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      {row.status === 'archived' ? t('assignments.restore') : t('assignments.archive')}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onDelete(row);
                      }}
                      disabled={busy}
                      className="px-3 py-1.5 text-sm rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('assignments.delete')}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {(openCreate || editTarget) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl transition-colors">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">
                {editTarget ? t('assignments.editDeadline') : t('assignments.add')}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setOpenCreate(false);
                  setEditTarget(null);
                }}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!editTarget && (
                <>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t('createAssignment.assignmentTitle')}</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t('createAssignment.description')}</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t('createAssignment.deadline')}</span>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {!editTarget && (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleTool('ev3')}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${tools.includes('ev3') ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-200' : 'border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200'}`}
                    >
                      EV3
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleTool('tinkercad')}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${tools.includes('tinkercad') ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-200' : 'border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200'}`}
                    >
                      Tinkercad
                    </button>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t('createAssignment.attach')}</span>
                    <div className="mt-1.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-950/50 p-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-200 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {t('assignments.chooseFile')}
                      </button>
                      <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                        {file?.name || t('assignments.noFileChosen')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-200 dark:border-zinc-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenCreate(false);
                  setEditTarget(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={busy || !deadline || (!editTarget && (!title.trim() || !description.trim() || tools.length === 0))}
                onClick={() => void (editTarget ? onUpdateDeadline() : onCreate())}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60 hover:bg-blue-700 transition-colors"
              >
                {busy ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

