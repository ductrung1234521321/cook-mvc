import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { UserProfileSchema } from '../common/common.schemas.js';


extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// --- Reusable sub-schemas ---

const DeviceSchema = registry.register('Device', z.object({
    platform: z.enum(['ANDROID', 'IOS', 'WEB']).optional(),
    fcmToken: z.string().optional(),
}));


// --- Request Schemas ---

export const RegisterRequest = registry.register('RegisterRequest', z.object({
    email: z.email(),
    password: z.string().min(8),
    fullName: z.string().optional(),
    nickName: z.string().optional(),
    dob: z.string().optional().describe('Date of birth in ISO 8601 format'),
    address: z.string().optional(),
    phone: z.string().optional(),
    avatarId: z.uuid().optional(),
    device: DeviceSchema.optional(),
}));

export const LoginRequest = registry.register('LoginRequest', z.object({
    email: z.string().email(),
    password: z.string().min(8),
    device: DeviceSchema.optional(),
}));

export const FirebaseLoginRequest = registry.register('FirebaseLoginRequest', z.object({
    idToken: z.string().min(10),
    device: DeviceSchema.optional(),
}));

export const RefreshRequest = registry.register('RefreshRequest', z.object({
    refreshToken: z.string().min(10),
}));


// --- Validation Schemas (for middleware) ---

export const RegisterSchema = z.object({
    body: RegisterRequest,
});

export const LoginSchema = z.object({
    body: LoginRequest,
});

export const FirebaseLoginSchema = z.object({
    body: FirebaseLoginRequest,
});

export const RefreshSchema = z.object({
    body: RefreshRequest,
});


// --- Response Schemas ---

export const AuthTokens = registry.register('AuthTokens', z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
}));

export const UserAuthResponse = registry.register('UserAuthResponse', UserProfileSchema.pick({ id: true }).extend({
    email: z.string().email(),
    role: z.enum(['USER', 'ADMIN']),
}));

export const LoginResponse = registry.register('LoginResponse', AuthTokens.extend({
    user: UserAuthResponse,
}));

export const RegisterResponse = registry.register('RegisterResponse', LoginResponse);

export const RefreshResponse = registry.register('RefreshResponse', AuthTokens);
