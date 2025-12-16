import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registry as authRegistry } from '../modules/auth/auth.schemas.js';
import { registry as recipeRegistry } from '../modules/recipes/recipe.schemas.js';
import { registry as userRegistry } from '../modules/user/user.schemas.js';
import { registry as commonRegistry } from '../modules/common/common.schemas.js';
import { registry as deviceRegistry } from '../modules/device/device.schemas.js';

export function generateOpenApiSchemas() {
    const registry = new OpenAPIRegistry([
        commonRegistry,
        authRegistry,
        recipeRegistry,
        userRegistry,
        deviceRegistry,
    ]);

    const generator = new OpenApiGeneratorV3(registry.definitions);
    const components = generator.generateComponents();

    return components.components?.schemas ?? {};
}
