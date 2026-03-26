import { z } from 'zod';

const responseSchema = z.object({
  idea: z.coerce.number(),
  algorithm: z.coerce.number(),
  technical: z.coerce.number(),
  toolsUsage: z.coerce.number(),
  feedback: z.string().min(1).max(12000),
});

function clampInt(n, min, max) {
  const x = Math.round(Number(n));
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function stripJsonFence(raw) {
  let s = String(raw).trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im;
  const m = s.match(fence);
  if (m) s = m[1].trim();
  return s;
}

function parseModelJson(text) {
  const s = stripJsonFence(text);
  const parsed = JSON.parse(s);
  return responseSchema.parse(parsed);
}

const TOOL_LABELS = { ev3: 'LEGO Mindstorms / EV3', tinkercad: 'Tinkercad (circuits / 3D)' };

function isRetryableGeminiError(message) {
  const m = String(message || '').toLowerCase();
  return (
    m.includes('high demand') ||
    m.includes('resource exhausted') ||
    m.includes('429') ||
    m.includes('quota') ||
    m.includes('unavailable') ||
    m.includes('503')
  );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {{ apiKey: string; model: string; title: string; description: string; tools: string[] }} opts
 */
export async function evaluateWithGemini({ apiKey, model, title, description, tools }) {
  const toolList = Array.isArray(tools) ? tools : [];
  const toolHuman = toolList.map((t) => TOOL_LABELS[t] || t).join(', ') || 'not specified';

  const system = `You are an expert robotics / STEM educator. You evaluate student project write-ups (not the attached file).
Score each dimension 0–100 as integers. Be fair: very short or vague descriptions should score lower on technical depth.
Respond with JSON only, no markdown, matching this exact shape:
{"idea":number,"algorithm":number,"technical":number,"toolsUsage":number,"feedback":string}
feedback: 2–5 sentences, constructive, encouraging. Use the same primary language as the student's description when it is clearly Kazakh, Russian, or English; otherwise English.`;

  const user = `Project title: ${title}

Student description:
${description}

Tools selected on the form: ${toolHuman}

Return only the JSON object.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  };

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0) await delay(2500);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 60_000);

    let res;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });
    } finally {
      clearTimeout(t);
    }

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body?.error?.message || res.statusText || 'Gemini request failed';
      lastErr = new Error(msg);
      if (attempt === 0 && isRetryableGeminiError(msg)) continue;
      throw lastErr;
    }

    const candidate = body?.candidates?.[0];
    const reason = candidate?.finishReason;
    if (reason && reason !== 'STOP') {
      lastErr = new Error(`Gemini finish: ${reason}`);
      if (attempt === 0 && isRetryableGeminiError(reason)) continue;
      throw lastErr;
    }

    const text = candidate?.content?.parts?.map((p) => p.text).join('') ?? '';
    if (!text.trim()) {
      lastErr = new Error('Empty Gemini response');
      if (attempt === 0) continue;
      throw lastErr;
    }

    try {
      const validated = parseModelJson(text);
      return {
        scores: {
          idea: clampInt(validated.idea, 0, 100),
          algorithm: clampInt(validated.algorithm, 0, 100),
          technical: clampInt(validated.technical, 0, 100),
          toolsUsage: clampInt(validated.toolsUsage, 0, 100),
        },
        feedback: validated.feedback.trim(),
      };
    } catch (e) {
      lastErr = new Error(`Invalid JSON from model: ${e.message}`);
      throw lastErr;
    }
  }

  throw lastErr || new Error('Gemini request failed');
}
