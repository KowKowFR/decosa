import { z } from "zod";

export const createPostSchema = z.object({
	title: z.string().min(1).max(200),
	content: z.string().min(1).max(10000),
	image: z.string().url().optional(),
});

export const updatePostSchema = z.object({
	title: z.string().min(1).max(200).optional(),
	content: z.string().min(1).max(10000).optional(),
	image: z.string().url().optional().nullable(),
});

export const getPostsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
	authorId: z.string().optional(),
	search: z.string().optional(),
});

export const postIdSchema = z.object({
	postId: z.string().cuid(),
});
