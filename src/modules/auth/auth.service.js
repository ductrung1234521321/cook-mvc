import { signAccessToken } from "../../libs/jwt.js";
import { prisma } from "../../libs/prisma.js";
import { ApiError } from "../../middlewares/error.js";
import bcrypt from "bcrypt";
import { generateRefreshToken, hashToken, plusDays } from "../../libs/refresh.js"
import { StatusCodes } from "http-status-codes";
import crypto from "crypto";
import { getFirebaseAuth, isFirebaseEnabled } from "../../libs/firebase.js";

const RT_DAYS = Number(process.env.RT_DAYS) || 7;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
const userSelect = {
    id: true,
    email: true,
    role: true,
    fullName: true,
    nickName: true,
    dob: true,
    address: true,
    phone: true,
    avatarId: true,
    isLocked: true,
    avatar: {
        select: {
            id: true,
            type: true,
            url: true,
        },
    },
};

async function issueRefreshToken(tx, userId){
    const token = generateRefreshToken();
    const tokenHash = hashToken(token);
    const expiresAt = plusDays(new Date(), RT_DAYS);

    await tx.refreshToken.create({
        data: {
            userId,
            tokenHash,
            expiresAt,
        },
    });

    return token;
}

async function upsertDevice(tx, userId, device){
    if(!device) return;
    const {platform, fcmToken} = device;
    if(fcmToken){
        await tx.device.upsert({
            where: { userId_fcmToken: { userId, fcmToken } },
            update: { platform, lastSeenAt: new Date() },
            create: { userId, platform, fcmToken, lastSeenAt: new Date() },
        });
    } else {
        await tx.device.create({data: {userId, platform, lastSeenAt: new Date()}})
    }
}


export const authService = {
    async register(payload) {
        const { email, password, device, ...profile } = payload;
        const existed = await prisma.user.findUnique({where: { email } });
        if (existed) throw new ApiError(StatusCodes.CONFLICT, 'Email already exists', "EMAIL_TAKEN");

        const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        return prisma.$transaction(async (tx) =>{
            const user = await tx.user.create({
                data: {email, password: hash, role: "USER", ...profile},
                select: userSelect,
            });
            await upsertDevice(tx, user.id, device);
            const refreshToken = await issueRefreshToken(tx, user.id);
            const accessToken = signAccessToken(user);
            return { accessToken, refreshToken, user };
        });
    },

    async login({ email, password, device}){
        const user = await prisma.user.findUnique({
            where: { email },
            select: { ...userSelect, password: true },
        });
        if(!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials", "BAD_CREDENTIALS");
        if(user.isLocked) throw new ApiError(StatusCodes.FORBIDDEN, "Account is locked", "ACCOUNT_LOCKED");
        
        const ok = await bcrypt.compare(password, user.password);
        if(!ok) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials", "BAD_CREDENTIALS");
        const { password: _pw, ...safeUser } = user;

        return prisma.$transaction(async (tx) => {
            await upsertDevice(tx, user.id, device);
            const refreshToken = await issueRefreshToken(tx, user.id);
            const accessToken = signAccessToken(user);
            return { accessToken, refreshToken, user: safeUser };
        });
    },

    async firebaseLogin({ idToken, device }) {
        if (!isFirebaseEnabled()) {
            throw new ApiError(StatusCodes.SERVICE_UNAVAILABLE, "Firebase is not configured", "FIREBASE_DISABLED");
        }

        let decoded;
        try {
            const auth = getFirebaseAuth();
            decoded = await auth.verifyIdToken(idToken);
        } catch (err) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Firebase ID token", "BAD_ID_TOKEN");
        }

        const email = decoded.email;
        const name = decoded.name;
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Firebase token missing email", "MISSING_EMAIL");
        }

        return prisma.$transaction(async (tx) => {
            let user = await tx.user.findUnique({
                where: { email },
                select: userSelect,
            });

            if (!user) {
                const randomPassword = crypto.randomBytes(32).toString("hex");
                const hash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);
                user = await tx.user.create({
                    data: {
                        email,
                        password: hash,
                        role: "USER",
                        fullName: name ?? null,
                    },
                    select: userSelect,
                });
            }

            if (user.isLocked) {
                throw new ApiError(StatusCodes.FORBIDDEN, "Account is locked", "ACCOUNT_LOCKED");
            }

            await upsertDevice(tx, user.id, device);
            const refreshToken = await issueRefreshToken(tx, user.id);
            const accessToken = signAccessToken(user);
            return { accessToken, refreshToken, user };
        });
    },

    async refresh({ refreshToken}){
        const rtHash = hashToken(refreshToken);
        const record = await prisma.refreshToken.findFirst({
            where: { tokenHash: rtHash, revokedAt: null},
        });
        if(!record) throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token", "BAD_REFRESH");
        if(record.expiresAt < new Date()) throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token expired", "REFRESH_EXPIRED");

        const user = await prisma.user.findUnique({
            where: { id: record.userId},
            select: {
                id: true,
                role: true,
                avatarId: true,
            },
        });
        if (!user) throw new ApiError (StatusCodes.UNAUTHORIZED, "Invalid refresh token", "BAD_REFRESH");

        return prisma.$transaction(async (tx) => {
            await tx.refreshToken.update({
                where: {id: record.id},
                data: { revokedAt: new Date()},
            });

            const newRT = await issueRefreshToken(tx, user.id);
            const access = signAccessToken(user);
            return {
                accessToken: access,
                refreshToken: newRT
            }
        });
    },

    async logout(userId){
        await prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null},
            data: { revokedAt: new Date()},
        });
        return {ok: true};
    }
}
