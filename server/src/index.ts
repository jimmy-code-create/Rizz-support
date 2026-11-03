import 'dotenv/config';
import { loadConfig } from './config.ts';
import { createApp } from './app.ts';

const config = loadConfig();
const { app, close } = createApp({
  dataDir: config.dataDir,
  adminToken: config.adminToken,
  clientDist: config.clientDist,
  rateLimit: true,
});

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[support-api] listening on http://0.0.0.0:${config.port}`);
  if (!config.adminToken) {
    console.log('[support-api] admin API disabled (set SUPPORT_ADMIN_TOKEN to enable it)');
  }
});

function shutdown(signal: string) {
  console.log(`[support-api] ${signal} received, shutting down`);
  server.close(() => {
    close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
