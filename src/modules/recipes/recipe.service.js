import { StatusCodes } from "http-status-codes";
import { normalizeText } from "../../utils/string.js";
import { prisma } from "../../libs/prisma.js";
import { appEvents, EVENT_NAMES } from "../../libs/events.js";
import { ApiError } from "../../middlewares/error.js";
import { getIO } from "../../libs/socket.js";
import { isRecipeLiked, likeRecipeMongo, unlikeRecipeMongo } from "../../libs/likeStore.js";
import {
    insertComment,
    findCommentById,
    listCommentsByRecipe,
    countCommentsByRecipe,
    countReplies,
    listAllCommentsForRecipe,
} from "../../libs/commentStore.js";
import { v4 as uuidv4 } from "uuid";

async function createIngredientItem(tx, name) {
    if (!name) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Ingredient name is required');
    }

    const exits = await tx.ingredient.findUnique({ where: { name } });
    if (exits) return exits;

    return tx.ingredient.create({
        data: { name, nameNorm: normalizeText(name) },
    });
}

async function createRecipeIngredients(tx, recipeId, ingredients) {
    if (!Array.isArray(ingredients)) return;
    for (let i = 0; i < ingredients.length; i++) {
        const item = ingredients[i];
        if (!item || !item.name) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Ingredient at index ${i} is missing required field 'name'`);
        }

        const ingredient = await createIngredientItem(tx, item.name);
        await tx.recipeIngredient.create({
            data: {
                recipeId,
                ingredientId: ingredient.id,
                qtyNum: item.qtyNum,
                qtyText: item.qtyText,
                unit: item.unit,
            },
        });
    }
}
async function createTagItem(tx,name) {
    const exits = await tx.tag.findUnique({

        where: { name },
    });
    if (exits) return exits;

    return tx.tag.create({
        data: { name, nameNorm: normalizeText(name)},
    });
}

async function createRecipeTags(tx, recipeId, tags) {
    for (const name of tags) {
        const tag = await createTagItem(tx,name);
        await tx.recipeTag.create({
            data: {
                recipeId,
                tagId: tag.id,
            },
        });
    }
}

async function createStepMedia(tx, step, mediaItem) {
    await tx.stepMedia.create({
                    data: {
                        stepId: step.id,
                        mediaId: mediaItem.mediaId,
                        sortOrder: mediaItem.sortOrder,
                    },
                });
}

async function createRecipeSteps(tx, recipeId, steps) {
    for (let i = 0; i < steps.length; i++) {
        const item = steps[i];
        const step = await tx.recipeStep.create({
            data: {
                recipeId,
                stepNo: i+1,
                title: item.title,
                body: item.body,
                durationSec: item.durationSec,
                primaryMediaId: item.mediaId,
            },
        });

        if (item.medias && item.medias.length > 0) {
            for (const mediaItem of item.medias) {
                await createStepMedia(tx, step, mediaItem);
            }
        }
    }
}

async function loadRecipe(recipeId) {
    const recipe = await prisma.recipe.findUnique({
        where: { id: recipeId },
        include: {
            coverMedia: true,
            ingredients: { include: { ingredient: true } },
            steps: {
                include: {
                    primaryMedia: true,
                    stepMedias: { include: { media: true } }
                }
            },
            tags: { include: { tag: true } },
        }
    });

    if (!recipe) return null;

    if (recipe.steps && Array.isArray(recipe.steps)) {
        recipe.steps.sort((a, b) => (a.stepNo || 0) - (b.stepNo || 0));
    }

    const likesCount = recipe.likesCount ?? 0;
    const commentsCount = recipe.commentsCount ?? 0;

    return {
        ...recipe,
        likesCount,
        commentsCount,
    };
}


export const recipeService = {
    async CreateRecipe(userId,payload) {
        const { title, description, coverMediaId, ingredients, steps, tags } = payload;

        return prisma.$transaction(async (tx) => {
            const recipe = await tx.recipe.create({
                data: {
                    authorId: userId,
                    title,
                    titleNorm: normalizeText(title),
                    description,
                    coverMediaId,
                },
            });

            await createRecipeIngredients(tx, recipe.id, ingredients);
            await createRecipeSteps(tx, recipe.id, steps);
            if (tags && tags.length > 0) {
                await createRecipeTags(tx, recipe.id, tags);
            }

            return recipe;
        });
    },

    async ListRecipesByUser(userId, page = 1, limit = 4) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.recipe.findMany({
                where: { authorId: userId },
                include: {
                    coverMedia: true
                },
                skip,
                take: limit,
                orderBy: { created_at: "desc" }
            }),
            prisma.recipe.count({ where: { authorId: userId } })
        ]);

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            items
        };
    },

    async ListRecipes(page = 1, limit = 4) {
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.recipe.findMany({
                include: {
                    author: {
                        select: {
                            id: true,
                            fullName: true,
                            nickName: true,
                            avatar: true,
                        },
                    },
                    coverMedia: true,
                },
                skip,
                take: limit,
                orderBy: { created_at: "desc" }
            }),
            prisma.recipe.count()
        ]);
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            items
        };
    },

    // Get a recipe by id with full related data
    async GetRecipeById(recipeId, currentUserId = null) {
        const recipe = await loadRecipe(recipeId);
        if (!recipe) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }

        // Determine if current user liked this recipe
        let likedByMe = false;
        if (currentUserId) {
            likedByMe = await isRecipeLiked(recipeId, currentUserId);
        }

        const comments = await listAllCommentsForRecipe(recipeId);

        return {
            ...recipe,
            commentsCount: comments.length,
            likedByMe,
            comments,
        };
    },

    // Update a recipe ensuring the requester is the author (userId)
    async UpdateRecipeByUser(userId, recipeId, payload) {
        // Validate ownership
        const existing = await prisma.recipe.findUnique({ where: { id: recipeId } });
        if (!existing) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }
        if (existing.authorId !== userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Not allowed to update this recipe');
        }

        // Perform transactional update. We will update base fields, and if arrays provided,
        // replace ingredients, steps and tags atomically.
        const updated = await prisma.$transaction(async (tx) => {
            const { title, description, coverMediaId, ingredients, steps, tags } = payload;

            // Update base recipe fields
            const data = {};
            if (title !== undefined) {
                data.title = title;
                data.titleNorm = normalizeText(title);
            }
            if (description !== undefined) data.description = description;
            if (coverMediaId !== undefined) data.coverMediaId = coverMediaId;
            if (Object.keys(data).length > 0) {
                data.updated_at = new Date();
                await tx.recipe.update({ where: { id: recipeId }, data });
            }

            // Replace ingredients if provided
            if (Array.isArray(ingredients)) {
                await tx.recipeIngredient.deleteMany({ where: { recipeId } });
                if (ingredients.length > 0) {
                    await createRecipeIngredients(tx, recipeId, ingredients);
                }
            }

            // Replace steps if provided
            if (Array.isArray(steps)) {
                // Remove existing stepMedias first
                const existingSteps = await tx.recipeStep.findMany({ where: { recipeId }, select: { id: true } });
                const stepIds = existingSteps.map(s => s.id);
                if (stepIds.length > 0) {
                    await tx.stepMedia.deleteMany({ where: { stepId: { in: stepIds } } });
                }
                // Remove steps
                await tx.recipeStep.deleteMany({ where: { recipeId } });
                // Create new steps
                if (steps.length > 0) {
                    await createRecipeSteps(tx, recipeId, steps);
                }
            }

            // Replace tags if provided
            if (Array.isArray(tags)) {
                await tx.recipeTag.deleteMany({ where: { recipeId } });
                if (tags.length > 0) {
                    await createRecipeTags(tx, recipeId, tags);
                }
            }

            // Return updated recipe
            const updated = await tx.recipe.findUnique({
                where: { id: recipeId },
                include: {
                    coverMedia: true,
                    ingredients: { include: { ingredient: true } },
                    steps: { include: { primaryMedia: true, stepMedias: { include: { media: true } } } },
                    tags: { include: { tag: true } }
                }
            });

            return updated;
        });

        return updated;
    },

    async LikeRecipe(userId, recipeId) {
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            select: { id: true, authorId: true, title: true },
        });
        if (!recipe) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }

        const likesCount = await likeRecipeMongo(recipeId, userId);
        await prisma.recipe.update({ where: { id: recipeId }, data: { likesCount } });

        appEvents.emit(EVENT_NAMES.RECIPE_LIKED, {
            recipeId,
            actorId: userId,
            recipeTitle: recipe.title,
            authorId: recipe.authorId,
        });

        return { liked: true, likesCount };
    },

    async UnlikeRecipe(userId, recipeId) {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
        if (!recipe) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }

        const likesCount = await unlikeRecipeMongo(recipeId, userId);
        await prisma.recipe.update({ where: { id: recipeId }, data: { likesCount } });

        return { liked: false, likesCount };
    },

    async CreateComment(userId, recipeId, payload) {
        const { content, parentId } = payload;

        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
        if (!recipe) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, fullName: true, nickName: true, avatar: true },
        });
        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found');
        }

        let parent = null;
        if (parentId) {
            parent = await findCommentById(parentId);
            if (!parent || parent.recipeId !== recipeId) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'Parent comment not found in this recipe');
            }
        }

        const depth = parent ? parent.depth + 1 : 0;
        const rootId = parent ? (parent.rootId ?? parent.id) : null;
        const id = uuidv4();
        const now = new Date();
        const path = parent ? `${parent.path ?? parent.id}/${id}` : id;

        const commentDoc = {
            id,
            recipeId,
            userId,
            content,
            depth,
            parentId: parent?.id ?? null,
            rootId,
            path,
            createdAt: now,
            updatedAt: now,
            user,
        };

        const saved = await insertComment(commentDoc);
        const commentsCount = await countCommentsByRecipe(recipeId);
        await prisma.recipe.update({ where: { id: recipeId }, data: { commentsCount } });
        const parentRepliesCount = parent ? await countReplies(parent.id) : null;

        const result = {
            comment: saved,
            commentsCount,
            parentRepliesCount,
        };

        try {
            const io = getIO();
            io.to(String(recipeId)).emit('new_comment', result);
        } catch (err) {
            console.warn(`[socket] emit new_comment failed: ${err.message}`);
        }

        appEvents.emit(EVENT_NAMES.COMMENT_CREATED, {
            recipeId,
            commentId: result.comment.id,
            parentId: result.comment.parentId,
            commentsCount: result.commentsCount,
            parentRepliesCount: result.parentRepliesCount,
            comment: result.comment,
        });

        return result;
    },

    async ListComments(recipeId, page = 1, limit = 10) {
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
        if (!recipe) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Recipe not found');
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            listCommentsByRecipe(recipeId, skip, limit),
            countCommentsByRecipe(recipeId),
        ]);

        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            items,
        };
    }
};
