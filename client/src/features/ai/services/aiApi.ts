import { api } from '@/services/api';

export async function askAiAssist(payload: {
  question: string;
  projectText?: string;
  assignmentText?: string;
  selectedTools?: ('ev3' | 'tinkercad')[];
  language?: 'en' | 'ru' | 'kz';
}) {
  const { data } = await api.post<{ answer: string }>('/api/ai/assist', payload);
  return data;
}

export async function askAiEvaluation(payload: {
  projectText: string;
  assignmentText?: string;
  selectedTools?: ('ev3' | 'tinkercad')[];
  language?: 'en' | 'ru' | 'kz';
}) {
  const { data } = await api.post<{
    scores: { idea: number; algorithm: number; technical: number; tools: number };
    feedback: string;
  }>('/api/ai/evaluate', payload);
  return data;
}

