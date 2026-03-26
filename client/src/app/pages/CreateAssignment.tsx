import { useState } from 'react';
import { useNavigate } from 'react-router';
import FileUpload from '../components/FileUpload';
import { Calendar, FileText, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';
import SidebarLayout from '../components/SidebarLayout';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    tools: [] as ('ev3' | 'tinkercad')[],
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleToolToggle = (tool: 'ev3' | 'tinkercad') => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool) ? prev.tools.filter((x) => x !== tool) : [...prev.tools, tool],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.tools.length === 0) {
      setError(t('createAssignment.toolsRequired'));
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('deadline', formData.deadline);
      fd.append('tools', JSON.stringify(formData.tools));
      if (file) fd.append('file', file);
      await api.post('/api/assignments', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/teacher/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, t('createAssignment.loadError')));
    } finally {
      setPending(false);
    }
  };

  return (
    <SidebarLayout role="teacher">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('createAssignment.title')}</h1>
            <p className="text-gray-600">{t('createAssignment.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t('createAssignment.basic')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createAssignment.assignmentTitle')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createAssignment.description')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createAssignment.deadline')} *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('createAssignment.selectTools')} *</h2>
              <p className="text-sm text-gray-600 mb-4">{t('createAssignment.selectToolsHint')}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleToolToggle('ev3')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    formData.tools.includes('ev3')
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    {formData.tools.includes('ev3') && (
                      <CheckCircle className="w-6 h-6 text-orange-600" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{t('toolsPage.ev3Title')}</h3>
                  <p className="text-sm text-gray-600">{t('toolsPage.ev3Desc')}</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolToggle('tinkercad')}
                  className={`p-6 border-2 rounded-xl transition-all text-left ${
                    formData.tools.includes('tinkercad')
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    {formData.tools.includes('tinkercad') && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{t('toolsPage.tinkercadTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('toolsPage.tinkercadDesc')}</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('createAssignment.attach')}</h2>
              <p className="text-sm text-gray-600 mb-4">{t('createAssignment.attachHint')}</p>
              <FileUpload onFileSelect={setFile} />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
              >
                {pending ? t('loading') : t('createAssignment.create')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/teacher/dashboard')}
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-all font-semibold"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
}
