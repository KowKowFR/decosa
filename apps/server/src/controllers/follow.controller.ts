import type { Context } from "hono";
import { FollowService } from "../services/follow.service";

export class FollowController {
	static async follow(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { userId: string };

		const result = await FollowService.followUser(user.id, params.userId);

		if (!result) {
			return c.json({ error: "User not found" }, 404);
		}

		if ("error" in result) {
			return c.json({ error: result.error }, 400);
		}

		return c.json(result, 201);
	}

	static async unfollow(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { userId: string };

		const result = await FollowService.unfollowUser(user.id, params.userId);

		if ("error" in result) {
			return c.json({ error: result.error }, 400);
		}

		return c.json(result);
	}

	static async getFollowers(c: Context) {
		const params = c.get("validatedParams") as { userId: string };
		const query = c.get("validatedQuery") as { page: number; limit: number };

		const result = await FollowService.getFollowers(params.userId, query);

		return c.json(result);
	}

	static async getFollowing(c: Context) {
		const params = c.get("validatedParams") as { userId: string };
		const query = c.get("validatedQuery") as { page: number; limit: number };

		const result = await FollowService.getFollowing(params.userId, query);

		return c.json(result);
	}

	static async checkFollow(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { userId: string };

		const isFollowing = await FollowService.isFollowing(user.id, params.userId);

		return c.json({ isFollowing });
	}
}

