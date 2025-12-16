import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Kích hoạt extension OpenAPI cho Zod
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const MediaAssetSchema = registry.register('MediaAsset', z.object({
    id: z.string().uuid(),
    type: z.enum(['IMAGE', 'VIDEO', 'FILE']),
    url: z.string().min(1).openapi({ description: 'Bucket/key path; prepend host:port on the client' }),
}));

export const UserProfileSchema = registry.register('UserProfile', z.object({
    id: z.string().uuid(),
    fullName: z.string().nullable(),
    nickName: z.string().nullable(),
    avatar: MediaAssetSchema.nullable(),
}));

export const ErrorResponse = registry.register('ErrorResponse', z.object({
    statusCode: z.number().int(),
    message: z.string(),
    error: z.string().optional(),
}));

export const PublicUserProfile = registry.register('PublicUserProfile', z.object({
    fullName: z.string().nullable(),
    nickName: z.string().nullable(),
    avatar: MediaAssetSchema.nullable(),
    dob: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    isLocked: z.boolean(),
}));

export const UserInfoResponse = registry.register('UserInfoResponse', z.object({
    email: z.email(),
    fullName: z.string().nullable(),
    nickName: z.string().nullable(),
    avatar: MediaAssetSchema.nullable(),
    dob: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    role: z.enum(['USER', 'ADMIN']),
    isLocked: z.boolean(),
}));
