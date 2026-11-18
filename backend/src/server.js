import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`[api] Kharna API listening on http://localhost:${env.port}/api/v1`);
    console.log(`[api] Allowing client origins: ${env.clientUrls.join(', ')}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received — shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 8000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((error) => {
  console.error('[api] Failed to start', error);
  process.exit(1);
});
