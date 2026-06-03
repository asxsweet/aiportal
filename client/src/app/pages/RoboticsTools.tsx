import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Video, FileText, Plus, X, Trash2, Download, File, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { api, getErrorMessage } from '@/lib/api';
import { downloadBlob } from '@/lib/download';
import SidebarLayout from '../components/SidebarLayout';

type Material = {
  _id: string;
  category: string;
  title: string;
  description: string;
  fileUrl: string;
  originalName: string;
  createdBy: { _id: string; name: string } | string;
  createdAt: string;
};

export default function RoboticsTools() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sidebarRole = user?.role === 'teacher' ? 'teacher' : 'student';
  const isTeacher = user?.role === 'teacher';

  const tools = [
    {
      id: 'tinkercad' as const,
      nameKey: 'toolsPage.tinkercadTitle',
      descKey: 'toolsPage.tinkercadDesc',
      icon: '⚡',
      color: 'from-cyan-400 to-blue-500',
      url: 'https://www.tinkercad.com',
      featureKeys: ['toolsPage.tinkercadDesc', 'landing.f1Desc', 'landing.f2Desc'],
    },
    {
      id: 'ev3' as const,
      nameKey: 'toolsPage.ev3Title',
      descKey: 'toolsPage.ev3Desc',
      icon: '🤖',
      color: 'from-yellow-400 to-orange-500',
      url: 'https://www.lego.com/en-us/themes/mindstorms',
      featureKeys: ['toolsPage.ev3Desc', 'landing.f1Desc', 'landing.f3Desc'],
    },
  ];

  const learningResources = [
    { categoryKey: 'projectView.criteria.algorithm', typeKey: 'toolsPage.learningResources', icon: Video },
    { categoryKey: 'projectView.criteria.technical', typeKey: 'toolsPage.learningResources', icon: FileText },
    { categoryKey: 'projectView.criteria.idea', typeKey: 'toolsPage.learningResources', icon: Video },
  ];

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addForm, setAddForm] = useState({ title: '', description: '', file: null as File | null });

  useEffect(() => {
    if (!expandedCategory) return;
    let cancelled = false;
    (async () => {
      setMaterialsLoading(true);
      try {
        const { data } = await api.get<{ materials: Material[] }>('/api/materials', {
          params: { category: expandedCategory },
        });
        if (!cancelled) setMaterials(data.materials);
      } catch {
        if (!cancelled) setMaterials([]);
      } finally {
        if (!cancelled) setMaterialsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [expandedCategory]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategory((prev) => (prev === categoryKey ? null : categoryKey));
    setShowAddForm(false);
    setAddForm({ title: '', description: '', file: null });
    setAddError(null);
  };

  const handleAddMaterial = async () => {
    if (!addForm.title.trim() || !expandedCategory) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const fd = new FormData();
      fd.append('category', expandedCategory);
      fd.append('title', addForm.title.trim());
      fd.append('description', addForm.description.trim());
      if (addForm.file) fd.append('file', addForm.file);
      await api.post('/api/materials', fd);
      setAddForm({ title: '', description: '', file: null });
      setShowAddForm(false);
      const { data } = await api.get<{ materials: Material[] }>('/api/materials', {
        params: { category: expandedCategory },
      });
      setMaterials(data.materials);
    } catch (e) {
      setAddError(getErrorMessage(e, t('error')));
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm(t('toolsPage.materialDeleteConfirm'))) return;
    try {
      await api.delete(`/api/materials/${id}`);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch {
      /* silent */
    }
  };

  const handleDownload = (material: Material) => {
    downloadBlob(`/api/materials/${material._id}/download`, material.originalName || 'material');
  };

  const isOwner = (m: Material) => {
    const cid = typeof m.createdBy === 'string' ? m.createdBy : m.createdBy._id;
    return cid === user?.id;
  };

  return (
    <SidebarLayout role={sidebarRole}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-zinc-50">{t('toolsPage.title')}</h1>
            <p className="text-gray-600 dark:text-zinc-400">{t('toolsPage.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className={`h-32 bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                  <span className="text-6xl">{tool.icon}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{t(tool.nameKey)}</h2>
                  <p className="text-gray-600 dark:text-zinc-400 mb-4">{t(tool.descKey)}</p>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-sm text-gray-700 dark:text-zinc-300">{t('toolsPage.keyFeatures')}</h3>
                    <ul className="space-y-2">
                      {tool.featureKeys.map((fk) => (
                        <li key={fk} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          {t(fk)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    {t('toolsPage.open')} {t(tool.nameKey)}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8">
            <h2 className="text-2xl font-bold mb-6">{t('toolsPage.learningResources')}</h2>
            <div className="space-y-4">
              {learningResources.map((resource) => {
                const Icon = resource.icon;
                const isExpanded = expandedCategory === resource.categoryKey;
                return (
                  <div key={resource.categoryKey} className="border-2 border-gray-200 dark:border-zinc-700 rounded-xl overflow-hidden transition-all">
                    <button
                      onClick={() => toggleCategory(resource.categoryKey)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{t(resource.categoryKey)}</h3>
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-medium">
                            {t(resource.typeKey)}
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-zinc-700 p-6 bg-gray-50 dark:bg-zinc-800/50">
                        {isTeacher && (
                          <div className="mb-4">
                            {!showAddForm ? (
                              <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                              >
                                <Plus className="w-4 h-4" />
                                {t('toolsPage.addMaterial')}
                              </button>
                            ) : (
                              <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold">{t('toolsPage.addMaterial')}</h4>
                                  <button onClick={() => { setShowAddForm(false); setAddError(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>

                                {addError && (
                                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                                    {addError}
                                  </div>
                                )}

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">{t('toolsPage.materialTitle')}</label>
                                    <input
                                      type="text"
                                      value={addForm.title}
                                      onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                                      placeholder={t('toolsPage.materialTitlePlaceholder')}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">{t('toolsPage.materialDescription')}</label>
                                    <textarea
                                      value={addForm.description}
                                      onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                                      placeholder={t('toolsPage.materialDescriptionPlaceholder')}
                                      rows={3}
                                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-zinc-300">{t('toolsPage.materialFile')}</label>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">{t('toolsPage.materialFileHint')}</p>
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      onChange={(e) => setAddForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                                      className="w-full text-sm text-gray-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-600 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                                    />
                                    {addForm.file && (
                                      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                                        <File className="w-4 h-4" />
                                        {addForm.file.name}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleAddMaterial}
                                    disabled={addLoading || !addForm.title.trim()}
                                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {addLoading ? t('loading') : t('submit')}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {materialsLoading ? (
                          <div className="py-8 text-center text-gray-500 dark:text-zinc-400">{t('loading')}</div>
                        ) : materials.length === 0 ? (
                          <div className="py-8 text-center text-gray-500 dark:text-zinc-400">{t('toolsPage.noMaterials')}</div>
                        ) : (
                          <div className="space-y-3">
                            {materials.map((m) => (
                              <div
                                key={m._id}
                                className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 flex items-start justify-between gap-4"
                              >
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 dark:text-zinc-100 mb-1">{m.title}</h4>
                                  {m.description && (
                                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-2 line-clamp-2">{m.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 flex-wrap">
                                    {m.originalName && (
                                      <span className="flex items-center gap-1">
                                        <File className="w-3 h-3" />
                                        {m.originalName}
                                      </span>
                                    )}
                                    {typeof m.createdBy === 'object' && m.createdBy.name && (
                                      <span>{t('toolsPage.materialUploadedBy')}: {m.createdBy.name}</span>
                                    )}
                                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {m.originalName && (
                                    <button
                                      onClick={() => handleDownload(m)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      title={t('toolsPage.materialDownload')}
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  )}
                                  {isTeacher && isOwner(m) && (
                                    <button
                                      onClick={() => handleDeleteMaterial(m._id)}
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                      title={t('assignments.delete')}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </SidebarLayout>
  );
}