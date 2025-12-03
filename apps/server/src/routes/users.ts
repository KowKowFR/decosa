import { Hono } from "hono";
import { requireAuth, optionalAuth } from "../middleware/auth";
import {
	validateBody,
	validateQuery,
	validateParams,
} from "../middleware/validation";
import {
	updateUserSchema,
	userIdSchema,
	getUserPostsQuerySchema,
} from "../schemas/user";
import { UserController } from "../controllers/user.controller";

const users = new Hono();

// Récupérer l'utilisateur actuel (authentifié)
users.get("/me", requireAuth, UserController.getCurrent);

// Mettre à jour l'utilisateur actuel (authentifié)
users.put(
	"/me",
	requireAuth,
	validateBody(updateUserSchema),
	UserController.update
);

// Récupérer un utilisateur par ID (optionnellement authentifié)
users.get(
	"/:userId",
	optionalAuth,
	validateParams(userIdSchema),
	UserController.getById
);

// Récupérer les posts d'un utilisateur (optionnellement authentifié)
users.get(
	"/:userId/posts",
	optionalAuth,
	validateParams(userIdSchema),
	validateQuery(getUserPostsQuerySchema),
	UserController.getPosts
);

export default users;
