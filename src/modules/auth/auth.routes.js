import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { authController } from "./auth.controller.js";
import { FirebaseLoginSchema, LoginSchema, RefreshSchema, RegisterSchema } from "./auth.schemas.js";

const r = Router();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterRequest' }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RegisterResponse' }
 *       409: { description: Conflict, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
r.post('/register', validate(RegisterSchema), authController.register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginRequest' }
 *           example:
 *             email: "ductrung@gmail.com"
 *             password: "admin123"
 *             device:
 *               platform: "ANDROID"
 *               fcmToken: "fcm-token-123"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       401: { description: Unauthorized, content: { application/json: { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
 */
r.post('/login', validate(LoginSchema), authController.login);
/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RefreshRequest' }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/RefreshResponse' } } } }
 *       401: { description: Unauthorized }
 */
r.post('/refresh', validate(RefreshSchema), authController.refresh);
r.post('/logout', auth(), authController.logout);
/**
 * @openapi
 * /auth/firebase-login:
 *   post:
 *     summary: Login with Firebase ID token (Google)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/FirebaseLoginRequest' }
 *           example:
 *             idToken: "<firebase_id_token>"
 *             device:
 *               platform: "ANDROID"
 *               fcmToken: "fcm-token-123"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       401: { description: Unauthorized }
 */
r.post('/firebase-login', validate(FirebaseLoginSchema), authController.firebaseLogin);
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Current user (id, role)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
r.get('/me', auth(), authController.me);

export default r;
