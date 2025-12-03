import type { Context } from "hono";
import prisma from "@decosa/db";
import { UserService } from "../services/user.service";
import { S3Service } from "../services/s3.service";

export class UserController {
	static async getById(c: Context) {
		const params = c.get("validatedParams") as { userId: string };
		const user = c.get("user") || null;

		const userData = await UserService.getUserById(params.userId);

		if (!userData) {
			return c.json({ error: "User not found" }, 404);
		}

		// Convertir l'URL S3 en URL pré-signée si nécessaire
		let imageUrl = userData.image;
		if (userData.image && !userData.image.includes("X-Amz-Signature")) {
			try {
				const key = S3Service.extractKeyFromUrl(userData.image);
				if (key) {
					imageUrl = await S3Service.getPresignedReadUrl(key, 3600 * 24 * 7); // 7 jours
				}
			} catch (error) {
				console.error("Error generating presigned URL for user image:", error);
				// Garder l'URL originale en cas d'erreur
			}
		}

		// Si l'utilisateur demande son propre profil, inclure l'email
		const isOwnProfile = user?.id === params.userId;

		return c.json({
			...userData,
			image: imageUrl,
			email: isOwnProfile ? userData.email : undefined,
		});
	}

	static async getCurrent(c: Context) {
		const user = c.get("user");

		const userData = await UserService.getUserById(user.id);

		if (!userData) {
			return c.json({ error: "User not found" }, 404);
		}

		// Convertir l'URL S3 en URL pré-signée si nécessaire
		let imageUrl = userData.image;
		if (userData.image && !userData.image.includes("X-Amz-Signature")) {
			try {
				const key = S3Service.extractKeyFromUrl(userData.image);
				if (key) {
					imageUrl = await S3Service.getPresignedReadUrl(key, 3600 * 24 * 7); // 7 jours
				}
			} catch (error) {
				console.error("Error generating presigned URL for user image:", error);
				// Garder l'URL originale en cas d'erreur
			}
		}

		return c.json({
			...userData,
			image: imageUrl,
		});
	}

	static async update(c: Context) {
		const user = c.get("user");
		const body = c.get("validatedBody") as {
			name?: string;
			bio?: string;
			image?: string | null;
		};

		const updatedUser = await UserService.updateUser(user.id, body);

		// Convertir l'URL S3 en URL pré-signée si nécessaire
		let imageUrl = updatedUser.image;
		if (updatedUser.image && !updatedUser.image.includes("X-Amz-Signature")) {
			try {
				const key = S3Service.extractKeyFromUrl(updatedUser.image);
				if (key) {
					imageUrl = await S3Service.getPresignedReadUrl(key, 3600 * 24 * 7); // 7 jours
				}
			} catch (error) {
				console.error(
					"Error generating presigned URL for updated user image:",
					error
				);
			}
		}

		return c.json({
			...updatedUser,
			image: imageUrl,
		});
	}

	static async getPosts(c: Context) {
		const params = c.get("validatedParams") as { userId: string };
		const query = c.get("validatedQuery") as { page: number; limit: number };
		const currentUser = c.get("user") || null;

		const result = await UserService.getUserPosts(params.userId, query);

		// Fonction helper pour convertir l'URL de l'image d'un post
		const convertPostImageUrl = async (post: any): Promise<any> => {
			if (post.image && !post.image.includes("X-Amz-Signature")) {
				try {
					const key = S3Service.extractKeyFromUrl(post.image);
					if (key) {
						post.image = await S3Service.getPresignedReadUrl(
							key,
							3600 * 24 * 7
						);
					}
				} catch (error) {
					console.error(
						"Error generating presigned URL for post image:",
						error
					);
				}
			}
			return post;
		};

		// Ajouter isLiked et isOwner pour chaque post, et convertir les URLs S3
		const postsWithLikes = await Promise.all(
			result.posts.map(async (post) => {
				if (!currentUser) {
					const postData = {
						...post,
						isLiked: false,
						isOwner: false,
					};
					// Convertir les URLs S3 en URLs pré-signées
					return await convertPostImageUrl(postData);
				}

				const like = await prisma.like.findUnique({
					where: {
						postId_userId: {
							postId: post.id,
							userId: currentUser.id,
						},
					},
				});

				const postData = {
					...post,
					isLiked: !!like,
					isOwner: post.authorId === currentUser.id,
				};
				// Convertir les URLs S3 en URLs pré-signées
				return await convertPostImageUrl(postData);
			})
		);

		return c.json({
			posts: postsWithLikes,
			pagination: result.pagination,
		});
	}
}
