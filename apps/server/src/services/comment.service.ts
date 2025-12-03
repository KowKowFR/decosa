import prisma from "@decosa/db";

export class CommentService {
	static async createComment(
		data: { content: string },
		postId: string,
		authorId: string
	) {
		// Vérifier que le post existe
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				deletedAt: null,
			},
		});

		if (!post) {
			return null;
		}

		return await prisma.comment.create({
			data: {
				content: data.content,
				postId,
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
					},
				},
			},
		});
	}

	static async getComments(
		postId: string,
		options: { page: number; limit: number; userId?: string }
	) {
		const { page, limit, userId } = options;
		const skip = (page - 1) * limit;

		// Vérifier que le post existe
		const post = await prisma.post.findFirst({
			where: {
				id: postId,
				deletedAt: null,
			},
		});

		if (!post) {
			return null;
		}

		const [comments, total] = await Promise.all([
			prisma.comment.findMany({
				where: {
					postId,
					deletedAt: null,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "asc" },
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
			prisma.comment.count({
				where: {
					postId,
					deletedAt: null,
				},
			}),
		]);

		return {
			comments: comments.map((comment) => ({
				...comment,
				isLiked: userId ? comment.likes.length > 0 : false,
				isOwner: userId ? comment.authorId === userId : false,
			})),
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	static async updateComment(
		commentId: string,
		data: { content: string },
		userId: string
	) {
		// Vérifier que le commentaire existe et appartient à l'utilisateur
		const comment = await prisma.comment.findFirst({
			where: {
				id: commentId,
				authorId: userId,
				deletedAt: null,
			},
		});

		if (!comment) {
			return null;
		}

		return await prisma.comment.update({
			where: { id: commentId },
			data: {
				content: data.content,
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
					},
				},
			},
		});
	}

	static async deleteComment(commentId: string, userId: string) {
		// Vérifier que le commentaire existe et appartient à l'utilisateur
		const comment = await prisma.comment.findFirst({
			where: {
				id: commentId,
				authorId: userId,
				deletedAt: null,
			},
		});

		if (!comment) {
			return null;
		}

		// Soft delete
		return await prisma.comment.update({
			where: { id: commentId },
			data: {
				deletedAt: new Date(),
			},
		});
	}
}
