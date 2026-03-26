import { Link } from 'react-router';
import { Bot, Cpu, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            {t('brand')}
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <LanguageSwitcher />
          <Link
            to="/login"
            className="px-6 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            {t('landing.ctaLogin')}
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            {t('landing.getStarted')}
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {t('landing.heroTitle')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">{t('landing.heroLead')}</p>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
              >
                {t('landing.ctaRegister')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all font-semibold"
              >
                {t('landing.learnMore')}
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1743677077216-00a458eff9e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdGljcyUyMGVkdWNhdGlvbiUyMHN0dWRlbnRzfGVufDF8fHx8MTc3NDQ0MjM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt=""
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">{t('landing.featuresTitle')}</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3">{t('landing.f1Title')}</h4>
            <p className="text-gray-600">{t('landing.f1Desc')}</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3">{t('landing.f2Title')}</h4>
            <p className="text-gray-600">{t('landing.f2Desc')}</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-xl font-semibold mb-3">{t('landing.f3Title')}</h4>
            <p className="text-gray-600">{t('landing.f3Desc')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-center mb-8">{t('landing.platformsTitle')}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-center gap-6 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">{t('toolsPage.ev3Title')}</h4>
                <p className="text-gray-600">{t('landing.ev3Card')}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">{t('toolsPage.tinkercadTitle')}</h4>
                <p className="text-gray-600">{t('landing.tinkercadCard')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4">{t('landing.bannerTitle')}</h3>
          <p className="text-xl mb-8 opacity-90">{t('landing.bannerLead')}</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:shadow-xl transition-all font-semibold"
          >
            {t('landing.bannerCta')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <footer className="container mx-auto px-6 py-8 text-center text-gray-600 border-t border-gray-200">
        <p>{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
