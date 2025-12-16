import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { registry as authRegistry } from '../modules/auth/auth.schemas.js';
import { registerAuthRoutes } from '../modules/auth/auth.routes.js'; // This is now correct

import { registry as commonRegistry } from '../modules/common/common.schemas.js';

export function generateOpenAPIDocument() {
    const registry = new OpenAPIRegistry();

    // Merge all schemas from different modules
    registry.merge(authRegistry);
    registry.merge(commonRegistry);

    // Register all routes
    registerAuthRoutes(registry); // This function now exists and will work
    // otherModuleRoutes(registry);

    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'My API',
            description: 'This is the API for my application',
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
        },
    });
}