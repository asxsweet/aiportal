import { config } from '../config.js';
import { evaluateWithGemini } from './geminiClient.js';

const TOOL_KEYWORDS = {
  ev3: ['ev3', 'mindstorms', 'lego', 'robot', 'sensor', 'motor', 'brick'],
  tinkercad: ['tinkercad', 'circuit', 'arduino', '3d', 'simulation', 'breadboard'],
};

const SAFETY_KEYWORDS = ['safety', 'safe', 'battery', 'charge', 'charge', 'precaution', 'danger', 'risk', 'protect', 'қауіпсіз', 'батарея', 'заряд', 'қауіп', 'қорға', 'безопаст', 'батарей', 'заряд', 'опасн', 'защит'];
const PROBLEM_SOLVING_KEYWORDS = ['problem', 'issue', 'challenge', 'fix', 'solve', 'solution', 'workaround', 'debug', 'troubleshoot', 'error', 'failed', 'мәселе', 'шешім', 'қате', 'жөнде', 'проблем', 'решен', 'исправ', 'ошібк', 'отлад'];
const INNOVATION_KEYWORDS = ['innovative', 'creative', 'unique', 'original', 'novel', 'custom', 'new approach', 'different', 'hack', 'жаңа', 'бірінші', 'ерекше', 'креатив', 'инноваци', 'оригинал', 'нестандарт', 'новый'];
const PRESENTATION_KEYWORDS = ['step', 'first', 'then', 'finally', 'result', 'goal', 'objective', 'method', 'conclusion', 'summary', 'қадам', 'нәтиже', 'мақсат', 'әдіс', 'қорытынд', 'шаг', 'результат', 'цель', 'метод', 'итог'];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function countKeywordHits(text, keywords) {
  return keywords.filter((k) => text.includes(k)).length;
}

export function evaluateProjectMock({ title, description, tools }) {
  const text = `${title}\n${description}`.toLowerCase();
  const len = text.trim().length;
  const base = clamp(55 + Math.min(25, Math.floor(len / 40)), 60, 92);
  const jitter = hashString(text) % 9;

  let idea = clamp(base - 4 + (jitter % 5), 55, 98);
  let algorithm = clamp(base - 2 + ((jitter >> 2) % 6), 55, 98);
  let technical = clamp(base + ((jitter >> 4) % 5), 55, 98);
  let toolsUsage = clamp(base - 1 + ((jitter >> 1) % 7), 55, 98);

  const safetyHits = countKeywordHits(text, SAFETY_KEYWORDS);
  let safety = clamp(base - 8 + (jitter % 3) + safetyHits * 4, 50, 98);
  if (len > 300 && safetyHits === 0) safety = clamp(safety - 5, 50, 98);

  const psHits = countKeywordHits(text, PROBLEM_SOLVING_KEYWORDS);
  let problemSolving = clamp(base - 5 + ((jitter >> 3) % 5) + psHits * 4, 50, 98);

  const innovHits = countKeywordHits(text, INNOVATION_KEYWORDS);
  let innovation = clamp(base - 3 + (jitter % 6) + innovHits * 4, 50, 98);

  const presHits = countKeywordHits(text, PRESENTATION_KEYWORDS);
  let presentation = clamp(base - 2 + ((jitter >> 1) % 4) + presHits * 3, 50, 98);

  const toolList = Array.isArray(tools) ? tools : [];
  for (const t of toolList) {
    const keys = TOOL_KEYWORDS[t] || [];
    const hits = keys.filter((k) => text.includes(k)).length;
    toolsUsage = clamp(toolsUsage + hits * 2, 55, 98);
  }

  if (len < 80) {
    idea -= 8;
    technical -= 5;
    presentation -= 6;
    problemSolving -= 4;
  }
  if (len > 400) {
    idea += 3;
    algorithm += 2;
    presentation += 2;
  }

  idea = clamp(idea, 50, 100);
  algorithm = clamp(algorithm, 50, 100);
  technical = clamp(technical, 50, 100);
  toolsUsage = clamp(toolsUsage, 50, 100);
  presentation = clamp(presentation, 50, 100);
  problemSolving = clamp(problemSolving, 50, 100);
  innovation = clamp(innovation, 50, 100);
  safety = clamp(safety, 50, 100);

  const parts = [];
  if (len < 120) {
    parts.push('Consider expanding the description with goals, method, and results.');
  } else {
    parts.push('The write-up covers the project scope reasonably well.');
  }
  if (toolList.includes('ev3') && /pid|loop|sensor|calibrat/.test(text)) {
    parts.push('Technical vocabulary suggests solid engagement with robotics concepts.');
  }
  if (toolList.includes('tinkercad') && /circuit|simulat|design/.test(text)) {
    parts.push('Good linkage to circuit or 3D design workflow.');
  }
  if (safetyHits === 0) {
    parts.push('Consider mentioning safety practices and precautions.');
  }
  if (psHits === 0) {
    parts.push('Describe any challenges faced and how they were resolved.');
  }
  parts.push('This is an automated preview — your teacher will give the official grade.');

  return {
    scores: {
      idea,
      algorithm,
      technical,
      toolsUsage,
      presentation,
      problemSolving,
      innovation,
      safety,
    },
    feedback: parts.join(' '),
  };
}

