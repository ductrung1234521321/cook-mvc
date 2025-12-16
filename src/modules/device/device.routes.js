import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";
import { deviceController } from "./device.controller.js";
import { DeviceDeleteSchema, DeviceRegisterSchema } from "./device.schemas.js";

const r = Router();

/**
 * @openapi
 * /devices/register:
 *   post:
 *     summary: Lưu/ cập nhật FCM token cho thiết bị
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeviceRegisterRequest' }
 *           example:
 *             fcmToken: "fcm-token-123"
 *             platform: "ANDROID"
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
r.post('/register', auth(), validate(DeviceRegisterSchema), deviceController.register);

/**
 * @openapi
 * /devices/delete:
 *   post:
 *     summary: Xoá FCM token khỏi thiết bị (logout)
 *     tags: [Device]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/DeviceDeleteRequest' }
 *           example:
 *             fcmToken: "fcm-token-123"
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
r.post('/delete', auth(), validate(DeviceDeleteSchema), deviceController.delete);

export default r;
