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

export default function AiAssistantPanel({ projectText, assignmentText = '', selectedTools = [] }: Props) {
  const { t, i18n } = useTranslation();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [evalBusy, setEvalBusy] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);

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
    try {
      const { data } = await api.post<EvalResult>('/api/ai/evaluate', {
        projectText: projectShort,
        assignmentText: assignmentShort,
        selectedTools,
        language,
      });
      setEvalResult(data);
    } catch {
      setEvalResult({
        scores: { idea: 0, algorithm: 0, technical: 0, tools: 0 },
        feedback: t('aiAssistant.unavailable'),
      });
    } finally {
      setEvalBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">{t('aiAssistant.title')}</h2>
        </div>
        <button
          type="button"
          onClick={onEvaluate}
          disabled={evalBusy || !projectText.trim()}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {evalBusy ? t('loading') : t('aiAssistant.quickEvaluate')}
        </button>
      </div>

      {evalResult && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>{t('projectView.criteria.idea')}: {evalResult.scores.idea}</div>
            <div>{t('projectView.criteria.algorithm')}: {evalResult.scores.algorithm}</div>
            <div>{t('projectView.criteria.technical')}: {evalResult.scores.technical}</div>
            <div>{t('projectView.criteria.tools')}: {evalResult.scores.tools}</div>
          </div>
          <p className="text-gray-700">{evalResult.feedback}</p>
        </div>
      )}

      <div className="max-h-56 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2 mb-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">{t('aiAssistant.hint')}</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 ${m.role === 'ai' ? 'bg-white border border-gray-200' : 'bg-blue-600 text-white ml-8'}`}
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
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={onAsk}
          disabled={busy || !question.trim()}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          aria-label={t('aiAssistant.send')}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
