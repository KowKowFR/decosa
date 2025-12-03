import { z } from "zod";

export const createReportSchema = z
	.object({
		reason: z.string().min(1).max(1000),
		type: z.enum(["POST", "COMMENT"]),
		postId: z.string().cuid().optional(),
		commentId: z.string().cuid().optional(),
	})
	.refine(
		(data) =>
			(data.type === "POST" && data.postId) ||
			(data.type === "COMMENT" && data.commentId),
		{
			message:
				"postId is required for POST type, commentId is required for COMMENT type",
		}
	);

export const updateReportStatusSchema = z.object({
	status: z.enum(["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"]),
	notes: z.string().max(1000).optional(),
});

export const reportIdSchema = z.object({
	reportId: z.string().cuid(),
});
