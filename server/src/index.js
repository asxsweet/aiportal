import { connectDb } from './config/db.js';
import app from './app.js';
import { config } from './config.js';

try {
  await connectDb();
} catch (err) {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});

// Long-running POST /api/projects (upload + Gemini) — avoid Node closing the socket early
server.requestTimeout = 180_000;
server.headersTimeout = 185_000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[EADDRINUSE] Порт ${config.port} бос емес (басқа Node/сервер қолданып тұр).\n` +
        `  • Бұрынғы терминалдағы npm run dev-ті тоқтатыңыз (Ctrl+C), немесе\n` +
        `  • server/.env ішінде басқа порт қойыңыз: PORT=4002\n` +
        `    содан кейін client іске қосқанда: VITE_PROXY_TARGET=http://localhost:4002\n`,
    );
    process.exit(1);
  }
  throw err;
});
