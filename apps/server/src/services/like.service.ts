import prisma from "@decosa/db";

export class LikeService {
	static async togglePostLike(postId: string, userId: string) {
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

		// Vérifier si le like existe déjà
		const existingLike = await prisma.like.findUnique({
			where: {
				postId_userId: {
					postId,
					userId,
				},
			},
		});

		if (existingLike) {
			// Retirer le like
			await prisma.like.delete({
				where: {
					id: existingLike.id,
				},
			});
			return { liked: false };
		} else {
			// Ajouter le like
			await prisma.like.create({
				data: {
					postId,
					userId,
				},
			});
			return { liked: true };
		}
	}

	static async toggleCommentLike(commentId: string, userId: string) {
		// Vérifier que le commentaire existe
		const comment = await prisma.comment.findFirst({
			where: {
				id: commentId,
				deletedAt: null,
			},
		});

		if (!comment) {
			return null;
		}

		// Vérifier si le like existe déjà
		const existingLike = await prisma.commentLike.findUnique({
			where: {
				commentId_userId: {
					commentId,
					userId,
				},
			},
		});

		if (existingLike) {
			// Retirer le like
			await prisma.commentLike.delete({
				where: {
					id: existingLike.id,
				},
			});
			return { liked: false };
		} else {
			// Ajouter le like
			await prisma.commentLike.create({
				data: {
					commentId,
					userId,
				},
			});
			return { liked: true };
		}
	}
}
