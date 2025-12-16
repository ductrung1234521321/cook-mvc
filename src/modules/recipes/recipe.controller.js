import { asyncHandler } from "../../middlewares/async.js";
import { StatusCodes } from "http-status-codes";
import { recipeService } from "./recipe.service.js";
import { ApiError } from "../../middlewares/error.js";

export const recipeController = {
    createRecipe: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const payload = req.body;
        const recipe = await recipeService.CreateRecipe(userId, payload);
        res.status(201).json(recipe);
    }),

    updateRecipe: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;
        const payload = req.body;

        const updated = await recipeService.UpdateRecipeByUser(userId, recipeId, payload);
        res.status(200).json(updated);
    }),
    
    listRecipes: asyncHandler(async (req, res) => {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const data = await recipeService.ListRecipes(page, limit);
        res.status(200).json(data);
    }),

    listRecipesByOwner: asyncHandler(async (req, res) => {
        const userId = req.params.userId || req.user?.id;
        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'userId is required');
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const data = await recipeService.ListRecipesByUser(userId, page, limit);
        res.status(200).json(data);
    }),

    getRecipeById: asyncHandler(async (req, res) => {
        const recipeId = req.params.id;
        const currentUserId = req.user?.id ?? null;
        const recipe = await recipeService.GetRecipeById(recipeId, currentUserId);
        res.status(200).json(recipe);
    }),

    likeRecipe: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;
        const result = await recipeService.LikeRecipe(userId, recipeId);
        res.status(StatusCodes.OK).json(result);
    }),

    unlikeRecipe: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;
        const result = await recipeService.UnlikeRecipe(userId, recipeId);
        res.status(StatusCodes.OK).json(result);
    }),

    createComment: asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const recipeId = req.params.id;
        const payload = req.body;
        const result = await recipeService.CreateComment(userId, recipeId, payload);
        res.status(StatusCodes.CREATED).json(result);
    }),

    listComments: asyncHandler(async (req, res) => {
        const recipeId = req.params.id;
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
        const result = await recipeService.ListComments(recipeId, page, limit);
        res.status(StatusCodes.OK).json(result);
    }),
};

export default recipeController;
