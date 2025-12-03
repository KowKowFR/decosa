import { Hono } from "hono";
import { requireAuth, optionalAuth } from "../middleware/auth";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "../middleware/validation";
import {
	createCommentSchema,
	updateCommentSchema,
	getCommentsQuerySchema,
	commentIdSchema,
} from "../schemas/comment";
import { CommentController } from "../controllers/comment.controller";
import { postIdSchema } from "../schemas/post";

const comments = new Hono();

// Créer un commentaire (authentifié)
comments.post(
	"/posts/:postId",
	requireAuth,
	validateParams(postIdSchema),
	validateBody(createCommentSchema),
	CommentController.create
);

// Récupérer les commentaires d'un post (optionnellement authentifié)
comments.get(
	"/posts/:postId",
	optionalAuth,
	validateParams(postIdSchema),
	validateQuery(getCommentsQuerySchema),
	CommentController.getByPostId
);

// Mettre à jour un commentaire (authentifié, propriétaire uniquement)
comments.put(
	"/:commentId",
	requireAuth,
	validateParams(commentIdSchema),
	validateBody(updateCommentSchema),
	CommentController.update
);

// Supprimer un commentaire (authentifié, propriétaire uniquement)
comments.delete(
	"/:commentId",
	requireAuth,
	validateParams(commentIdSchema),
	CommentController.delete
);

export default comments;
