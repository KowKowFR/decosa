import { Hono } from "hono";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validation";
import { z } from "zod";
import { S3Service } from "../services/s3.service";
import { UserService } from "../services/user.service";

const upload = new Hono();

const getPresignedUrlSchema = z.object({
	filename: z.string().min(1),
	contentType: z.string().min(1),
	type: z.enum(["avatar", "post"]),
	postId: z.string().optional(), // Requis si type === "post"
});

// Obtenir une URL pré-signée pour uploader une image
upload.post(
	"/presigned-url",
	requireAuth,
	validateBody(getPresignedUrlSchema),
	async (c) => {
		const user = c.get("user");
		const { filename, contentType, type, postId } = c.get("validatedBody") as {
			filename: string;
			contentType: string;
			type: "avatar" | "post";
			postId?: string;
		};

		try {
			let key: string;
			if (type === "avatar") {
				key = S3Service.generateUserImageKey(user.id, filename);
			} else if (type === "post") {
				if (!postId) {
					return c.json({ error: "postId is required for post images" }, 400);
				}
				key = S3Service.generatePostImageKey(user.id, postId, filename);
			} else {
				return c.json({ error: "Invalid type" }, 400);
			}

			const presignedUrl = await S3Service.getPresignedUploadUrl(
				key,
				contentType,
				3600 // 1 heure
			);

			const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${
				process.env.AWS_REGION || "us-east-1"
			}.amazonaws.com/${key}`;

			return c.json({
				presignedUrl,
				key,
				publicUrl,
			});
		} catch (error) {
			console.error("Error generating presigned URL:", error);
			return c.json(
				{
					error: "Failed to generate upload URL",
					details: error instanceof Error ? error.message : String(error),
				},
				500
			);
		}
	}
);

// Upload direct depuis le serveur (alternative)
upload.post("/direct", requireAuth, async (c) => {
	const user = c.get("user");

	try {
		const formData = await c.req.formData();
		const file = formData.get("file") as File;
		const type = formData.get("type") as string;

		if (!file) {
			return c.json({ error: "No file provided" }, 400);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		let key: string;

		if (type === "avatar") {
			// Récupérer l'utilisateur pour obtenir l'ancienne image
			const currentUser = await UserService.getUserById(user.id);

			// Supprimer l'ancienne image S3 si elle existe
			if (currentUser?.image) {
				try {
					const oldKey = S3Service.extractKeyFromUrl(currentUser.image);
					if (oldKey) {
						await S3Service.deleteFile(oldKey);
					}
				} catch (deleteError) {
					// Continue même si la suppression échoue
				}
			}

			key = S3Service.generateUserImageKey(user.id, file.name);
		} else if (type === "post") {
			const postId = formData.get("postId") as string;
			if (!postId) {
				return c.json({ error: "postId is required for post images" }, 400);
			}
			key = S3Service.generatePostImageKey(user.id, postId, file.name);
		} else {
			return c.json({ error: "Invalid type" }, 400);
		}

		const publicUrl = await S3Service.uploadFile(buffer, key, file.type);

		// Générer une URL pré-signée pour l'affichage immédiat (valide 7 jours)
		const presignedUrl = await S3Service.getPresignedReadUrl(
			key,
			3600 * 24 * 7
		);

		return c.json({ url: presignedUrl, key, publicUrl });
	} catch (error) {
		console.error("Upload error:", error);
		return c.json(
			{
				error: "Failed to upload file",
				details: error instanceof Error ? error.message : String(error),
			},
			500
		);
	}
});

export default upload;
