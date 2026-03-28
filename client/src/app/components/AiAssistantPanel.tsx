import { useMemo, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api, getErrorMessage } from '@/lib/api';

type ToolId = 'ev3' | 'tinkercad';

type Props = {
  projectText: string;
  assignmentText?: string;
  selectedTools?: ToolId[];
};

type EvalResult = {
  scores: { idea: number; algorithm: number; technical: number; tools: number };
  feedback: string;
};

type EvalResponse = {
  aiStatus: 'active' | 'failed';
  aiStatusText: string;
  result: EvalResult | null;
  errorMessage: string | null;
};

export default function AiAssistantPanel({ projectText, assignmentText = '', selectedTools = [] }: Props) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [evalBusy, setEvalBusy] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [evalStatus, setEvalStatus] = useState<'idle' | 'loading' | 'active' | 'failed'>('idle');
  const [evalStatusText, setEvalStatusText] = useState('');

  const language = useMemo(() => {
    const raw = (i18n.resolvedLanguage || i18n.language || 'en').toLowerCase();
    if (raw.startsWith('ru')) return 'ru';
    if (raw.startsWith('kz')) return 'kz';
    return 'en';
  }, [i18n.language, i18n.resolvedLanguage]);

  const projectShort = useMemo(() => String(projectText || '').trim().slice(0, 2000), [projectText]);
  const assignmentShort = useMemo(
    () => String(assignmentText || '').trim().slice(0, 1200),
    [assignmentText],
  );

  const onAsk = async () => {
    const q = question.trim();
    if (!q || busy) return;
    setBusy(true);
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuestion('');
    try {
      const { data } = await api.post<{ answer: string }>('/api/ai/assist', {
        question: q.slice(0, 500),
        projectText: projectShort,
        assignmentText: assignmentShort,
        selectedTools,
        language,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
    } catch (e) {
      const msg = getErrorMessage(e, t('aiAssistant.unavailable'));
      setMessages((prev) => [...prev, { role: 'ai', text: msg || t('aiAssistant.unavailable') }]);
    } finally {
      setBusy(false);
    }
  };

  const onEvaluate = async () => {
    if (!projectText.trim() || evalBusy) return;
    setEvalBusy(true);
    setEvalStatus('loading');
    setEvalStatusText(t('aiAssistant.aiActive'));
    try {
      const { data } = await api.post<EvalResponse>('/api/ai/evaluate', {
        projectText: projectShort,
        assignmentText: assignmentShort,
        selectedTools,
        language,
      });
      if (data.aiStatus === 'active' && data.result) {
        setEvalResult(data.result);
        setEvalStatus('active');
        setEvalStatusText(data.aiStatusText || t('aiAssistant.aiActive'));
      } else {
        setEvalResult(null);
        setEvalStatus('failed');
        setEvalStatusText(data.errorMessage || data.aiStatusText || t('aiAssistant.aiNotResponding'));
      }
    } catch {
      setEvalStatus('failed');
      setEvalStatusText(t('aiAssistant.aiFailed'));
      setEvalResult({
        scores: { idea: 0, algorithm: 0, technical: 0, tools: 0 },
        feedback: t('aiAssistant.unavailable'),
      });
    } finally {
      setEvalBusy(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-50">{t('aiAssistant.title')}</h2>
        </div>
        <button
          type="button"
          onClick={onEvaluate}
          disabled={evalBusy || !projectText.trim()}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-60 transition-colors"
        >
          {evalBusy ? t('loading') : t('aiAssistant.quickEvaluate')}
        </button>
      </div>

      {evalResult && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-sm text-gray-800 dark:text-zinc-200">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>{t('projectView.criteria.idea')}: {evalResult.scores.idea}</div>
            <div>{t('projectView.criteria.algorithm')}: {evalResult.scores.algorithm}</div>
            <div>{t('projectView.criteria.technical')}: {evalResult.scores.technical}</div>
            <div>{t('projectView.criteria.tools')}: {evalResult.scores.tools}</div>
          </div>
          <p className="text-gray-700 dark:text-zinc-300">{evalResult.feedback}</p>
        </div>
      )}
      {evalStatus !== 'idle' && (
        <div
          className={`mb-4 p-3 rounded-lg border text-sm ${
            evalStatus === 'failed'
              ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-300'
              : evalStatus === 'loading'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-800 dark:text-amber-200'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {evalStatusText}
        </div>
      )}

      <div className="max-h-56 overflow-auto rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-950/80 p-3 space-y-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-500">{t('aiAssistant.hint')}</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 ${m.role === 'ai' ? 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200' : 'bg-blue-600 text-white ml-8'}`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void onAsk();
            }
          }}
          placeholder={t('aiAssistant.placeholder')}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <button
          type="button"
          onClick={onAsk}
          disabled={busy || !question.trim()}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          aria-label={t('aiAssistant.send')}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