function automatedPreviewByLanguage(language) {
  if (language === 'ru') return 'Это автоматическая предварительная оценка — итоговую оценку выставит преподаватель.';
  if (language === 'kz') return 'Бұл автоматты алдын ала бағалау — ресми бағаны мұғалім қояды.';
  return 'This is an automated preview — your teacher will give the official grade.';
}

function fallbackFeedbackByLanguage({ language, len, scores }) {
  const lines = [];
  if (language === 'ru') {
    if (len < 120) lines.push('Добавьте больше деталей: цель, метод и результат.');
    else lines.push('Описание проекта в целом достаточно понятное.');
    if (scores.safety < 60) lines.push('Укажите меры безопасности при работе с оборудованием.');
    if (scores.problemSolving < 60) lines.push('Опишите трудности и как вы их решали.');
    lines.push(automatedPreviewByLanguage(language));
    return lines.join(' ');
  }
  if (language === 'kz') {
    if (len < 120) lines.push('Мақсат, әдіс және нәтижені нақтырақ қосыңыз.');
    else lines.push('Жоба сипаттамасы жалпы түсінікті берілген.');
    if (scores.safety < 60) lines.push('Жабдықпен жұмыс кезіндегі қауіпсіздік шараларын көрсетіңіз.');
    if (scores.problemSolving < 60) lines.push('Қиындықтар мен оларды шешу жолдарын сипаттаңыз.');
    lines.push(automatedPreviewByLanguage(language));
    return lines.join(' ');
  }
  if (len < 120) lines.push('Consider expanding the description with goals, method, and results.');
  else lines.push('The write-up covers the project scope reasonably well.');
  if (scores.safety < 60) lines.push('Mention safety practices when working with equipment.');
  if (scores.problemSolving < 60) lines.push('Describe challenges encountered and how they were resolved.');
  lines.push(automatedPreviewByLanguage(language));
  return lines.join(' ');
}

export async function evaluateProject({ title, description, tools, language = 'en' }) {
  if (config.geminiApiKey) {
    try {
      const out = await evaluateWithGemini({
        apiKey: config.geminiApiKey,
        model: config.geminiModel,
        title,
        description,
        tools,
        language,
      });
      const s = out.scores;
      console.info(`[ai] Gemini OK — model=${config.geminiModel}, avg≈${Math.round((s.idea + s.algorithm + s.technical + s.toolsUsage + s.presentation + s.problemSolving + s.innovation + s.safety) / 8)}`);
      return out;
    } catch (e) {
      console.warn('[ai] Gemini evaluation failed, using heuristic fallback:', e?.message || e);
    }
  }
  const mock = evaluateProjectMock({ title, description, tools });
  return {
    ...mock,
    feedback: fallbackFeedbackByLanguage({
      language,
      len: `${title}\n${description}`.trim().length,
      scores: mock.scores,
    }),
  };
}

export function averageAiScore(scores) {
  const v = [scores.idea, scores.algorithm, scores.technical, scores.toolsUsage, scores.presentation, scores.problemSolving, scores.innovation, scores.safety];
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

export function computeFinalScore(aiAverage, teacherScore) {
  if (teacherScore == null || Number.isNaN(Number(teacherScore))) {
    return Number(aiAverage);
  }
  return Math.round((Number(aiAverage) + Number(teacherScore)) / 2);
}