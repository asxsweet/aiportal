import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import FileUpload from '../components/FileUpload';
import AiAssistantPanel from '../components/AiAssistantPanel';
import SidebarLayout from '../components/SidebarLayout';
import { Users, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';

export default function ProjectSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tools: [] as ('ev3' | 'tinkercad')[],
    teamMembers: [''],
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

  const handleAddTeamMember = () => {
    setFormData((prev) => ({ ...prev, teamMembers: [...prev.teamMembers, ''] }));
  };

  const handleRemoveTeamMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const handleTeamMemberChange = (index: number, value: string) => {
    const updated = [...formData.teamMembers];
    updated[index] = value;
    setFormData({ ...formData, teamMembers: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!id) return;
    if (!file) {
      setError(t('projectSubmit.fileRequired'));
      return;
    }
    if (formData.tools.length === 0) {
      setError(t('createAssignment.toolsRequired'));
      return;
    }
    setPending(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', id);
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('tools', JSON.stringify(formData.tools));
      fd.append('teamMembers', JSON.stringify(formData.teamMembers.map((x) => x.trim())));
      fd.append('file', file);
      const { data } = await api.post<{ project: { id: string } }>('/api/projects', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/project/${data.project.id}`);
    } catch (err) {
      setError(getErrorMessage(err, t('projectSubmit.loadError')));
    } finally {
      setPending(false);
    }
  };

  return (
    <SidebarLayout role="student">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('projectSubmit.title')}</h1>
            <p className="text-gray-600">{t('projectSubmit.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('projectSubmit.projectInfo')}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('projectSubmit.projectTitle')} *
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
                    {t('projectSubmit.projectDescription')} *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('projectSubmit.toolsUsed')} *</h2>
              <p className="text-sm text-gray-600 mb-4">{t('projectSubmit.toolsHint')}</p>

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
              <h2 className="text-xl font-semibold mb-4">{t('projectSubmit.uploadTitle')} *</h2>
              <p className="text-sm text-gray-600 mb-4">{t('projectSubmit.uploadHint')}</p>
              <FileUpload onFileSelect={setFile} acceptedFormats=".pdf,.doc,.docx" label="" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    {t('projectSubmit.team')}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{t('projectSubmit.teamHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm"
                >
                  {t('projectSubmit.addMember')}
                </button>
              </div>

              <div className="space-y-3">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('projectSubmit.memberPlaceholder', { n: index + 1 })}
                    />
                    {formData.teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(index)}
                        className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        {t('projectSubmit.remove')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <AiAssistantPanel
              projectText={formData.description}
              selectedTools={formData.tools}
            />

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={pending}
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-60"
              >
                {pending ? t('loading') : t('submit')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/assignment/${id}`)}
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
