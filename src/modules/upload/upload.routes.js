import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { uploadSingle } from "../../middlewares/upload.js";
import { uploadController } from "../upload/upload.controller.js";

const r = Router();
/**
 * @openapi
 * /upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - type
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *               type:
 *                 type: string
 *                 enum: ['IMAGE', 'VIDEO', 'FILE']
 *                 description: The type of media being uploaded.
 *                 example: 'IMAGE'
 *     responses:
 *       201:
 *         description: Created
 *       401: { description: Unauthorized }
 *       400: { description: Bad Request (e.g., no file, file too large) }
 */
r.post('/image', auth(), uploadSingle('file'), uploadController.upload) 


export default r;