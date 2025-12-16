import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { UserProfileSchema } from '../common/common.schemas.js';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const UpdateAvatarRequest = registry.register('UpdateAvatarRequest', z.object({
  avatarId: z.uuid("Invalid Avatar UUID").openapi({
    description: "UUID of the avatar media asset",
    example: "00000000-0000-0000-0000-000000000000",
  })
}));

export const UpdateAvatarSchema = z.object({
  body: UpdateAvatarRequest,
});

export const UserResponse = registry.register('User', UserProfileSchema);


export const GetUserByIdSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const FollowParamsSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),
});

export const FollowListSchema = z.object({
  params: FollowParamsSchema.shape.params,
  query: PaginationQuery,
});

const UpdateUserInfoBody = z.object({
  fullName: z.string().nullable(),
  nickName: z.string().nullable(),
  dob: z.string().nullable(),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  isLocked: z.boolean().nullable(),
})
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

export const UpdateUserInfoRequest = registry.register('UpdateUserInfoRequest', UpdateUserInfoBody);

export const UpdateUserInfoSchema = z.object({
  body: UpdateUserInfoRequest,
});
