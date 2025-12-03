import { z } from "zod";

export const updateUserSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	bio: z.string().max(500).optional().nullable(),
	image: z.string().url().optional().nullable(),
});

export const userIdSchema = z.object({
	userId: z.string(),
});

export const getUserPostsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
});
