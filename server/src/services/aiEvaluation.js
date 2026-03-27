import { config } from '../config.js';
import { evaluateWithGemini } from './geminiClient.js';

/**
 * Heuristic fallback when Gemini is unavailable or fails.
 */
const TOOL_KEYWORDS = {
  ev3: ['ev3', 'mindstorms', 'lego', 'robot', 'sensor', 'motor', 'brick'],
  tinkercad: ['tinkercad', 'circuit', 'arduino', '3d', 'simulation', 'breadboard'],
};

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

export function evaluateProjectMock({ title, description, tools }) {
  const text = `${title}\n${description}`.toLowerCase();
  const len = text.trim().length;
  const base = clamp(55 + Math.min(25, Math.floor(len / 40)), 60, 92);
  const jitter = hashString(text) % 9;

  let idea = clamp(base - 4 + (jitter % 5), 55, 98);
  let algorithm = clamp(base - 2 + ((jitter >> 2) % 6), 55, 98);
  let technical = clamp(base + ((jitter >> 4) % 5), 55, 98);
  let toolsUsage = clamp(base - 1 + ((jitter >> 1) % 7), 55, 98);

  const toolList = Array.isArray(tools) ? tools : [];
  for (const t of toolList) {
    const keys = TOOL_KEYWORDS[t] || [];
    const hits = keys.filter((k) => text.includes(k)).length;
    toolsUsage = clamp(toolsUsage + hits * 2, 55, 98);
  }

  if (len < 80) {
    idea -= 8;
    technical -= 5;
  }
  if (len > 400) {
    idea += 3;
    algorithm += 2;
  }

  idea = clamp(idea, 50, 100);
  algorithm = clamp(algorithm, 50, 100);
  technical = clamp(technical, 50, 100);
  toolsUsage = clamp(toolsUsage, 50, 100);

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
  parts.push('This is an automated preview — your teacher will give the official grade.');

  return {
    scores: {
      idea,
      algorithm,
      technical,
      toolsUsage,
    },
    feedback: parts.join(' '),
  };
}

function automatedPreviewByLanguage(language) {
  if (language === 'ru') return 'Это автоматическая предварительная оценка — итоговую оценку выставит преподаватель.';
  if (language === 'kz') return 'Бұл автоматты алдын ала бағалау — ресми бағаны мұғалім қояды.';
  return 'This is an automated preview — your teacher will give the official grade.';
}

function fallbackFeedbackByLanguage({ language, len }) {
  const lines = [];
  if (language === 'ru') {
    if (len < 120) lines.push('Добавьте больше деталей: цель, метод и результат.');
    else lines.push('Описание проекта в целом достаточно понятное.');
    lines.push(automatedPreviewByLanguage(language));
    return lines.join(' ');
  }
  if (language === 'kz') {
    if (len < 120) lines.push('Мақсат, әдіс және нәтижені нақтырақ қосыңыз.');
    else lines.push('Жоба сипаттамасы жалпы түсінікті берілген.');
    lines.push(automatedPreviewByLanguage(language));
    return lines.join(' ');
  }
  if (len < 120) lines.push('Consider expanding the description with goals, method, and results.');
  else lines.push('The write-up covers the project scope reasonably well.');
  lines.push(automatedPreviewByLanguage(language));
  return lines.join(' ');
}

/**
 * Uses Google Gemini (free tier API key from AI Studio) when GEMINI_API_KEY is set; otherwise mock heuristics.
 */
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
      console.info(`[ai] Gemini OK — model=${config.geminiModel}, avg≈${Math.round((out.scores.idea + out.scores.algorithm + out.scores.technical + out.scores.toolsUsage) / 4)}`);
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
    }),
  };
}

export function averageAiScore(scores) {
  const v = [scores.idea, scores.algorithm, scores.technical, scores.toolsUsage];
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}

export function computeFinalScore(aiAverage, teacherScore) {
  if (teacherScore == null || Number.isNaN(Number(teacherScore))) {
    return Number(aiAverage);
  }
  return Math.round((Number(aiAverage) + Number(teacherScore)) / 2);
}
