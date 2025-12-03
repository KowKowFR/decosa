import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { validateParams } from "../middleware/validation";
import { postIdSchema } from "../schemas/post";
import { commentIdSchema } from "../schemas/comment";
import { LikeController } from "../controllers/like.controller";

const likes = new Hono();

// Toggle like sur un post (authentifié)
likes.post(
	"/posts/:postId",
	requireAuth,
	validateParams(postIdSchema),
	LikeController.togglePostLike
);

// Toggle like sur un commentaire (authentifié)
likes.post(
	"/comments/:commentId",
	requireAuth,
	validateParams(commentIdSchema),
	LikeController.toggleCommentLike
);

export default likes;
