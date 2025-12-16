import { asyncHandler } from "../../middlewares/async.js";
import { deviceService } from "./device.service.js";

export const deviceController = {
  register: asyncHandler(async (req, res) => {
    await deviceService.register({
      userId: req.user.id,
      fcmToken: req.body.fcmToken,
      platform: req.body.platform,
    });
    res.json({ ok: true });
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await deviceService.delete({
      userId: req.user.id,
      fcmToken: req.body.fcmToken,
    });
    res.json(result);
  }),
};
