import prisma from "@decosa/db";

export class UserService {
	static async getUserById(userId: string) {
		return await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				createdAt: true,
				_count: {
					select: {
						posts: true,
						followers: true,
						following: true,
					},
				},
			},
		});
	}

	static async updateUser(
		userId: string,
		data: {
			name?: string;
			bio?: string;
			image?: string | null;
		}
	) {
		return await prisma.user.update({
			where: { id: userId },
			data: {
				...(data.name && { name: data.name }),
				...(data.bio !== undefined && { bio: data.bio }),
				...(data.image !== undefined && { image: data.image }),
			},
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				bio: true,
				createdAt: true,
			},
		});
	}

	static async getUserPosts(
		userId: string,
		options: { page: number; limit: number }
	) {
		const { page, limit } = options;
		const skip = (page - 1) * limit;

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where: {
					authorId: userId,
					deletedAt: null,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					_count: {
						select: {
							likes: true,
							comments: true,
						},
					},
				},
			}),
			prisma.post.count({
				where: {
					authorId: userId,
					deletedAt: null,
				},
			}),
		]);

		return {
			posts,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}
