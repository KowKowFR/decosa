import type { Context } from "hono";
import { CommentService } from "../services/comment.service";
import { S3Service } from "../services/s3.service";

export class CommentController {
	// Fonction helper pour convertir les URLs S3 des auteurs de commentaires
	static async convertCommentAuthorImage(comment: any): Promise<any> {
		if (
			comment.author?.image &&
			!comment.author.image.includes("X-Amz-Signature")
		) {
			try {
				const key = S3Service.extractKeyFromUrl(comment.author.image);
				if (key) {
					comment.author.image = await S3Service.getPresignedReadUrl(
						key,
						3600 * 24 * 7
					);
				}
			} catch (error) {
				console.error(
					"Error generating presigned URL for comment author image:",
					error
				);
			}
		}
		return comment;
	}

	static async create(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { postId: string };
		const body = c.get("validatedBody") as { content: string };

		const comment = await CommentService.createComment(
			body,
			params.postId,
			user.id
		);

		if (!comment) {
			return c.json({ error: "Post not found" }, 404);
		}

		const commentWithPresignedUrl =
			await CommentController.convertCommentAuthorImage(comment);
		return c.json(commentWithPresignedUrl, 201);
	}

	static async getByPostId(c: Context) {
		const params = c.get("validatedParams") as { postId: string };
		const query = c.get("validatedQuery") as { page: number; limit: number };
		const user = c.get("user") || null;

		const result = await CommentService.getComments(params.postId, {
			...query,
			userId: user?.id,
		});

		if (!result) {
			return c.json({ error: "Post not found" }, 404);
		}

		// Convertir les URLs S3 des auteurs de commentaires en URLs pré-signées
		const commentsWithPresignedUrls = await Promise.all(
			result.comments.map((comment) =>
				CommentController.convertCommentAuthorImage(comment)
			)
		);

		return c.json({
			...result,
			comments: commentsWithPresignedUrls,
		});
	}

	static async update(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { commentId: string };
		const body = c.get("validatedBody") as { content: string };

		const comment = await CommentService.updateComment(
			params.commentId,
			body,
			user.id
		);

		if (!comment) {
			return c.json({ error: "Comment not found or unauthorized" }, 404);
		}

		return c.json(comment);
	}

	static async delete(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { commentId: string };

		const comment = await CommentService.deleteComment(
			params.commentId,
			user.id
		);

		if (!comment) {
			return c.json({ error: "Comment not found or unauthorized" }, 404);
		}

		return c.json({ message: "Comment deleted successfully" });
	}
}
