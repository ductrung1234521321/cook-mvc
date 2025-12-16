import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import {auth} from "../../middlewares/auth.js";
import { recipeController } from "./recipe.controller.js";
import { CreateCommentSchema, CreateRecipeSchema, ListCommentsSchema, UpdateRecipeSchema, RecipeIdParamsSchema, OwnerRecipesParamsSchema } from "./recipe.schemas.js";

const r = Router();

// Create recipe
/**
 * @openapi
 * /recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRecipeRequest'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 */
r.post('/', auth(), validate(CreateRecipeSchema), recipeController.createRecipe);
/**
 * @openapi
 * /recipes:
 *   get:
 *     summary: List recipes (paginated)
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         required: false
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         required: false
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRecipes'
 */
r.get('/', recipeController.listRecipes);
/**
 * @openapi
 * /recipes/owner:
 *   get:
 *     summary: List recipes created by the authenticated user
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     description: For the owner's home/profile page of the current user.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRecipes'
 *       '401': { description: Unauthorized }
 */
r.get('/owner', auth(), recipeController.listRecipesByOwner);

/**
 * @openapi
 * /recipes/owner/{userId}:
 *   get:
 *     summary: List recipes created by a specific user
 *     tags:
 *       - Recipes
 *     description: For viewing another user's recipe list on their public page. Auth optional.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedRecipes'
 *       '401': { description: Unauthorized }
 */
r.get('/owner/:userId', auth(false), validate(OwnerRecipesParamsSchema), recipeController.listRecipesByOwner);
/**
 * @openapi
 * /recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       '404': { description: Not Found }
 */
r.get('/:id', validate(RecipeIdParamsSchema), recipeController.getRecipeById);

/**
 * @openapi
 * /recipes/{id}/like:
 *   post:
 *     summary: Like a recipe
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Liked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeLikeResponse'
 *       '401': { description: Unauthorized }
 *       '404': { description: Not Found }
 */
r.post('/:id/like', auth(), validate(RecipeIdParamsSchema), recipeController.likeRecipe);

/**
 * @openapi
 * /recipes/{id}/like:
 *   delete:
 *     summary: Unlike a recipe
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Unliked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeLikeResponse'
 *       '401': { description: Unauthorized }
 *       '404': { description: Not Found }
 */
r.delete('/:id/like', auth(), validate(RecipeIdParamsSchema), recipeController.unlikeRecipe);

/**
 * @openapi
 * /recipes/{id}/comments:
 *   get:
 *     summary: Lấy danh sách bình luận của công thức
 *     tags:
 *       - Recipes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedComments'
 *       '404': { description: Not Found }
 */
r.get('/:id/comments', validate(ListCommentsSchema), recipeController.listComments);

/**
 * @openapi
 * /recipes/{id}/comments:
 *   post:
 *     summary: Thêm bình luận vào công thức
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipeCommentResponse'
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 *       '404': { description: Not Found }
 */
r.post('/:id/comments', auth(), validate(CreateCommentSchema), recipeController.createComment);

/**
 * @openapi
 * /recipes/{id}:
 *   patch:
 *     summary: Update a recipe (author only)
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecipeRequest'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       '401': { description: Unauthorized }
 *       '403': { description: Forbidden }
 *       '404': { description: Not Found }
 */
r.patch('/:id', auth(), validate(RecipeIdParamsSchema), validate(UpdateRecipeSchema), recipeController.updateRecipe);

export default r;
