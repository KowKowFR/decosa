import type { Context } from "hono";
import { PostService } from "../services/post.service";
import { S3Service } from "../services/s3.service";

// Fonction helper pour convertir les URLs S3 en URLs pré-signées
async function convertS3UrlsToPresigned(data: any): Promise<any> {
	if (!data) return data;

	// Convertir l'image du post si elle existe
	if (data.image && !data.image.includes("X-Amz-Signature")) {
		try {
			const key = S3Service.extractKeyFromUrl(data.image);
			if (key) {
				data.image = await S3Service.getPresignedReadUrl(key, 3600 * 24 * 7);
			}
		} catch (error) {
			console.error("Error generating presigned URL for post image:", error);
		}
	}

	// Convertir l'image de l'auteur si elle existe
	if (data.author?.image && !data.author.image.includes("X-Amz-Signature")) {
		try {
			const key = S3Service.extractKeyFromUrl(data.author.image);
			if (key) {
				data.author.image = await S3Service.getPresignedReadUrl(
					key,
					3600 * 24 * 7
				);
			}
		} catch (error) {
			console.error("Error generating presigned URL for author image:", error);
		}
	}

	return data;
}

export class PostController {
	static async create(c: Context) {
		const user = c.get("user");
		const body = c.get("validatedBody") as {
			title: string;
			content: string;
			image?: string;
		};

		const post = await PostService.createPost(body, user.id);
		const postWithPresignedUrls = await convertS3UrlsToPresigned(post);

		return c.json(postWithPresignedUrls, 201);
	}

	static async getById(c: Context) {
		const params = c.get("validatedParams") as { postId: string };
		const user = c.get("user") || null;

		const post = await PostService.getPostById(params.postId, user?.id);

		if (!post) {
			return c.json({ error: "Post not found" }, 404);
		}

		const postWithPresignedUrls = await convertS3UrlsToPresigned(post);
		return c.json(postWithPresignedUrls);
	}

	static async getAll(c: Context) {
		const query = c.get("validatedQuery") as {
			page: number;
			limit: number;
			authorId?: string;
			search?: string;
		};
		const user = c.get("user") || null;

		const result = await PostService.getPosts({
			...query,
			userId: user?.id,
		});

		// Convertir les URLs S3 en URLs pré-signées pour tous les posts
		const postsWithPresignedUrls = await Promise.all(
			result.posts.map((post) => convertS3UrlsToPresigned(post))
		);

		return c.json({
			...result,
			posts: postsWithPresignedUrls,
		});
	}

	static async update(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { postId: string };
		const body = c.get("validatedBody") as {
			title?: string;
			content?: string;
			image?: string | null;
		};

		const post = await PostService.updatePost(params.postId, body, user.id);

		if (!post) {
			return c.json({ error: "Post not found or unauthorized" }, 404);
		}

		const postWithPresignedUrls = await convertS3UrlsToPresigned(post);
		return c.json(postWithPresignedUrls);
	}

	static async delete(c: Context) {
		const user = c.get("user");
		const params = c.get("validatedParams") as { postId: string };

		const post = await PostService.deletePost(params.postId, user.id);

		if (!post) {
			return c.json({ error: "Post not found or unauthorized" }, 404);
		}

		return c.json({ message: "Post deleted successfully" });
	}
}
