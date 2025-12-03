import { Hono } from "hono";
import { requireAuth, optionalAuth } from "../middleware/auth";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "../middleware/validation";
import {
	createPostSchema,
	updatePostSchema,
	getPostsQuerySchema,
	postIdSchema,
} from "../schemas/post";
import { PostController } from "../controllers/post.controller";

const posts = new Hono();

// Créer un post (authentifié)
posts.post(
	"/",
	requireAuth,
	validateBody(createPostSchema),
	PostController.create
);

// Récupérer tous les posts (optionnellement authentifié pour voir les likes)
posts.get(
	"/",
	optionalAuth,
	validateQuery(getPostsQuerySchema),
	PostController.getAll
);

// Récupérer un post par ID (optionnellement authentifié)
posts.get(
	"/:postId",
	optionalAuth,
	validateParams(postIdSchema),
	PostController.getById
);

// Mettre à jour un post (authentifié, propriétaire uniquement)
posts.put(
	"/:postId",
	requireAuth,
	validateParams(postIdSchema),
	validateBody(updatePostSchema),
	PostController.update
);

// Supprimer un post (authentifié, propriétaire uniquement)
posts.delete(
	"/:postId",
	requireAuth,
	validateParams(postIdSchema),
	PostController.delete
);

export default posts;
