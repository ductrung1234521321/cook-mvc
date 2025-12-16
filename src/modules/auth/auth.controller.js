import { asyncHandler } from "../../middlewares/async.js";
import { authService } from "./auth.service.js";
import { userService } from "../user/user.service.js";

export const authController = {
    register: asyncHandler(async (req, res) => {
        const { accessToken, refreshToken, user} = await authService.register(req.body);
        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatar?.url || null,
            },
        });
    }),

    login: asyncHandler(async (req, res) => {
        const { accessToken, refreshToken, user} = await authService.login(req.body);
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatar?.url || null,
            },
        });
    }),

    refresh: asyncHandler(async (req, res) => {
        const { accessToken, refreshToken } = await authService.refresh(req.body);
        res.json({accessToken, refreshToken});
    }),

    logout: asyncHandler(async (req, res) => {
        await authService.logout(req.user.id);
        res.json({ok: true});
    }),

    firebaseLogin: asyncHandler(async (req, res) => {
        const { accessToken, refreshToken, user } = await authService.firebaseLogin(req.body);
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatar?.url || null,
            },
        });
    }),

    me: asyncHandler(async (req, res) => {
        const user = await userService.getUserInfo(req.user.id);
        res.json({
            id: req.user.id,
            role: req.user.role,
            avatarUrl: user.avatar?.url || null,
        });
    }),
}
