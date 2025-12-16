import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import {auth} from "../../middlewares/auth.js";
import { userController } from "./user.controller.js";
import { FollowListSchema, FollowParamsSchema, GetUserByIdSchema, UpdateAvatarSchema, UpdateUserInfoSchema } from "./user.schemas.js";

const r = Router();

/**
 * @openapi
 * /user/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAvatarRequest'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 */
r.put('/avatar', auth(), validate(UpdateAvatarSchema), userController.updateAvatar);

/**
 * @openapi
 * /user:
 *   patch:
 *     summary: Update current user info
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInfoRequest'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfoResponse'
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 */
r.patch('/', auth(), validate(UpdateUserInfoSchema), userController.updateUserInfo);

/**
 * @openapi
 * /user/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [User]
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
 *       '200': { description: Followed }
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 *       '404': { description: User not found }
 */
r.post('/:id/follow', auth(), validate(FollowParamsSchema), userController.followUser);

/**
 * @openapi
 * /user/{id}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [User]
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
 *       '200': { description: Unfollowed }
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 *       '404': { description: Follow relationship not found }
 */
r.delete('/:id/follow', auth(), validate(FollowParamsSchema), userController.unfollowUser);

/**
 * @openapi
 * /user/{id}/followers:
 *   get:
 *     summary: List followers of a user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Public endpoint; send bearer token optionally for personalization.
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
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 totalPages: { type: integer }
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *       '400': { description: Bad Request }
 *       '404': { description: User not found }
 */
r.get('/:id/followers', auth(false), validate(FollowListSchema), userController.listFollowers);

/**
 * @openapi
 * /user/{id}/following:
 *   get:
 *     summary: List users that a user is following
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     description: Public endpoint; send bearer token optionally for personalization.
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
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 totalPages: { type: integer }
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProfile'
 *       '400': { description: Bad Request }
 *       '404': { description: User not found }
 */
r.get('/:id/following', auth(false), validate(FollowListSchema), userController.listFollowing);

/**
 * @openapi
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     description: >
 *       Returns the authenticated user's full profile when the path `id` matches the requester,
 *       otherwise returns the public profile for that user.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UserInfoResponse'
 *                 - $ref: '#/components/schemas/PublicUserProfile'
 *       '400': { description: Bad Request }
 *       '401': { description: Unauthorized }
 */
r.get('/:id', auth(), validate(GetUserByIdSchema), userController.getUserById);

export default r;
