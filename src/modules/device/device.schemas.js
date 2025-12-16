import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const DeviceRegisterRequest = registry.register('DeviceRegisterRequest', z.object({
  fcmToken: z.string().min(10),
  platform: z.enum(['ANDROID', 'IOS', 'WEB']).optional(),
}));

export const DeviceDeleteRequest = registry.register('DeviceDeleteRequest', z.object({
  fcmToken: z.string().min(10),
}));

export const DeviceRegisterSchema = z.object({
  body: DeviceRegisterRequest,
});

export const DeviceDeleteSchema = z.object({
  body: DeviceDeleteRequest,
});
