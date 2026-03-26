/**
 * One-off check: Gemini key + model from server/.env and a real generateContent call.
 * Run from anywhere:  node server/scripts/test-gemini.mjs
 * Or from server/:     npm run test:gemini
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(serverDir, '.env') });

const key = (process.env.GEMINI_API_KEY || '').trim();
const model = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();

if (!key) {
  console.error('❌ server/.env ішінде GEMINI_API_KEY жоқ немесе бос.');
  console.error('   Кілтті https://aistudio.google.com/apikey алып, тек server/.env файлына қойыңыз (client/.env емес).');
  process.exit(1);
}

const { evaluateWithGemini } = await import('../src/services/geminiClient.js');

console.info(`Тексеру: model=${model}, key=${key.slice(0, 6)}…${key.slice(-4)}`);

try {
  const result = await evaluateWithGemini({
    apiKey: key,
    model,
    title: 'Сызық бойымен жүретін робот',
    description:
      'EV3 платформасында түсті сенсормен сызықты қадағалайтын робот жасадым. PID реттеу қолдандым, мотор қуатын теңестірдім.',
    tools: ['ev3'],
  });
  console.info('✅ Gemini жауабы дұрыс келді:');
  console.info(JSON.stringify(result, null, 2));
  process.exit(0);
} catch (e) {
  console.error('❌ Gemini қатесі:', e?.message || e);
  console.error('   Модель атауын тексеріңіз (GEMINI_MODEL), квотаны AI Studio-да қараңыз.');
  process.exit(1);
}
