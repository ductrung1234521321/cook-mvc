import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { MediaAssetSchema, UserProfileSchema } from '../common/common.schemas.js';



extendZodWithOpenApi(z);
export const registry = new OpenAPIRegistry();

// --- Reusable sub-schemas ---

const StepMediaItem = registry.register('StepMediaItem', z.object({
    sortOrder: z.number().int().min(0).optional(),
    mediaId: z.string().uuid(),
}));

const IngredientItem = registry.register('IngredientItem', z.object({
    name: z.string().min(1, "Tên nguyên liệu không được để trống"),
    qtyNum: z.number().optional(),
    qtyText: z.string().optional(),
    unit: z.string().optional(),
}));

const StepItem = registry.register('StepItem', z.object({
    title: z.string().optional(),
    body: z.string().min(1, "Mô tả bước không được để trống"),
    durationSec: z.number().int().positive().optional(),
    mediaId: z.string().uuid().optional(),
    medias: z.array(StepMediaItem).optional(),
}));

const Tag = registry.register('Tag', z.object({
    id: z.number().int(),
    name: z.string(),
}));

const Comment = registry.register('Comment', z.object({
    id: z.uuid(),
    recipeId: z.uuid(),
    userId: z.uuid(),
    content: z.string(),
    depth: z.number().int().nonnegative(),
    parentId: z.uuid().nullable(),
    rootId: z.uuid().nullable(),
    path: z.string().nullable(),
    createdAt: z.string().datetime(),
    user: UserProfileSchema,
}));


// --- Request Schemas ---

export const CreateRecipeRequest = registry.register('CreateRecipeRequest', z.object({
    title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự"),
    description: z.string().optional(),
    coverMediaId: z.string().uuid().optional(),
    ingredients: z.array(IngredientItem).min(1, "Cần ít nhất 1 nguyên liệu"),
    steps: z.array(StepItem).min(1, "Cần ít nhất 1 bước thực hiện"),
    tags: z.array(z.string()).optional(),
}));

export const UpdateRecipeRequest = registry.register(
    'UpdateRecipeRequest',
    CreateRecipeRequest.partial()
);

export const CreateCommentRequest = registry.register('CreateCommentRequest', z.object({
    content: z.string().min(1, "Nội dung bình luận không được để trống"),
    parentId: z.uuid().optional(),
}));


// --- Validation Schemas (for middleware) ---

export const CreateRecipeSchema = z.object({
    body: CreateRecipeRequest,
});

export const UpdateRecipeSchema = z.object({
    body: UpdateRecipeRequest,
});

export const RecipeIdParamsSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: "Invalid recipe id. Expected a UUID (e.g. 00000000-0000-0000-0000-000000000000)." }),
    })
});

export const OwnerRecipesParamsSchema = z.object({
    params: z.object({
        userId: z.string().uuid(),
    }),
});

export const CreateCommentSchema = z.object({
    params: z.object({ id: z.uuid() }),
    body: CreateCommentRequest,
});

export const ListCommentsSchema = z.object({
    params: z.object({ id: z.uuid() }),
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
});


// --- Response Schemas ---

export const RecipeSchema = registry.register('Recipe', z.object({
    id: z.string().uuid(),
    author: UserProfileSchema,
    title: z.string(),
    description: z.string().nullable(),
    coverMedia: MediaAssetSchema.nullable(),
    ingredients: z.array(IngredientItem),
    steps: z.array(StepItem),
    tags: z.array(Tag),
    likesCount: z.number().int(),
    commentsCount: z.number().int(),
    likedByMe: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
}));

export const PaginatedRecipes = registry.register('PaginatedRecipes', z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    items: z.array(RecipeSchema),
}));

export const RecipeLikeResponse = registry.register('RecipeLikeResponse', z.object({
    liked: z.boolean(),
    likesCount: z.number().int(),
}));

export const RecipeCommentResponse = registry.register('RecipeCommentResponse', z.object({
    comment: Comment,
    commentsCount: z.number().int(),
    parentRepliesCount: z.number().int().nullable(),
}));

export const PaginatedComments = registry.register('PaginatedComments', z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
    items: z.array(Comment),
}));
