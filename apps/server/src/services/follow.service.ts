import prisma from "@decosa/db";

export class FollowService {
	static async followUser(followerId: string, followingId: string) {
		// Un utilisateur ne peut pas se suivre lui-même
		if (followerId === followingId) {
			return { error: "Cannot follow yourself" };
		}

		// Vérifier que l'utilisateur à suivre existe
		const userToFollow = await prisma.user.findUnique({
			where: { id: followingId },
		});

		if (!userToFollow) {
			return null;
		}

		// Vérifier si la relation existe déjà
		const existingFollow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId,
					followingId,
				},
			},
		});

		if (existingFollow) {
			return { error: "Already following this user" };
		}

		return await prisma.follow.create({
			data: {
				followerId,
				followingId,
			},
			include: {
				following: {
					select: {
						id: true,
						name: true,
						image: true,
						bio: true,
					},
				},
			},
		});
	}

	static async unfollowUser(followerId: string, followingId: string) {
		const follow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId,
					followingId,
				},
			},
		});

		if (!follow) {
			return { error: "Not following this user" };
		}

		await prisma.follow.delete({
			where: {
				id: follow.id,
			},
		});

		return { success: true };
	}

	static async getFollowers(
		userId: string,
		options: { page: number; limit: number }
	) {
		const { page, limit } = options;
		const skip = (page - 1) * limit;

		const [followers, total] = await Promise.all([
			prisma.follow.findMany({
				where: {
					followingId: userId,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					follower: {
						select: {
							id: true,
							name: true,
							image: true,
							bio: true,
						},
					},
				},
			}),
			prisma.follow.count({
				where: {
					followingId: userId,
				},
			}),
		]);

		return {
			followers: followers.map((f) => f.follower),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static async getFollowing(
		userId: string,
		options: { page: number; limit: number }
	) {
		const { page, limit } = options;
		const skip = (page - 1) * limit;

		const [following, total] = await Promise.all([
			prisma.follow.findMany({
				where: {
					followerId: userId,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					following: {
						select: {
							id: true,
							name: true,
							image: true,
							bio: true,
						},
					},
				},
			}),
			prisma.follow.count({
				where: {
					followerId: userId,
				},
			}),
		]);

		return {
			following: following.map((f) => f.following),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static async isFollowing(followerId: string, followingId: string) {
		const follow = await prisma.follow.findUnique({
			where: {
				followerId_followingId: {
					followerId,
					followingId,
				},
			},
		});

		return !!follow;
	}
}
