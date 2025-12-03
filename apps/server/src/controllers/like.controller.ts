import type { Context } from "hono";
import { LikeService } from "../services/like.service";

export class LikeController {
	static async togglePostLike(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { postId: string };

		const result = await LikeService.togglePostLike(params.postId, user.id);

		if (!result) {
			return c.json({ error: "Post not found" }, 404);
		}

		return c.json(result);
	}

	static async toggleCommentLike(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { commentId: string };

		const result = await LikeService.toggleCommentLike(
			params.commentId,
			user.id
		);

		if (!result) {
			return c.json({ error: "Comment not found" }, 404);
		}

		return c.json(result);
	}
}
