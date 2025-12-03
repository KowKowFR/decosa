import { Hono } from "hono";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { validateParams, validateQuery } from "../middleware/validation";
import { userIdSchema, getFollowersQuerySchema } from "../schemas/follow";
import { FollowController } from "../controllers/follow.controller";

const follows = new Hono();

// Suivre un utilisateur (authentifié)
follows.post(
	"/:userId",
	requireAuth,
	validateParams(userIdSchema),
	FollowController.follow
);

// Ne plus suivre un utilisateur (authentifié)
follows.delete(
	"/:userId",
	requireAuth,
	validateParams(userIdSchema),
	FollowController.unfollow
);

// Récupérer les abonnés d'un utilisateur (optionnellement authentifié)
follows.get(
	"/:userId/followers",
	optionalAuth,
	validateParams(userIdSchema),
	validateQuery(getFollowersQuerySchema),
	FollowController.getFollowers
);

// Récupérer les abonnements d'un utilisateur (optionnellement authentifié)
follows.get(
	"/:userId/following",
	optionalAuth,
	validateParams(userIdSchema),
	validateQuery(getFollowersQuerySchema),
	FollowController.getFollowing
);

// Vérifier si on suit un utilisateur (authentifié)
follows.get(
	"/:userId/check",
	requireAuth,
	validateParams(userIdSchema),
	FollowController.checkFollow
);

export default follows;
