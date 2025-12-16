import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';
import { generateOpenApiSchemas } from '../libs/openapi.js';

export const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Node MVC API', version: '1.0.0' },
    servers: [{ url: '/api' }], // KHÔNG viết /api trong path của JSDoc nữa
    components: {
      securitySchemes: {
        bearerAuth: {                // <— nút Authorize sẽ xuất hiện
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: generateOpenApiSchemas(),
    }
  },
  apis: ['src/**/*.routes.js'],   // QUAN TRỌNG: đường dẫn tới file routes
});

const swaggerOptions = {
  explorer: true,
};

export function mountSwagger(app) {
  const r = Router();
  // Serve raw spec for tooling and ensure assets load correctly under /docs
  r.get('/docs/openapi.json', (_req, res) => res.json(spec));
  r.use(
    '/docs',
    swaggerUi.serveFiles(spec, swaggerOptions),
    swaggerUi.setup(spec, swaggerOptions)
  );
  app.use(r);
}
