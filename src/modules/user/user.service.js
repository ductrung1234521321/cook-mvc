import { prisma } from "../../libs/prisma.js";
import { ApiError } from "../../middlewares/error.js";
import { StatusCodes } from "http-status-codes";
import { appEvents, EVENT_NAMES } from "../../libs/events.js";

const followUserSelect = {
  id: true,
  fullName: true,
  nickName: true,
  avatar: {
    select: {
      id: true,
      type: true,
      url: true,
    },
  },
};

async function ensureUserExists(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  return user;
}

async function checkFollowing(userId, targetUserId) {
  if (!userId || !targetUserId) return false;

  const result = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: targetUserId,
      },
    },
  });
  return !!result;
}

export const userService = {
  updateAvatar: async (userId, avatarId) => {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatarId: avatarId,
      },
    });
    return updatedUser;
  },

  getUserInfo: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        nickName: true,
        dob: true,
        address: true,
        phone: true,
        role: true,
        isLocked: true,
        avatar: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return user;
  },

  getUserById: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId, isLocked: false },
      select: {
        fullName: true,
        nickName: true,
        dob: true,
        address: true,
        phone: true,
        isLocked: true,
        avatar: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    });
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return user;
  },

  updateUserInfo: async (userId, payload) => {
    return prisma.user.update({
      where: { id: userId },
      data: payload,
      select: {
        email: false,
        fullName: true,
        nickName: true,
        dob: true,
        address: true,
        phone: true,
        role: true,
        isLocked: true,
        avatar: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
      },
    });
  },

  followUser: async (followerId, targetUserId) => {
    if (followerId === targetUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot follow yourself");
    }

    await ensureUserExists(targetUserId);

    await prisma.userFollow.upsert({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
      update: {},
      create: {
        followerId,
        followingId: targetUserId,
      },
    });

    appEvents.emit(EVENT_NAMES.USER_FOLLOWED, {
      followerId,
      targetUserId,
    });

    return { ok: true };
  },

  unfollowUser: async (followerId, targetUserId) => {
    if (followerId === targetUserId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot unfollow yourself");
    }

    await ensureUserExists(targetUserId);

    const result = await prisma.userFollow.deleteMany({
      where: {
        followerId,
        followingId: targetUserId,
      },
    });

    if (result.count === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Follow relationship not found");
    }

    return { ok: true };
  },

  listFollowers: async (targetUserId, page = 1, limit = 10, userId) => {
    await ensureUserExists(targetUserId);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followingId: targetUserId },
        include: {
          follower: { select: followUserSelect },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followingId: targetUserId } }),
    ]);

    const checkFollow = await checkFollowing(userId, targetUserId);


    return {
      page,
      limit,
      checkFollow,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((i) => i.follower),
    };
  },

  listFollowing: async (followerId, page = 1, limit = 10) => {
    await ensureUserExists(followerId);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId },
        include: {
          following: { select: followUserSelect },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followerId } }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map((i) => i.following),
    };
  },
};
