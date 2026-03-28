import { ExternalLink, Book, Video, FileText, Cpu, Box } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import SidebarLayout from '../components/SidebarLayout';

export default function RoboticsTools() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sidebarRole = user?.role === 'teacher' ? 'teacher' : 'student';

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
    { titleKey: 'landing.f2Title', typeKey: 'toolsPage.learningResources', icon: Book, duration: '15 min' },
    { titleKey: 'projectView.criteria.algorithm', typeKey: 'toolsPage.learningResources', icon: Video, duration: '20 min' },
    { titleKey: 'toolsPage.tinkercadTitle', typeKey: 'toolsPage.learningResources', icon: Book, duration: '10 min' },
    { titleKey: 'projectView.criteria.technical', typeKey: 'toolsPage.learningResources', icon: FileText, duration: '25 min' },
    { titleKey: 'projectView.criteria.idea', typeKey: 'toolsPage.learningResources', icon: Video, duration: '30 min' },
    { titleKey: 'landing.f3Title', typeKey: 'toolsPage.learningResources', icon: Book, duration: '12 min' },
  ];

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{t(resource.titleKey)}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {t(resource.typeKey)}
                      </span>
                      <span>• {resource.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Cpu className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">{t('toolsPage.tipHardwareTitle')}</h3>
              <p className="text-sm opacity-90">{t('toolsPage.tipHardwareBody')}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Box className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">{t('toolsPage.tipTestTitle')}</h3>
              <p className="text-sm opacity-90">{t('toolsPage.tipTestBody')}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <Book className="w-10 h-10 mb-3 opacity-80" />
              <h3 className="font-semibold mb-2">{t('toolsPage.tipDocTitle')}</h3>
              <p className="text-sm opacity-90">{t('toolsPage.tipDocBody')}</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
