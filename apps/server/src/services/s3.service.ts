import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
	},
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export class S3Service {
	/**
	 * Upload un fichier vers S3
	 * Retourne l'URL publique simple (sans signature)
	 * Les URLs pré-signées sont générées à la volée dans les contrôleurs
	 */
	static async uploadFile(
		file: Buffer,
		key: string,
		contentType: string
	): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			Body: file,
			ContentType: contentType,
			// Note: ACL n'est pas utilisé car le bucket utilise "Bucket owner enforced"
			// L'accès public est géré via la bucket policy OU via des URLs pré-signées
		});

		await s3Client.send(command);

		// Retourner l'URL publique simple (sans signature)
		// Les URLs pré-signées seront générées à la volée dans les contrôleurs
		const region = process.env.AWS_REGION || "us-east-1";
		const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;

		return publicUrl;
	}

	/**
	 * Génère une URL pré-signée pour uploader directement depuis le client
	 */
	static async getPresignedUploadUrl(
		key: string,
		contentType: string,
		expiresIn: number = 3600
	): Promise<string> {
		const command = new PutObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
			ContentType: contentType,
			// Note: ACL n'est pas utilisé car le bucket utilise "Bucket owner enforced"
			// L'accès public est géré via la bucket policy
		});

		return await getSignedUrl(s3Client, command, { expiresIn });
	}

	/**
	 * Supprime un fichier de S3
	 */
	static async deleteFile(key: string): Promise<void> {
		const command = new DeleteObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		await s3Client.send(command);
	}

	/**
	 * Génère une clé unique pour un fichier utilisateur
	 */
	static generateUserImageKey(userId: string, filename: string): string {
		const extension = filename.split(".").pop();
		const timestamp = Date.now();
		return `users/${userId}/avatar-${timestamp}.${extension}`;
	}

	/**
	 * Génère une clé unique pour une image de post
	 */
	static generatePostImageKey(
		userId: string,
		postId: string,
		filename: string
	): string {
		const extension = filename.split(".").pop();
		const timestamp = Date.now();
		return `posts/${userId}/${postId}-${timestamp}.${extension}`;
	}

	/**
	 * Extrait la clé S3 depuis une URL S3
	 */
	static extractKeyFromUrl(url: string): string | null {
		try {
			const urlObj = new URL(url);
			// Format: https://bucket.s3.region.amazonaws.com/key
			// Enlever les paramètres de requête s'il y en a
			const pathname = urlObj.pathname.substring(1); // Enlever le premier /
			return pathname;
		} catch {
			return null;
		}
	}

	/**
	 * Génère une URL pré-signée pour lire un objet S3
	 * Utile si le bucket n'est pas public
	 */
	static async getPresignedReadUrl(
		key: string,
		expiresIn: number = 3600 // 1 heure par défaut
	): Promise<string> {
		const command = new GetObjectCommand({
			Bucket: BUCKET_NAME,
			Key: key,
		});

		return await getSignedUrl(s3Client, command, { expiresIn });
	}

	/**
	 * Convertit une URL S3 publique en URL pré-signée si nécessaire
	 * Si l'URL contient déjà des paramètres de signature, la retourne telle quelle
	 */
	static async ensureAccessibleUrl(url: string): Promise<string> {
		// Si l'URL contient déjà des paramètres de signature, elle est déjà pré-signée
		if (url.includes("X-Amz-Signature") || url.includes("X-Amz-Algorithm")) {
			return url;
		}

		// Extraire la clé de l'URL
		const key = this.extractKeyFromUrl(url);
		if (!key) {
			return url; // Retourner l'URL originale si on ne peut pas extraire la clé
		}

		// Générer une URL pré-signée
		return await this.getPresignedReadUrl(key, 3600 * 24 * 7); // 7 jours
	}
}
