import http from 'http';
import https from 'https';
import fs from 'fs';
import env from './config/env.js';
import { createApp } from './app.js';
import { initMinio } from './config/s3.js';
import { initSocket } from './libs/socket.js';
import { initMongo } from './libs/mongo.js';
import { registerNotificationListeners } from './libs/notificationListeners.js';

function buildServer(app) {
  if (!env.HTTPS_ENABLED) {
    return { server: http.createServer(app), protocol: 'http' };
  }

  if (!env.SSL_KEY_PATH || !env.SSL_CERT_PATH) {
    throw new Error('HTTPS enabled but SSL_KEY_PATH or SSL_CERT_PATH is missing');
  }

  const credentials = {
    key: fs.readFileSync(env.SSL_KEY_PATH),
    cert: fs.readFileSync(env.SSL_CERT_PATH),
  };

  return { server: https.createServer(credentials, app), protocol: 'https' };
}

async function startServer() {
  try {
    await initMinio(); // Ensure the bucket exists before handling uploads
    await initMongo(); // Connect MongoDB for comments/likes
    registerNotificationListeners(); // Setup in-process push listeners
    const app = createApp();
    const { server, protocol } = buildServer(app);
    initSocket(server);

    const displayHost = env.PUBLIC_HOST || env.HOST;

    server.listen(env.PORT, env.BIND_HOST, () => {
      console.log(`[${env.NODE_ENV}] API listening at ${protocol}://${displayHost}:${env.PORT}`);
      console.log(`Swagger UI: ${protocol}://${displayHost}:${env.PORT}/docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
