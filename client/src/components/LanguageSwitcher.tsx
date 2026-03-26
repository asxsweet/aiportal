import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kz', label: 'KZ' },
] as const;

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n } = useTranslation();

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 ${className}`}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => {
            localStorage.setItem('rep_lang', code);
            void i18n.changeLanguage(code);
          }}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
            i18n.language.startsWith(code)
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
