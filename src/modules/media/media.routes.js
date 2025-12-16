import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { mediaController } from "./media.controller.js";

const r = Router();

/**
 * @openapi
 * /media/owner:
 *   get:
 *     summary: List current user's media assets
 *     tags:
 *       - Media
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: OK
 *       '401':
 *         description: Unauthorized
 */
r.get('/owner', auth(), mediaController.listMediaByOwner);

/**
 * @openapi
 * /media/{id}:
 *   delete:
 *     summary: Delete a media asset
 *     tags:
 *       - Media
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
 *       '204':
 *         description: No Content
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Not Found
 */
r.delete('/:id', auth(), mediaController.deleteMedia);

export default r;