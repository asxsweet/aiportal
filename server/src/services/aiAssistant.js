import { z } from 'zod';
import { config } from '../config.js';

const langSchema = z.enum(['en', 'ru', 'kz']);

const evaluateResponseSchema = z.object({
  idea: z.coerce.number().min(0).max(10),
  algorithm: z.coerce.number().min(0).max(10),
  technical: z.coerce.number().min(0).max(10),
  tools: z.coerce.number().min(0).max(10),
  feedback: z.string().min(1).max(500),
});

const TOOL_LABELS = {
  ev3: 'LEGO Mindstorms EV3',
  tinkercad: 'Tinkercad',
};

function clampInt(n, min, max) {
  const x = Math.round(Number(n));
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function languageName(lang) {
  if (lang === 'ru') return 'Russian';
  if (lang === 'kz') return 'Kazakh';
  return 'English';
}

function toToolText(tools) {
  if (!Array.isArray(tools) || tools.length === 0) return 'not specified';
  return tools.map((t) => TOOL_LABELS[t] || t).join(', ');
}

function stripJsonFence(raw) {
  let s = String(raw).trim();
  const m = s.match(/^```(?:json)?\s*([\s\S]*?)```$/im);
  if (m) s = m[1].trim();
  return s;
}

function countWords(s) {
  return String(s || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeAnswerText(s) {
  return String(s || '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateToMaxSentences(s, maxSentences) {
  const text = normalizeAnswerText(s);
  const parts = text.split(/(?<=[.!?])\s+/);
  if (parts.length <= maxSentences) return text;
  return parts.slice(0, maxSentences).join(' ').trim();
}

const STOPWORDS = {
  en: new Set([
    'the','and','or','to','of','a','an','in','on','for','with','without','is','are','was','were','be','it','that','this',
    'you','your','we','our','they','their','i','me','my','how','what','why','where','when','can','could','should','would',
    'do','does','did','please','improve','fix','help',
  ]),
  ru: new Set([
    'и','в','во','на','с','со','к','ко','от','по','для','без','не','ни','но','или','как','что','зачем','почему','можно',
    'нужно','ли','вы','тебя','твой','мне','моя','мой','ваш','ваша','это','этот','эта','эти','тому','теперь','бы','же',
    'улучшить','исправить','помочь',
  ]),
  kz: new Set([
    'және','мен','біз','сіз','үшін','туралы','қалай','не','неге','қайда','қашан','болады','болса','керек','қажет',
    'мүмкін','істеу','осы','мына','сенің','менің','сіздің','т.б','жөн',
    'жақсарту','түзету','көмектес',
  ]),
};

const ACTION_VERBS = {
  en: ['add', 'use', 'improve', 'check', 'calibrate', 'measure', 'tune', 'implement', 'update', 'fix', 'replace', 'adjust'],
  ru: ['добавь', 'добавьте', 'используй', 'используйте', 'проверь', 'проверьте', 'улучшите', 'улучшай', 'калибруйте', 'откалибруйте', 'настрой', 'настройте', 'измерьте', 'реализуй', 'реализуйте'],
  kz: ['қос', 'қолдан', 'жақсарт', 'тексер', 'өлше', 'калибрле', 'теңше', 'енгіз', 'жүзеге'],
};

function extractKeywords(question, lang) {
  const q = String(question || '').toLowerCase();
  const stop = STOPWORDS[lang] || STOPWORDS.en;
  const minLen = lang === 'en' ? 4 : 3;
  const tokens = q
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((t) => t.trim())
    .filter((t) => t.length >= minLen && !stop.has(t))
    .slice(0, 10);
  return tokens;
}

function isLikelyRelevant({ answer, question, selectedTools, lang }) {
  const a = normalizeAnswerText(answer).toLowerCase();
  const keywords = extractKeywords(question, lang);
  if (keywords.length > 0) {
    const hasOverlap = keywords.some((k) => k && a.includes(k));
    if (hasOverlap) return true;
  }

  // If no keyword overlap (common with translations), allow if tool mentioned.
  const toolTokens = (Array.isArray(selectedTools) ? selectedTools : []).map((t) => String(t).toLowerCase());
  if (toolTokens.some((tok) => tok && a.includes(tok))) return true;

  const verbs = ACTION_VERBS[lang] || ACTION_VERBS.en;
  if (verbs.some((v) => v && a.includes(v))) return true;

  return false;
}

async function callGemini({ systemPrompt, userPrompt, maxOutputTokens, responseMimeType }) {
  if (!config.geminiApiKey) {
    throw new Error('AI unavailable. Try again.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.geminiModel)}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;
  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens,
      ...(responseMimeType ? { responseMimeType } : {}),
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || 'AI unavailable. Try again.');
  }

  const candidate = body?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || '').join('').trim();
  if (!text) throw new Error('AI unavailable. Try again.');
  return text;
}

function assistFallback({ language }) {
  if (language === 'ru') return 'ИИ недоступен. Попробуйте снова.';
  if (language === 'kz') return 'AI қолжетімсіз. Қайта көріңіз.';
  return 'AI unavailable. Try again.';
}

function evaluateFallback({ language }) {
  return {
    scores: { idea: 6, algorithm: 6, technical: 6, tools: 6 },
    feedback:
      language === 'ru'
        ? 'ИИ недоступен. Попробуйте снова.'
        : language === 'kz'
          ? 'AI қолжетімсіз. Қайта көріңіз.'
          : 'AI unavailable. Try again.',
  };
}

function guessAssistHeuristic({ question, projectText, selectedTools, language }) {
  const q = String(question || '').toLowerCase();
  const ctx = String(projectText || '').toLowerCase();
  const toolTokens = (Array.isArray(selectedTools) ? selectedTools : []).map((t) => String(t).toLowerCase());

  const mentionsDistance = /distance|ultrasonic|range|скан|distance|қашық|range/.test(q) || /distance|ultrasonic|range|қашық/.test(ctx);
  const mentionsSensor = /sensor|sensors|ультразву|sensor|датчик/.test(q) || /sensor|датчик|датчик/.test(ctx);
  const mentionsPid = /pid|контур|регулятор/.test(q) || /pid|контур|регулятор/.test(ctx);
  const mentionsLoop = /loop|цик|while|for|loop/.test(q);
  const mentionsAlgorithm = /algorithm|logic|flow|state|machine|алгоритм|логика|схема/.test(q) || mentionsLoop;
  const mentionsCalibration = /calibr|калибр|түзету/.test(q) || /calibr|калибр/.test(ctx);
  const mentionsSafety = /safety|опасн|safe|stop|emergency/.test(q) || /stop/.test(q);

  const hasEv3 = toolTokens.includes('ev3');
  const hasTink = toolTokens.includes('tinkercad');

  if (language === 'ru') {
    const parts = [];
    if (mentionsAlgorithm) parts.push('Сделай алгоритм более явным: разбей на состояния и переходы, чтобы поведение было предсказуемым.');
    if (mentionsPid) parts.push('Если есть управление скоростью/движением, добавь PID-регулятор и настрой параметры по тестам.');
    if (mentionsDistance) parts.push('Добавь проверку расстояния: введи порог и реакцию (остановка/коррекция), чтобы избежать столкновений.');
    if (mentionsSensor) parts.push('Укажи логику обработки датчика: калибровка, фильтрация шума и условия срабатывания.');
    if (mentionsCalibration)
      parts.push('Проверь калибровку датчиков и повтори измерения после установки.');
    if (mentionsSafety) parts.push('Добавь безопасное поведение на краевых случаях (остановка при ошибке датчика).');
    if (parts.length === 0) parts.push('Уточни описание: что измеряешь, как принимаешь решения и какие параметры регулируешь.');
    const toolHint = hasEv3 ? ' Для EV3 опиши, какие порты и датчики используешь.' : hasTink ? ' Для Tinkercad добавь схему соединений.' : '';
    return `${parts[0]}${toolHint}`.trim();
  }

  if (language === 'kz') {
    const parts = [];
    if (mentionsAlgorithm) parts.push('Алгоритмді нақтырақ қыл: күйге/өтулерге бөліп, әрекетің алдын-ала болсын.');
    if (mentionsPid) parts.push('Жылдамдық/қозғалысты басқарсаң, PID қолданып параметрлерін тестпен бапта.');
    if (mentionsDistance) parts.push('Қашықтықты тексер: шек мәнін қой және реакцияны (тоқтау/түзету) нақты көрсет.');
    if (mentionsSensor) parts.push('Датчик өңдеу логикасын қос: калибрлеу, шу сүзгісі және іске қосылу шарттары.');
    if (mentionsCalibration) parts.push('Датчик калибрін қайта тексеріп, орнатқаннан кейін өлшеуді қайтала.');
    if (mentionsSafety) parts.push('Қауіпсіз режим енгіз: датчик қате болса тоқтату қарастыр.');
    if (parts.length === 0) parts.push('Сипаттаманы нақтыла: не өлшейсің, шешімді қалай қабылдайсың, қандай параметр өзгереді?');
    const toolHint = hasEv3 ? ' EV3 үшін қолданылатын порттар мен датчиктерді көрсет.' : hasTink ? ' Tinkercad үшін қосылым схемасын қос.' : '';
    return `${parts[0]}${toolHint}`.trim();
  }

  // English
  const parts = [];
  if (mentionsAlgorithm) parts.push('Make the algorithm explicit: break it into states and transitions so behavior is predictable.');
  if (mentionsPid) parts.push('If controlling motion/speed, add a PID controller and tune parameters with tests.');
  if (mentionsDistance) parts.push('Add a distance check: set a threshold and a clear reaction (stop/correct) to avoid collisions.');
  if (mentionsSensor) parts.push('Improve sensor handling: calibration, noise filtering, and clear trigger conditions.');
  if (mentionsCalibration) parts.push('Verify sensor calibration and retest after setup.');
  if (mentionsSafety) parts.push('Add safe behavior for edge cases (e.g., stop when sensor reading is invalid).');
  if (parts.length === 0) parts.push('Clarify your write-up: what you measure, how you decide, and what parameters you tune.');

  const toolHint = hasEv3 ? ' For EV3, specify which ports and sensors you used.' : hasTink ? ' For Tinkercad, include your wiring connections.' : '';
  return `${parts[0]}${toolHint}`.trim();
}

function guessEvaluateHeuristic({ projectText, assignmentText, selectedTools, language }) {
  const txt = `${projectText || ''} ${assignmentText || ''}`.toLowerCase();
  const len = String(projectText || '').trim().length;
  const toolTokens = (Array.isArray(selectedTools) ? selectedTools : []).map((t) => String(t).toLowerCase());

  const mentionsSensor = /sensor|sensors|датчик|ультразв|distance|range|дистан/.test(txt);
  const mentionsAlgorithm = /algorithm|logic|state|machine|flow|loop|cycle|алгоритм|логика|күй|цикл/.test(txt);
  const mentionsControl = /pid|регулятор|контроль|controller|threshold|порог/.test(txt);
  const mentionsTools = /ev3|tinkercad|lego|mindstorms|ev3|ардуино/.test(txt) || toolTokens.length > 0;

  const base = clampInt(2 + Math.floor(len / 140), 0, 10);
  let idea = clampInt(base + (len > 220 ? 2 : 0), 0, 10);
  let algorithm = clampInt(base + (mentionsAlgorithm ? 3 : 0), 0, 10);
  let technical = clampInt(base + (mentionsSensor ? 2 : 0) + (mentionsControl ? 2 : 0), 0, 10);
  let tools = clampInt(base + (mentionsTools ? 3 : 0), 0, 10);

  // If tools selected but write-up doesn't mention any relevant detail, slightly reduce.
  if (toolTokens.length > 0 && !mentionsTools) tools = clampInt(tools - 2, 0, 10);

  idea = clampInt(idea, 0, 10);
  algorithm = clampInt(algorithm, 0, 10);
  technical = clampInt(technical, 0, 10);
  tools = clampInt(tools, 0, 10);

  if (language === 'ru') {
    const feedbackParts = [];
    if (!mentionsAlgorithm) feedbackParts.push('Опиши алгоритм: решения, переходы и порядок действий.');
    if (!mentionsSensor) feedbackParts.push('Добавь логику датчиков и условия срабатывания.');
    if (feedbackParts.length === 0) feedbackParts.push('Уточни параметры и протестируй поведение на разных сценариях.');
    return { scores: { idea, algorithm, technical, tools }, feedback: feedbackParts.slice(0, 2).join(' ') };
  }

  if (language === 'kz') {
    const feedbackParts = [];
    if (!mentionsAlgorithm) feedbackParts.push('Алгоритмді сипатта: шешімдер, өтулер және әрекет реті.');
    if (!mentionsSensor) feedbackParts.push('Датчик логикасын және іске қосылу шарттарын қос.');
    if (feedbackParts.length === 0) feedbackParts.push('Параметрлерді нақтылап, әртүрлі жағдайларда тексер.');
    return { scores: { idea, algorithm, technical, tools }, feedback: feedbackParts.slice(0, 2).join(' ') };
  }

  // English
  const feedbackParts = [];
  if (!mentionsAlgorithm) feedbackParts.push('Clarify the algorithm: decisions, transitions, and step-by-step flow.');
  if (!mentionsSensor) feedbackParts.push('Add sensor logic and trigger conditions.');
  if (feedbackParts.length === 0) feedbackParts.push('Specify parameters and test behavior across different scenarios.');
  return { scores: { idea, algorithm, technical, tools }, feedback: feedbackParts.slice(0, 2).join(' ') };
}

export async function assistProject({ question, projectText, assignmentText, selectedTools, language }) {
  const lang = langSchema.parse(language || 'en');
  const projectSnippet = String(projectText || '').trim().slice(0, 1200);
  const assignmentSnippet = String(assignmentText || '').trim().slice(0, 800);
  const q = String(question || '').trim().slice(0, 500);

  const systemPrompt = `You are an AI assistant for a robotics education platform.
Understand the user's question carefully.
Respond in the given language.
Keep answers short (1-3 sentences).
Give only relevant and useful suggestions.
In your first sentence, address the specific topic of the question.
Do not give one-word answers.
Do not give unrelated responses.`;

  const userPrompt = `Language: ${lang} (${languageName(lang)})
Question: ${q}
Project context: ${projectSnippet}
Assignment context: ${assignmentSnippet}
Tools used: ${toToolText(selectedTools)}
Return only the answer text (no bullets, no quotes).`;

  const maxAttempts = 2;
  let lastAnswer = '';
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const text = await callGemini({
        systemPrompt,
        userPrompt,
        maxOutputTokens: 140,
      });
      const normalized = normalizeAnswerText(text);
      const trimmed = truncateToMaxSentences(normalized, 3);
      lastAnswer = trimmed;

      if (countWords(trimmed) < 5) continue;
      if (!isLikelyRelevant({ answer: trimmed, question: q, selectedTools, lang })) continue;

      return { answer: trimmed };
    } catch {
      // retry once below
    }
  }

  // If Gemini fails (quota/outage), still provide useful offline guidance.
  const heuristic = guessAssistHeuristic({ question: q, projectText, selectedTools, language: lang });
  if (heuristic && String(heuristic).trim().split(/\s+/).filter(Boolean).length >= 3) {
    return { answer: truncateToMaxSentences(normalizeAnswerText(heuristic), 3) };
  }
  return { answer: assistFallback({ language: lang }) };
}

export async function evaluateProjectShort({ projectText, assignmentText, selectedTools, language }) {
  const lang = langSchema.parse(language || 'en');
  const systemPrompt = `You are an AI assistant for a robotics education platform.
Respond only in ${languageName(lang)}.
Keep answers very short.
Return JSON only with this exact shape:
{"idea":number,"algorithm":number,"technical":number,"tools":number,"feedback":string}
Scores must be integers from 0 to 10.
feedback must be 1-2 short sentences, direct and useful.`;

  const userPrompt = `Project text: ${String(projectText || '').trim()}
Assignment text: ${String(assignmentText || '').trim()}
Selected tools: ${toToolText(selectedTools)}
Return only JSON.`;

  try {
    const raw = await callGemini({
      systemPrompt,
      userPrompt,
      maxOutputTokens: 160,
      responseMimeType: 'application/json',
    });
    const parsed = evaluateResponseSchema.parse(JSON.parse(stripJsonFence(raw)));
    return {
      scores: {
        idea: clampInt(parsed.idea, 0, 10),
        algorithm: clampInt(parsed.algorithm, 0, 10),
        technical: clampInt(parsed.technical, 0, 10),
        tools: clampInt(parsed.tools, 0, 10),
      },
      feedback: parsed.feedback.trim(),
    };
  } catch {
    return guessEvaluateHeuristic({ projectText, assignmentText, selectedTools, language: lang });
  }
}
