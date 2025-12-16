import { asyncHandler } from "../../middlewares/async.js";
import { StatusCodes } from "http-status-codes";
import { userService } from "./user.service.js";

export const userController = {
  updateAvatar: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { avatarId } = req.body;
    const user = await userService.updateAvatar(userId, avatarId);
    res.status(StatusCodes.OK).json(user);
  }),

  getUserById: asyncHandler(async (req, res) => {
    if(req.params.id === req.user.id){
      const userInfo = await userService.getUserInfo(req.user.id);
      res.status(StatusCodes.OK).json(userInfo);
    }else{
      const userInfo = await userService.getUserById(req.params.id);
      res.status(StatusCodes.OK).json(userInfo);
    }

  }),

  updateUserInfo: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userInfo = await userService.updateUserInfo(userId, req.body);
    res.status(StatusCodes.OK).json(userInfo);
  }),

  followUser: asyncHandler(async (req, res) => {
    const followerId = req.user.id;
    const targetUserId = req.params.id;
    const result = await userService.followUser(followerId, targetUserId);
    res.status(StatusCodes.OK).json(result);
  }),

  unfollowUser: asyncHandler(async (req, res) => {
    const followerId = req.user.id;
    const targetUserId = req.params.id;
    const result = await userService.unfollowUser(followerId, targetUserId);
    res.status(StatusCodes.OK).json(result);
  }),

  listFollowers: asyncHandler(async (req, res) => {
    const targetUserId = req.params.id;
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await userService.listFollowers(targetUserId, page, limit, userId);
    res.status(StatusCodes.OK).json(result);
  }),

  listFollowing: asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await userService.listFollowing(userId, page, limit);
    res.status(StatusCodes.OK).json(result);
  }),
};
