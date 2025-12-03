import prisma from "@decosa/db";

export class PostService {
	static async createPost(
		data: { title: string; content: string; image?: string },
		authorId: string
	) {
		return await prisma.post.create({
			data: {
				title: data.title,
				content: data.content,
				image: data.image,
				authorId,
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
	}

	static async getPostById(postId: string, userId?: string) {
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				deletedAt: null,
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
						bio: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
				likes: userId
					? {
							where: {
								userId,
							},
							select: {
								userId: true,
							},
					  }
					: false,
			},
		});

		if (!post) {
			return null;
		}

		return {
			...post,
			isLiked: userId ? post.likes.length > 0 : false,
			isOwner: userId ? post.authorId === userId : false,
		};
	}

	static async getPosts(options: {
		page: number;
		limit: number;
		authorId?: string;
		search?: string;
		userId?: string;
	}) {
		const { page, limit, authorId, search, userId } = options;
		const skip = (page - 1) * limit;

		const where = {
			deletedAt: null,
			...(authorId && { authorId }),
			...(search && {
				OR: [
					{ title: { contains: search, mode: "insensitive" as const } },
					{ content: { contains: search, mode: "insensitive" as const } },
				],
			}),
		};

		const [posts, total] = await Promise.all([
			prisma.post.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					author: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					_count: {
						select: {
							likes: true,
							comments: true,
						},
					},
					likes: userId
						? {
								where: {
									userId,
								},
								select: {
									userId: true,
								},
						  }
						: false,
				},
			}),
			prisma.post.count({ where }),
		]);

		return {
			posts: posts.map((post) => ({
				...post,
				isLiked: userId ? post.likes.length > 0 : false,
				isOwner: userId ? post.authorId === userId : false,
			})),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static async updatePost(
		postId: string,
		data: { title?: string; content?: string; image?: string | null },
		userId: string
	) {
		// Vérifier que le post existe et appartient à l'utilisateur
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				authorId: userId,
				deletedAt: null,
			},
		});

		if (!post) {
			return null;
		}

		return await prisma.post.update({
			where: { id: postId },
			data: {
				...(data.title && { title: data.title }),
				...(data.content && { content: data.content }),
				...(data.image !== undefined && { image: data.image }),
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
					},
				},
				_count: {
					select: {
						likes: true,
						comments: true,
					},
				},
			},
		});
	}

	static async deletePost(postId: string, userId: string) {
		// Vérifier que le post existe et appartient à l'utilisateur
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				authorId: userId,
				deletedAt: null,
			},
		});

		if (!post) {
			return null;
		}

		// Soft delete
		return await prisma.post.update({
			where: { id: postId },
			data: {
				deletedAt: new Date(),
			},
		});
	}
}
