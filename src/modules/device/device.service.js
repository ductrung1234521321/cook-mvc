import { prisma } from "../../libs/prisma.js";
import { ApiError } from "../../middlewares/error.js";
import { StatusCodes } from "http-status-codes";

export const deviceService = {
  async register({ userId, fcmToken, platform }) {
    if (!fcmToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing fcmToken", "MISSING_FCM_TOKEN");
    }

    await prisma.device.upsert({
      where: { userId_fcmToken: { userId, fcmToken } },
      update: { platform, lastSeenAt: new Date() },
      create: { userId, fcmToken, platform, lastSeenAt: new Date() },
    });
    return { ok: true };
  },

  async delete({ userId, fcmToken }) {
    if (!fcmToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing fcmToken", "MISSING_FCM_TOKEN");
    }
    const result = await prisma.device.deleteMany({
      where: { userId, fcmToken },
    });
    return { ok: true, deleted: result.count };
  },
};
