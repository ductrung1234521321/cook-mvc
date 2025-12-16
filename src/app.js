import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { httpLogger } from './libs/logger.js';
import { requestId } from './middlewares/requestId.js';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/error.js';
import { mountSwagger } from './config/swagger.js';
import env from './config/env.js';

export function createApp() {
  const app = express();
  // Helmet config tuned for local dev Swagger: disable COOP/COEP/OAC and drop HSTS/CSP when not using HTTPS
  const helmetOptions = {
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    originAgentCluster: false,
  };
  if (!env.HTTPS_ENABLED) {
    helmetOptions.hsts = false;
    helmetOptions.contentSecurityPolicy = false; // avoid upgrade-insecure-requests forcing https
  }
  app.use(helmet(helmetOptions));
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(requestId);
  app.use(httpLogger);

  mountSwagger(app);          // /docs
  
  app.get('/', (_req, res) => res.redirect('/docs'));
  app.use('/api', routes);    // /api/health

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
